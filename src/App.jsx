import { useState, useEffect } from 'react'
import './App.css'
import PlayerStatsModal from './components/PlayerStatsModal'

const MLB_TEAMS = [
  { id: 109, name: 'Arizona Diamondbacks' },
  { id: 144, name: 'Atlanta Braves' },
  { id: 110, name: 'Baltimore Orioles' },
  { id: 111, name: 'Boston Red Sox' },
  { id: 112, name: 'Chicago Cubs' },
  { id: 145, name: 'Chicago White Sox' },
  { id: 113, name: 'Cincinnati Reds' },
  { id: 114, name: 'Cleveland Guardians' },
  { id: 115, name: 'Colorado Rockies' },
  { id: 116, name: 'Detroit Tigers' },
  { id: 117, name: 'Houston Astros' },
  { id: 118, name: 'Kansas City Royals' },
  { id: 108, name: 'Los Angeles Angels' },
  { id: 119, name: 'Los Angeles Dodgers' },
  { id: 146, name: 'Miami Marlins' },
  { id: 158, name: 'Milwaukee Brewers' },
  { id: 142, name: 'Minnesota Twins' },
  { id: 121, name: 'New York Mets' },
  { id: 147, name: 'New York Yankees' },
  { id: 133, name: 'Oakland Athletics' },
  { id: 143, name: 'Philadelphia Phillies' },
  { id: 134, name: 'Pittsburgh Pirates' },
  { id: 135, name: 'San Diego Padres' },
  { id: 137, name: 'San Francisco Giants' },
  { id: 136, name: 'Seattle Mariners' },
  { id: 138, name: 'St. Louis Cardinals' },
  { id: 139, name: 'Tampa Bay Rays' },
  { id: 140, name: 'Texas Rangers' },
  { id: 141, name: 'Toronto Blue Jays' },
  { id: 120, name: 'Washington Nationals' },
];

function App() {
  const [selectedTeam, setSelectedTeam] = useState('142'); // Default to Twins
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    if (selectedTeam) {
      fetchRoster(selectedTeam);
    }
  }, [selectedTeam]);

  const fetchRoster = async (teamId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster/40Man`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch roster data');
      }

      const data = await response.json();
      setRoster(data.roster || []);
    } catch (err) {
      setError(err.message);
      setRoster([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedTeamName = MLB_TEAMS.find(t => t.id.toString() === selectedTeam)?.name || '';

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>⚾ MLB 40-Man Rosters</h1>
          <p>Select a team to view their current 40-man roster</p>
        </header>

        <div className="content">
          <div className="team-selector">
            <label htmlFor="team-select">Choose a Team:</label>
            <select
              id="team-select"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              {MLB_TEAMS.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {loading && <div className="loading">Loading roster...</div>}

          {error && (
            <div className="error">
              Error: {error}
            </div>
          )}

          {!loading && !error && roster.length > 0 && (
            <>
              <div className="roster-count">
                {selectedTeamName} - {roster.length} Players on 40-Man Roster
              </div>

              <div className="roster-grid">
                {roster.map((player) => (
                  <div
                    key={player.person.id}
                    className="player-card"
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <div className="player-photo-wrapper">
                      <img
                        src={`https://img.mlb.com/mlb/images/players/head_shot/${player.person.id}.jpg`}
                        alt={player.person.fullName}
                        className="player-photo"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="60" fill="%239ca3af"%3E' + player.person.fullName.split(' ').map(n => n[0]).join('').substring(0,2) + '%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="player-name">
                      #{player.jerseyNumber || '--'} {player.person.fullName}
                    </div>
                    <div className="player-details">
                      <div className="player-detail">
                        <span className="player-detail-label">Position:</span>
                        <span>{player.position.abbreviation}</span>
                      </div>
                      {player.status && (
                        <div className="player-detail">
                          <span className="player-detail-label">Status:</span>
                          <span>{player.status.description}</span>
                        </div>
                      )}
                    </div>
                    <div className="click-hint">Click for stats →</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && !error && roster.length === 0 && (
            <div className="loading">
              No roster data available for this team.
            </div>
          )}
        </div>
      </div>

      {selectedPlayer && (
        <PlayerStatsModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}

export default App;
