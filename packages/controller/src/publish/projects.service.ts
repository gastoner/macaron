import { Injectable } from "@nestjs/common";
import { type Project, type Projects, repoKey, RepoSlug } from "@open-macaron/contracts";
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

  /** Every project by name, its repositories by slug; a project without one is kept. */
  async list(): Promise<Projects> {
    const { projects, repos } = this.config.snapshot;
    const ready = await this.forks.readyForks();
    const byName = new Map<string, Project>([...projects.keys()].map((name) => [name, { name, repos: [] }]));
    const sorted = [...repos.values()].sort((a, b) => a.repo.localeCompare(b.repo));
    for (const { project, repo } of sorted) {
      const fork = ready.get(repoKey(repo));
      byName.get(project)?.repos.push({ repo, fork: fork === undefined ? null : RepoSlug.parse(`${fork.owner}/${fork.repo}`) });
    }
    return { projects: [...byName.values()].sort((a, b) => a.name.localeCompare(b.name)) };
  }
}
