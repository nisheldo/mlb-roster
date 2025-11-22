import { useState, useEffect } from 'react';
import { usePlayerDetail } from '../hooks/useMLBData';
import { mlbApi } from '../api/mlbApi';
import './PlayerDetail.css';

const PlayerDetail = ({ playerId, playerName, onClose }) => {
  const { playerDetail, loading, error } = usePlayerDetail(playerId);
  const [highlightUrl, setHighlightUrl] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // Fetch highlights when player detail loads
  useEffect(() => {
    if (playerDetail) {
      mlbApi.getPlayerHighlights(playerDetail.fullName, playerId).then(url => {
        setHighlightUrl(url);
      });
    }
  }, [playerDetail, playerId]);

  // Fetch player transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setTransactionsLoading(true);
      try {
        const txns = await mlbApi.getPlayerTransactions(playerId);
        setTransactions(txns);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    if (playerId) {
      fetchTransactions();
    }
  }, [playerId]);

  if (!playerId) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderCareerStats = () => {
    if (!playerDetail?.stats) return null;

    // Find career stats
    const careerStatsGroup = playerDetail.stats.find(s =>
      s.type.displayName === 'career'
    );

    if (!careerStatsGroup || !careerStatsGroup.splits || careerStatsGroup.splits.length === 0) {
      return <p className="no-data">No career stats available</p>;
    }

    // Find the regular season split (gameType === 'R')
    const regularSeasonSplit = careerStatsGroup.splits.find(split => split.gameType === 'R');

    if (!regularSeasonSplit || !regularSeasonSplit.stat) {
      return <p className="no-data">No career stats available</p>;
    }

    const stats = regularSeasonSplit.stat;
    const isPitcher = careerStatsGroup.group.displayName === 'pitching';

    if (isPitcher) {
      return (
        <div className="stats-table">
          <div className="stat-row">
            <span className="stat-label">ERA</span>
            <span className="stat-value">{stats.era || '0.00'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Wins-Losses</span>
            <span className="stat-value">{stats.wins || 0}-{stats.losses || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Games</span>
            <span className="stat-value">{stats.gamesPlayed || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Games Started</span>
            <span className="stat-value">{stats.gamesStarted || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Innings Pitched</span>
            <span className="stat-value">{stats.inningsPitched || '0.0'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Strikeouts</span>
            <span className="stat-value">{stats.strikeOuts || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Walks</span>
            <span className="stat-value">{stats.baseOnBalls || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Saves</span>
            <span className="stat-value">{stats.saves || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">WHIP</span>
            <span className="stat-value">{stats.whip || '0.00'}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="stats-table">
          <div className="stat-row">
            <span className="stat-label">Games</span>
            <span className="stat-value">{stats.gamesPlayed || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">At Bats</span>
            <span className="stat-value">{stats.atBats || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Hits</span>
            <span className="stat-value">{stats.hits || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Batting Average</span>
            <span className="stat-value">{stats.avg || '.000'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Home Runs</span>
            <span className="stat-value">{stats.homeRuns || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">RBI</span>
            <span className="stat-value">{stats.rbi || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Runs</span>
            <span className="stat-value">{stats.runs || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Stolen Bases</span>
            <span className="stat-value">{stats.stolenBases || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">OBP</span>
            <span className="stat-value">{stats.obp || '.000'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">SLG</span>
            <span className="stat-value">{stats.slg || '.000'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">OPS</span>
            <span className="stat-value">{stats.ops || '.000'}</span>
          </div>
        </div>
      );
    }
  };

  const renderYearByYearStats = () => {
    if (!playerDetail?.stats) return null;

    const yearByYearStats = playerDetail.stats.find(s =>
      s.type.displayName === 'yearByYear'
    );

    if (!yearByYearStats || !yearByYearStats.splits || yearByYearStats.splits.length === 0) {
      return <p className="no-data">No season-by-season stats available</p>;
    }

    const isPitcher = yearByYearStats.group.displayName === 'pitching';
    // Filter for only regular season games (gameType 'R' or no gameType means regular season)
    const seasons = yearByYearStats.splits.filter(split =>
      split.stat.gamesPlayed > 0 && (!split.gameType || split.gameType === 'R')
    );

    if (seasons.length === 0) {
      return <p className="no-data">No season-by-season stats available</p>;
    }

    if (isPitcher) {
      return (
        <div className="year-by-year-table-container">
          <table className="year-by-year-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Team</th>
                <th>W</th>
                <th>L</th>
                <th>ERA</th>
                <th>G</th>
                <th>GS</th>
                <th>SV</th>
                <th>IP</th>
                <th>H</th>
                <th>R</th>
                <th>ER</th>
                <th>BB</th>
                <th>SO</th>
                <th>WHIP</th>
              </tr>
            </thead>
            <tbody>
              {seasons.reverse().map((split, index) => (
                <tr key={index}>
                  <td className="year-cell">{split.season}</td>
                  <td className="team-cell">{split.team?.name || 'N/A'}</td>
                  <td>{split.stat.wins || 0}</td>
                  <td>{split.stat.losses || 0}</td>
                  <td>{split.stat.era || '0.00'}</td>
                  <td>{split.stat.gamesPlayed || 0}</td>
                  <td>{split.stat.gamesStarted || 0}</td>
                  <td>{split.stat.saves || 0}</td>
                  <td>{split.stat.inningsPitched || '0.0'}</td>
                  <td>{split.stat.hits || 0}</td>
                  <td>{split.stat.runs || 0}</td>
                  <td>{split.stat.earnedRuns || 0}</td>
                  <td>{split.stat.baseOnBalls || 0}</td>
                  <td>{split.stat.strikeOuts || 0}</td>
                  <td>{split.stat.whip || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="year-by-year-table-container">
          <table className="year-by-year-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Team</th>
                <th>G</th>
                <th>AB</th>
                <th>R</th>
                <th>H</th>
                <th>2B</th>
                <th>3B</th>
                <th>HR</th>
                <th>RBI</th>
                <th>SB</th>
                <th>BB</th>
                <th>SO</th>
                <th>AVG</th>
                <th>OBP</th>
                <th>SLG</th>
                <th>OPS</th>
              </tr>
            </thead>
            <tbody>
              {seasons.reverse().map((split, index) => (
                <tr key={index}>
                  <td className="year-cell">{split.season}</td>
                  <td className="team-cell">{split.team?.name || 'N/A'}</td>
                  <td>{split.stat.gamesPlayed || 0}</td>
                  <td>{split.stat.atBats || 0}</td>
                  <td>{split.stat.runs || 0}</td>
                  <td>{split.stat.hits || 0}</td>
                  <td>{split.stat.doubles || 0}</td>
                  <td>{split.stat.triples || 0}</td>
                  <td>{split.stat.homeRuns || 0}</td>
                  <td>{split.stat.rbi || 0}</td>
                  <td>{split.stat.stolenBases || 0}</td>
                  <td>{split.stat.baseOnBalls || 0}</td>
                  <td>{split.stat.strikeOuts || 0}</td>
                  <td>{split.stat.avg || '.000'}</td>
                  <td>{split.stat.obp || '.000'}</td>
                  <td>{split.stat.slg || '.000'}</td>
                  <td>{split.stat.ops || '.000'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  const renderPostseasonStats = () => {
    if (!playerDetail?.stats) return null;

    // Look for yearByYear stats (which should now include both R and P gameTypes)
    const yearByYearStats = playerDetail.stats.find(s =>
      s.type.displayName === 'yearByYear'
    );

    if (!yearByYearStats || !yearByYearStats.splits || yearByYearStats.splits.length === 0) {
      return <p className="no-data">No postseason appearances</p>;
    }

    // Filter ONLY for playoff games (gameType === 'P')
    const postseasonSeasons = yearByYearStats.splits.filter(split =>
      split.stat &&
      split.stat.gamesPlayed > 0 &&
      split.gameType === 'P'
    );

    if (postseasonSeasons.length === 0) {
      return <p className="no-data">No postseason appearances</p>;
    }

    const isPitcher = yearByYearStats.group.displayName === 'pitching';

    if (isPitcher) {
      return (
        <div className="year-by-year-table-container">
          <table className="year-by-year-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Team</th>
                <th>W</th>
                <th>L</th>
                <th>ERA</th>
                <th>G</th>
                <th>GS</th>
                <th>SV</th>
                <th>IP</th>
                <th>H</th>
                <th>BB</th>
                <th>SO</th>
              </tr>
            </thead>
            <tbody>
              {postseasonSeasons.reverse().map((split, index) => (
                <tr key={index}>
                  <td className="year-cell">{split.season}</td>
                  <td className="team-cell">{split.team?.name || 'N/A'}</td>
                  <td>{split.stat.wins || 0}</td>
                  <td>{split.stat.losses || 0}</td>
                  <td>{split.stat.era || '0.00'}</td>
                  <td>{split.stat.gamesPlayed || 0}</td>
                  <td>{split.stat.gamesStarted || 0}</td>
                  <td>{split.stat.saves || 0}</td>
                  <td>{split.stat.inningsPitched || '0.0'}</td>
                  <td>{split.stat.hits || 0}</td>
                  <td>{split.stat.baseOnBalls || 0}</td>
                  <td>{split.stat.strikeOuts || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="year-by-year-table-container">
          <table className="year-by-year-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Team</th>
                <th>G</th>
                <th>AB</th>
                <th>R</th>
                <th>H</th>
                <th>2B</th>
                <th>3B</th>
                <th>HR</th>
                <th>RBI</th>
                <th>SB</th>
                <th>AVG</th>
                <th>OBP</th>
                <th>SLG</th>
              </tr>
            </thead>
            <tbody>
              {postseasonSeasons.reverse().map((split, index) => (
                <tr key={index}>
                  <td className="year-cell">{split.season}</td>
                  <td className="team-cell">{split.team?.name || 'N/A'}</td>
                  <td>{split.stat.gamesPlayed || 0}</td>
                  <td>{split.stat.atBats || 0}</td>
                  <td>{split.stat.runs || 0}</td>
                  <td>{split.stat.hits || 0}</td>
                  <td>{split.stat.doubles || 0}</td>
                  <td>{split.stat.triples || 0}</td>
                  <td>{split.stat.homeRuns || 0}</td>
                  <td>{split.stat.rbi || 0}</td>
                  <td>{split.stat.stolenBases || 0}</td>
                  <td>{split.stat.avg || '.000'}</td>
                  <td>{split.stat.obp || '.000'}</td>
                  <td>{split.stat.slg || '.000'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  const renderAwards = () => {
    if (!playerDetail?.awards || playerDetail.awards.length === 0) {
      return <p className="no-data">No awards</p>;
    }

    return (
      <div className="awards-list">
        {playerDetail.awards.map((award, index) => (
          <div key={index} className="award-item">
            <span className="award-name">{award.name}</span>
            <span className="award-season">{award.season}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="player-detail-overlay" onClick={handleBackdropClick}>
      <div className="player-detail-modal">
        <button className="close-button" onClick={onClose}>×</button>

        {loading && (
          <div className="detail-loading">
            <div className="loading-spinner"></div>
            <p>Loading player details...</p>
          </div>
        )}

        {error && (
          <div className="detail-error">
            <p>Error loading player details: {error}</p>
          </div>
        )}

        {!loading && !error && playerDetail && (
          <div className="player-detail-content">
            <div className="player-detail-header">
              <img
                src={mlbApi.getPlayerImageUrl(playerId)}
                alt={playerDetail.fullName}
                className="player-detail-image"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="player-detail-info">
                <h2>{playerDetail.fullName}</h2>
                <p className="player-meta">
                  #{playerDetail.primaryNumber} • {playerDetail.primaryPosition?.name}
                </p>
                <p className="player-meta">
                  {playerDetail.currentTeam?.name}
                </p>
                <p className="player-bio">
                  Born: {playerDetail.birthDate ? new Date(playerDetail.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </p>
                <p className="player-bio">
                  {playerDetail.height} • {playerDetail.weight} lbs
                </p>
                <p className="player-bio">
                  Bats: {playerDetail.batSide?.description} • Throws: {playerDetail.pitchHand?.description}
                </p>
              </div>
            </div>

            <div className="player-detail-sections">
              {highlightUrl && (
                <section className="detail-section">
                  <h3>Highlights</h3>
                  <div className="highlight-link-container">
                    <a
                      href={highlightUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="highlight-link"
                    >
                      Watch {playerDetail.fullName} Highlights on MLB.com
                    </a>
                  </div>
                </section>
              )}

              <section className="detail-section">
                <h3>Career Totals (Regular Season)</h3>
                {renderCareerStats()}
              </section>

              <section className="detail-section">
                <h3>Season-by-Season Stats</h3>
                {renderYearByYearStats()}
              </section>

              <section className="detail-section">
                <h3>Postseason Stats</h3>
                {renderPostseasonStats()}
              </section>

              <section className="detail-section">
                <h3>Awards & Honors</h3>
                {renderAwards()}
              </section>

              <section className="detail-section">
                <h3>Recent Transactions</h3>
                {transactionsLoading ? (
                  <p className="no-data">Loading transactions...</p>
                ) : transactions.length > 0 ? (
                  <div className="transactions-list">
                    {transactions.map((txn, index) => (
                      <div key={index} className="transaction-item">
                        <div className="transaction-date">
                          {new Date(txn.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="transaction-desc">{txn.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No recent transactions</p>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDetail;
