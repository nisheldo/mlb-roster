import { useState, useEffect } from 'react'
import './App.css'
import PlayerStatsModal from './components/PlayerStatsModal'

const MLB_TEAMS = [
  { id: 109, name: 'Arizona Diamondbacks', primaryColor: '#A71930', secondaryColor: '#E3D4AD' },
  { id: 144, name: 'Atlanta Braves', primaryColor: '#CE1141', secondaryColor: '#13274F' },
  { id: 110, name: 'Baltimore Orioles', primaryColor: '#DF4601', secondaryColor: '#000000' },
  { id: 111, name: 'Boston Red Sox', primaryColor: '#BD3039', secondaryColor: '#0C2340' },
  { id: 112, name: 'Chicago Cubs', primaryColor: '#0E3386', secondaryColor: '#CC3433' },
  { id: 145, name: 'Chicago White Sox', primaryColor: '#27251F', secondaryColor: '#C4CED4' },
  { id: 113, name: 'Cincinnati Reds', primaryColor: '#C6011F', secondaryColor: '#000000' },
  { id: 114, name: 'Cleveland Guardians', primaryColor: '#0C2340', secondaryColor: '#E31937' },
  { id: 115, name: 'Colorado Rockies', primaryColor: '#33006F', secondaryColor: '#C4CED4' },
  { id: 116, name: 'Detroit Tigers', primaryColor: '#0C2340', secondaryColor: '#FA4616' },
  { id: 117, name: 'Houston Astros', primaryColor: '#002D62', secondaryColor: '#EB6E1F' },
  { id: 118, name: 'Kansas City Royals', primaryColor: '#004687', secondaryColor: '#BD9B60' },
  { id: 108, name: 'Los Angeles Angels', primaryColor: '#BA0021', secondaryColor: '#003263' },
  { id: 119, name: 'Los Angeles Dodgers', primaryColor: '#005A9C', secondaryColor: '#EF3E42' },
  { id: 146, name: 'Miami Marlins', primaryColor: '#00A3E0', secondaryColor: '#EF3340' },
  { id: 158, name: 'Milwaukee Brewers', primaryColor: '#12284B', secondaryColor: '#FFC52F' },
  { id: 142, name: 'Minnesota Twins', primaryColor: '#002B5C', secondaryColor: '#D31145' },
  { id: 121, name: 'New York Mets', primaryColor: '#002D72', secondaryColor: '#FF5910' },
  { id: 147, name: 'New York Yankees', primaryColor: '#0C2340', secondaryColor: '#C4CED4' },
  { id: 133, name: 'Oakland Athletics', primaryColor: '#003831', secondaryColor: '#EFB21E' },
  { id: 143, name: 'Philadelphia Phillies', primaryColor: '#E81828', secondaryColor: '#002D72' },
  { id: 134, name: 'Pittsburgh Pirates', primaryColor: '#27251F', secondaryColor: '#FDB827' },
  { id: 135, name: 'San Diego Padres', primaryColor: '#2F241D', secondaryColor: '#FFC425' },
  { id: 137, name: 'San Francisco Giants', primaryColor: '#FD5A1E', secondaryColor: '#27251F' },
  { id: 136, name: 'Seattle Mariners', primaryColor: '#0C2C56', secondaryColor: '#005C5C' },
  { id: 138, name: 'St. Louis Cardinals', primaryColor: '#C41E3A', secondaryColor: '#0C2340' },
  { id: 139, name: 'Tampa Bay Rays', primaryColor: '#092C5C', secondaryColor: '#8FBCE6' },
  { id: 140, name: 'Texas Rangers', primaryColor: '#003278', secondaryColor: '#C0111F' },
  { id: 141, name: 'Toronto Blue Jays', primaryColor: '#134A8E', secondaryColor: '#1D2D5C' },
  { id: 120, name: 'Washington Nationals', primaryColor: '#AB0003', secondaryColor: '#14225A' },
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

  const selectedTeamData = MLB_TEAMS.find(t => t.id.toString() === selectedTeam);
  const selectedTeamName = selectedTeamData?.name || '';
  const teamColors = {
    primary: selectedTeamData?.primaryColor || '#1e3a8a',
    secondary: selectedTeamData?.secondaryColor || '#1e40af'
  };

  return (
    <div className="app" style={{
      background: `linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.secondary} 100%)`
    }}>
      <div className="container">
        <header className="header" style={{
          background: `linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.secondary} 100%)`
        }}>
          {selectedTeam && (
            <img
              src={`https://www.mlbstatic.com/team-logos/${selectedTeam}.svg`}
              alt={selectedTeamName}
              className="team-logo"
            />
          )}
          <div className="header-text">
            <h1>{selectedTeamName || 'MLB 40-Man Rosters'}</h1>
            <p>40-Man Roster</p>
          </div>
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
              <div className="roster-count" style={{
                background: `${teamColors.primary}15`,
                color: teamColors.primary,
                borderLeft: `4px solid ${teamColors.primary}`
              }}>
                {roster.length} Players on 40-Man Roster
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
                        src={`https://img.mlb.com/mlb/images/players/head_shot/${player.person.id}@2x.jpg`}
                        alt={player.person.fullName}
                        className="player-photo"
                        loading="lazy"
                        onError={(e) => {
                          // Try standard resolution
                          if (e.target.src.includes('@2x')) {
                            e.target.src = `https://img.mlb.com/mlb/images/players/head_shot/${player.person.id}.jpg`;
                          } else if (e.target.src.includes('img.mlb.com')) {
                            // Try content.mlb.com
                            e.target.src = `https://content.mlb.com/images/headshots/current/60x60/${player.person.id}.png`;
                          } else {
                            // Fall back to initials
                            const initials = player.person.fullName.split(' ').map(n => n[0]).join('').substring(0,2);
                            e.target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="60" fill="%239ca3af"%3E${initials}%3C/text%3E%3C/svg%3E`;
                          }
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
