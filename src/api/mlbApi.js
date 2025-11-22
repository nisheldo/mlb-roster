const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';
const DEFAULT_TEAM_ID = 142; // Minnesota Twins

export const mlbApi = {
  /**
   * Get all MLB teams
   */
  async getAllTeams() {
    try {
      const response = await fetch(`${MLB_API_BASE}/teams?sportId=1`);
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();

      // Filter and sort teams
      return (data.teams || [])
        .filter(team => team.sport.id === 1) // MLB only
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(team => ({
          id: team.id,
          name: team.name,
          teamName: team.teamName,
          locationName: team.locationName,
          abbreviation: team.abbreviation
        }));
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  /**
   * Get team roster for a specific season
   * @param {number} teamId - MLB team ID
   * @param {number} season - Season year
   */
  async getTeamRoster(teamId = DEFAULT_TEAM_ID, season = new Date().getFullYear()) {
    try {
      // 40-man roster data is available from 1910 onwards
      const response = await fetch(
        `${MLB_API_BASE}/teams/${teamId}/roster/40Man?season=${season}`
      );
      if (!response.ok) throw new Error('Failed to fetch roster');
      const data = await response.json();
      return data.roster || [];
    } catch (error) {
      console.error('Error fetching team roster:', error);
      throw error;
    }
  },

  /**
   * Get player details and stats for a specific year
   * @param {number} playerId - MLB player ID
   * @param {number} year - Season year
   */
  async getPlayerStats(playerId, year = new Date().getFullYear()) {
    try {
      const response = await fetch(
        `${MLB_API_BASE}/people/${playerId}?hydrate=stats(group=[hitting,pitching],type=[season],season=${year})`
      );
      if (!response.ok) throw new Error('Failed to fetch player stats');
      const data = await response.json();
      return data.people?.[0] || null;
    } catch (error) {
      console.error(`Error fetching stats for player ${playerId}:`, error);
      throw error;
    }
  },

  /**
   * Get detailed player information including career stats, postseason stats, and awards
   * @param {number} playerId - MLB player ID
   */
  async getPlayerDetail(playerId) {
    try {
      const response = await fetch(
        `${MLB_API_BASE}/people/${playerId}?hydrate=stats(group=[hitting,pitching],type=[yearByYear,career,careerRegularSeason,careerPostseason],gameType=[R,P]),awards,currentTeam`
      );
      if (!response.ok) throw new Error('Failed to fetch player details');
      const data = await response.json();

      // Log to check if there's video data available
      console.log('Player detail data:', data.people?.[0]);

      return data.people?.[0] || null;
    } catch (error) {
      console.error(`Error fetching player details for ${playerId}:`, error);
      throw error;
    }
  },

  /**
   * Search for player highlight videos from MLB
   * @param {string} playerName - Player's full name
   * @param {number} playerId - MLB player ID
   */
  async getPlayerHighlights(playerName, playerId) {
    try {
      // Try to fetch video content from MLB's video search
      // This searches for videos tagged with the player
      const response = await fetch(
        `https://search-api-mlbtv.mlb.com/svc/search/v2/graphql/persisted/query/core/Suggest?variables={"query":"${encodeURIComponent(playerName)}","limit":1,"languagePreference":"EN","contentPreference":"CMS_VIDEO"}`
      );

      if (!response.ok) {
        console.log('MLB video search failed, no highlights available');
        return null;
      }

      const data = await response.json();
      console.log('MLB video search result:', data);

      // Extract video slug if available
      if (data?.data?.search?.suggestions?.[0]?.slug) {
        const videoSlug = data.data.search.suggestions[0].slug;
        return `https://www.mlb.com${videoSlug}`;
      }

      return null;
    } catch (error) {
      console.error('Error fetching MLB highlights:', error);
      return null;
    }
  },

  /**
   * Get player transactions
   * @param {number} playerId - MLB player ID
   */
  async getPlayerTransactions(playerId) {
    try {
      const response = await fetch(
        `${MLB_API_BASE}/people/${playerId}?hydrate=transactions`
      );
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();

      // Return the most recent 3 transactions (reverse to get newest first)
      const transactions = data.people?.[0]?.transactions || [];
      return transactions.reverse().slice(0, 3).map(t => ({
        date: t.date,
        description: t.description,
        typeCode: t.typeCode,
        typeDesc: t.typeDesc
      }));
    } catch (error) {
      console.error(`Error fetching transactions for player ${playerId}:`, error);
      return [];
    }
  },

  /**
   * Get player image URL
   * @param {number} playerId - MLB player ID
   * @param {number} year - Season year (not used, kept for compatibility)
   */
  getPlayerImageUrl(playerId, year) {
    // MLB doesn't provide year-specific headshots in a simple URL format
    // Always use the most recent available image
    return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
  },

  /**
   * Format player data from API response
   */
  formatPlayerData(rosterPlayer, statsData, year) {
    const person = rosterPlayer.person;
    const position = rosterPlayer.position;

    // Determine if player is a pitcher
    const isPitcher = position.type === 'Pitcher';

    // Extract stats - check for both hitting and pitching stats
    let stats = {};
    let hittingStats = null;
    let pitchingStats = null;
    let isTwoWay = false;

    if (statsData && statsData.stats) {
      // Try to find hitting stats
      const hittingSeasonStats = statsData.stats.find(s =>
        s.type.displayName === 'season' &&
        s.group.displayName === 'hitting'
      );

      // Try to find pitching stats
      const pitchingSeasonStats = statsData.stats.find(s =>
        s.type.displayName === 'season' &&
        s.group.displayName === 'pitching'
      );

      // Extract hitting stats if available
      if (hittingSeasonStats && hittingSeasonStats.splits && hittingSeasonStats.splits.length > 0) {
        const statData = hittingSeasonStats.splits[0].stat;
        hittingStats = {
          avg: statData.avg || '.000',
          homeRuns: statData.homeRuns || 0,
          rbi: statData.rbi || 0,
          ops: statData.ops || '.000',
          games: statData.gamesPlayed || 0,
          hits: statData.hits || 0,
          atBats: statData.atBats || 0
        };
      }

      // Extract pitching stats if available
      if (pitchingSeasonStats && pitchingSeasonStats.splits && pitchingSeasonStats.splits.length > 0) {
        const statData = pitchingSeasonStats.splits[0].stat;
        pitchingStats = {
          era: statData.era || '0.00',
          wins: statData.wins || 0,
          losses: statData.losses || 0,
          strikeouts: statData.strikeOuts || 0,
          innings: statData.inningsPitched || '0.0',
          saves: statData.saves || 0,
          games: statData.gamesPlayed || 0
        };
      }

      // Determine if player is two-way (has both hitting and pitching stats with meaningful games)
      isTwoWay = hittingStats && pitchingStats &&
                 hittingStats.atBats > 0 &&
                 pitchingStats.innings !== '0.0';

      // Set primary stats based on player type
      if (isTwoWay) {
        stats = { hitting: hittingStats, pitching: pitchingStats };
      } else if (isPitcher && pitchingStats) {
        stats = pitchingStats;
      } else if (hittingStats) {
        stats = hittingStats;
      }
    }

    return {
      id: person.id,
      name: person.fullName,
      number: rosterPlayer.jerseyNumber || '00',
      position: position.abbreviation,
      positionType: position.type,
      isTwoWay,
      bats: statsData?.batSide?.code || 'R',
      throws: statsData?.pitchHand?.code || 'R',
      height: statsData?.height || 'N/A',
      weight: statsData?.weight || 0,
      birthDate: statsData?.birthDate ? new Date(statsData.birthDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'N/A',
      age: statsData?.currentAge || 'N/A',
      imageUrl: this.getPlayerImageUrl(person.id, year),
      stats,
      year
    };
  }
};
