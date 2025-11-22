import { useState, useEffect } from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player, onClick, showTeamName = false }) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(player.imageUrl);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const isPitcher = (player.positionType === 'Pitcher' ||
                    player.position === 'SP' ||
                    player.position === 'RP' ||
                    player.position.includes('SP/RP')) &&
                    !player.isTwoWay;

  // Reset image state when player data changes
  useEffect(() => {
    setImageSrc(player.imageUrl);
    setImageError(false);
    setFallbackAttempted(false);
  }, [player.imageUrl, player.id]);

  const handleImageError = () => {
    // Try current year image as fallback if year-specific image fails
    if (!fallbackAttempted) {
      setFallbackAttempted(true);
      const currentImageUrl = `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${player.id}/headshot/67/current`;
      setImageSrc(currentImageUrl);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="player-card" onClick={onClick}>
      <div className="player-image-container">
        {!imageError ? (
          <img
            src={imageSrc}
            alt={player.name}
            className="player-image"
            onError={handleImageError}
          />
        ) : (
          <div className="player-image-placeholder">
            <span className="placeholder-text">{player.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
        )}
      </div>

      <div className="player-header">
        <div className="player-number">#{player.number}</div>
        <div className="player-info">
          <h3 className="player-name">{player.name}</h3>
          <div className="player-position">{player.position}</div>
          {showTeamName && player.teamName && (
            <div className="player-team">{player.teamName}</div>
          )}
        </div>
      </div>

      <div className="player-details">
        <div className="detail-row">
          <span className="detail-label">Bats/Throws:</span>
          <span className="detail-value">{player.bats}/{player.throws}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Height/Weight:</span>
          <span className="detail-value">{player.height}, {player.weight} lbs</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Birth Date:</span>
          <span className="detail-value">{player.birthDate} (Age {player.age})</span>
        </div>
      </div>

      <div className="player-stats">
        <h4>{player.year} Stats</h4>
        {player.isTwoWay ? (
          <>
            <h5 style={{ fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '0.5rem', color: 'var(--team-accent)' }}>Hitting</h5>
            <div className="stats-grid">
              <div className="stat">
                <div className="stat-label">AVG</div>
                <div className="stat-value">{player.stats.hitting.avg}</div>
              </div>
              <div className="stat">
                <div className="stat-label">HR</div>
                <div className="stat-value">{player.stats.hitting.homeRuns}</div>
              </div>
              <div className="stat">
                <div className="stat-label">RBI</div>
                <div className="stat-value">{player.stats.hitting.rbi}</div>
              </div>
              <div className="stat">
                <div className="stat-label">OPS</div>
                <div className="stat-value">{player.stats.hitting.ops}</div>
              </div>
            </div>
            <h5 style={{ fontSize: '0.85rem', marginTop: '0.75rem', marginBottom: '0.5rem', color: 'var(--team-accent)' }}>Pitching</h5>
            <div className="stats-grid">
              <div className="stat">
                <div className="stat-label">ERA</div>
                <div className="stat-value">{player.stats.pitching.era}</div>
              </div>
              <div className="stat">
                <div className="stat-label">W-L</div>
                <div className="stat-value">{player.stats.pitching.wins}-{player.stats.pitching.losses}</div>
              </div>
              <div className="stat">
                <div className="stat-label">K</div>
                <div className="stat-value">{player.stats.pitching.strikeouts}</div>
              </div>
              <div className="stat">
                <div className="stat-label">IP</div>
                <div className="stat-value">{player.stats.pitching.innings}</div>
              </div>
            </div>
          </>
        ) : isPitcher ? (
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-label">ERA</div>
              <div className="stat-value">{player.stats.era}</div>
            </div>
            <div className="stat">
              <div className="stat-label">W-L</div>
              <div className="stat-value">{player.stats.wins}-{player.stats.losses}</div>
            </div>
            <div className="stat">
              <div className="stat-label">K</div>
              <div className="stat-value">{player.stats.strikeouts}</div>
            </div>
            <div className="stat">
              <div className="stat-label">IP</div>
              <div className="stat-value">{player.stats.innings}</div>
            </div>
            {player.stats.saves !== undefined && (
              <div className="stat">
                <div className="stat-label">SV</div>
                <div className="stat-value">{player.stats.saves}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-label">AVG</div>
              <div className="stat-value">{player.stats.avg}</div>
            </div>
            <div className="stat">
              <div className="stat-label">HR</div>
              <div className="stat-value">{player.stats.homeRuns}</div>
            </div>
            <div className="stat">
              <div className="stat-label">RBI</div>
              <div className="stat-value">{player.stats.rbi}</div>
            </div>
            <div className="stat">
              <div className="stat-label">OPS</div>
              <div className="stat-value">{player.stats.ops}</div>
            </div>
            <div className="stat">
              <div className="stat-label">G</div>
              <div className="stat-value">{player.stats.games}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
