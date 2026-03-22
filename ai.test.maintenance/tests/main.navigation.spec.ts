import { test, expect } from "@playwright/test";
import { PlaywrightHomePage } from "../pages/PlaywrightHomePage";

test.describe("Test Case 1: Main page displays navigation buttons", () => {
  test("The main page should display navigation buttons: Docs, API, Community", async ({
    page,
  }) => {
    const homePage = new PlaywrightHomePage(page);

    // Step 1: Navigate to playwright.dev
    await homePage.goto();

    // Step 3: Verify Docs link is visible in the navigation
    await expect(homePage.docsLink).toBeVisible();

    // Step 4: Verify API link is visible in the navigation
    await expect(homePage.apiLink).toBeVisible();

    // Step 5: Verify Community link is visible in the navigation
    await expect(homePage.communityLink).toBeVisible();
  });

  test("Navigation links open the correct pages", async ({ page }) => {
    const homePage = new PlaywrightHomePage(page);
    await homePage.goto();

    // Docs → /docs/intro
    await homePage.docsLink.click();
    await expect(page).toHaveURL(/\/docs\/intro/);
    await expect(
      page.getByRole("heading", { name: "Installation", exact: true }),
    ).toBeVisible();

    // API → /docs/api/class-playwright
    await homePage.goto();
    await homePage.apiLink.click();
    await expect(page).toHaveURL(/\/docs\/api\//);
    await expect(
      page.getByRole("heading", { name: "Playwright Library", exact: true }),
    ).toBeVisible();

    // Community → /community/welcome
    await homePage.goto();
    await homePage.communityLink.click();
    await expect(page).toHaveURL(/\/community\//);
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  });
});
