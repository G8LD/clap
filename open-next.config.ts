import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal configuration: this app has no ISR / `revalidate`, so no incremental
// cache override (and therefore no R2 bucket) is required. This keeps us on the
// Cloudflare Workers free tier.
export default defineCloudflareConfig();
