import { useState, useEffect } from 'react';
import PlayerCard from './PlayerCard';
import PlayerDetail from './PlayerDetail';
import { useTeamRoster, useMLBTeams } from '../hooks/useMLBData';
import { getTeamColors } from '../data/teamColors';
import './Roster.css';

const Roster = () => {
  const currentYear = new Date().getFullYear();
  const [selectedTeamId, setSelectedTeamId] = useState(142); // Default to Twins
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState('');

  const { teams, loading: teamsLoading } = useMLBTeams();
  const { players, loading, error } = useTeamRoster(selectedTeamId, selectedYear);

  // Get selected team info
  const selectedTeam = teams.find(t => t.id === selectedTeamId) || { name: 'Loading...', abbreviation: '' };

  // Apply team colors when team changes
  useEffect(() => {
    const colors = getTeamColors(selectedTeamId);
    document.documentElement.style.setProperty('--team-primary', colors.primary);
    document.documentElement.style.setProperty('--team-secondary', colors.secondary);
    document.documentElement.style.setProperty('--team-accent', colors.accent);
  }, [selectedTeamId]);

  const handlePlayerClick = (playerId, playerName) => {
    setSelectedPlayerId(playerId);
    setSelectedPlayerName(playerName);
  };

  const handleCloseDetail = () => {
    setSelectedPlayerId(null);
    setSelectedPlayerName('');
  };

  const getFilteredPlayers = () => {
    let filtered = players;

    // Filter by position
    if (filter === 'pitchers') {
      filtered = filtered.filter(p => p.positionType === 'Pitcher' && !p.isTwoWay);
    } else if (filter === 'catchers') {
      filtered = filtered.filter(p => p.position === 'C');
    } else if (filter === 'infielders') {
      filtered = filtered.filter(p => p.positionType === 'Infielder');
    } else if (filter === 'outfielders') {
      filtered = filtered.filter(p => p.positionType === 'Outfielder');
    } else if (filter === 'twoWay') {
      filtered = filtered.filter(p => p.isTwoWay);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPlayers = getFilteredPlayers();

  // Generate year options (2020 to current year)
  const yearOptions = [];
  for (let year = currentYear; year >= 2020; year--) {
    yearOptions.push(year);
  }

  return (
    <div className="roster-container">
      <header className="roster-header">
        <div className="header-content">
          <img
            src={`https://www.mlbstatic.com/team-logos/${selectedTeamId}.svg`}
            alt={`${selectedTeam.name} logo`}
            className="team-logo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="header-text">
            <h1>{selectedTeam.name} Roster</h1>
            <p className="roster-subtitle">{selectedYear} Season</p>
            <p className="roster-attribution">Data from MLB Stats API</p>
          </div>
        </div>
      </header>

      <div className="controls">
        <div className="selectors-row">
          <div className="team-selector">
            <label htmlFor="team-select">Team:</label>
            <select
              id="team-select"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(Number(e.target.value))}
              className="team-select"
              disabled={teamsLoading}
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="year-selector">
            <label htmlFor="year-select">Season:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="year-select"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by player name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({players.length})
          </button>
          <button
            className={filter === 'pitchers' ? 'active' : ''}
            onClick={() => setFilter('pitchers')}
          >
            Pitchers
          </button>
          <button
            className={filter === 'catchers' ? 'active' : ''}
            onClick={() => setFilter('catchers')}
          >
            Catchers
          </button>
          <button
            className={filter === 'infielders' ? 'active' : ''}
            onClick={() => setFilter('infielders')}
          >
            Infielders
          </button>
          <button
            className={filter === 'outfielders' ? 'active' : ''}
            onClick={() => setFilter('outfielders')}
          >
            Outfielders
          </button>
          <button
            className={filter === 'twoWay' ? 'active' : ''}
            onClick={() => setFilter('twoWay')}
          >
            Two-Way
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading roster data...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>Error loading roster: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="roster-grid">
            {filteredPlayers.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={() => handlePlayerClick(player.id, player.name)}
              />
            ))}
          </div>

          {filteredPlayers.length === 0 && players.length > 0 && (
            <div className="no-results">
              No players found matching your criteria.
            </div>
          )}
        </>
      )}

      {selectedPlayerId && (
        <PlayerDetail
          playerId={selectedPlayerId}
          playerName={selectedPlayerName}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default Roster;
