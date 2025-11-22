/**
 * Test script to check historical 40-man roster data availability
 * Tests various years from 1900 to present
 */

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';

// Test a sample of teams (we'll use Twins as main, but test a few others)
const TEST_TEAMS = [
  { id: 142, name: 'Minnesota Twins' },
  { id: 147, name: 'New York Yankees' },
  { id: 111, name: 'Boston Red Sox' }
];

// Test years - sample from different eras
const TEST_YEARS = [
  1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980,
  1990, 1995, 2000, 2005, 2010, 2015, 2020, 2023, 2024, 2025
];

const ROSTER_TYPES = ['40Man', 'active', 'fullRoster'];

async function testRosterAvailability(teamId, teamName, year, rosterType) {
  const url = `${MLB_API_BASE}/teams/${teamId}/roster/${rosterType}?season=${year}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.roster && data.roster.length > 0) {
      return {
        success: true,
        count: data.roster.length,
        url: url
      };
    } else {
      return {
        success: false,
        status: response.status,
        message: data.message || 'No roster data',
        url: url
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: url
    };
  }
}

async function runTests() {
  console.log('Testing Historical MLB Roster Data Availability\n');
  console.log('='.repeat(80));

  const results = {
    byRosterType: {},
    byYear: {},
    earliest: {}
  };

  // Initialize results structure
  ROSTER_TYPES.forEach(type => {
    results.byRosterType[type] = [];
    results.earliest[type] = null;
  });

  // Test each combination
  for (const rosterType of ROSTER_TYPES) {
    console.log(`\n\nTesting ${rosterType} rosters:`);
    console.log('-'.repeat(80));

    for (const year of TEST_YEARS) {
      const team = TEST_TEAMS[0]; // Use Twins as primary test
      const result = await testRosterAvailability(team.id, team.name, year, rosterType);

      if (result.success) {
        console.log(`✅ ${year}: Found ${result.count} players`);
        results.byRosterType[rosterType].push(year);

        // Track earliest year
        if (!results.earliest[rosterType] || year < results.earliest[rosterType]) {
          results.earliest[rosterType] = year;
        }
      } else {
        console.log(`❌ ${year}: ${result.message || result.error || 'Failed'}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  for (const rosterType of ROSTER_TYPES) {
    console.log(`\n${rosterType}:`);
    if (results.earliest[rosterType]) {
      console.log(`  Earliest available: ${results.earliest[rosterType]}`);
      console.log(`  Years with data: ${results.byRosterType[rosterType].join(', ')}`);
    } else {
      console.log(`  No data found in tested years`);
    }
  }

  // Test a few different teams for recent years to verify consistency
  console.log('\n\n' + '='.repeat(80));
  console.log('TESTING DIFFERENT TEAMS (2024, 40Man roster)');
  console.log('='.repeat(80));

  for (const team of TEST_TEAMS) {
    const result = await testRosterAvailability(team.id, team.name, 2024, '40Man');
    if (result.success) {
      console.log(`✅ ${team.name}: ${result.count} players`);
    } else {
      console.log(`❌ ${team.name}: ${result.message || result.error}`);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(80));
  console.log('Test complete!');
}

// Run the tests
runTests().catch(console.error);
