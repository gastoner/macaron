import { expect, test } from "./fixtures.ts";

test("a user reaches the projects from the menu, not on the overview", async ({ signIn }) => {
  const page = await signIn("defunkt");
  await page.goto("/");
  await expect(page.getByText("Recent runs")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Repository" })).toHaveCount(0);
  await page.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
});

test("the projects show each repository ready or not, and a project without any", async ({ signIn }) => {
  const page = await signIn("defunkt");
  await page.goto("/projects");
  const ready = page.getByRole("row", { name: /open-macaron\/repo-0 / });
  await expect(ready.getByText("Ready", { exact: true })).toBeVisible();
  await expect(ready.getByRole("link", { name: "macaron-bot/x1y2z3-repo-0" })).toHaveAttribute("href", "https://github.com/macaron-bot/x1y2z3-repo-0");
  const waiting = page.getByRole("row", { name: /open-macaron\/sandbox-b/ });
  await expect(waiting.getByText("Not ready", { exact: true })).toBeVisible();
  await expect(waiting.getByRole("link")).toHaveCount(1);
  await expect(page.getByRole("row", { name: /empty-project/ }).getByText("No repository yet")).toBeVisible();
});

test("the projects page by page with Load more, in one table", async ({ signIn }) => {
  const page = await signIn("defunkt");
  await page.goto("/projects");
  await expect(page.getByRole("row")).toHaveCount(26);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByRole("row")).toHaveCount(31);
  await expect(page.getByRole("columnheader", { name: "Repository" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Load more" })).toHaveCount(0);
});

test("a failure to load the projects is explained on their page", async ({ signIn, breakProjects }) => {
  const page = await signIn("defunkt");
  await breakProjects();
  await page.goto("/projects");
  await expect(page.getByText("The projects could not be loaded")).toBeVisible();
});
