import { ExperimentSuggestion } from '../../types';
import { useWizard } from '../../contexts';
import styles from './ExperimentSuggestionsCard.module.css';

interface ExperimentSuggestionsCardProps {
  suggestions: ExperimentSuggestion[];
  isLoading: boolean;
}

export function ExperimentSuggestionsCard({ suggestions, isLoading }: ExperimentSuggestionsCardProps) {
  const { selectExperiment } = useWizard();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multi_armed_bandit': return '🎰';
      case 'ab_test': return '🔬';
      case 'personalization': return '✨';
      default: return '🧪';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multi_armed_bandit': return 'Multi-Armed Bandit';
      case 'ab_test': return 'A/B Test';
      case 'personalization': return 'Personalization';
      default: return type;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <div className={`${styles.card} ${isLoading ? styles.cardLoading : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon}>🧪</span>
          <h4 className={styles.title}>Experiment Suggestions</h4>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <div className={styles.suggestionsList}>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`${styles.suggestionItem} ${suggestion.selected ? styles.suggestionSelected : ''}`}
              onClick={() => selectExperiment(suggestion.id)}
            >
              <div className={styles.suggestionHeader}>
                <span className={styles.typeIcon}>{getTypeIcon(suggestion.type)}</span>
                <div className={styles.suggestionInfo}>
                  <span className={styles.suggestionTitle}>{suggestion.title}</span>
                  <span className={styles.typeLabel}>{getTypeLabel(suggestion.type)}</span>
                </div>
                <div className={styles.suggestionRight}>
                  <span className={styles.liftBadge}>{suggestion.estimatedLift}</span>
                  {suggestion.selected && (
                    <div className={styles.selectedIndicator}>✓</div>
                  )}
                </div>
              </div>
              <p className={styles.suggestionDescription}>{suggestion.description}</p>
              <div className={styles.suggestionFooter}>
                <span
                  className={styles.confidenceBadge}
                  style={{ color: getConfidenceColor(suggestion.confidence) }}
                >
                  <span className={styles.confidenceDot} style={{ background: getConfidenceColor(suggestion.confidence) }} />
                  {suggestion.confidence.charAt(0).toUpperCase() + suggestion.confidence.slice(1)} confidence
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🧪</span>
          <span className={styles.emptyText}>Complete more campaign details to see experiment recommendations</span>
        </div>
      )}
    </div>
  );
}
