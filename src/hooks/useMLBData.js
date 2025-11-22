import { useState, useEffect } from 'react';
import { mlbApi } from '../api/mlbApi';

/**
 * Hook to fetch all MLB teams
 */
export const useMLBTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);

      try {
        const teamsData = await mlbApi.getAllTeams();
        setTeams(teamsData);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  return { teams, loading, error };
};

/**
 * Hook to fetch team roster with stats for a specific year
 * @param {number} teamId - MLB team ID
 * @param {number} year - Season year
 */
export const useTeamRoster = (teamId, year) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamId) return;

    const fetchRosterWithStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the roster for the specified team and year
        const roster = await mlbApi.getTeamRoster(teamId, year);

        // Fetch stats for each player
        const playersWithStats = await Promise.all(
          roster.map(async (rosterPlayer) => {
            try {
              const statsData = await mlbApi.getPlayerStats(rosterPlayer.person.id, year);
              return mlbApi.formatPlayerData(rosterPlayer, statsData, year);
            } catch (error) {
              console.error(`Failed to fetch stats for ${rosterPlayer.person.fullName}:`, error);
              // Return player with basic info even if stats fail
              return mlbApi.formatPlayerData(rosterPlayer, null, year);
            }
          })
        );

        setPlayers(playersWithStats);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching roster:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRosterWithStats();
  }, [teamId, year]);

  return { players, loading, error };
};

/**
 * Hook to fetch individual player stats
 */
export const usePlayerStats = (playerId, year) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await mlbApi.getPlayerStats(playerId, year);
        setStats(data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching player stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId, year]);

  return { stats, loading, error };
};

/**
 * Hook to fetch detailed player information (career stats, postseason, awards)
 */
export const usePlayerDetail = (playerId) => {
  const [playerDetail, setPlayerDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    const fetchPlayerDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await mlbApi.getPlayerDetail(playerId);
        setPlayerDetail(data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching player detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerDetail();
  }, [playerId]);

  return { playerDetail, loading, error };
};
