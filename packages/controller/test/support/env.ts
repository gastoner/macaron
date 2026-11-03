import { parseEnv, type AppEnv } from "../../src/config/env.ts";

/** A complete, valid environment with fake credentials. Override what a test cares about. */
export function testEnv(overrides: Readonly<Record<string, string>> = {}): AppEnv {
  return parseEnv({
    NODE_ENV: "test",
    PUBLIC_URL: "https://macaron.example.test",
    DATABASE_URL: "postgres://macaron:macaron@localhost:5432/macaron",
    GH_INTERACT: "ghp_test_interact_000000000000000000",
    GH_PUSH: "github_pat_test_push_00000000000000000",
    GH_ORG: "github_pat_test_org_000000000000000000",
    RUNNER_REPO_ID: "1001",
    RUNNER_OWNER_ID: "2002",
    BIFROST_ADMIN_URL: "http://macaron-bifrost:8080",
    BIFROST_PUBLIC_URL: "https://macaron.example.test/llm/anthropic",
    BIFROST_ADMIN_PASSWORD: "bifrost-admin-password-000",
    LLM_PRICING_FILE: "/etc/macaron/pricing/pricing.json",
    WEBHOOK_HMAC: "0123456789abcdef0123456789abcdef",
    ...overrides,
  });
}
