import type { R2Bucket, D1Database } from "@cloudflare/workers-types";

declare global {
    interface CloudflareEnv {
        R2_BUCKET: R2Bucket;
        DB: D1Database;
    }
}

export { };
