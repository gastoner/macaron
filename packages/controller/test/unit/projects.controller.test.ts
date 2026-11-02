import "reflect-metadata";
import { Module, StandardSchemaValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionsService } from "../../src/accounts/sessions.service.ts";
import { SignInRequired } from "../../src/common/errors.ts";
import { DomainErrorFilter } from "../../src/http/domain-error.filter.ts";
import { ProjectsController } from "../../src/http/projects.controller.ts";
import { ProjectsService } from "../../src/publish/projects.service.ts";

const user = vi.fn<() => Promise<{ id: string }>>();
const page = vi.fn<(limit: number, after: string | undefined) => Promise<{ rows: never[]; nextCursor: null }>>();

@Module({
  controllers: [ProjectsController],
  providers: [
    { provide: SessionsService, useValue: { user } },
    { provide: ProjectsService, useValue: { page } },
  ],
})
class TestModule {}

describe("GET /v1/projects", () => {
  let app: NestExpressApplication;
  let base: string;

  beforeAll(async () => {
    app = await NestFactory.create<NestExpressApplication>(TestModule, { logger: false });
    // As main.ts: queries are validated with their defaults, domain errors become their status.
    app.useGlobalPipes(new StandardSchemaValidationPipe({ transform: true }));
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
    expect(page).not.toHaveBeenCalled();
  });

  it("serves a page to any signed-in user, 25 rows by default", async () => {
    user.mockResolvedValue({ id: "usr1" });
    page.mockResolvedValue({ rows: [], nextCursor: null });

    const response = await fetch(`${base}/v1/projects`);

    expect(await response.json()).toEqual({ rows: [], nextCursor: null });
    expect(page).toHaveBeenCalledWith(25, undefined);
  });

  it("refuses a page over the limit", async () => {
    user.mockResolvedValue({ id: "usr1" });

    const response = await fetch(`${base}/v1/projects?limit=101`);

    expect(response.status).toBe(400);
    expect(page).not.toHaveBeenCalled();
  });
});
