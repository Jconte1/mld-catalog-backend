import { runInventorySync } from "../route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const userAgent = req.headers.get("user-agent") || "";
  const isVercelCron = userAgent.toLowerCase().startsWith("vercel-cron/");

  if (!isVercelCron) {
    console.warn("Cron auth failed", {
      isVercelCron,
      isVercelCronUA: Boolean(userAgent),
    });
    return new Response("Unauthorized", { status: 401 });
  }

  return runInventorySync();
}
