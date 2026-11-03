import { fileURLToPath } from "node:url";
import { z } from "zod";
import type { BifrostEnv } from "../../src/config/env.ts";

const LiveGitHub = z.object({ GH_PUSH: z.string().min(20), GITHUB_API_VERSION: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default("2026-03-10") });

/**
 * The bot's push token for live tests (`pnpm test:live`, with ~/.config/macaron/dev.env loaded),
 * or undefined when it isn't there — live tests then skip instead of failing.
 */
export function liveGitHub(): { readonly pushToken: string; readonly apiVersion: string } | undefined {
  // eslint-disable-next-line no-restricted-syntax -- tests read the developer's real environment on purpose
  const parsed = LiveGitHub.safeParse(process.env);
  return parsed.success ? { pushToken: parsed.data.GH_PUSH, apiVersion: parsed.data.GITHUB_API_VERSION } : undefined;
}

const LiveBifrost = z.object({
  BIFROST_ADMIN_URL: z.url(),
  BIFROST_ADMIN_PASSWORD: z.string().min(20),
  BIFROST_ADMIN_USERNAME: z.string().min(1).default("macaron"),
});

/**
 * A local Bifrost (deploy/bifrost/dev.sh) for live tests, or undefined when BIFROST_ADMIN_URL isn't
 * in the developer's environment. Runners' requests go straight to Bifrost's /anthropic route.
 */
/** The prices production pins, as the controller reads them. */
export const PINNED_PRICES = fileURLToPath(new URL("../../../../deploy/bifrost/pricing.json", import.meta.url));

export function liveBifrost(): BifrostEnv | undefined {
  // eslint-disable-next-line no-restricted-syntax -- tests read the developer's real environment on purpose
  const parsed = LiveBifrost.safeParse(process.env);
  if (!parsed.success) return undefined;
  const { BIFROST_ADMIN_URL: adminUrl, BIFROST_ADMIN_PASSWORD: password, BIFROST_ADMIN_USERNAME: username } = parsed.data;
  return { adminUrl, publicUrl: new URL("/anthropic", adminUrl).toString(), username, password, pricingFile: PINNED_PRICES, requestsPerMinute: 60 };
}

const LiveUpstream = z.object({ LLM_UPSTREAM_URL: z.url({ protocol: /^https$/ }), LLM_UPSTREAM_KEY: z.string().min(8) });

/** The developer's own LLM endpoint and key (dev.env), standing in for a user's in live tests. */
export function liveUpstream(): { readonly baseUrl: string; readonly key: string } | undefined {
  // eslint-disable-next-line no-restricted-syntax -- tests read the developer's real environment on purpose
  const parsed = LiveUpstream.safeParse(process.env);
  return parsed.success ? { baseUrl: parsed.data.LLM_UPSTREAM_URL.replace(/\/+$/, ""), key: parsed.data.LLM_UPSTREAM_KEY } : undefined;
}
