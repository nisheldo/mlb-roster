# E2E Test Suite

Comprehensive end-to-end tests for the MLB Roster application using Playwright.

## Test Structure

```
tests/
├── features/
│   ├── core-functionality.spec.js    # Basic app loading and functionality
│   ├── filters.spec.js                # All position filter tests
│   ├── player-interactions.spec.js    # Player cards and detail modal
│   └── two-way-and-dh.spec.js        # Two-way players and DH features
└── helpers/
    └── test-utils.js                  # Reusable test utilities
```

## Running Tests

### Local Development

```bash
# Run all tests (headless)
npm test

# Run tests with browser visible
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# View HTML report from last test run
npm run test:report
```

### Specific Test Files

```bash
# Run specific test file
npx playwright test tests/features/core-functionality.spec.js

# Run tests matching a pattern
npx playwright test --grep "filter"

# Run specific browser
npx playwright test --project=chromium
```

### Debug Mode

```bash
# Run in debug mode
npx playwright test --debug

# Debug specific test
npx playwright test tests/features/filters.spec.js --debug
```

## Test Coverage

### Core Functionality Tests (`core-functionality.spec.js`)

- ✅ Application loads successfully
- ✅ Default team (Twins) displays
- ✅ Current year selected by default
- ✅ Team selection changes roster
- ✅ Year selection changes roster
- ✅ All filter buttons visible
- ✅ Player count displayed
- ✅ Player cards show required information
- ✅ MLB API attribution present

### Filter Tests (`filters.spec.js`)

- ✅ All filter shows all players
- ✅ Pitchers filter shows only pitchers
- ✅ Catchers filter shows only catchers (position "C")
- ✅ Infielders filter shows infield positions (1B, 2B, 3B, SS)
- ✅ Outfielders filter shows outfield positions (LF, CF, RF, OF)
- ✅ DH filter shows only designated hitters
- ✅ No results message when filter empty
- ✅ Filter switching works correctly
- ✅ Filter state persists (or resets) on team change

### Player Interaction Tests (`player-interactions.spec.js`)

- ✅ Search by player name
- ✅ No results for non-existent player
- ✅ Clear search shows all players
- ✅ Click player card opens detail modal
- ✅ Close button closes modal
- ✅ Backdrop click closes modal
- ✅ Career stats displayed in modal
- ✅ Season-by-season stats displayed
- ✅ Postseason stats section present
- ✅ Awards section present
- ✅ Transactions section present
- ✅ Player bio information displayed
- ✅ Player images/placeholders work
- ✅ Jersey numbers displayed
- ✅ Bats/Throws information shown

### Two-Way & DH Feature Tests (`two-way-and-dh.spec.js`)

**Two-Way Players:**
- ✅ Two-Way filter button exists
- ✅ Filter shows only two-way players
- ✅ Player cards show both hitting and pitching stats
- ✅ Detail modal shows both stat types
- ✅ Two-way players excluded from Pitchers filter
- ✅ Filter order correct

**DH Features:**
- ✅ DH filter button exists
- ✅ Filter shows only DH position players
- ✅ DH players show hitting stats
- ✅ Handles teams/years without DH gracefully

## CI/CD Integration

Tests automatically run on:
- Every push to `main` branch
- Every pull request to `main` branch

### GitHub Actions Workflow

Located at `.github/workflows/playwright.yml`

**What it does:**
1. Installs dependencies
2. Installs Playwright browsers
3. Runs all tests
4. Uploads test reports as artifacts
5. Reports pass/fail status to PR

**Viewing Results:**
- Check "Actions" tab in GitHub repository
- Download test reports from workflow artifacts
- View test results directly in PR checks

## Adding New Tests

### 1. Create Test File

```javascript
// tests/features/my-feature.spec.js
import { test, expect } from '@playwright/test';
import { waitForRosterLoad } from '../helpers/test-utils.js';

test.describe('My New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForRosterLoad(page);
  });

  test('should do something', async ({ page }) => {
    // Your test code here
    await expect(page.locator('.my-element')).toBeVisible();
  });
});
```

### 2. Use Helper Functions

Common helpers available in `test-utils.js`:
- `waitForRosterLoad(page)` - Wait for roster to load
- `selectTeam(page, teamName)` - Select a team
- `selectYear(page, year)` - Select a year
- `clickFilter(page, filterName)` - Click a filter button
- `searchPlayer(page, searchTerm)` - Search for player
- `openPlayerDetail(page, index)` - Open detail modal
- `closePlayerDetail(page)` - Close detail modal

### 3. Run Your Tests

```bash
# Run new test file
npx playwright test tests/features/my-feature.spec.js

# Run in UI mode to develop
npm run test:ui
```

### 4. Commit and Push

Tests will automatically run in CI when you create a PR!

## Best Practices

1. **Use descriptive test names** - Test name should describe what is being tested
2. **Use test utilities** - Reuse helpers from `test-utils.js`
3. **Handle dynamic content** - Use `waitFor` methods for dynamic content
4. **Keep tests independent** - Each test should run standalone
5. **Test user journeys** - Test realistic user flows
6. **Handle errors gracefully** - Tests should pass even if optional elements missing

## Troubleshooting

### Tests failing locally but not in CI

```bash
# Update Playwright browsers
npx playwright install
```

### Tests timing out

```bash
# Increase timeout in test
test('my test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Network issues with MLB API

Tests interact with the real MLB API. If API is slow or down:
- Tests may timeout
- Tests may fail unexpectedly
- This is expected behavior - API is external dependency

### Viewing test results

```bash
# View HTML report
npm run test:report

# Generate report from last run
npx playwright show-report
```

## Configuration

Playwright configuration is in `playwright.config.js`:
- **Browsers**: Tests run on Chromium, Firefox, and WebKit
- **Base URL**: `http://localhost:5173`
- **Retries**: 2 retries on CI, 0 locally
- **Reporter**: HTML report generated
- **Screenshots**: Captured on failure
- **Traces**: Captured on first retry

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
