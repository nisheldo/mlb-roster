import { useState, useEffect } from 'react';
import './PlayerStatsModal.css';

function PlayerStatsModal({ player, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('hitting');

  useEffect(() => {
    fetchPlayerStats();
  }, [player.person.id]);

  const fetchPlayerStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch career stats and year-by-year stats
      const [careerResponse, yearByYearResponse] = await Promise.all([
        fetch(`https://statsapi.mlb.com/api/v1/people/${player.person.id}/stats?stats=career&group=hitting,pitching,fielding`),
        fetch(`https://statsapi.mlb.com/api/v1/people/${player.person.id}/stats?stats=yearByYear&group=hitting,pitching,fielding`)
      ]);

      if (!careerResponse.ok || !yearByYearResponse.ok) {
        throw new Error('Failed to fetch player stats');
      }

      const careerData = await careerResponse.json();
      const yearByYearData = await yearByYearResponse.json();

      setStats({
        career: careerData.stats || [],
        yearByYear: yearByYearData.stats || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCareerStats = (type) => {
    if (!stats?.career) return null;
    const careerStat = stats.career.find(s => s.group?.displayName?.toLowerCase() === type);
    return careerStat?.splits?.[0]?.stat || null;
  };

  const getYearByYearStats = (type) => {
    if (!stats?.yearByYear) return [];
    const yearStats = stats.yearByYear.find(s => s.group?.displayName?.toLowerCase() === type);
    return yearStats?.splits || [];
  };

  const isPitcher = player.position.abbreviation === 'P';
  const defaultTab = isPitcher ? 'pitching' : 'hitting';

  const renderHittingStats = (stat) => (
    <div className="stat-row">
      <span className="stat-label">AVG</span>
      <span className="stat-value">{stat.avg || '.---'}</span>
      <span className="stat-label">HR</span>
      <span className="stat-value">{stat.homeRuns || 0}</span>
      <span className="stat-label">RBI</span>
      <span className="stat-value">{stat.rbi || 0}</span>
      <span className="stat-label">OPS</span>
      <span className="stat-value">{stat.ops || '.---'}</span>
      <span className="stat-label">AB</span>
      <span className="stat-value">{stat.atBats || 0}</span>
      <span className="stat-label">H</span>
      <span className="stat-value">{stat.hits || 0}</span>
    </div>
  );

  const renderPitchingStats = (stat) => (
    <div className="stat-row">
      <span className="stat-label">ERA</span>
      <span className="stat-value">{stat.era || '-.--'}</span>
      <span className="stat-label">W-L</span>
      <span className="stat-value">{stat.wins || 0}-{stat.losses || 0}</span>
      <span className="stat-label">IP</span>
      <span className="stat-value">{stat.inningsPitched || '0.0'}</span>
      <span className="stat-label">SO</span>
      <span className="stat-value">{stat.strikeOuts || 0}</span>
      <span className="stat-label">WHIP</span>
      <span className="stat-value">{stat.whip || '-.--'}</span>
      <span className="stat-label">SV</span>
      <span className="stat-value">{stat.saves || 0}</span>
    </div>
  );

  const renderFieldingStats = (stat) => (
    <div className="stat-row">
      <span className="stat-label">Games</span>
      <span className="stat-value">{stat.games || 0}</span>
      <span className="stat-label">Putouts</span>
      <span className="stat-value">{stat.putOuts || 0}</span>
      <span className="stat-label">Assists</span>
      <span className="stat-value">{stat.assists || 0}</span>
      <span className="stat-label">Errors</span>
      <span className="stat-value">{stat.errors || 0}</span>
      <span className="stat-label">Fld%</span>
      <span className="stat-value">{stat.fielding || '.---'}</span>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <img
            src={`https://img.mlb.com/mlb/images/players/head_shot/${player.person.id}.jpg`}
            alt={player.person.fullName}
            className="modal-player-photo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="modal-header-text">
            <h2>#{player.jerseyNumber || '--'} {player.person.fullName}</h2>
            <p className="player-position">{player.position.name}</p>
          </div>
        </div>

        {loading && <div className="modal-loading">Loading stats...</div>}

        {error && <div className="modal-error">Error: {error}</div>}

        {!loading && !error && stats && (
          <>
            <div className="stats-tabs">
              <button
                className={`tab ${activeTab === 'hitting' ? 'active' : ''}`}
                onClick={() => setActiveTab('hitting')}
              >
                Hitting
              </button>
              <button
                className={`tab ${activeTab === 'pitching' ? 'active' : ''}`}
                onClick={() => setActiveTab('pitching')}
              >
                Pitching
              </button>
              <button
                className={`tab ${activeTab === 'fielding' ? 'active' : ''}`}
                onClick={() => setActiveTab('fielding')}
              >
                Fielding
              </button>
            </div>

            <div className="stats-content">
              {activeTab === 'hitting' && (
                <>
                  <h3>Career Hitting</h3>
                  {getCareerStats('hitting') ? (
                    renderHittingStats(getCareerStats('hitting'))
                  ) : (
                    <p className="no-stats">No hitting stats available</p>
                  )}

                  <h3>Year by Year</h3>
                  <div className="year-by-year">
                    {getYearByYearStats('hitting').length > 0 ? (
                      getYearByYearStats('hitting').reverse().map((split, idx) => (
                        <div key={idx} className="year-section">
                          <h4>{split.season} - {split.team?.name || 'N/A'}</h4>
                          {renderHittingStats(split.stat)}
                        </div>
                      ))
                    ) : (
                      <p className="no-stats">No year-by-year hitting stats available</p>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'pitching' && (
                <>
                  <h3>Career Pitching</h3>
                  {getCareerStats('pitching') ? (
                    renderPitchingStats(getCareerStats('pitching'))
                  ) : (
                    <p className="no-stats">No pitching stats available</p>
                  )}

                  <h3>Year by Year</h3>
                  <div className="year-by-year">
                    {getYearByYearStats('pitching').length > 0 ? (
                      getYearByYearStats('pitching').reverse().map((split, idx) => (
                        <div key={idx} className="year-section">
                          <h4>{split.season} - {split.team?.name || 'N/A'}</h4>
                          {renderPitchingStats(split.stat)}
                        </div>
                      ))
                    ) : (
                      <p className="no-stats">No year-by-year pitching stats available</p>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'fielding' && (
                <>
                  <h3>Career Fielding</h3>
                  {getCareerStats('fielding') ? (
                    renderFieldingStats(getCareerStats('fielding'))
                  ) : (
                    <p className="no-stats">No fielding stats available</p>
                  )}

                  <h3>Year by Year</h3>
                  <div className="year-by-year">
                    {getYearByYearStats('fielding').length > 0 ? (
                      getYearByYearStats('fielding').reverse().map((split, idx) => (
                        <div key={idx} className="year-section">
                          <h4>{split.season} - {split.team?.name || 'N/A'}</h4>
                          {renderFieldingStats(split.stat)}
                        </div>
                      ))
                    ) : (
                      <p className="no-stats">No year-by-year fielding stats available</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PlayerStatsModal;
