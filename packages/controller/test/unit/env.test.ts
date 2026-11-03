import { describe, expect, it } from "vitest";
import { testEnv } from "../support/env.ts";

describe("MACARON_ALLOWED_USER_IDS", () => {
  it("is gone: an account of the web app decides who may trigger; a leftover value is ignored", () => {
    expect(testEnv({ MACARON_ALLOWED_USER_IDS: "42176370" })).not.toHaveProperty("MACARON_ALLOWED_USER_IDS");
  });
});

describe("Bifrost", () => {
  it("is configured from its variables", () => {
    expect(testEnv().bifrost).toEqual({
      adminUrl: "http://macaron-bifrost:8080",
      publicUrl: "https://macaron.example.test/llm/anthropic",
      username: "macaron",
      password: "bifrost-admin-password-000",
      pricingFile: "/etc/macaron/pricing/pricing.json",
      requestsPerMinute: 60,
    });
  });

  it("is required, prices included: without them no endpoint's provider could be priced", () => {
    expect(() => testEnv({ BIFROST_ADMIN_URL: "" })).toThrow(/BIFROST_ADMIN_URL/);
    expect(() => testEnv({ LLM_PRICING_FILE: "" })).toThrow(/LLM_PRICING_FILE/);
  });

  it("refuses a public URL runners would reach in clear text", () => {
    expect(() => testEnv({ BIFROST_PUBLIC_URL: "http://macaron.example.test/llm/anthropic" })).toThrow(/BIFROST_PUBLIC_URL/);
  });
});

describe("published configuration", () => {
  it("reads config/ from a directory when CONFIG_URL is unset", () => {
    expect(testEnv().publishedConfig).toBeUndefined();
  });

  it("needs CONFIG_URL and CONFIG_REPO_ID together", () => {
    expect(testEnv({ CONFIG_URL: "https://open-macaron.github.io/config/v1", CONFIG_REPO_ID: "1234" }).publishedConfig).toEqual({
      url: "https://open-macaron.github.io/config/v1",
      repoId: 1234,
    });
    expect(() => testEnv({ CONFIG_URL: "https://open-macaron.github.io/config/v1" })).toThrow(/CONFIG_REPO_ID: required/);
    expect(() => testEnv({ CONFIG_REPO_ID: "1234" })).toThrow(/CONFIG_URL: required/);
  });

  it("refuses a plain-HTTP URL", () => {
    expect(() => testEnv({ CONFIG_URL: "http://open-macaron.github.io/config/v1", CONFIG_REPO_ID: "1" })).toThrow(/CONFIG_URL/);
  });
});

describe("sign-in", () => {
  const signIn = {
    BETTER_AUTH_SECRET: "better-auth-secret-for-tests-0123456789",
    GITHUB_LOGIN_CLIENT_ID: "Iv23test",
    GITHUB_LOGIN_CLIENT_SECRET: "github-login-secret-for-tests-0000",
    MACARON_ADMIN_USER_IDS: "42176370",
  };

  it("is off until BETTER_AUTH_SECRET is set", () => {
    expect(testEnv().auth).toBeUndefined();
  });

  it("is configured with its client and the admins' ids", () => {
    expect(testEnv(signIn).auth).toEqual({ secret: signIn.BETTER_AUTH_SECRET, githubClientId: "Iv23test", githubClientSecret: signIn.GITHUB_LOGIN_CLIENT_SECRET, adminGithubIds: new Set([42_176_370]) });
  });

  it("names what is missing", () => {
    expect(() => testEnv({ BETTER_AUTH_SECRET: signIn.BETTER_AUTH_SECRET })).toThrow(/GITHUB_LOGIN_CLIENT_ID.*required for sign-in/s);
    expect(() => testEnv({ ...signIn, MACARON_ADMIN_USER_IDS: "axel7083" })).toThrow(/MACARON_ADMIN_USER_IDS/);
    expect(() => testEnv({ ...signIn, BETTER_AUTH_SECRET: "short" })).toThrow(/BETTER_AUTH_SECRET/);
  });
});

describe("LLM_ENDPOINT_DEFAULTS", () => {
  it("is empty when unset", () => {
    expect(testEnv().LLM_ENDPOINT_DEFAULTS).toEqual([]);
  });

  it("parses approved endpoints, normalising their base URL", () => {
    expect(testEnv({ LLM_ENDPOINT_DEFAULTS: '[{"name":"Anthropic API","baseUrl":"https://api.anthropic.com/"}]' }).LLM_ENDPOINT_DEFAULTS).toEqual([{ name: "Anthropic API", baseUrl: "https://api.anthropic.com", pricingNote: null }]);
  });

  it("refuses what isn't a list of https endpoints", () => {
    expect(() => testEnv({ LLM_ENDPOINT_DEFAULTS: "not json" })).toThrow(/LLM_ENDPOINT_DEFAULTS/);
    expect(() => testEnv({ LLM_ENDPOINT_DEFAULTS: '[{"name":"Plain","baseUrl":"http://api.example.com"}]' })).toThrow(/LLM_ENDPOINT_DEFAULTS/);
    expect(() => testEnv({ LLM_ENDPOINT_DEFAULTS: '[{"name":"Creds","baseUrl":"https://user:pass@api.example.com"}]' })).toThrow(/LLM_ENDPOINT_DEFAULTS/);
  });
});
