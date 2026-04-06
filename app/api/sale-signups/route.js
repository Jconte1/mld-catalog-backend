import prisma from "../../../lib/prisma";
import { randomUUID } from "crypto";
import { syncSaleSignupsToMailchimp } from "../../../lib/mailchimp";

function corsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  const allowed = ["https://www.mld.com", "http://localhost:3000"];
  const allowOrigin = allowed.includes(origin) ? origin : "https://www.mld.com";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidUsPhone(value) {
  return /^\d{10}$/.test(normalizePhone(value));
}

function parseAttendee(input, attendeeIndex) {
  const firstName = String(input?.firstName || "").trim();
  const lastName = String(input?.lastName || "").trim();
  const email = String(input?.email || "").trim();
  const phone = String(input?.phone || "").trim();
  const smsConsent = Boolean(input?.smsConsent);

  if (!firstName || !lastName || !email || !phone) {
    throw new Error(`Attendee ${attendeeIndex}: missing required fields.`);
  }

  if (!isValidEmail(email)) {
    throw new Error(`Attendee ${attendeeIndex}: invalid email.`);
  }

  if (!isValidUsPhone(phone)) {
    throw new Error(`Attendee ${attendeeIndex}: invalid phone.`);
  }

  return {
    attendeeIndex,
    firstName,
    lastName,
    email,
    phone: normalizePhone(phone),
    smsConsent,
    firstNameNorm: normalizeName(firstName),
    emailNorm: normalizeEmail(email),
  };
}

export function OPTIONS(req) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req) {
  const headers = corsHeaders(req);

  try {
    const body = await req.json();

    const eventSlug = String(body?.eventSlug || "").trim().toLowerCase();
    const eventTitle = body?.eventTitle ? String(body.eventTitle).trim() : null;
    const attendeesRaw = Array.isArray(body?.attendees) ? body.attendees : [];
    const captureUtm = body?.captureUtm !== false;

    if (!eventSlug) {
      return Response.json(
        { error: "Missing eventSlug." },
        { status: 400, headers }
      );
    }

    if (attendeesRaw.length < 1 || attendeesRaw.length > 2) {
      return Response.json(
        { error: "Attendees must contain 1 to 2 attendees." },
        { status: 400, headers }
      );
    }

    const attendees = attendeesRaw.map((a, i) => parseAttendee(a, i + 1));

    // Prevent duplicate attendees in the same submission payload.
    const seen = new Set();
    for (const a of attendees) {
      const key = `${eventSlug}|${a.emailNorm}|${a.firstNameNorm}`;
      if (seen.has(key)) {
        return Response.json(
          {
            error:
              "Duplicate attendee detected in this request. Same event + first name + email is not allowed.",
          },
          { status: 409, headers }
        );
      }
      seen.add(key);
    }

    const duplicates = await Promise.all(
      attendees.map((a) =>
        prisma.saleSignUp.findFirst({
          where: {
            eventSlug,
            emailNorm: a.emailNorm,
            firstNameNorm: a.firstNameNorm,
          },
          select: { id: true, firstName: true, email: true },
        })
      )
    );

    const firstDuplicate = duplicates.find(Boolean);
    if (firstDuplicate) {
      return Response.json(
        {
          error:
            "This attendee has already registered for this event with the same first name and email.",
          duplicate: firstDuplicate,
        },
        { status: 409, headers }
      );
    }

    const submissionId = `sale_${randomUUID()}`;
    const utm = body?.utm || {};

    const payloadRows = attendees.map((a) => ({
      submissionId,
      eventSlug,
      eventTitle,
      attendeeIndex: a.attendeeIndex,
      firstName: a.firstName,
      lastName: a.lastName,
      email: a.email,
      phone: a.phone,
      smsConsent: a.smsConsent,
      firstNameNorm: a.firstNameNorm,
      emailNorm: a.emailNorm,
      sourceUrl: body?.sourceUrl ? String(body.sourceUrl) : null,
      referrer: body?.referrer ? String(body.referrer) : null,
      utmSource: captureUtm ? utm?.utm_source ?? null : null,
      utmMedium: captureUtm ? utm?.utm_medium ?? null : null,
      utmCampaign: captureUtm ? utm?.utm_campaign ?? null : null,
      utmTerm: captureUtm ? utm?.utm_term ?? null : null,
      utmContent: captureUtm ? utm?.utm_content ?? null : null,
      gclid: captureUtm ? utm?.gclid ?? null : null,
      fbclid: captureUtm ? utm?.fbclid ?? null : null,
    }));

    await prisma.saleSignUp.createMany({ data: payloadRows });

    const mailchimpSync = await syncSaleSignupsToMailchimp(payloadRows, {
      eventSlug,
      eventTitle,
      submissionId,
    });

    if (mailchimpSync.failedCount > 0) {
      console.error("sale-signups Mailchimp sync failures:", {
        submissionId,
        eventSlug,
        failedCount: mailchimpSync.failedCount,
        failures: mailchimpSync.failures,
      });
    }

    return Response.json(
      {
        ok: true,
        submissionId,
        attendeeCount: payloadRows.length,
        mailchimpSync: {
          enabled: mailchimpSync.enabled,
          skipped: mailchimpSync.skipped,
          successCount: mailchimpSync.successCount,
          failedCount: mailchimpSync.failedCount,
          reason: mailchimpSync.reason || null,
        },
      },
      { status: 201, headers }
    );
  } catch (error) {
    console.error("sale-signups POST error:", error);
    return Response.json(
      { error: error?.message || "Unable to save sale signups." },
      { status: 500, headers }
    );
  }
}

export async function GET(req) {
  const headers = corsHeaders(req);
  try {
    const url = new URL(req.url);
    const eventSlug = String(url.searchParams.get("eventSlug") || "")
      .trim()
      .toLowerCase();

    if (!eventSlug) {
      return Response.json(
        { error: "eventSlug is required." },
        { status: 400, headers }
      );
    }

    const items = await prisma.saleSignUp.findMany({
      where: { eventSlug },
      orderBy: [{ createdAt: "desc" }, { attendeeIndex: "asc" }],
      take: 200,
    });

    return Response.json({ ok: true, items }, { headers });
  } catch (error) {
    console.error("sale-signups GET error:", error);
    return Response.json(
      { error: "Unable to fetch sale signups." },
      { status: 500, headers }
    );
  }
}
