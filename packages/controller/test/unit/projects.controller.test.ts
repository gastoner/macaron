import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionsService } from "../../src/accounts/sessions.service.ts";
import { SignInRequired } from "../../src/common/errors.ts";
import { DomainErrorFilter } from "../../src/http/domain-error.filter.ts";
import { ProjectsController } from "../../src/http/projects.controller.ts";
import { ProjectsService } from "../../src/publish/projects.service.ts";

const user = vi.fn<() => Promise<{ id: string }>>();
const list = vi.fn<() => Promise<{ projects: never[] }>>();

@Module({
  controllers: [ProjectsController],
  providers: [
    { provide: SessionsService, useValue: { user } },
    { provide: ProjectsService, useValue: { list } },
  ],
})
class TestModule {}

describe("GET /v1/projects", () => {
  let app: NestExpressApplication;
  let base: string;

  beforeAll(async () => {
    app = await NestFactory.create<NestExpressApplication>(TestModule, { logger: false });
    // As main.ts: domain errors become their status.
    app.useGlobalFilters(new DomainErrorFilter());
    await app.listen(0, "127.0.0.1");
    base = await app.getUrl();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("reads nothing without a session", async () => {
    user.mockRejectedValue(new SignInRequired("no valid session"));

    const response = await fetch(`${base}/v1/projects`);

    expect(response.status).toBe(401);
    expect(list).not.toHaveBeenCalled();
  });

  it("lists the projects for any signed-in user", async () => {
    user.mockResolvedValue({ id: "usr1" });
    list.mockResolvedValue({ projects: [] });

    const response = await fetch(`${base}/v1/projects`);

    expect(await response.json()).toEqual({ projects: [] });
  });
});
