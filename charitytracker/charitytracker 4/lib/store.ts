import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { Donation } from "./types";

// All donations live under a single key as a JSON array. That's plenty for the
// scale this app runs at, and keeps reads/writes to one round-trip.
const KEY = "charity:donations";

// On Vercel we use Upstash Redis (a hosted database) because serverless
// functions can't share a writable file. Locally — where no Redis env vars are
// set — we fall back to a JSON file so `npm run dev` works with zero setup.
function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

// True when a hosted database is configured. Used to give a clear error if
// someone deploys to Vercel without connecting the database.
export function hasDatabase(): boolean {
  return getRedis() !== null;
}

const filePath = path.join(process.cwd(), "data", "donations.json");

export async function getDonations(): Promise<Donation[]> {
  const redis = getRedis();
  if (redis) {
    const data = await redis.get<Donation[]>(KEY);
    return Array.isArray(data) ? data : [];
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return Array.isArray(parsed.donations) ? parsed.donations : [];
  } catch {
    return [];
  }
}

export async function saveDonations(donations: Donation[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(KEY, donations);
    return;
  }
  fs.writeFileSync(filePath, JSON.stringify({ donations }, null, 2));
}
