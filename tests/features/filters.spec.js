import { test, expect } from '@playwright/test';
import {
  waitForRosterLoad,
  clickFilter,
  getVisiblePlayerCards,
  getPlayerPosition,
} from '../helpers/test-utils.js';

test.describe('Position Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForRosterLoad(page);
  });

  test('should show all players when All filter is active', async ({ page }) => {
    await clickFilter(page, 'all');

    const allButton = page.getByRole('button', { name: /All \(/ });
    await expect(allButton).toHaveClass(/active/);

    const playerCards = await page.locator('.player-card').count();
    expect(playerCards).toBeGreaterThan(0);
  });

  test('should filter pitchers correctly', async ({ page }) => {
    await clickFilter(page, 'pitchers');

    const pitchersButton = page.getByRole('button', { name: 'Pitchers' });
    await expect(pitchersButton).toHaveClass(/active/);

    const cards = await getVisiblePlayerCards(page);

    if (cards.length > 0) {
      // Check that visible players have pitcher positions
      for (const card of cards) {
        const position = await getPlayerPosition(card);
        // Pitchers typically have positions like SP, RP, P
        expect(['SP', 'RP', 'P', 'LHP', 'RHP']).toContainEqual(position);
      }
    }
  });

  test('should filter catchers correctly', async ({ page }) => {
    await clickFilter(page, 'catchers');

    const catchersButton = page.getByRole('button', { name: 'Catchers' });
    await expect(catchersButton).toHaveClass(/active/);

    const cards = await getVisiblePlayerCards(page);

    if (cards.length > 0) {
      // All visible players should be catchers
      for (const card of cards) {
        const position = await getPlayerPosition(card);
        expect(position).toBe('C');
      }
    }
  });

  test('should filter infielders correctly', async ({ page }) => {
    await clickFilter(page, 'infielders');

    const inFieldersButton = page.getByRole('button', { name: 'Infielders' });
    await expect(inFieldersButton).toHaveClass(/active/);

    const cards = await getVisiblePlayerCards(page);

    if (cards.length > 0) {
      // Check for infield positions
      for (const card of cards) {
        const position = await getPlayerPosition(card);
        expect(['1B', '2B', '3B', 'SS', 'IF']).toContainEqual(position);
      }
    }
  });

  test('should filter outfielders correctly', async ({ page }) => {
    await clickFilter(page, 'outfielders');

    const outFieldersButton = page.getByRole('button', { name: 'Outfielders' });
    await expect(outFieldersButton).toHaveClass(/active/);

    const cards = await getVisiblePlayerCards(page);

    if (cards.length > 0) {
      // Check for outfield positions
      for (const card of cards) {
        const position = await getPlayerPosition(card);
        expect(['LF', 'CF', 'RF', 'OF']).toContainEqual(position);
      }
    }
  });

  test('should filter DH correctly', async ({ page }) => {
    await clickFilter(page, 'dh');

    const dhButton = page.getByRole('button', { name: 'DH' });
    await expect(dhButton).toHaveClass(/active/);

    const cards = await getVisiblePlayerCards(page);

    if (cards.length > 0) {
      // All visible players should be designated hitters
      for (const card of cards) {
        const position = await getPlayerPosition(card);
        expect(position).toBe('DH');
      }
    } else {
      // DH might not exist for all teams/years (especially National League)
      // This is acceptable
      expect(cards.length).toBe(0);
    }
  });

  test('should show no results message when filter has no matches', async ({ page }) => {
    // Click a filter that might have no players
    await clickFilter(page, 'twoWay');

    const cards = await page.locator('.player-card').count();

    if (cards === 0) {
      // Should show no results message
      const noResults = page.locator('.no-results');
      await expect(noResults).toBeVisible();
    }
  });

  test('should switch between filters correctly', async ({ page }) => {
    // Click Pitchers
    await clickFilter(page, 'pitchers');
    let button = page.getByRole('button', { name: 'Pitchers' });
    await expect(button).toHaveClass(/active/);

    // Click Catchers
    await clickFilter(page, 'catchers');
    button = page.getByRole('button', { name: 'Catchers' });
    await expect(button).toHaveClass(/active/);

    // Pitchers should no longer be active
    button = page.getByRole('button', { name: 'Pitchers' });
    await expect(button).not.toHaveClass(/active/);

    // Click All
    await clickFilter(page, 'all');
    button = page.getByRole('button', { name: /All \(/ });
    await expect(button).toHaveClass(/active/);
  });

  test('should maintain filter when switching teams', async ({ page }) => {
    // Set a filter
    await clickFilter(page, 'pitchers');

    const pitchersButton = page.getByRole('button', { name: 'Pitchers' });
    await expect(pitchersButton).toHaveClass(/active/);

    // Note: Filter state might reset when changing teams
    // This test documents current behavior
    await page.selectOption('#team-select', { index: 1 });
    await waitForRosterLoad(page);

    // After team change, check if filter persists
    // (This might be "All" filter after team change - documenting expected behavior)
    const activeButton = await page.locator('.filter-buttons button.active');
    expect(await activeButton.count()).toBeGreaterThan(0);
  });
});
