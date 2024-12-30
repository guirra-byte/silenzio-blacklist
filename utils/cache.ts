import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

export const redis = () => {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
};

export async function reportCacheKeys(
  cursor: string = "0",
  keys: string[] = [],
) {
  let [nextCursor, scanKeys] = await redis().scan(cursor);
  scanKeys.forEach((key) => {
    if (new RegExp(/^\(?\d{2}\)?\s?(?:9?\d{4})-?\d{4}$/).test(key)) {
      keys = [...keys, key];
      cursor = nextCursor;
    }
  });

  if (cursor !== "0") {
    reportCacheKeys(cursor, keys);
  }

  return keys;
}
