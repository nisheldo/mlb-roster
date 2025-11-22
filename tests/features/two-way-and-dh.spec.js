import { test, expect } from '@playwright/test';
import {
  waitForRosterLoad,
  selectTeam,
  clickFilter,
  getVisiblePlayerCards,
  getPlayerPosition,
  openPlayerDetail,
  hasTwoWayStats,
  TEST_TEAMS,
} from '../helpers/test-utils.js';

test.describe('Two-Way Player Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForRosterLoad(page);
  });

  test('should have Two-Way filter button', async ({ page }) => {
    const twoWayButton = page.getByRole('button', { name: 'Two-Way' });
    await expect(twoWayButton).toBeVisible();
  });

  test('should filter two-way players when clicked', async ({ page }) => {
    await clickFilter(page, 'twoWay');

    const twoWayButton = page.getByRole('button', { name: 'Two-Way' });
    await expect(twoWayButton).toHaveClass(/active/);
  });

  test('should display both hitting and pitching stats for two-way players', async ({ page }) => {
    // Try Angels (more likely to have two-way players like Ohtani)
    await selectTeam(page, TEST_TEAMS.ANGELS);
    await clickFilter(page, 'twoWay');

    const cards = await getVisiblePlayerCards(page);

    if (cards.length > 0) {
      // Check first two-way player card
      const firstTwoWay = cards[0];

      // Should have hitting section header
      const hittingHeader = firstTwoWay.locator('h5').filter({ hasText: 'Hitting' });
      await expect(hittingHeader).toBeVisible();

      // Should have pitching section header
      const pitchingHeader = firstTwoWay.locator('h5').filter({ hasText: 'Pitching' });
      await expect(pitchingHeader).toBeVisible();

      // Should have hitting stats (AVG, HR, RBI, OPS)
      const statsGrid = firstTwoWay.locator('.stats-grid');
      await expect(statsGrid.first()).toBeVisible();

      // Should have pitching stats (ERA, W-L, K, IP)
      await expect(statsGrid.nth(1)).toBeVisible();
    }
  });

  test('should show both stat types in two-way player detail modal', async ({ page }) => {
    await selectTeam(page, TEST_TEAMS.ANGELS);
    await clickFilter(page, 'twoWay');

    const cards = await getVisiblePlayerCards(page);

    if (cards.length > 0) {
      // Open first two-way player
      await openPlayerDetail(page, 0);

      const modal = page.locator('.player-detail-modal');

      // Career stats should have both hitting and pitching sections
      const careerSection = modal.locator('.detail-section').filter({ hasText: 'Career Totals' });

      // Look for hitting/pitching headers in career section
      const headers = careerSection.locator('h4');
      const headerCount = await headers.count();

      if (headerCount >= 2) {
        // Two-way player - should have separate sections
        await expect(headers.filter({ hasText: 'Hitting' })).toBeVisible();
        await expect(headers.filter({ hasText: 'Pitching' })).toBeVisible();
      }
    }
  });

  test('should not show two-way players in Pitchers filter', async ({ page }) => {
    await selectTeam(page, TEST_TEAMS.ANGELS);
    await clickFilter(page, 'pitchers');

    const cards = await getVisiblePlayerCards(page);

    // None of the pitcher cards should have two-way stats
    for (const card of cards) {
      const isTwoWay = await hasTwoWayStats(card);
      expect(isTwoWay).toBe(false);
    }
  });
});

test.describe('DH (Designated Hitter) Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForRosterLoad(page);
  });

  test('should have DH filter button', async ({ page }) => {
    const dhButton = page.getByRole('button', { name: 'DH' });
    await expect(dhButton).toBeVisible();
  });

  test('should filter DH players when clicked', async ({ page }) => {
    await clickFilter(page, 'dh');

    const dhButton = page.getByRole('button', { name: 'DH' });
    await expect(dhButton).toHaveClass(/active/);
  });

  test('should show only DH position players in DH filter', async ({ page }) => {
    // Use an American League team more likely to have DH
    await selectTeam(page, TEST_TEAMS.YANKEES);
    await clickFilter(page, 'dh');

    const cards = await getVisiblePlayerCards(page);

    if (cards.length > 0) {
      // All visible players should have DH position
      for (const card of cards) {
        const position = await getPlayerPosition(card);
        expect(position).toBe('DH');
      }
    }
  });

  test('should display hitting stats for DH players', async ({ page }) => {
    await selectTeam(page, TEST_TEAMS.YANKEES);
    await clickFilter(page, 'dh');

    const cards = await getVisiblePlayerCards(page);

    if (cards.length > 0) {
      const firstDH = cards[0];

      // Should have hitting stats
      const avgStat = firstDH.locator('.stat-label').filter({ hasText: 'AVG' });
      await expect(avgStat).toBeVisible();

      const hrStat = firstDH.locator('.stat-label').filter({ hasText: 'HR' });
      await expect(hrStat).toBeVisible();

      const rbiStat = firstDH.locator('.stat-label').filter({ hasText: 'RBI' });
      await expect(rbiStat).toBeVisible();

      // Should NOT have pitching stats
      const eraStat = firstDH.locator('.stat-label').filter({ hasText: 'ERA' });
      await expect(eraStat).not.toBeVisible();
    }
  });

  test('should handle teams/years with no DH gracefully', async ({ page }) => {
    // Some National League teams or years might not have DH
    await selectTeam(page, TEST_TEAMS.DODGERS);
    await clickFilter(page, 'dh');

    // Either show DH players or show no results message
    const cards = await page.locator('.player-card').count();
    const noResults = page.locator('.no-results');

    if (cards === 0) {
      await expect(noResults).toBeVisible();
    } else {
      // If there are DH, they should all be DH position
      const visibleCards = await getVisiblePlayerCards(page);
      for (const card of visibleCards) {
        const position = await getPlayerPosition(card);
        expect(position).toBe('DH');
      }
    }
  });
});

test.describe('Filter Order and Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForRosterLoad(page);
  });

  test('should have filters in correct order', async ({ page }) => {
    const filterButtons = page.locator('.filter-buttons button');
    const buttonTexts = await filterButtons.allTextContents();

    // Clean up text (remove counts from "All (40)")
    const cleanTexts = buttonTexts.map(text => text.replace(/\s*\(\d+\)/, '').trim());

    // Expected order
    const expectedOrder = ['All', 'Pitchers', 'Catchers', 'Infielders', 'Outfielders', 'DH', 'Two-Way'];

    expect(cleanTexts).toEqual(expectedOrder);
  });

  test('should display all position filters on same row', async ({ page }) => {
    const filterContainer = page.locator('.filter-buttons');
    await expect(filterContainer).toBeVisible();

    // All buttons should be visible
    const buttons = filterContainer.locator('button');
    const count = await buttons.count();
    expect(count).toBe(7); // All, Pitchers, Catchers, Infielders, Outfielders, DH, Two-Way
  });
});
