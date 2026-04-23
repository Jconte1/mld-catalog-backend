import prisma from "../../../../lib/prisma";
import { syncSaleSignupsToMailchimp } from "../../../../lib/mailchimp";

function corsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  const allowed = ["https://www.mld.com", "http://localhost:3000"];
  const allowOrigin = allowed.includes(origin) ? origin : "https://www.mld.com";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export function OPTIONS(req) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req) {
  const headers = corsHeaders(req);

  try {
    const body = await req.json().catch(() => ({}));
    const eventSlug = String(body?.eventSlug || "").trim().toLowerCase();
    const submissionId = String(body?.submissionId || "").trim();
    const limit = Math.max(1, Math.min(500, Number(body?.limit || 200)));

    if (!eventSlug && !submissionId) {
      return Response.json(
        { error: "Provide eventSlug or submissionId." },
        { status: 400, headers }
      );
    }

    const where = {};
    if (eventSlug) where.eventSlug = eventSlug;
    if (submissionId) where.submissionId = submissionId;

    const attendees = await prisma.saleSignUp.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { attendeeIndex: "asc" }],
      take: limit,
    });

    if (attendees.length === 0) {
      return Response.json(
        { ok: true, matched: 0, message: "No signups matched the filter." },
        { headers }
      );
    }

    const sync = await syncSaleSignupsToMailchimp(attendees, {
      eventSlug: eventSlug || attendees[0]?.eventSlug || "",
      eventTitle: attendees[0]?.eventTitle || null,
      submissionId: submissionId || null,
    });

    if (sync.failedCount > 0) {
      console.error("sale-signups resync Mailchimp failures:", {
        eventSlug,
        submissionId,
        failedCount: sync.failedCount,
        failures: sync.failures,
      });
    }
    if ((sync.warnings || []).length > 0) {
      console.warn("sale-signups resync Mailchimp warnings:", {
        eventSlug,
        submissionId,
        warningCount: sync.warnings.length,
        warnings: sync.warnings,
      });
    }
    if ((sync.skippedAttendees || []).length > 0) {
      console.info("sale-signups resync Mailchimp skipped attendees:", {
        eventSlug,
        submissionId,
        skippedCount: sync.skippedCount,
        skippedAttendees: sync.skippedAttendees,
      });
    }

    return Response.json(
      {
        ok: true,
        matched: attendees.length,
        sync: {
          enabled: sync.enabled,
          skipped: sync.skipped,
          successCount: sync.successCount,
          failedCount: sync.failedCount,
          skippedCount: sync.skippedCount || 0,
          reason: sync.reason || null,
          warningCount: (sync.warnings || []).length,
          failures: sync.failures,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("sale-signups resync error:", error);
    return Response.json(
      { error: error?.message || "Unable to resync sale signups." },
      { status: 500, headers }
    );
  }
}
