import { query } from "$app/server";
import { requireUser } from "#lib/server/admin/access.js";
import { controller, unwrap } from "#lib/server/controller/index.js";
import { listProjects } from "#lib/server/controller/generated/sdk.gen.js";

/** Every configured project: the same list for every signed-in user. */
export const getProjects = query(async () => {
  requireUser();
  return unwrap(await listProjects({ client: controller() }));
});
