// api/index.js
import app from "../src/app.js";

export default function handler(req, res) {
  // Make Express see the same paths you used before (/api/products, etc.)
  if (req.url.startsWith('/api/')) req.url = req.url.slice(4);

  // (Optional) fast-path OPTIONS; your cors() middleware should also handle this
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.mld.com');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).end();
    return;
  }

  return app(req, res);
}
