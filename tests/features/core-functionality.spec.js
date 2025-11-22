import { test, expect } from '@playwright/test';
import {
  waitForRosterLoad,
  selectTeam,
  selectYear,
  searchPlayer,
  TEST_TEAMS,
  TEST_YEARS,
} from '../helpers/test-utils.js';

test.describe('Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application successfully', async ({ page }) => {
    // Check that the header is visible
    await expect(page.locator('.roster-header')).toBeVisible();

    // Check that the team logo is present
    await expect(page.locator('.team-logo')).toBeVisible();

    // Check that controls are present
    await expect(page.locator('#team-select')).toBeVisible();
    await expect(page.locator('#year-select')).toBeVisible();
    await expect(page.locator('.search-input')).toBeVisible();
  });

  test('should display default team roster (Twins)', async ({ page }) => {
    await waitForRosterLoad(page);

    // Check that roster heading shows Twins
    const heading = await page.locator('h1').textContent();
    expect(heading).toContain('Minnesota Twins');

    // Check that player cards are displayed
    const playerCards = await page.locator('.player-card').count();
    expect(playerCards).toBeGreaterThan(0);
  });

  test('should display current year by default', async ({ page }) => {
    await waitForRosterLoad(page);

    const currentYear = new Date().getFullYear().toString();
    const selectedYear = await page.locator('#year-select').inputValue();
    expect(selectedYear).toBe(currentYear);
  });

  test('should change team when different team selected', async ({ page }) => {
    await waitForRosterLoad(page);

    // Select a different team
    await selectTeam(page, TEST_TEAMS.DODGERS);

    // Verify team changed in header
    const heading = await page.locator('h1').textContent();
    expect(heading).toContain('Los Angeles Dodgers');

    // Verify new player cards loaded
    const playerCards = await page.locator('.player-card').count();
    expect(playerCards).toBeGreaterThan(0);
  });

  test('should change year when different year selected', async ({ page }) => {
    await waitForRosterLoad(page);

    // Select last year
    await selectYear(page, TEST_YEARS.LAST_YEAR);

    // Verify year changed in subtitle
    const subtitle = await page.locator('.roster-subtitle').textContent();
    expect(subtitle).toContain(TEST_YEARS.LAST_YEAR);

    // Verify roster data loaded
    const playerCards = await page.locator('.player-card').count();
    expect(playerCards).toBeGreaterThan(0);
  });

  test('should show all filter buttons', async ({ page }) => {
    await waitForRosterLoad(page);

    // Check all filter buttons are present
    const filters = ['All', 'Pitchers', 'Catchers', 'Infielders', 'Outfielders', 'DH', 'Two-Way'];

    for (const filter of filters) {
      const button = page.getByRole('button', { name: filter });
      await expect(button).toBeVisible();
    }
  });

  test('should display player count in All filter', async ({ page }) => {
    await waitForRosterLoad(page);

    const allButton = page.getByRole('button', { name: /All \(/ });
    await expect(allButton).toBeVisible();

    const buttonText = await allButton.textContent();
    // Extract number from "All (40)" or similar
    const match = buttonText.match(/\((\d+)\)/);
    expect(match).toBeTruthy();

    const count = parseInt(match[1]);
    expect(count).toBeGreaterThan(0);
  });

  test('should display player information on cards', async ({ page }) => {
    await waitForRosterLoad(page);

    const firstCard = page.locator('.player-card').first();

    // Check that key player info is displayed
    await expect(firstCard.locator('.player-name')).toBeVisible();
    await expect(firstCard.locator('.player-number')).toBeVisible();
    await expect(firstCard.locator('.player-position')).toBeVisible();
    await expect(firstCard.locator('.player-stats')).toBeVisible();
  });

  test('should handle team logo error gracefully', async ({ page }) => {
    await waitForRosterLoad(page);

    // The logo should either be visible or gracefully hidden on error
    const logo = page.locator('.team-logo');
    const isVisible = await logo.isVisible();

    // Either way, the page should still function
    await expect(page.locator('.roster-header')).toBeVisible();
  });

  test('should display MLB Stats API attribution', async ({ page }) => {
    await waitForRosterLoad(page);

    const attribution = page.locator('.roster-attribution');
    await expect(attribution).toBeVisible();
    await expect(attribution).toHaveText('Data from MLB Stats API');
  });
});
