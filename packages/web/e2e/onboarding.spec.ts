import type { Page, Response } from "@playwright/test";
import { expect, test } from "./fixtures.ts";

/** The remote command that records the onboarding as done: closing the dialog doesn't wait for it. */
const recorded = (page: Page): Promise<Response> => page.waitForResponse((response) => response.url().includes("/_app/remote/") && response.request().method() === "POST");

test("the onboarding opens once, over the overview, with the commands the user may ask for", async ({ signIn, forgetOnboarding }) => {
  const page = await signIn("defunkt");
  await forgetOnboarding("defunkt");
  await page.goto("/");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Meet macaron-bot" })).toBeVisible();
  await dialog.getByRole("button", { name: "Next" }).click();
  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog.getByRole("heading", { name: "What you can ask" })).toBeVisible();
  await expect(dialog.getByText("@macaron-bot review")).toBeVisible();
  await expect(dialog.getByText("@macaron-bot implement")).toHaveCount(0);
  await expect(dialog.getByText("Not granted to you")).toBeVisible();
  await dialog.getByRole("button", { name: "Back" }).click();
  await expect(dialog.getByRole("heading", { name: "How it works" })).toBeVisible();
  for (let step = 0; step < 4; step += 1) await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog.getByRole("heading", { name: "Your key and cost" })).toBeVisible();
  const done = recorded(page);
  await dialog.getByRole("button", { name: "Finish" }).click();
  await expect(dialog).toHaveCount(0);
  await done;
  await page.reload();
  await expect(page.getByText("Spend this month")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("closing the onboarding with Escape counts as done, and an onboarded user never sees it", async ({ signIn, forgetOnboarding }) => {
  const page = await signIn("octocat");
  await page.goto("/");
  await expect(page.getByText("Spend this month")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await forgetOnboarding("octocat");
  await page.reload();
  await expect(page.getByRole("dialog")).toBeVisible();
  const done = recorded(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await done;
  await page.reload();
  await expect(page.getByText("Spend this month")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
