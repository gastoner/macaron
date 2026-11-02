import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { type ProjectsPage, ProjectsPage as ProjectsPageSchema, ProjectsQuery } from "@open-macaron/contracts";
import type { Request } from "express";
import { SessionsService } from "../accounts/sessions.service.ts";
import { ProjectsService } from "../publish/projects.service.ts";

/**
 * What the bot works on, the same for every signed-in user: capabilities are per user, never per
 * repository. Reached only by the web app (the edge never routes /v1/projects).
 */
@ApiTags("projects")
@ApiCookieAuth()
@Controller("v1/projects")
export class ProjectsController {
  constructor(
    private readonly sessions: SessionsService,
    private readonly projects: ProjectsService,
  ) {}

  @Get()
  @ApiOperation({ operationId: "listProjects", summary: "A page of the configured projects' repositories, each with its fork once it is ready" })
  @ApiResponse({ status: 200, standardSchema: ProjectsPageSchema })
  @ApiResponse({ status: 401, description: "No valid session" })
  async list(@Req() request: Request, @Query({ schema: ProjectsQuery }) query: ProjectsQuery): Promise<ProjectsPage> {
    await this.sessions.user(request.headers);
    return this.projects.page(query.limit, query.after);
  }
}
