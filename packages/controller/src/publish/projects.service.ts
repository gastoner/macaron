import { Injectable } from "@nestjs/common";
import { type ProjectRow, type ProjectsPage, repoKey, RepoSlug } from "@open-macaron/contracts";
import { RepoConfigService } from "../config/repo-config.service.ts";
import { ForkRegistry } from "./fork-registry.ts";

/**
 * The configured projects and how far each repository's onboarding went. The configuration is the
 * source: a repository that left it keeps its fork (nothing deletes one), and must not be listed.
 */
@Injectable()
export class ProjectsService {
  constructor(
    private readonly config: RepoConfigService,
    private readonly forks: ForkRegistry,
  ) {}

  /**
   * A page of rows: one per repository, one for a project without any. The cursor is a row's key,
   * not an offset: a configuration reloaded between two pages neither repeats nor skips a row.
   */
  async page(limit: number, after: string | undefined): Promise<ProjectsPage> {
    const { projects, repos } = this.config.snapshot;
    const keyed: { readonly key: string; readonly project: string; readonly repo: RepoSlug | null }[] = [...repos.values()].map(({ project, repo }) => ({ key: `${project}/${repoKey(repo)}`, project, repo }));
    const populated = new Set(keyed.map((row) => row.project));
    for (const project of projects.keys()) if (!populated.has(project)) keyed.push({ key: `${project}/`, project, repo: null });
    // By code unit, as the cursor is compared. Project slugs hold no `/`, so a project's rows stay together.
    const sorted = keyed.filter((row) => after === undefined || row.key > after).sort((a, b) => (a.key < b.key ? -1 : 1));
    const page = sorted.slice(0, limit);
    const ready = await this.forks.readyForks();
    const rows = page.map(({ project, repo }): ProjectRow => {
      const fork = repo === null ? undefined : ready.get(repoKey(repo));
      return { project, repo, fork: fork === undefined ? null : RepoSlug.parse(`${fork.owner}/${fork.repo}`) };
    });
    return { rows, nextCursor: sorted.length > limit ? (page.at(-1)?.key ?? null) : null };
  }
}
