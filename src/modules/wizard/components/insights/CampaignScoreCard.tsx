import { PerformancePrediction, SuggestedUpdate, BrandAlignmentIssue } from '../../types';
import styles from './CampaignScoreCard.module.css';

interface BrandAlignmentData {
  selectedBrandKit: string | null;
  alignmentScore: number;
  issues: BrandAlignmentIssue[];
}

interface CampaignScoreCardProps {
  score: number;
  prediction: PerformancePrediction;
  suggestedUpdates: SuggestedUpdate[];
  strengthAreas: string[];
  brandAlignment: BrandAlignmentData;
  isLoading: boolean;
}

export function CampaignScoreCard({
  score,
  prediction,
  suggestedUpdates,
  strengthAreas,
  brandAlignment,
  isLoading,
}: CampaignScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#6366f1';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <div className={`${styles.card} ${isLoading ? styles.cardLoading : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon}>🎯</span>
          <h4 className={styles.title}>Campaign Score</h4>
        </div>
        <span
          className={styles.scoreLabel}
          style={{ color: getScoreColor(score) }}
        >
          {getScoreLabel(score)}
        </span>
      </div>

      {/* Score Section - Top Row */}
      <div className={styles.scoreSection}>
        {/* Campaign Score Circle */}
        <div
          className={styles.scoreCircle}
          style={{ '--score': score, '--color': getScoreColor(score) } as React.CSSProperties}
        >
          <div className={styles.scoreCircleInner}>
            <span className={styles.scoreValue}>{score}</span>
            <span className={styles.scoreMax}>/100</span>
          </div>
        </div>

        {/* Performance Prediction */}
        <div className={styles.predictions}>
          <div className={styles.predictionItem}>
            <span className={styles.predictionLabel}>Expected Reach</span>
            <span className={styles.predictionValue}>{prediction.expectedReach}</span>
          </div>
          <div className={styles.predictionItem}>
            <span className={styles.predictionLabel}>Engagement</span>
            <span className={styles.predictionValue}>{prediction.expectedEngagement}</span>
          </div>
          <div className={styles.predictionItem}>
            <span className={styles.predictionLabel}>Conversions</span>
            <span className={styles.predictionValue}>{prediction.expectedConversions}</span>
          </div>
          <div className={styles.confidenceBadge} style={{ color: getConfidenceColor(prediction.confidenceLevel) }}>
            {prediction.confidenceLevel.charAt(0).toUpperCase() + prediction.confidenceLevel.slice(1)} confidence
          </div>
        </div>

        {/* Brand Alignment - Inline */}
        <div className={styles.brandAlignmentInline}>
          <div className={styles.brandAlignmentLabel}>
            <span className={styles.brandIcon}>🎨</span>
            <span>Brand</span>
          </div>
          <div
            className={styles.brandScoreCircle}
            style={{ '--brand-score': brandAlignment.alignmentScore, '--brand-color': getScoreColor(brandAlignment.alignmentScore) } as React.CSSProperties}
          >
            <span
              className={styles.brandScoreValueSmall}
              style={{ color: getScoreColor(brandAlignment.alignmentScore) }}
            >
              {brandAlignment.selectedBrandKit ? brandAlignment.alignmentScore : '—'}
            </span>
          </div>
          {brandAlignment.selectedBrandKit && (
            <span className={styles.brandKitName}>{brandAlignment.selectedBrandKit}</span>
          )}
        </div>
      </div>

      {/* Strength Areas */}
      {strengthAreas.length > 0 && (
        <div className={styles.areasSection}>
          <div className={styles.areaGroup}>
            <span className={styles.areaLabel}>
              <span className={styles.areaIcon}>✓</span> Strengths
            </span>
            <div className={styles.areaTags}>
              {strengthAreas.map((area, i) => (
                <span key={i} className={styles.strengthTag}>{area}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suggested Updates */}
      {suggestedUpdates.length > 0 && (
        <div className={styles.suggestionsSection}>
          <span className={styles.suggestionsTitle}>Suggested Improvements</span>
          <div className={styles.suggestionsList}>
            {suggestedUpdates.slice(0, 2).map((update) => (
              <div key={update.id} className={styles.suggestionItem}>
                <span className={`${styles.impactBadge} ${styles[`impact${update.impact.charAt(0).toUpperCase() + update.impact.slice(1)}`]}`}>
                  {update.impact}
                </span>
                <div className={styles.suggestionContent}>
                  <span className={styles.suggestionField}>{update.field}</span>
                  <span className={styles.suggestionReason}>{update.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
