import { test, expect } from '@playwright/test';
import {
  waitForRosterLoad,
  searchPlayer,
  openPlayerDetail,
  closePlayerDetail,
} from '../helpers/test-utils.js';

test.describe('Player Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForRosterLoad(page);
  });

  test('should search for players by name', async ({ page }) => {
    // Get first player name
    const firstCard = page.locator('.player-card').first();
    const playerName = await firstCard.locator('.player-name').textContent();
    const firstName = playerName.trim().split(' ')[0];

    // Search for that player
    await searchPlayer(page, firstName);

    // Verify filtered results
    const visibleCards = await page.locator('.player-card').all();
    expect(visibleCards.length).toBeGreaterThan(0);

    // All visible players should match search
    for (const card of visibleCards) {
      const name = await card.locator('.player-name').textContent();
      expect(name.toLowerCase()).toContain(firstName.toLowerCase());
    }
  });

  test('should show no results for non-existent player', async ({ page }) => {
    await searchPlayer(page, 'ZzZzNonExistent123');

    const noResults = page.locator('.no-results');
    await expect(noResults).toBeVisible();
  });

  test('should clear search and show all players', async ({ page }) => {
    // Search for something
    await searchPlayer(page, 'A');

    const filteredCount = await page.locator('.player-card').count();

    // Clear search
    await page.fill('.search-input', '');

    const allCount = await page.locator('.player-card').count();
    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('should open player detail modal when card clicked', async ({ page }) => {
    await openPlayerDetail(page, 0);

    // Modal should be visible
    const modal = page.locator('.player-detail-modal');
    await expect(modal).toBeVisible();

    // Modal should have player info
    await expect(modal.locator('h2')).toBeVisible(); // Player name
    await expect(modal.locator('.player-detail-image')).toBeVisible();
  });

  test('should close player detail modal when close button clicked', async ({ page }) => {
    await openPlayerDetail(page, 0);

    // Close modal
    await closePlayerDetail(page);

    // Modal should be hidden
    const modal = page.locator('.player-detail-modal');
    await expect(modal).not.toBeVisible();
  });

  test('should close player detail modal when backdrop clicked', async ({ page }) => {
    await openPlayerDetail(page, 0);

    // Click backdrop area (outside modal) - click near top-left corner
    await page.click('.player-detail-overlay', { position: { x: 10, y: 10 } });

    // Modal should be hidden
    await page.waitForSelector('.player-detail-modal', { state: 'hidden' });
  });

  test('should display career stats in detail modal', async ({ page }) => {
    await openPlayerDetail(page, 0);

    const modal = page.locator('.player-detail-modal');

    // Check for career stats section
    const careerSection = modal.getByText('Career Totals');
    await expect(careerSection).toBeVisible();

    // Should have some stats displayed
    const statsTable = modal.locator('.stats-table').first();
    await expect(statsTable).toBeVisible();
  });

  test('should display season-by-season stats in detail modal', async ({ page }) => {
    await openPlayerDetail(page, 0);

    const modal = page.locator('.player-detail-modal');

    // Check for year-by-year stats section
    const yearByYearSection = modal.getByText('Season-by-Season Stats');
    await expect(yearByYearSection).toBeVisible();

    // Should have table with stats
    const table = modal.locator('.year-by-year-table').first();
    await expect(table).toBeVisible();
  });

  test('should display postseason stats section in detail modal', async ({ page }) => {
    await openPlayerDetail(page, 0);

    const modal = page.locator('.player-detail-modal');

    // Check for postseason stats section
    const postseasonSection = modal.getByText('Postseason Stats');
    await expect(postseasonSection).toBeVisible();
  });

  test('should display awards section in detail modal', async ({ page }) => {
    await openPlayerDetail(page, 0);

    const modal = page.locator('.player-detail-modal');

    // Check for awards section
    const awardsSection = modal.getByText('Awards & Honors');
    await expect(awardsSection).toBeVisible();
  });

  test('should display transactions section in detail modal', async ({ page }) => {
    await openPlayerDetail(page, 0);

    const modal = page.locator('.player-detail-modal');

    // Check for transactions section
    const transactionsSection = modal.getByText('Recent Transactions');
    await expect(transactionsSection).toBeVisible();
  });

  test('should display player bio information', async ({ page }) => {
    await openPlayerDetail(page, 0);

    const modal = page.locator('.player-detail-modal');

    // Check for bio info
    await expect(modal.locator('.player-meta').first()).toBeVisible();
    await expect(modal.locator('.player-bio').first()).toBeVisible();
  });

  test('should handle player image errors gracefully', async ({ page }) => {
    const cards = await page.locator('.player-card').all();

    for (let i = 0; i < Math.min(cards.length, 3); i++) {
      const card = cards[i];

      // Check if image is present or placeholder
      const hasImage = await card.locator('.player-image').isVisible();
      const hasPlaceholder = await card.locator('.player-image-placeholder').isVisible();

      // One or the other should be visible
      expect(hasImage || hasPlaceholder).toBeTruthy();
    }
  });

  test('should show player jersey number', async ({ page }) => {
    const firstCard = page.locator('.player-card').first();
    const number = firstCard.locator('.player-number');

    await expect(number).toBeVisible();
    const numberText = await number.textContent();
    expect(numberText).toMatch(/#\d+/);
  });

  test('should display bat and throw information', async ({ page }) => {
    const firstCard = page.locator('.player-card').first();

    // Look for bats/throws detail
    const batsThrows = firstCard.locator('.detail-row').filter({ hasText: 'Bats/Throws' });
    await expect(batsThrows).toBeVisible();
  });
});
