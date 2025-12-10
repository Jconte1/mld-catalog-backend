// app/api/closeout/inventory/route.js
import prisma from '../../../../lib/prisma';
import nodemailer from 'nodemailer';
import { XMLParser } from 'fast-xml-parser';

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

  // If it's already a string or number, just convert to string
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  // If it's an object, log it for debugging once
  if (typeof value === 'object') {
    console.log(`ℹ️ XML field ${label} came as object:`, JSON.stringify(value));

    // Common fast-xml-parser pattern: { "#text": "value", "@_xml:space": "preserve" }
    if (Object.prototype.hasOwnProperty.call(value, '#text')) {
      return String(value['#text']);
    }

    // Fallback: try the first value inside the object
    const first = Object.values(value)[0];
    if (first != null) {
      return String(first);
    }

    return '';
  }

  return String(value);
}

// ---------- EMAIL HELPER ----------

function makeTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.AUTO_EMAIL,
      pass: process.env.AUTO_EMAIL_PASSWORD,
    },
  });
}

async function sendFailureEmail(toEmail, failures) {
  if (!failures.length) return;

  const transporter = makeTransporter();

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

  await transporter.sendMail({
    from: `"Inventory Sync" <${process.env.AUTO_EMAIL}>`,
    to: toEmail,
    cc: process.env.CC_EMAIL,
    subject: '⚠️ Inventory Sync Failures Detected',
    html: htmlContent,
  });

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
    throw new Error(
      `OData fetch failed: ${res.status} ${res.statusText}`
    );
  }

  return res.text();
}

function parseODataXmlToItems(xml) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true, // turns m:properties -> properties, d:InventoryID -> InventoryID
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

export async function POST() {
  try {
    // 1) Fetch OData feed from Acumatica and parse XML into JS objects
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

    // 2) Process each OData item (upsert into closeout_inventory)
    for (const item of items) {
      const acumaticaSku = item.inventoryId;
      if (!acumaticaSku) {
        console.log('❌ Missing InventoryID on item, skipping.');
        continue;
      }

      const parts = acumaticaSku.split(/\s+/); // split on any whitespace
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
      const bin = item.location || 'default';

      // Simple placeholder rule: everything is NOT new-in-box by default.
      // You can customize this later based on description / itemClass / etc.
      const newInBox = false;

      console.log(
        `🔎 Processing Item - acumaticaSku: "${acumaticaSku}", modelNumber: "${modelNumber}", normalizedModelNumber: "${normalizedModelNumber}", qtyOnHand: ${qtyOnHand}`
      );

      // Look for existing closeout_inventory record for this SKU + model
      const existingRecord = await prisma.closeout_inventory.findFirst({
        where: {
          modelNumber: normalizedModelNumber,
          acumaticaSku,
        },
      });

      if (existingRecord) {
        // Update quantity, price, msrp, warehouse, bin, and timestamp
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
        // Need to link to a product in products table via model
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

    // 3) Send ONE failure email for this entire sync run (if any failures)
    if (failures.length > 0) {
      console.log(
        `⚠️ ${failures.length} inventory items failed to match products. Sending failure email...`
      );
      await sendFailureEmail(process.env.END_USER_EMAIL, failures);
    } else {
      console.log('✅ No failures to report.');
    }

    // 4) Housekeeping: delete records that have been zero quantity for >= 3 days
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

    // 5) Return summary JSON
    return Response.json(
      {
        success: true,
        updatedCount: updatedRecords.length,
        updatedRecords,
        failuresCount: failures.length,
        failures,
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
