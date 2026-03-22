# ai-framework

## Overview

This repository contains a Playwright-based UI test framework that validates key navigation behavior on [playwright.dev](https://playwright.dev/).

Main capabilities:

- Runs end-to-end browser tests with Playwright Test.
- Uses a page object (`PlaywrightHomePage`) to keep selectors and actions reusable.
- Includes multiple versions of the same navigation test suite (`main.navigation.spec.ts`, `main.navigation.refactored.spec.ts`, `main.navigation.professional.spec.ts`) for baseline, refactoring, and professional-grade patterns.
- Produces an HTML report and trace artifacts for debugging failed runs.
- Publishes the Playwright HTML report to GitHub Pages on successful pushes to `main`.

## Quick Start

```bash
cd ai.test.maintenance
npm ci
npx playwright install --with-deps
npm test
npm run test:report
```

## Setup and Usage

### Prerequisites

- Node.js LTS
- npm

### Local Setup

From the repository root:

```bash
cd ai.test.maintenance
npm ci
npx playwright install --with-deps
```

### Run Tests

```bash
npm test
```

This runs `playwright test` using the configuration in `playwright.config.ts`.

### Open the HTML Report

```bash
npm run test:report
```

## Project Structure

Top-level structure:

- `.github/workflows/playwright-tests.yml`: CI pipeline for tests, security scan, and Pages deployment.
- `ai.test.maintenance/`: main Playwright project.

Inside `ai.test.maintenance/`:

- `package.json`: scripts and dependencies.
- `playwright.config.ts`: Playwright runtime config (test directory, retries, workers, reporter, projects).
- `pages/PlaywrightHomePage.ts`: page object model for Playwright home page interactions.
- `tests/`: test specs.
- `docs/`: analysis and maintenance documentation.
- `playwright-report/`: generated HTML report output.
- `test-results/`: generated run artifacts (including traces when available).
- `testcase1.md`: original/manual test case definition.

## CI/CD (GitHub Actions)

Workflow file: `.github/workflows/playwright-tests.yml`

### Workflow Triggers

- `pull_request` targeting `main`
- `push` to `main`

### Jobs

1. `playwright-tests`
   - Runs on both PRs and pushes.
   - Steps:
     - `actions/checkout@v4`
     - `actions/setup-node@v4` (Node LTS + npm cache)
     - install dependencies (`npm ci`)
     - install browsers (`npx playwright install --with-deps`)
     - run tests (`npx playwright test`)
     - upload artifacts with `actions/upload-artifact@v4`:
       - HTML report (`playwright-html-report`)
       - traces (`playwright-traces`)
   - On failure, sends a Microsoft Teams webhook notification.

2. `security-scan`
   - Runs on both PRs and pushes.
   - Steps:
     - `actions/checkout@v4`
     - `actions/setup-node@v4`
     - install dependencies (`npm ci`)
     - run `npm audit --audit-level=high --json`
     - writes a vulnerability summary (high/critical counts) to the workflow job summary.

3. `deploy-pages`
   - Runs only on `push` to `main`.
   - Depends on successful completion of `playwright-tests`.
   - Steps:
     - `actions/checkout@v4`
     - `actions/download-artifact@v4` (downloads `playwright-html-report`)
     - prepares/updates `history.json` by merging previous `gh-pages` history with current run metadata
     - `actions/upload-pages-artifact@v3`
     - `actions/deploy-pages@v4`

## GitHub Pages Publication

The workflow publishes the contents of:

- `ai.test.maintenance/playwright-report/`

Published site content includes:

- Playwright HTML report entry point (`index.html`)
- report data assets in `data/`
- generated `history.json` containing run history metadata (timestamp, run URL, commit SHA, branch, test counts, and job conclusion)

In short, GitHub Pages serves a browsable Playwright test report with lightweight historical context across deployments.
