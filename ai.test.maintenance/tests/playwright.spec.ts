import { test, expect } from "@playwright/test";
import { PlaywrightHomePage } from "../pages/PlaywrightHomePage";

test.describe("Playwright website", () => {
  test("has title", async ({ page }) => {
    const homePage = new PlaywrightHomePage(page);
    await homePage.goto();

    await expect(page).toHaveTitle(/Playwright/);
  });

  test("get started link navigates to Installation page", async ({ page }) => {
    const homePage = new PlaywrightHomePage(page);
    await homePage.goto();
    await homePage.clickGetStarted();

    await expect(homePage.installationHeading).toBeVisible();
  });
});
