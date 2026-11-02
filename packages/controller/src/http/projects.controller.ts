import { Controller, Get, Req } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { type Projects, Projects as ProjectsSchema } from "@open-macaron/contracts";
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
  @ApiOperation({ operationId: "listProjects", summary: "Every configured project, with each repository's fork once it is ready" })
  @ApiResponse({ status: 200, standardSchema: ProjectsSchema })
  @ApiResponse({ status: 401, description: "No valid session" })
  async list(@Req() request: Request): Promise<Projects> {
    await this.sessions.user(request.headers);
    return this.projects.list();
  }
}
