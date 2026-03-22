# Legacy Test Analysis

## Scope

Reviewed files:

- `tests/main.navigation.spec.ts`
- `pages/PlaywrightHomePage.ts`
- `testcase1.md`

Manual expectation being checked:

- Docs, API, and Community are visible in the main navigation.
- Links are accessible by role and name.
- Each link navigates to the correct destination.

## Prioritized Checklist Of Issues

### P0 - Incorrect destination assertion causes immediate failure

- [ ] **Category:** selector quality, navigation target checks
      **Issue:** The Docs navigation assertion uses `page.getByTestId("#docs")`, but the destination page does not expose a matching test id.
      **Where:** `tests/main.navigation.spec.ts`
      **Impact:** Broken assertion causes a hard failure even when navigation succeeds. Test becomes misleading because it reports the wrong problem.
      **Recommended fix category:** Replace invalid destination selectors with stable post-navigation checks that match the actual destination content and expected route.

### P0 - Explicit fixed wait introduces unnecessary flakiness

- [ ] **Category:** synchronization
      **Issue:** The visibility test uses `page.waitForTimeout(2000)` before checking the API link.
      **Where:** `tests/main.navigation.spec.ts`
      **Impact:** Fixed waits slow the suite and still do not guarantee readiness. They create timing-dependent failures when the page is slower than the hardcoded delay, and waste time when the page is already ready.
      **Recommended fix category:** Remove fixed delays and rely on Playwright auto-waiting or state-based assertions tied to the navigation region or target locators.

### P1 - Accessibility requirement is only partially covered

- [ ] **Category:** accessibility, coverage
      **Issue:** The page object uses role-based locators inside `navigation[Main]`, which is good, but the spec only asserts visibility. It does not explicitly verify accessible names or that the links are discoverable by role and name as part of the test intent.
      **Where:** `pages/PlaywrightHomePage.ts`, `tests/main.navigation.spec.ts`
      **Impact:** The implementation currently depends on accessibility semantics, but the test does not make that requirement explicit. A future refactor could keep links visible while degrading accessible naming, and this spec would not clearly explain the regression.
      **Recommended fix category:** Add explicit assertions for link role/name semantics or structure tests so the requirement “accessible by role+name” is directly represented in the assertions.

### P1 - Navigation checks are too loose for API and Community

- [ ] **Category:** coverage, navigation target checks
      **Issue:** URL assertions for API and Community use broad patterns (`/docs/api/` and `/community/`) instead of validating the specific targets implied by the link destinations.
      **Where:** `tests/main.navigation.spec.ts`
      **Impact:** Test may pass after navigating to the wrong subpage within the same section. This weakens defect detection and allows silent regressions if link destinations change unexpectedly.
      **Recommended fix category:** Assert the exact expected route or a tighter route pattern, then pair it with a destination-specific page assertion.

### P1 - Destination content checks are inconsistent across links

- [ ] **Category:** coverage, readability/reuse
      **Issue:** Docs, API, and Community use three unrelated validation styles: an invalid test id, a heading check for “Playwright,” and a heading check for “Welcome.” There is no clear rule for what qualifies as a correct landing page.
      **Where:** `tests/main.navigation.spec.ts`
      **Impact:** Inconsistent assertions increase maintenance cost and make the test intent harder to interpret. They also raise the chance of accidentally choosing weak or brittle signals on each page.
      **Recommended fix category:** Standardize post-navigation validation around a consistent pattern such as exact route plus a stable, user-visible destination marker.

### P1 - Test case mixes multiple independent navigations in one flow

- [ ] **Category:** readability/reuse, duplication risks
      **Issue:** A single test covers Docs, API, and Community navigation by repeatedly going back to the home page and continuing in the same body.
      **Where:** `tests/main.navigation.spec.ts`
      **Impact:** One broken link blocks feedback on the remaining links. The flow is longer to debug, and repeated setup steps make the test harder to maintain.
      **Recommended fix category:** Split navigation checks into focused cases or parameterize them into a table-driven pattern with shared expectations.

### P2 - Repeated navigation setup increases duplication risk

- [ ] **Category:** duplication risks, readability/reuse
      **Issue:** The second test calls `homePage.goto()` before each individual link check instead of centralizing repeated setup.
      **Where:** `tests/main.navigation.spec.ts`
      **Impact:** Repetition makes future updates error-prone. If the landing setup changes, the test requires multiple edits and can easily become inconsistent.
      **Recommended fix category:** Consolidate repeated setup through helper functions, hooks, or table-driven test data.

### P2 - Manual test case traceability is incomplete

- [ ] **Category:** coverage, readability/reuse
      **Issue:** The manual test case only verifies visibility of the three links, but the spec adds navigation assertions without clearly separating them from the original manual scope.
      **Where:** `testcase1.md`, `tests/main.navigation.spec.ts`
      **Impact:** The test name suggests simple visibility coverage, while the body also performs navigation validation. This weakens maintainability because future readers cannot easily tell whether a failure belongs to the original requirement or an extended automation-only scenario.
      **Recommended fix category:** Align test names and structure with requirement boundaries, or document which checks extend beyond the manual case.

### P2 - Page object contains unused members for this scenario

- [ ] **Category:** readability/reuse
      **Issue:** `PlaywrightHomePage` exposes `getStartedLink`, `installationHeading`, and `clickGetStarted()` even though this scenario only uses top-navigation links.
      **Where:** `pages/PlaywrightHomePage.ts`
      **Impact:** Shared page objects can accumulate unrelated helpers, making maintenance harder and increasing coupling between unrelated tests.
      **Recommended fix category:** Keep page objects narrowly focused or separate unrelated flows into clearer abstractions.

## Additional Issues Easy To Miss

- [ ] **Category:** accessibility, coverage
      **Issue:** The spec never asserts that the links are enabled/actionable, only visible.
      **Impact:** A visible but disabled or obstructed link could still satisfy the first test.

- [ ] **Category:** accessibility, coverage
      **Issue:** The spec does not verify that the links are within the intended main navigation in the assertions themselves, even though the locators are scoped there in the page object.
      **Impact:** If page-object locators are later loosened, the test intent could drift without an obvious spec-level signal.

- [ ] **Category:** selector quality
      **Issue:** The Docs destination assertion suggests confusion between test ids and CSS id selectors by using `getByTestId("#docs")`.
      **Impact:** This is a maintenance smell beyond the immediate failure because it indicates the selector strategy is not yet disciplined.

- [ ] **Category:** coverage
      **Issue:** The route checks do not verify that the clicked link’s own `href` matches the expected destination before navigation.
      **Impact:** Navigation may still pass after redirects, fallback routes, or site changes, which hides broken or unexpected link targets.

## Summary By Fix Category

- **Selector quality:** Replace invalid or weak destination selectors with stable user-facing assertions and consistent locator strategy.
- **Synchronization:** Remove fixed sleeps and use Playwright’s built-in waiting around navigation state and destination assertions.
- **Accessibility:** Make role-and-name expectations explicit, not just implicit in page-object locators.
- **Coverage:** Tighten route checks, standardize landing-page verification, and ensure each requirement is directly asserted.
- **Readability/reuse:** Reduce mixed concerns in single tests and keep page-object responsibilities focused.
- **Duplication risks:** Parameterize repeated link checks or centralize setup to avoid copy-paste maintenance.

## Short Impact Notes

- Fixed waits -> flakiness and slower execution.
- Invalid test-id selector -> immediate false failure.
- Broad URL patterns -> silent false positives.
- Visibility-only assertions -> accessibility and actionability gaps.
- Mixed assertions per destination -> inconsistent maintenance burden.
- Multi-scenario single test -> poorer failure isolation.
- Repeated `goto()` calls -> duplication and drift risk.
- Overloaded page object -> harder long-term maintenance.
