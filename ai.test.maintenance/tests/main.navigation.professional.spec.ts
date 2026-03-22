import { test, expect, type Locator, type Page } from "@playwright/test";
import { PlaywrightHomePage } from "../pages/PlaywrightHomePage";

const PLAYWRIGHT_HOME_URL = "https://playwright.dev/";
const TEST_CASE_ID = "TC-NAV-001";

type NavigationCase = {
  name: "Docs" | "API" | "Community";
  href: string;
  link: (homePage: PlaywrightHomePage) => Locator;
  destinationLocator: (page: Page) => Locator;
};

// Single source of truth for the required main-navigation behavior in TC-NAV-001.
const navigationCases: NavigationCase[] = [
  {
    name: "Docs",
    href: "/docs/intro",
    link: (homePage) => homePage.docsLink,
    destinationLocator: (page) =>
      page.getByRole("heading", { name: "Installation", exact: true }),
  },
  {
    name: "API",
    href: "/docs/api/class-playwright",
    link: (homePage) => homePage.apiLink,
    destinationLocator: (page) =>
      page.getByRole("heading", {
        name: "Playwright Library",
        exact: true,
      }),
  },
  {
    name: "Community",
    href: "/community/welcome",
    link: (homePage) => homePage.communityLink,
    destinationLocator: (page) =>
      page.getByRole("heading", { name: "Welcome", exact: true }),
  },
];

function mainNavigation(homePage: PlaywrightHomePage): Locator {
  return homePage.page.getByRole("navigation", { name: "Main" });
}

function navigationLink(
  homePage: PlaywrightHomePage,
  navigationCase: NavigationCase,
): Locator {
  return navigationCase.link(homePage);
}

async function openHomePageWithVisibleMainNavigation(
  homePage: PlaywrightHomePage,
) {
  await test.step(`Open the Playwright home page for ${TEST_CASE_ID}`, async () => {
    await homePage.goto();
    await expect(homePage.page).toHaveURL(PLAYWRIGHT_HOME_URL);
    await expect(mainNavigation(homePage)).toBeVisible();
  });
}

async function expectRequiredMainNavigationLink(
  homePage: PlaywrightHomePage,
  navigationCase: NavigationCase,
) {
  const link = navigationLink(homePage, navigationCase);
  const navigationRegion = mainNavigation(homePage);

  await expect(
    navigationRegion.getByRole("link", {
      name: navigationCase.name,
      exact: true,
    }),
  ).toHaveCount(1);
  await expect(link).toBeVisible();
  await expect(link).toBeEnabled();
  await expect(link).toHaveAccessibleName(navigationCase.name);
  await expect(link).toHaveAttribute("href", navigationCase.href);
  await expect(link).not.toHaveAttribute("aria-disabled", "true");
}

test.describe(`${TEST_CASE_ID}: Main page navigation buttons`, () => {
  test(`${TEST_CASE_ID} shows Docs, API, and Community links in the main navigation`, async ({
    page,
  }) => {
    const homePage = new PlaywrightHomePage(page);

    await openHomePageWithVisibleMainNavigation(homePage);

    for (const navigationCase of navigationCases) {
      await test.step(`Verify the ${navigationCase.name} link is visible, enabled, and exposed by its accessible name`, async () => {
        await expectRequiredMainNavigationLink(homePage, navigationCase);
      });
    }
  });

  for (const navigationCase of navigationCases) {
    test(`${TEST_CASE_ID} navigates to ${navigationCase.name} from the main navigation`, async ({
      page,
    }) => {
      const homePage = new PlaywrightHomePage(page);

      await openHomePageWithVisibleMainNavigation(homePage);

      await test.step(`Activate the ${navigationCase.name} link from the main navigation`, async () => {
        const link = navigationLink(homePage, navigationCase);
        await expectRequiredMainNavigationLink(homePage, navigationCase);
        await link.click();
      });

      await test.step(`Verify the ${navigationCase.name} link opens the expected URL and destination content`, async () => {
        await expect(page).toHaveURL(
          new URL(navigationCase.href, PLAYWRIGHT_HOME_URL).toString(),
        );
        await expect(navigationCase.destinationLocator(page)).toBeVisible();
      });
    });
  }

  test(`${TEST_CASE_ID} supports keyboard activation for the Docs link`, async ({
    page,
  }) => {
    const homePage = new PlaywrightHomePage(page);

    await openHomePageWithVisibleMainNavigation(homePage);

    await test.step("Verify the Docs link is actionable without pointer input", async () => {
      await expectRequiredMainNavigationLink(homePage, navigationCases[0]);
      await homePage.docsLink.focus();
      await expect(homePage.docsLink).toBeFocused();
      await page.keyboard.press("Enter");
    });

    await test.step("Verify keyboard activation opens the Docs destination", async () => {
      await expect(page).toHaveURL(
        new URL("/docs/intro", PLAYWRIGHT_HOME_URL).toString(),
      );
      await expect(
        page.getByRole("heading", { name: "Installation", exact: true }),
      ).toBeVisible();
    });
  });
});
