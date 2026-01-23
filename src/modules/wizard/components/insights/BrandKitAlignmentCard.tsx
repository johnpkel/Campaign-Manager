import { BrandAlignmentIssue } from '../../types';
import styles from './BrandKitAlignmentCard.module.css';

interface BrandKitAlignmentCardProps {
  selectedBrandKit: string | null;
  alignmentScore: number;
  issues: BrandAlignmentIssue[];
  suggestions: string[];
  isLoading: boolean;
}

export function BrandKitAlignmentCard({
  selectedBrandKit,
  alignmentScore,
  issues,
  suggestions,
  isLoading,
}: BrandKitAlignmentCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#6366f1';
    if (score >= 40) return '#f59e0b';
    return '#94a3b8';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '⚠️';
      case 'warning': return '⚡';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  };

  return (
    <div className={`${styles.card} ${isLoading ? styles.cardLoading : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon}>🎨</span>
          <h4 className={styles.title}>Brand Alignment</h4>
        </div>
        {selectedBrandKit && (
          <span className={styles.brandBadge}>{selectedBrandKit}</span>
        )}
      </div>

      {/* Score Display */}
      <div className={styles.scoreSection}>
        <div className={styles.scoreDisplay}>
          <span
            className={styles.scoreValue}
            style={{ color: getScoreColor(alignmentScore) }}
          >
            {alignmentScore}
          </span>
          <span className={styles.scoreMax}>/100</span>
        </div>
        <div className={styles.scoreBar}>
          <div
            className={styles.scoreBarFill}
            style={{
              width: `${alignmentScore}%`,
              background: getScoreColor(alignmentScore),
            }}
          />
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className={styles.issuesSection}>
          <span className={styles.sectionLabel}>Issues & Suggestions</span>
          <div className={styles.issuesList}>
            {issues.slice(0, 3).map((issue, index) => (
              <div
                key={index}
                className={`${styles.issueItem} ${styles[`issue${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}`]}`}
              >
                <span className={styles.issueIcon}>{getSeverityIcon(issue.severity)}</span>
                <span className={styles.issueMessage}>{issue.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && issues.length < 2 && (
        <div className={styles.suggestionsSection}>
          <span className={styles.sectionLabel}>Quick Tips</span>
          <ul className={styles.suggestionsList}>
            {suggestions.slice(0, 2).map((suggestion, index) => (
              <li key={index} className={styles.suggestionItem}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!selectedBrandKit && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🎨</span>
          <span className={styles.emptyText}>Select a Brand Kit to see alignment score</span>
        </div>
      )}
    </div>
  );
}
