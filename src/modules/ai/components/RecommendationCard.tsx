import { CampaignRecommendation } from '../types/ai';
import styles from './RecommendationCard.module.css';

interface RecommendationCardProps {
  recommendation: CampaignRecommendation;
  index: number;
  onSelect: (recommendation: CampaignRecommendation) => void;
}

const TYPE_LABELS: Record<CampaignRecommendation['type'], { label: string; icon: string }> = {
  'performance-based': { label: 'Based on Performance', icon: '📊' },
  'audience-insight': { label: 'Audience Insight', icon: '👥' },
  'trend-based': { label: 'Industry Trend', icon: '📈' },
};

const CONFIDENCE_STYLES: Record<CampaignRecommendation['confidence'], string> = {
  high: styles.confidenceHigh,
  medium: styles.confidenceMedium,
  low: styles.confidenceLow,
};

export function RecommendationCard({ recommendation, index, onSelect }: RecommendationCardProps) {
  const typeInfo = TYPE_LABELS[recommendation.type];

  return (
    <button
      className={styles.card}
      onClick={() => onSelect(recommendation)}
    >
      <div className={styles.header}>
        <span className={styles.number}>{index + 1}</span>
        <span className={styles.type}>
          <span className={styles.typeIcon}>{typeInfo.icon}</span>
          {typeInfo.label}
        </span>
        <span className={`${styles.confidence} ${CONFIDENCE_STYLES[recommendation.confidence]}`}>
          {recommendation.confidence} confidence
        </span>
      </div>

      <h4 className={styles.title}>{recommendation.title}</h4>
      <p className={styles.description}>{recommendation.description}</p>

      <div className={styles.details}>
        {recommendation.suggestedChannels && recommendation.suggestedChannels.length > 0 && (
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Channels:</span>
            <span className={styles.detailValue}>
              {recommendation.suggestedChannels.join(', ')}
            </span>
          </div>
        )}
        {recommendation.estimatedBudget && (
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Est. Budget:</span>
            <span className={styles.detailValue}>{recommendation.estimatedBudget}</span>
          </div>
        )}
        {recommendation.sourceData?.newsSource && (
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Source:</span>
            <span className={styles.detailValue}>{recommendation.sourceData.newsSource}</span>
          </div>
        )}
      </div>

      <div className={styles.selectHint}>Click to select this recommendation</div>
    </button>
  );
}

interface RecommendationListProps {
  recommendations: CampaignRecommendation[];
  onSelect: (recommendation: CampaignRecommendation) => void;
}

export function RecommendationList({ recommendations, onSelect }: RecommendationListProps) {
  // Group recommendations by type
  const performanceBased = recommendations.filter(r => r.type === 'performance-based');
  const audienceBased = recommendations.filter(r => r.type === 'audience-insight');
  const trendBased = recommendations.filter(r => r.type === 'trend-based');

  let globalIndex = 0;

  return (
    <div className={styles.list}>
      {performanceBased.length > 0 && (
        <div className={styles.section}>
          <h5 className={styles.sectionTitle}>Based on Your Campaign Performance</h5>
          {performanceBased.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              index={globalIndex++}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {audienceBased.length > 0 && (
        <div className={styles.section}>
          <h5 className={styles.sectionTitle}>From Audience Insight Explorer</h5>
          {audienceBased.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              index={globalIndex++}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {trendBased.length > 0 && (
        <div className={styles.section}>
          <h5 className={styles.sectionTitle}>Based on Industry Trends</h5>
          {trendBased.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              index={globalIndex++}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      <div className={styles.customOption}>
        <p>Or describe your own campaign idea and I'll help you create it.</p>
      </div>
    </div>
  );
}
