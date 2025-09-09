// src/lib/redis/client.js
import pkg from "redis";             
const { createClient } = pkg;

let client = null;
export async function getRedis() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (e) => console.error("Redis error:", e));
    await client.connect();
  }
  return client;
}