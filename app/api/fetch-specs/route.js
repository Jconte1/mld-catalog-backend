// src/app/api/fetch-specs/route.js
import JSZip from "jszip";
import { ingestProductsFromXml } from "../../../lib/catalogue/ingestProductsFromXml";

const FEED_URL =
  "https://demo37861.appliances.dev.rwsgateway.com/_CGI/specs.zip?PW=-26160157&MAN=COVE";

export const dynamic = "force-dynamic"; // always fetch fresh feed
export const revalidate = 0;            // don't cache this route at all

export async function GET(req) {
  // Only run when called by Vercel Cron
  if (req.headers.get("x-vercel-cron") !== "1") {
    return new Response("ignored");
  }

  try {
    // 1) Download specs.zip (what you currently do in the browser)
    const res = await fetch(FEED_URL, {
      cache: "no-store", // 🔑 prevent Next.js data cache (2MB limit) from being used
    });

    if (!res.ok) {
      console.error("❌ Failed to download specs.zip:", res.status, res.statusText);
      return new Response("failed to download specs.zip", { status: 500 });
    }

    const zipData = await res.arrayBuffer();

    // 2) Unzip and grab the XML file (what you do with “Extract all”)
    const zip = await JSZip.loadAsync(zipData);

    const xmlFileName = Object.keys(zip.files).find((name) =>
      name.toLowerCase().endsWith(".xml")
    );

    if (!xmlFileName) {
      console.error("❌ No XML file found in specs.zip");
      return new Response("no xml file found in specs.zip", { status: 500 });
    }

    const xmlString = await zip.files[xmlFileName].async("string");

    // 3) Hand off to ingestion pipeline (parse + upsert into Prisma)
    await ingestProductsFromXml(xmlString);

    return new Response("ok");
  } catch (err) {
    console.error("❌ Error in /api/fetch-specs:", err);
    return new Response("internal error", { status: 500 });
  }
}
