// app/api/closeout/inventory/route.js
import prisma from '../../../../lib/prisma';
import { XMLParser } from 'fast-xml-parser';

// Ensure Node runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------- CORS HELPERS ----------

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://www.mld.com',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function extractText(value, label) {
  if (value == null) return '';

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    console.log(`ℹ️ XML field ${label} came as object:`, JSON.stringify(value));

    if (Object.prototype.hasOwnProperty.call(value, '#text')) {
      return String(value['#text']);
    }

    const first = Object.values(value)[0];
    if (first != null) {
      return String(first);
    }

    return '';
  }

  return String(value);
}

// ---------- EMAIL HELPER (MICROSOFT GRAPH sendMail) ----------
//
// Add these env vars in Vercel (Production):
// MS_TENANT_ID
// MS_CLIENT_ID
// MS_CLIENT_SECRET
// MS_SENDER_EMAIL   (optional; defaults to AUTO_EMAIL)
//
// Keep using:
// END_USER_EMAIL, CC_EMAIL, AUTO_EMAIL

let cachedToken = null;
let cachedTokenExp = 0; // unix seconds

async function getGraphAccessToken() {
  const tenantId = process.env.MS_TENANT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;

  if (!tenantId) throw new Error('Missing MS_TENANT_ID env var');
  if (!clientId) throw new Error('Missing MS_CLIENT_ID env var');
  if (!clientSecret) throw new Error('Missing MS_CLIENT_SECRET env var');

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedTokenExp && now < cachedTokenExp - 60) {
    return cachedToken;
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope: 'https://graph.microsoft.com/.default',
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `Graph token request failed: ${res.status} ${res.statusText} - ${txt}`
    );
  }

  const data = await res.json();

  cachedToken = data.access_token;
  cachedTokenExp = now + (data.expires_in || 3599);

  return cachedToken;
}

function asRecipients(addresses) {
  const list = Array.isArray(addresses) ? addresses : [addresses];
  return list
    .filter(Boolean)
    .map((addr) => ({ emailAddress: { address: String(addr).trim() } }));
}

async function sendFailureEmail(toEmail, failures) {
  if (!failures.length) return;

  const sender = process.env.MS_SENDER_EMAIL || process.env.AUTO_EMAIL;
  if (!sender) throw new Error('Missing MS_SENDER_EMAIL (or AUTO_EMAIL) env var');
  if (!toEmail) throw new Error('Missing END_USER_EMAIL (toEmail) env var');

  const token = await getGraphAccessToken();

  const htmlContent = `
    <h2>Inventory Sync Failures</h2>
    <p>The following inventory items could not be processed because they were not found in the product catalog:</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Acumatica SKU</th>
          <th>Normalized Model Number</th>
          <th>Reason</th>
        </tr>
      </thead>
      <tbody>
        ${failures
          .map(
            (f) => `
          <tr>
            <td>${f.acumaticaSku}</td>
            <td>${f.modelNumber}</td>
            <td>${f.reason}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;

  const payload = {
    message: {
      subject: '⚠️ Inventory Sync Failures Detected',
      body: {
        contentType: 'HTML',
        content: htmlContent,
      },
      toRecipients: asRecipients(toEmail),
      ccRecipients: asRecipients(process.env.CC_EMAIL),
      from: { emailAddress: { address: sender } },
      sender: { emailAddress: { address: sender } },
    },
    saveToSentItems: false,
  };

  const graphUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
    sender
  )}/sendMail`;

  const res = await fetch(graphUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `Graph sendMail failed: ${res.status} ${res.statusText} - ${txt}`
    );
  }

  console.log(`✅ Failure email sent to ${toEmail}`);
}

// ---------- ODATA FETCH + PARSE ----------

async function fetchODataXml() {
  const url =
    process.env.ACUMATICA_CLOSEOUT_ODATA_URL ||
    'https://acumatica.mld.com/OData/MLD/Closeout%20Inventory%20Counts';

  const username = process.env.ACUMATICA_USERNAME;
  const password = process.env.ACUMATICA_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing ACUMATICA_USERNAME or ACUMATICA_PASSWORD env vars');
  }

  const authHeader =
    'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
      Accept: 'application/xml',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`OData fetch failed: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

function parseODataXmlToItems(xml) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    parseTagValue: true,
    trimValues: false,
  });

  const json = parser.parse(xml);

  const entriesRaw = json?.feed?.entry || [];
  const entries = Array.isArray(entriesRaw) ? entriesRaw : [entriesRaw];

  const items = [];

  for (const entry of entries) {
    const props = entry?.content?.properties;
    if (!props) continue;

    const inventoryId = extractText(props.InventoryID, 'InventoryID').trim();
    const warehouse = extractText(props.Warehouse, 'Warehouse').trim();
    const location = extractText(props.Location, 'Location').trim();
    const description = extractText(props.Description, 'Description');
    const itemClass = extractText(props.ItemClass, 'ItemClass');
    const brand = extractText(props.Brand, 'Brand');

    const qtyOnHandStr = extractText(props.QtyOnHand, 'QtyOnHand');
    const defaultPriceStr = extractText(props.DefaultPrice, 'DefaultPrice');
    const msrpStr = extractText(props.MSRP, 'MSRP');

    const qtyOnHand = Number(qtyOnHandStr) || 0;
    const defaultPrice =
      defaultPriceStr !== '' && defaultPriceStr != null
        ? Number(defaultPriceStr)
        : null;
    const msrp = msrpStr !== '' && msrpStr != null ? Number(msrpStr) : 0;

    items.push({
      inventoryId,
      warehouse,
      location,
      description,
      itemClass,
      brand,
      qtyOnHand,
      defaultPrice,
      msrp,
    });
  }

  return items;
}

// ---------- CORE SYNC LOGIC ----------

export async function runInventorySync() {
  try {
    console.log('🔄 Starting closeout inventory sync from OData...');
    const xml = await fetchODataXml();
    const items = parseODataXmlToItems(xml);

    if (!items.length) {
      console.warn('⚠️ No items returned from OData Closeout Inventory Counts.');
      return Response.json(
        { error: 'No inventory records returned from OData' },
        { status: 400, headers: corsHeaders() }
      );
    }

    console.log(`📦 Received ${items.length} closeout inventory rows from OData.`);

    const updatedRecords = [];
    const failures = [];
    const seenSkus = new Set();
    const seenWarehouses = new Set();
    let missingDeletedCount = 0;
    let missingDeletedRows = [];

    for (const item of items) {
      const acumaticaSku = item.inventoryId;
      if (!acumaticaSku) {
        console.log('❌ Missing InventoryID on item, skipping.');
        continue;
      }

      seenSkus.add(acumaticaSku);


      const parts = acumaticaSku.split(/\s+/);
      if (parts.length < 3) {
        console.log('❌ Invalid acumaticaSku format. Parts:', parts);
        continue;
      }

      const modelNumber = parts[1];
      const normalizedModelNumber = modelNumber.replace(/[-\/\s]/g, '');

      const qtyOnHand = item.qtyOnHand;
      const defaultPrice = item.defaultPrice;
      const msrp = item.msrp;

      const warehouse = item.warehouse || 'SALT LAKE CLOSEOUT';

      seenWarehouses.add(warehouse);
      const bin = item.location || 'default';

      const newInBox = false;

      console.log(
        `🔎 Processing Item - acumaticaSku: "${acumaticaSku}", modelNumber: "${modelNumber}", normalizedModelNumber: "${normalizedModelNumber}", qtyOnHand: ${qtyOnHand}`
      );

      const existingRecord = await prisma.closeout_inventory.findFirst({
        where: {
          modelNumber: normalizedModelNumber,
          acumaticaSku,
        },
      });

      if (existingRecord) {
        await prisma.closeout_inventory.update({
          where: { id: existingRecord.id },
          data: {
            quantity: qtyOnHand,
            lastSyncedAt: new Date(),
            price: defaultPrice,
            msrp,
            warehouse,
            bin,
            newInBox,
          },
        });

        console.log(
          `✅ Updated existing closeout_inventory: "${normalizedModelNumber}" (qtyOnHand: ${qtyOnHand})`
        );

        updatedRecords.push({
          modelNumber: normalizedModelNumber,
          acumaticaSku,
          qtyOnHand,
          defaultPrice,
          msrp,
          warehouse,
          bin,
        });
      } else {
        const product = await prisma.products.findFirst({
          where: { model: normalizedModelNumber },
        });

        if (!product) {
          console.log(
            `❌ Product not found in catalog for normalizedModelNumber: "${normalizedModelNumber}", acumaticaSku: "${acumaticaSku}"`
          );
          failures.push({
            acumaticaSku,
            modelNumber: normalizedModelNumber,
            reason: 'Product not found in catalog',
          });
          continue;
        }

        await prisma.closeout_inventory.create({
          data: {
            productId: product.id,
            modelNumber: normalizedModelNumber,
            acumaticaSku,
            quantity: qtyOnHand,
            lastSyncedAt: new Date(),
            price: defaultPrice,
            msrp,
            warehouse,
            bin,
            newInBox,
          },
        });

        console.log(
          `✅ Created new closeout_inventory for normalizedModelNumber: "${normalizedModelNumber}" (qtyOnHand: ${qtyOnHand})`
        );

        updatedRecords.push({
          modelNumber: normalizedModelNumber,
          acumaticaSku,
          qtyOnHand,
          defaultPrice,
          msrp,
          warehouse,
          bin,
        });
      }
    }

    if (seenSkus.size > 0) {
      const seenSkuList = Array.from(seenSkus);
      const seenWarehouseList = Array.from(seenWarehouses);

      const missingWhere = {
        acumaticaSku: { notIn: seenSkuList },
      };

      if (seenWarehouseList.length > 0) {
        missingWhere.warehouse = { in: seenWarehouseList };
      }

      const missingRows = await prisma.closeout_inventory.findMany({
        where: missingWhere,
        select: { acumaticaSku: true, modelNumber: true },
      });

      const missingDeleted = await prisma.closeout_inventory.deleteMany({
        where: missingWhere,
      });

      missingDeletedCount = missingDeleted.count;

      console.log(
        `Deleted ${missingDeletedCount} closeout_inventory rows not returned by OData sync.`
      );
      missingDeletedRows = missingRows;
    }


    if (failures.length > 0) {
      console.log(
        `⚠️ ${failures.length} inventory items failed to match products. Sending failure email...`
      );
      await sendFailureEmail(process.env.END_USER_EMAIL, failures);
    } else {
      console.log('✅ No failures to report.');
    }

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const deletedStale = await prisma.closeout_inventory.deleteMany({
      where: {
        quantity: 0,
        lastSyncedAt: {
          lte: threeDaysAgo,
        },
      },
    });

    console.log(
      `🧹 Housekeeping: deleted ${deletedStale.count} stale closeout_inventory records (qty 0 for >= 3 days).`
    );

    if (missingDeletedRows.length > 0) {
      console.log(
        'Deleted closeout rows:',
        missingDeletedRows.map(
          (row) => `${row.acumaticaSku} | ${row.modelNumber}`
        )
      );
    }

    return Response.json(
      {
        success: true,
        updatedCount: updatedRecords.length,
        updatedRecords,
        failuresCount: failures.length,
        failures,
        missingDeletedCount,
        housekeepingDeletedCount: deletedStale.count,
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error in /api/closeout/inventory:', error);
    return Response.json(
      { error: 'Server error', details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST() {
  return runInventorySync();
}

