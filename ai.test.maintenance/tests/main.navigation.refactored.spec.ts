import { test, expect, type Locator, type Page } from "@playwright/test";

const PLAYWRIGHT_HOME_URL = "https://playwright.dev/";

type NavigationCase = {
  name: "Docs" | "API" | "Community";
  href: string;
  destinationLocator: (page: Page) => Locator;
};

const navigationCases: NavigationCase[] = [
  {
    name: "Docs",
    href: "/docs/intro",
    destinationLocator: (page) =>
      page.getByRole("heading", { name: "Installation", exact: true }),
  },
  {
    name: "API",
    href: "/docs/api/class-playwright",
    destinationLocator: (page) =>
      page.getByRole("heading", {
        name: "Playwright Library",
        exact: true,
      }),
  },
  {
    name: "Community",
    href: "/community/welcome",
    destinationLocator: (page) =>
      page.getByRole("heading", { name: "Welcome", exact: true }),
  },
];

function mainNavigation(page: Page): Locator {
  return page.getByRole("navigation", { name: "Main" });
}

function navigationLink(page: Page, linkName: NavigationCase["name"]): Locator {
  return mainNavigation(page).getByRole("link", {
    name: linkName,
    exact: true,
  });
}

async function openHomePage(page: Page) {
  await test.step("Open the Playwright home page", async () => {
    await page.goto(PLAYWRIGHT_HOME_URL);
    await expect(mainNavigation(page)).toBeVisible();
  });
}

async function expectNavigationLink(
  page: Page,
  navigationCase: NavigationCase,
) {
  const link = navigationLink(page, navigationCase.name);

  await expect(link).toBeVisible();
  await expect(link).toBeEnabled();
  await expect(link).toHaveAccessibleName(navigationCase.name);
  await expect(link).toHaveAttribute("href", navigationCase.href);
}

test.describe("Test Case 1: Main page navigation buttons", () => {
  test("Main navigation shows Docs, API, and Community links by role and name", async ({
    page,
  }) => {
    await openHomePage(page);

    for (const navigationCase of navigationCases) {
      await test.step(`Verify the ${navigationCase.name} link is visible and accessible`, async () => {
        await expectNavigationLink(page, navigationCase);
      });
    }
  });

  for (const navigationCase of navigationCases) {
    test(`${navigationCase.name} opens the expected destination page`, async ({
      page,
    }) => {
      await openHomePage(page);

      await test.step(`Activate the ${navigationCase.name} link from the main navigation`, async () => {
        const link = navigationLink(page, navigationCase.name);
        await expectNavigationLink(page, navigationCase);
        await link.click();
      });

      await test.step(`Verify the ${navigationCase.name} destination URL and page content`, async () => {
        await expect(page).toHaveURL(
          new URL(navigationCase.href, PLAYWRIGHT_HOME_URL).toString(),
        );
        await expect(navigationCase.destinationLocator(page)).toBeVisible();
      });
    });
  }
});
