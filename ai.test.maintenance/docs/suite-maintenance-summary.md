# suite-maintenance-summary

## Scope and validation

- Reviewed all specs in [tests/main.navigation.spec.ts](tests/main.navigation.spec.ts), [tests/main.navigation.refactored.spec.ts](tests/main.navigation.refactored.spec.ts), [tests/main.navigation.professional.spec.ts](tests/main.navigation.professional.spec.ts), and [tests/playwright.spec.ts](tests/playwright.spec.ts).
- Runtime status: `npm test -- --reporter=line` => 13 passed.

## Findings (prioritized)

### High: Redundant scenario coverage across three navigation specs

- The same Docs/API/Community visibility and destination behavior is implemented in:
  - [tests/main.navigation.spec.ts](tests/main.navigation.spec.ts#L23)
  - [tests/main.navigation.refactored.spec.ts](tests/main.navigation.refactored.spec.ts#L78)
  - [tests/main.navigation.professional.spec.ts](tests/main.navigation.professional.spec.ts#L98)
- Impact: triple maintenance for one requirement and inconsistent drift risk when one file is updated and others are not.

### Medium: Obsolete legacy structure still active

- [tests/main.navigation.spec.ts](tests/main.navigation.spec.ts#L4) is legacy-style and overlaps newer suites, but still runs as a first-class spec.
- Test intent naming is outdated: [tests/main.navigation.spec.ts](tests/main.navigation.spec.ts#L4) says "displays navigation buttons" while [tests/main.navigation.spec.ts](tests/main.navigation.spec.ts#L23) also validates destination navigation.

### Medium: Side-effect assertion pattern in smoke flow

- In [tests/playwright.spec.ts](tests/playwright.spec.ts#L15), `clickGetStarted()` already asserts destination in the page object, then the spec asserts again at [tests/playwright.spec.ts](tests/playwright.spec.ts#L17).
- Impact: duplicated assertion responsibility and less transparent test intent.

### Low: Minor brittle/implicit logic

- [tests/main.navigation.professional.spec.ts](tests/main.navigation.professional.spec.ts#L129) uses `navigationCases[0]` for Docs keyboard flow. This is order-coupled and should be explicit by name.

## Broken selector check

- No currently broken selector was found in the active specs under tests/.
- Existing selectors are primarily role-based and stable.

## Consolidation plan

1. Keep [tests/main.navigation.professional.spec.ts](tests/main.navigation.professional.spec.ts) as the canonical TC-NAV-001 suite.
2. Retire overlap by either removing [tests/main.navigation.spec.ts](tests/main.navigation.spec.ts) and [tests/main.navigation.refactored.spec.ts](tests/main.navigation.refactored.spec.ts), or marking them with `test.describe.skip` during transition.
3. Keep [tests/playwright.spec.ts](tests/playwright.spec.ts) as a separate smoke file, but remove duplicate expectation ownership from page-object action methods.
4. Replace order-coupled access (`navigationCases[0]`) with name-based lookup for keyboard activation.

## Representative cleanup diff

Suggested cleanup for [tests/main.navigation.spec.ts](tests/main.navigation.spec.ts): convert it to a lightweight smoke check and remove overlapping destination journeys already covered by the professional suite.

```diff
diff --git a/tests/main.navigation.spec.ts b/tests/main.navigation.spec.ts
index 1111111..2222222 100644
--- a/tests/main.navigation.spec.ts
+++ b/tests/main.navigation.spec.ts
@@ -1,48 +1,28 @@
 import { test, expect } from "@playwright/test";
 import { PlaywrightHomePage } from "../pages/PlaywrightHomePage";

-test.describe("Test Case 1: Main page displays navigation buttons", () => {
-  test("The main page should display navigation buttons: Docs, API, Community", async ({
-    page,
-  }) => {
+test.describe("Smoke: main navigation presence", () => {
+  test("main navigation exposes Docs, API, Community links", async ({ page }) => {
     const homePage = new PlaywrightHomePage(page);
-
-    // Step 1: Navigate to playwright.dev
     await homePage.goto();

-    // Step 3: Verify Docs link is visible in the navigation
     await expect(homePage.docsLink).toBeVisible();
-
-    // Step 4: Verify API link is visible in the navigation
     await expect(homePage.apiLink).toBeVisible();
-
-    // Step 5: Verify Community link is visible in the navigation
     await expect(homePage.communityLink).toBeVisible();
-  });
-
-  test("Navigation links open the correct pages", async ({ page }) => {
-    const homePage = new PlaywrightHomePage(page);
-    await homePage.goto();
-
-    // Docs → /docs/intro
-    await homePage.docsLink.click();
-    await expect(page).toHaveURL(/\/docs\/intro/);
-    await expect(
-      page.getByRole("heading", { name: "Installation", exact: true }),
-    ).toBeVisible();
-
-    // API → /docs/api/class-playwright
-    await homePage.goto();
-    await homePage.apiLink.click();
-    await expect(page).toHaveURL(/\/docs\/api\//);
-    await expect(
-      page.getByRole("heading", { name: "Playwright Library", exact: true }),
-    ).toBeVisible();
-
-    // Community → /community/welcome
-    await homePage.goto();
-    await homePage.communityLink.click();
-    await expect(page).toHaveURL(/\/community\//);
-    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
+
+    // Destination behavior is intentionally centralized in
+    // tests/main.navigation.professional.spec.ts.
   });
 });
```
