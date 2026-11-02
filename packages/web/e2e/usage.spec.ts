import { expect, test } from "./fixtures.ts";

test("the overview shows this month, the user's capabilities and recent runs", async ({ signIn }) => {
  const page = await signIn("defunkt");
  await page.goto("/");
  await expect(page.getByText("$15.00")).toBeVisible();
  await expect(page.getByText("30", { exact: true })).toBeVisible();
  await expect(page.getByText("Review", { exact: true })).toBeVisible();
  await expect(page.getByRole("table").filter({ hasText: "Thread" }).getByRole("row")).toHaveCount(6);
  await expect(page.getByText("Settling…")).toBeVisible();
  await expect(page.getByRole("link", { name: "open-macaron/macaron#1200" })).toHaveAttribute("href", "https://github.com/open-macaron/macaron/issues/1200");
});

test("the overview lists every project, each repository ready or not", async ({ signIn }) => {
  const page = await signIn("defunkt");
  await page.goto("/");
  const ready = page.getByRole("row", { name: /open-macaron\/sandbox-a/ });
  await expect(ready.getByText("Ready", { exact: true })).toBeVisible();
  await expect(ready.getByRole("link", { name: "macaron-bot/x1y2z3-sandbox-a" })).toHaveAttribute("href", "https://github.com/macaron-bot/x1y2z3-sandbox-a");
  const waiting = page.getByRole("row", { name: /open-macaron\/sandbox-b/ });
  await expect(waiting.getByText("Not ready", { exact: true })).toBeVisible();
  await expect(waiting.getByRole("link")).toHaveCount(1);
  await expect(page.getByRole("row", { name: /empty-project/ }).getByText("No repository yet")).toBeVisible();
});

test("the overview stays usable when the projects can't be loaded", async ({ signIn, breakProjects }) => {
  const page = await signIn("defunkt");
  await breakProjects();
  await page.goto("/");
  await expect(page.getByText("The projects could not be loaded")).toBeVisible();
  await expect(page.getByText("Recent runs")).toBeVisible();
});

test("the usage history pages with Load more, in one table", async ({ signIn }) => {
  const page = await signIn("defunkt");
  await page.goto("/usage");
  await expect(page.getByRole("row")).toHaveCount(26);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByRole("row")).toHaveCount(32);
  await expect(page.getByRole("columnheader", { name: "Thread" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Load more" })).toHaveCount(0);
});

test("a user who isn't an admin never sees administration", async ({ signIn }) => {
  const page = await signIn("defunkt");
  await page.goto("/");
  await expect(page.getByText("Administration")).toHaveCount(0);
  for (const path of ["/admin/activity", "/admin/users", "/admin/invitations", "/admin/endpoints"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/$/);
  }
});
