/**
 * Test utilities and helper functions for E2E tests
 */

/**
 * Wait for the roster to finish loading
 * @param {import('@playwright/test').Page} page
 */
export async function waitForRosterLoad(page) {
  // Wait for loading spinner to disappear
  await page.waitForSelector('.loading-container', { state: 'hidden', timeout: 30000 });

  // Wait for player cards to appear
  await page.waitForSelector('.player-card', { timeout: 30000 });
}

/**
 * Select a team from the dropdown
 * @param {import('@playwright/test').Page} page
 * @param {string} teamName - Full team name (e.g., "Minnesota Twins")
 */
export async function selectTeam(page, teamName) {
  await page.selectOption('#team-select', { label: teamName });
  await waitForRosterLoad(page);
}

/**
 * Select a year from the dropdown
 * @param {import('@playwright/test').Page} page
 * @param {string} year - Year as string (e.g., "2024")
 */
export async function selectYear(page, year) {
  await page.selectOption('#year-select', year);
  await waitForRosterLoad(page);
}

/**
 * Click a filter button
 * @param {import('@playwright/test').Page} page
 * @param {string} filterName - Filter name: 'all', 'pitchers', 'catchers', 'infielders', 'outfielders', 'dh', 'twoWay'
 */
export async function clickFilter(page, filterName) {
  const filterButtons = {
    all: 'All',
    pitchers: 'Pitchers',
    catchers: 'Catchers',
    infielders: 'Infielders',
    outfielders: 'Outfielders',
    dh: 'DH',
    twoWay: 'Two-Way',
  };

  await page.getByRole('button', { name: filterButtons[filterName] }).click();
  // Small wait for filter to apply
  await page.waitForTimeout(500);
}

/**
 * Get all player cards currently visible
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Array>}
 */
export async function getVisiblePlayerCards(page) {
  return await page.locator('.player-card').all();
}

/**
 * Get player position from a player card
 * @param {import('@playwright/test').Locator} card
 * @returns {Promise<string>}
 */
export async function getPlayerPosition(card) {
  return await card.locator('.player-position').textContent();
}

/**
 * Search for a player by name
 * @param {import('@playwright/test').Page} page
 * @param {string} searchTerm
 */
export async function searchPlayer(page, searchTerm) {
  await page.fill('.search-input', searchTerm);
  await page.waitForTimeout(500);
}

/**
 * Click on a player card to open detail modal
 * @param {import('@playwright/test').Page} page
 * @param {number} index - Index of player card (0-based)
 */
export async function openPlayerDetail(page, index = 0) {
  const cards = await page.locator('.player-card').all();
  if (cards[index]) {
    await cards[index].click();
    await page.waitForSelector('.player-detail-modal', { timeout: 10000 });
  }
}

/**
 * Close the player detail modal
 * @param {import('@playwright/test').Page} page
 */
export async function closePlayerDetail(page) {
  await page.click('.close-button');
  await page.waitForSelector('.player-detail-modal', { state: 'hidden' });
}

/**
 * Check if a player card shows two-way stats
 * @param {import('@playwright/test').Locator} card
 * @returns {Promise<boolean>}
 */
export async function hasTwoWayStats(card) {
  const statsSection = card.locator('.player-stats');
  const headings = await statsSection.locator('h5').count();
  return headings >= 2; // Should have "Hitting" and "Pitching" headings
}

/**
 * Teams available for testing (subset to avoid API rate limits)
 */
export const TEST_TEAMS = {
  TWINS: 'Minnesota Twins',
  DODGERS: 'Los Angeles Dodgers',
  YANKEES: 'New York Yankees',
  ANGELS: 'Los Angeles Angels', // More likely to have two-way players
};

/**
 * Years available for testing
 */
export const TEST_YEARS = {
  CURRENT: new Date().getFullYear().toString(),
  LAST_YEAR: (new Date().getFullYear() - 1).toString(),
};
