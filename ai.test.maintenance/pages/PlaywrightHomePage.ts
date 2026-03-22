import { expect, type Locator, type Page } from "@playwright/test";

export class PlaywrightHomePage {
  readonly page: Page;
  readonly getStartedLink: Locator;
  readonly installationHeading: Locator;
  readonly docsLink: Locator;
  readonly apiLink: Locator;
  readonly communityLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedLink = page.getByRole("link", { name: "Get started" });
    this.installationHeading = page.getByRole("heading", {
      name: "Installation",
    });
    this.docsLink = page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Docs" });
    this.apiLink = page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "API" });
    this.communityLink = page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Community" });
  }

  async goto() {
    await this.page.goto("https://playwright.dev/");
  }

  async clickGetStarted() {
    await this.getStartedLink.first().click();
    await expect(this.installationHeading).toBeVisible();
  }
}
