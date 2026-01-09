import { runInventorySync } from "../route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const expectedSecret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const providedSecret = url.searchParams.get("secret");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  if (!isVercelCron && (!expectedSecret || providedSecret !== expectedSecret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  return runInventorySync();
}
