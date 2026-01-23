import { SuggestedAudience } from '../../types';
import { useWizard } from '../../contexts';
import styles from './AudienceReachCard.module.css';

interface AudienceReachCardProps {
  totalUsers: number;
  percentOfTotal: number;
  audiences: SuggestedAudience[];
  isLoading: boolean;
}

export function AudienceReachCard({
  totalUsers,
  percentOfTotal,
  audiences,
  isLoading,
}: AudienceReachCardProps) {
  const { selectAudience, deselectAudience } = useWizard();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const handleToggle = (audience: SuggestedAudience) => {
    if (audience.selected) {
      deselectAudience(audience.id);
    } else {
      selectAudience(audience.id);
    }
  };

  return (
    <div className={`${styles.card} ${isLoading ? styles.cardLoading : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon}>👥</span>
          <h4 className={styles.title}>Audience Reach</h4>
        </div>
      </div>

      {/* Reach Summary */}
      <div className={styles.reachSummary}>
        <div className={styles.reachStat}>
          <span className={styles.reachValue}>{formatNumber(totalUsers)}</span>
          <span className={styles.reachLabel}>Potential Users</span>
        </div>
        <div className={styles.reachStat}>
          <span className={styles.reachValue}>{percentOfTotal.toFixed(1)}%</span>
          <span className={styles.reachLabel}>of Total Audience</span>
        </div>
      </div>

      {/* Audience List */}
      <div className={styles.audienceList}>
        <span className={styles.listLabel}>Suggested Audiences</span>
        {audiences.slice(0, 4).map((audience) => (
          <div
            key={audience.id}
            className={`${styles.audienceItem} ${audience.selected ? styles.audienceSelected : ''}`}
            onClick={() => handleToggle(audience)}
          >
            <div className={styles.audienceInfo}>
              <span className={styles.audienceName}>{audience.name}</span>
              <span className={styles.audienceCount}>{formatNumber(audience.memberCount)} users</span>
            </div>
            <div className={styles.audienceRight}>
              <div className={styles.matchScore}>
                <div
                  className={styles.matchBar}
                  style={{ width: `${audience.matchScore}%` }}
                />
              </div>
              <span className={styles.matchLabel}>{audience.matchScore}% match</span>
            </div>
            <div className={`${styles.checkbox} ${audience.selected ? styles.checkboxChecked : ''}`}>
              {audience.selected && '✓'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
