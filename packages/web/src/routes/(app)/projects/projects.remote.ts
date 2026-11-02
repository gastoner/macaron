import { query } from "$app/server";
import { z } from "zod";
import { requireUser } from "#lib/server/admin/access.js";
import { controller, unwrap } from "#lib/server/controller/index.js";
import { listProjects } from "#lib/server/controller/generated/sdk.gen.js";

/** A page of the configured projects' repositories: the same for every signed-in user. */
export const getProjects = query(z.object({ after: z.string().max(200).optional(), limit: z.int().min(1).max(100).default(25) }), async ({ after, limit }) => {
  requireUser();
  return unwrap(await listProjects({ client: controller(), query: after === undefined ? { limit } : { after, limit } }));
});
