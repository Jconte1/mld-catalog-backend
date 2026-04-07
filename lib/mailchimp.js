import { createHash } from "crypto";

function toBool(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function clean(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .trim();
}

function getConfig() {
  const enabled = toBool(process.env.MAILCHIMP_ENABLED, false);
  const apiKey = clean(process.env.MAILCHIMP_API_KEY);
  const serverPrefix = clean(process.env.MAILCHIMP_SERVER_PREFIX);
  const audienceId = clean(process.env.MAILCHIMP_AUDIENCE_ID);
  const signupTag = clean(process.env.MAILCHIMP_SIGNUP_TAG);
  const timeoutMs = Math.max(1000, Number(process.env.MAILCHIMP_TIMEOUT_MS || 8000));
  const doubleOptIn = toBool(process.env.MAILCHIMP_DOUBLE_OPT_IN, false);

  const missing = [];
  if (enabled && !apiKey) missing.push("MAILCHIMP_API_KEY");
  if (enabled && !serverPrefix) missing.push("MAILCHIMP_SERVER_PREFIX");
  if (enabled && !audienceId) missing.push("MAILCHIMP_AUDIENCE_ID");

  return {
    enabled,
    apiKey,
    serverPrefix,
    audienceId,
    signupTag,
    timeoutMs,
    doubleOptIn,
    missing,
  };
}

function md5Lower(value) {
  return createHash("md5").update(String(value || "").trim().toLowerCase()).digest("hex");
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function toUsE164(value) {
  const digits = normalizePhone(value);
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

async function requestWithRetry(config, path, method, body) {
  const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0${path}`;
  const headers = {
    Authorization: `apikey ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  const attempts = [0, 1];
  let lastError = null;

  for (const attempt of attempts) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (res.ok) {
        clearTimeout(timer);
        if (res.status === 204) return {};
        return await res.json().catch(() => ({}));
      }

      const payload = await res.json().catch(() => ({}));
      const retriable = res.status === 429 || res.status >= 500;
      const message = payload?.detail || payload?.title || `Mailchimp request failed (${res.status})`;

      if (retriable && attempt === 0) {
        clearTimeout(timer);
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }

      const error = new Error(message);
      error.status = res.status;
      error.payload = payload;
      throw error;
    } catch (error) {
      lastError = error;
      if (attempt === 1) break;
      if (error?.name !== "AbortError") {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError?.name === "AbortError") {
    const timeoutError = new Error("Mailchimp request timed out.");
    timeoutError.status = 408;
    throw timeoutError;
  }

  throw lastError || new Error("Mailchimp request failed.");
}

async function syncOne(config, attendee, meta = {}) {
  const email = String(attendee?.email || "").trim().toLowerCase();
  const subscriberHash = md5Lower(email);
  const tags = [config.signupTag, meta?.eventSlug ? `sale-${meta.eventSlug}` : ""].filter(Boolean);

  const member = await requestWithRetry(
    config,
    `/lists/${config.audienceId}/members/${subscriberHash}`,
    "PUT",
    {
      email_address: email,
      status_if_new: config.doubleOptIn ? "pending" : "subscribed",
      merge_fields: {
        FNAME: attendee?.firstName || "",
        LNAME: attendee?.lastName || "",
        PHONE: normalizePhone(attendee?.phone || ""),
      },
    }
  );

  const smsResult = await syncSmsConsent(config, attendee);

  if (tags.length > 0) {
    await requestWithRetry(
      config,
      `/lists/${config.audienceId}/members/${subscriberHash}/tags`,
      "POST",
      { tags: tags.map((name) => ({ name, status: "active" })) }
    );
  }

  return {
    ok: true,
    email,
    subscriberHash,
    memberId: member?.id || subscriberHash,
    smsResult,
  };
}

async function findAudienceContactByEmail(config, email) {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return null;

  const pageSize = 100;
  const maxPages = 10;

  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * pageSize;
    const result = await requestWithRetry(
      config,
      `/audiences/${config.audienceId}/contacts?count=${pageSize}&offset=${offset}`,
      "GET"
    );
    const contacts = Array.isArray(result?.contacts) ? result.contacts : [];
    const match = contacts.find(
      (c) => String(c?.email_channel?.email || "").trim().toLowerCase() === target
    );
    if (match) return match;
    if (contacts.length < pageSize) break;
  }

  return null;
}

async function syncSmsConsent(config, attendee) {
  if (!attendee?.smsConsent) {
    return { attempted: false, reason: "smsConsent is false." };
  }
  const smsConsentStatus = "consented";

  const e164 = toUsE164(attendee?.phone || "");
  if (!e164) {
    return { attempted: false, reason: "Phone number is not valid US E.164 candidate." };
  }

  const email = String(attendee?.email || "").trim().toLowerCase();
  const contact = await findAudienceContactByEmail(config, email);
  if (!contact?.id) {
    return {
      attempted: true,
      synced: false,
      phone: e164,
      reason: "Could not find Mailchimp audience contact id for this email.",
    };
  }

  try {
    await requestWithRetry(
      config,
      `/audiences/${config.audienceId}/contacts/${contact.id}`,
      "PATCH",
      {
        sms_channel: {
          sms_phone: e164,
          marketing_consent: {
            status: smsConsentStatus,
          },
        },
      }
    );

    return { attempted: true, synced: true, phone: e164, status: smsConsentStatus };
  } catch (error) {
    return {
      attempted: true,
      synced: false,
      phone: e164,
      status: smsConsentStatus,
      reason: error?.message || "Unknown SMS sync error.",
      statusCode: error?.status || 500,
    };
  }
}

export async function syncSaleSignupsToMailchimp(attendees = [], meta = {}) {
  const config = getConfig();
  if (!config.enabled) {
    return {
      enabled: false,
      skipped: true,
      reason: "MAILCHIMP_ENABLED is false.",
      successCount: 0,
      failedCount: 0,
      failures: [],
    };
  }

  if (config.missing.length > 0) {
    return {
      enabled: true,
      skipped: true,
      reason: `Missing Mailchimp env vars: ${config.missing.join(", ")}`,
      successCount: 0,
      failedCount: attendees.length,
      failures: attendees.map((a) => ({
        email: a?.email || null,
        reason: "Mailchimp configuration incomplete.",
      })),
    };
  }

  const failures = [];
  const warnings = [];
  let successCount = 0;

  for (const attendee of attendees) {
    try {
      const result = await syncOne(config, attendee, meta);
      successCount += 1;
      if (result?.smsResult?.attempted && result?.smsResult?.synced === false) {
        warnings.push({
          email: attendee?.email || null,
          reason: result.smsResult.reason,
          status: result.smsResult.statusCode || null,
        });
      }
    } catch (error) {
      failures.push({
        email: attendee?.email || null,
        reason: error?.message || "Unknown Mailchimp sync error.",
        status: error?.status || 500,
      });
    }
  }

  return {
    enabled: true,
    skipped: false,
    successCount,
    failedCount: failures.length,
    failures,
    warnings,
  };
}
