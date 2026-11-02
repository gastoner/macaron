import { fileURLToPath } from "node:url";
import { type ConfigSnapshot, loadConfigTree, type RepoConfig, RepoSlug } from "@open-macaron/contracts";
import { beforeAll, describe, expect, it } from "vitest";
import { BotIdentity } from "../../src/github/bot-identity.ts";
import { createGitHub } from "../../src/github/github.ts";
import { ProjectsService } from "../../src/publish/projects.service.ts";
import { testEnv } from "../support/env.ts";
import { FakeClock } from "../support/fakes.ts";
import { fixedConfig, forkRegistry, MemoryForkStore } from "../support/forks.ts";

const UPSTREAM = "axel7083/foobar-tmp-demo";
const env = testEnv();
const gh = createGitHub("test", "token", env.GITHUB_API_VERSION, { throttled: false });

class FixedIdentity extends BotIdentity {
  override get identity() {
    return { login: "macaron-bot", id: 7, email: "7+macaron-bot@users.noreply.github.com" };
  }
}

let snapshot: ConfigSnapshot;
let config: RepoConfig;

beforeAll(async () => {
  snapshot = await loadConfigTree(fileURLToPath(new URL("../../../contracts/test/fixtures/config", import.meta.url)));
  const found = snapshot.repos.get(UPSTREAM);
  if (found === undefined) throw new Error(`${UPSTREAM} missing from the fixtures`);
  config = found;
});

function service(tree: ConfigSnapshot, store: MemoryForkStore): ProjectsService {
  const repoConfig = fixedConfig(env, tree);
  const registry = forkRegistry({ gh, bot: new FixedIdentity(gh, gh, gh, env), env, clock: new FakeClock(), store, config: repoConfig });
  return new ProjectsService(repoConfig, registry);
}

/** The fixtures' projects, with `repos` as the only repositories. */
function withRepos(...repos: readonly RepoConfig[]): ConfigSnapshot {
  return { ...snapshot, repos: new Map(repos.map((repo) => [repo.repo.toLowerCase(), repo])) };
}

describe("ProjectsService", () => {
  it("lists every project by name, each repository by slug", async () => {
    const { projects } = await service(snapshot, new MemoryForkStore()).list();

    const names = projects.map((project) => project.name);
    expect(names).toEqual([...snapshot.projects.keys()].sort((a, b) => a.localeCompare(b)));
    expect(projects.flatMap((project) => project.repos)).toHaveLength(snapshot.repos.size);
    for (const { repos } of projects) {
      const slugs = repos.map(({ repo }) => repo);
      expect(slugs).toEqual(slugs.toSorted((a, b) => a.localeCompare(b)));
    }
  });

  it("gives a repository its fork once ready, and none before", async () => {
    const other = { ...config, repo: RepoSlug.parse("org-x/not-ready") };
    const store = new MemoryForkStore().ready(UPSTREAM, "abc123-foobar-tmp-demo");
    await store.record({ upstreamId: 99, upstreamKey: "org-x/not-ready", forkId: 199, forkName: "def456-not-ready" });

    const { projects } = await service(withRepos(config, other), store).list();

    expect(projects.find((project) => project.name === config.project)?.repos).toEqual([
      { repo: UPSTREAM, fork: "macaron-bot/abc123-foobar-tmp-demo" },
      { repo: "org-x/not-ready", fork: null },
    ]);
  });

  it("keeps a project without repositories", async () => {
    const { projects } = await service(withRepos(), new MemoryForkStore()).list();

    expect(projects).toHaveLength(snapshot.projects.size);
    expect(projects.every((project) => project.repos.length === 0)).toBe(true);
  });

  it("doesn't list a ready fork whose repository left the configuration", async () => {
    const store = new MemoryForkStore().ready("org-x/gone", "abc123-gone");

    const { projects } = await service(withRepos(config), store).list();

    expect(projects.flatMap((project) => project.repos)).toEqual([{ repo: UPSTREAM, fork: null }]);
  });

  it("matches a fork whatever the case of the configured name, and keeps that case", async () => {
    const mixed = { ...config, repo: RepoSlug.parse("Axel7083/Foobar-Tmp-Demo") };
    const store = new MemoryForkStore().ready(UPSTREAM, "abc123-foobar-tmp-demo");

    const { projects } = await service(withRepos(mixed), store).list();

    expect(projects.flatMap((project) => project.repos)).toEqual([{ repo: "Axel7083/Foobar-Tmp-Demo", fork: "macaron-bot/abc123-foobar-tmp-demo" }]);
  });
});
