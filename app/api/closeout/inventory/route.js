// app/api/closeout/inventory/route.js
import prisma from '../../../../lib/prisma';

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

// ---------- QUEUE ERP FETCH ----------

async function queueErpRequest(path, opts = {}) {
  const base = requireEnv('MLD_QUEUE_BASE_URL').replace(/\/$/, '');
  const token = requireEnv('MLD_QUEUE_TOKEN');
  const method = opts.method || 'GET';
  const timeoutMs = getMs(process.env.MLD_QUEUE_TIMEOUT_MS || opts.timeoutMs, 30000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: method === 'POST' ? JSON.stringify(opts.body || {}) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `Queue request failed (${res.status}) path=${path} body=${text.slice(0, 400)}`
      );
    }

    return text ? JSON.parse(text) : {};
  } finally {
    clearTimeout(timeout);
  }
}

async function queueErpJobRequest(submitPath, body) {
  const timeoutMs = getMs(process.env.MLD_QUEUE_JOB_POLL_TIMEOUT_MS, 60000);
  const pollIntervalMs = getMs(process.env.MLD_QUEUE_JOB_POLL_INTERVAL_MS, 300);
  const startedAt = Date.now();

  const submit = await queueErpRequest(submitPath, { method: 'POST', body, timeoutMs });
  if (!submit?.jobId) {
    throw new Error(`Queue job submit missing jobId path=${submitPath}`);
  }

  console.log('[closeout-sync] queue job submitted', { submitPath, jobId: submit.jobId });

  while (Date.now() - startedAt < timeoutMs) {
    const status = await queueErpRequest(`/api/erp/jobs/${submit.jobId}`, {
      method: 'GET',
      timeoutMs,
    });

    if (status?.status === 'succeeded') {
      return status?.result || {};
    }
    if (status?.status === 'failed') {
      throw new Error(
        `Queue job failed path=${submitPath} jobId=${submit.jobId} error=${status?.error || 'unknown'}`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Queue job timeout path=${submitPath} timeoutMs=${timeoutMs}`);
}

function parseQueueRowsToItems(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const items = [];

  for (const row of list) {
    const inventoryId = extractText(row?.InventoryID, 'InventoryID').trim();
    const warehouse = extractText(row?.Warehouse, 'Warehouse').trim();
    const location = extractText(row?.Location, 'Location').trim();
    const description = extractText(row?.Description, 'Description');
    const itemClass = extractText(row?.ItemClass, 'ItemClass');
    const brand = extractText(row?.Brand, 'Brand');

    const qtyOnHandStr = extractText(row?.QtyOnHand, 'QtyOnHand');
    const defaultPriceStr = extractText(row?.DefaultPrice, 'DefaultPrice');
    const msrpStr = extractText(row?.MSRP, 'MSRP');

    const qtyOnHand = Number(qtyOnHandStr) || 0;
    const defaultPrice =
      defaultPriceStr !== '' && defaultPriceStr != null && Number.isFinite(Number(defaultPriceStr))
        ? Number(defaultPriceStr)
        : null;
    const msrp =
      msrpStr !== '' && msrpStr != null && Number.isFinite(Number(msrpStr))
        ? Number(msrpStr)
        : 0;

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
    console.log('🔄 Starting closeout inventory sync from queue report...');
    if ((process.env.USE_QUEUE_ERP || '').trim().toLowerCase() !== 'true') {
      throw new Error('USE_QUEUE_ERP must be true for closeout sync');
    }

    const result = await queueErpJobRequest('/api/erp/jobs/reports/closeout-inventory', {});
    const items = parseQueueRowsToItems(result?.rows);

    if (!items.length) {
      console.warn('⚠️ No items returned from queue report Closeout Inventory Counts.');
      return Response.json(
        { error: 'No inventory records returned from queue report' },
        { status: 400, headers: corsHeaders() }
      );
    }

    console.log(`📦 Received ${items.length} closeout inventory rows from queue report.`);

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

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function getMs(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function POST() {
  return runInventorySync();
}

