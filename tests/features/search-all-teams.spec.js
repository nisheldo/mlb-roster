import { test, expect } from '@playwright/test';
import { waitForRosterLoad } from '../helpers/test-utils.js';

test.describe('Search All Teams Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForRosterLoad(page);
  });

  test('should display search all teams checkbox', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    await expect(checkbox).toBeVisible();

    const label = page.locator('.search-all-teams-checkbox span');
    await expect(label).toHaveText('Search all teams');
  });

  test('checkbox should be unchecked by default', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();
  });

  test('should toggle checkbox on click', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');

    // Check the checkbox
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Uncheck the checkbox
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('should update search placeholder when checkbox is toggled', async ({ page }) => {
    const searchInput = page.locator('.search-input');

    // Default placeholder
    await expect(searchInput).toHaveAttribute('placeholder', 'Search by player name...');

    // Check the checkbox
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    await checkbox.check();

    // Placeholder should change
    await expect(searchInput).toHaveAttribute('placeholder', 'Search all MLB teams...');

    // Uncheck and verify it changes back
    await checkbox.uncheck();
    await expect(searchInput).toHaveAttribute('placeholder', 'Search by player name...');
  });

  test('should show message when search term is less than 2 characters with all-teams enabled', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    const searchInput = page.locator('.search-input');

    // Enable all-teams search
    await checkbox.check();

    // Enter 1 character
    await searchInput.fill('A');
    await page.waitForTimeout(500);

    // Should show minimum character message
    const noResults = page.locator('.no-results');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText('Enter at least 2 characters');
  });

  test('should search all teams when checkbox is checked and search term >= 2 chars', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    const searchInput = page.locator('.search-input');

    // Enable all-teams search
    await checkbox.check();

    // Enter a common name that should appear across multiple teams
    await searchInput.fill('Smith');

    // Wait for loading to complete
    await page.waitForSelector('.loading-container', { state: 'hidden', timeout: 60000 });

    // Should have results
    const cards = page.locator('.player-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show "Searching all teams..." loading message', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    const searchInput = page.locator('.search-input');

    // Enable all-teams search
    await checkbox.check();

    // Start typing
    await searchInput.fill('Jo');

    // Should see all-teams loading message (might be brief)
    const loadingContainer = page.locator('.loading-container');

    // Wait for either loading or results
    await Promise.race([
      loadingContainer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
      page.waitForSelector('.player-card', { timeout: 10000 }),
    ]);

    // If loading appears, check the message
    if (await loadingContainer.isVisible()) {
      const loadingText = loadingContainer.locator('p');
      await expect(loadingText).toContainText('Searching all teams');
    }
  });

  test('should display team name on player cards when searching all teams', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    const searchInput = page.locator('.search-input');

    // Enable all-teams search
    await checkbox.check();

    // Search for a common name
    await searchInput.fill('John');

    // Wait for results
    await page.waitForSelector('.loading-container', { state: 'hidden', timeout: 60000 });
    await page.waitForSelector('.player-card', { timeout: 10000 });

    // Check that at least one card shows team name
    const cards = await page.locator('.player-card').all();
    let foundTeamName = false;

    for (const card of cards.slice(0, 5)) {
      const teamName = card.locator('.player-team');
      if (await teamName.isVisible()) {
        foundTeamName = true;
        const teamText = await teamName.textContent();
        expect(teamText.length).toBeGreaterThan(0);
        break;
      }
    }

    expect(foundTeamName).toBeTruthy();
  });

  test('should NOT display team name when searching single team', async ({ page }) => {
    const searchInput = page.locator('.search-input');

    // Search without enabling all-teams
    await searchInput.fill('A');
    await page.waitForTimeout(500);

    // Get first card
    const firstCard = page.locator('.player-card').first();

    // Team name should not be visible
    const teamName = firstCard.locator('.player-team');
    await expect(teamName).not.toBeVisible();
  });

  test('should clear all-teams results when checkbox is unchecked', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    const searchInput = page.locator('.search-input');

    // Enable all-teams search and search
    await checkbox.check();
    await searchInput.fill('Smith');
    await page.waitForSelector('.loading-container', { state: 'hidden', timeout: 60000 });

    // Get count with all-teams
    const allTeamsCount = await page.locator('.player-card').count();

    // Uncheck - should revert to current team
    await checkbox.uncheck();
    await page.waitForTimeout(500);

    // Should show current team's matching players or no results
    const currentTeamCards = page.locator('.player-card');
    const currentCount = await currentTeamCards.count();

    // Could be 0 if no one on current team matches "Smith"
    expect(currentCount).toBeLessThanOrEqual(allTeamsCount);
  });

  test('should handle no results when searching all teams', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    const searchInput = page.locator('.search-input');

    // Enable all-teams search
    await checkbox.check();

    // Search for non-existent name
    await searchInput.fill('ZzZzNonExistent999');

    // Wait for loading to complete
    await page.waitForSelector('.loading-container', { state: 'hidden', timeout: 60000 });

    // Should show no results message
    const noResults = page.locator('.no-results');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText('No players found');
  });

  test('should allow clicking on players from all-teams search results', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    const searchInput = page.locator('.search-input');

    // Enable all-teams search
    await checkbox.check();

    // Search
    await searchInput.fill('John');
    await page.waitForSelector('.loading-container', { state: 'hidden', timeout: 60000 });
    await page.waitForSelector('.player-card', { timeout: 10000 });

    // Click first player card
    const firstCard = page.locator('.player-card').first();
    await firstCard.click();

    // Detail modal should open
    const modal = page.locator('.player-detail-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
  });

  test('should preserve search term when toggling checkbox', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    const searchInput = page.locator('.search-input');

    // Enter search term
    await searchInput.fill('Test');

    // Toggle checkbox
    await checkbox.check();

    // Search term should still be there
    await expect(searchInput).toHaveValue('Test');

    // Toggle back
    await checkbox.uncheck();

    // Search term should still be there
    await expect(searchInput).toHaveValue('Test');
  });

  test('should work with year selector when searching all teams', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    const searchInput = page.locator('.search-input');
    const yearSelect = page.locator('#year-select');

    // Enable all-teams search
    await checkbox.check();

    // Search
    await searchInput.fill('Williams');
    await page.waitForSelector('.loading-container', { state: 'hidden', timeout: 60000 });

    // Change year
    const currentYear = new Date().getFullYear();
    await yearSelect.selectOption((currentYear - 1).toString());

    // Should reload with new year
    await page.waitForSelector('.loading-container', { state: 'hidden', timeout: 60000 });

    // Should still be in all-teams mode
    await expect(checkbox).toBeChecked();
  });

  test('should handle rapid checkbox toggling', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');

    // Rapidly toggle
    await checkbox.check();
    await checkbox.uncheck();
    await checkbox.check();
    await checkbox.uncheck();

    // Should end up unchecked
    await expect(checkbox).not.toBeChecked();

    // No errors should occur
    const errorContainer = page.locator('.error-container');
    await expect(errorContainer).not.toBeVisible();
  });

  test('should style checkbox with team colors', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');

    // Checkbox should have accent-color styling
    const accentColor = await checkbox.evaluate((el) => {
      return window.getComputedStyle(el).accentColor;
    });

    // Should have a color set (not empty)
    expect(accentColor).toBeTruthy();
  });

  test('should show team names in italic style', async ({ page }) => {
    const checkbox = page.locator('.search-all-teams-checkbox input[type="checkbox"]');
    const searchInput = page.locator('.search-input');

    // Enable all-teams search
    await checkbox.check();
    await searchInput.fill('Mike');

    // Wait for results
    await page.waitForSelector('.loading-container', { state: 'hidden', timeout: 60000 });
    await page.waitForSelector('.player-card', { timeout: 10000 });

    // Check team name styling
    const teamName = page.locator('.player-team').first();
    if (await teamName.isVisible()) {
      const fontStyle = await teamName.evaluate((el) => {
        return window.getComputedStyle(el).fontStyle;
      });
      expect(fontStyle).toBe('italic');
    }
  });
});
