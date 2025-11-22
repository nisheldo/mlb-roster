import { useState, useEffect } from 'react';
import './PlayerStatsModal.css';

function PlayerStatsModal({ player, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    fetchPlayerStats();
  }, [player.person.id]);

  const fetchPlayerStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch career stats and year-by-year stats
      const [careerResponse, yearByYearResponse] = await Promise.all([
        fetch(`https://statsapi.mlb.com/api/v1/people/${player.person.id}/stats?stats=career&group=hitting,pitching`),
        fetch(`https://statsapi.mlb.com/api/v1/people/${player.person.id}/stats?stats=yearByYear&group=hitting,pitching`)
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

  // Determine which stats are available
  const hasHittingStats = getCareerStats('hitting') || getYearByYearStats('hitting').length > 0;
  const hasPitchingStats = getCareerStats('pitching') || getYearByYearStats('pitching').length > 0;

  // Set default tab based on available stats
  useEffect(() => {
    if (!activeTab && stats) {
      if (player.position.abbreviation === 'P' && hasPitchingStats) {
        setActiveTab('pitching');
      } else if (hasHittingStats) {
        setActiveTab('hitting');
      } else if (hasPitchingStats) {
        setActiveTab('pitching');
      }
    }
  }, [stats, activeTab, hasHittingStats, hasPitchingStats, player.position.abbreviation]);

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <img
            src={`https://img.mlb.com/mlb/images/players/head_shot/${player.person.id}.jpg`}
            alt={player.person.fullName}
            className="modal-player-photo"
            loading="lazy"
            onError={(e) => {
              const initials = player.person.fullName.split(' ').map(n => n[0]).join('').substring(0,2);
              e.target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Ccircle fill="%23e5e7eb" cx="60" cy="60" r="60"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="40" fill="%239ca3af"%3E${initials}%3C/text%3E%3C/svg%3E`;
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
            {/* Only show tabs if there are stats to display */}
            {(hasHittingStats || hasPitchingStats) && (
              <div className="stats-tabs">
                {hasHittingStats && (
                  <button
                    className={`tab ${activeTab === 'hitting' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hitting')}
                  >
                    Hitting
                  </button>
                )}
                {hasPitchingStats && (
                  <button
                    className={`tab ${activeTab === 'pitching' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pitching')}
                  >
                    Pitching
                  </button>
                )}
              </div>
            )}

            <div className="stats-content">
              {activeTab === 'hitting' && hasHittingStats && (
                <>
                  <h3>Career Hitting</h3>
                  {getCareerStats('hitting') ? (
                    renderHittingStats(getCareerStats('hitting'))
                  ) : (
                    <p className="no-stats">No career hitting stats available</p>
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

              {activeTab === 'pitching' && hasPitchingStats && (
                <>
                  <h3>Career Pitching</h3>
                  {getCareerStats('pitching') ? (
                    renderPitchingStats(getCareerStats('pitching'))
                  ) : (
                    <p className="no-stats">No career pitching stats available</p>
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

              {!hasHittingStats && !hasPitchingStats && (
                <div className="modal-loading">No stats available for this player.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PlayerStatsModal;
