import { useWizard } from '../contexts';
import { AudienceReachCard } from './insights/AudienceReachCard';
import { RecommendedAssetsCard } from './insights/RecommendedAssetsCard';
import { RecommendedContentCard } from './insights/RecommendedContentCard';
import { ExperimentSuggestionsCard } from './insights/ExperimentSuggestionsCard';
import styles from './WizardInsightsPanel.module.css';

export function WizardInsightsPanel() {
  const { insights } = useWizard();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Suggestions</h2>
      </div>

      {/* Suggestions List */}
      <div className={styles.suggestionsList}>
        {/* Audience Reach */}
        <AudienceReachCard
          totalUsers={insights.audienceReach.totalUsers}
          percentOfTotal={insights.audienceReach.percentOfTotalAudience}
          audiences={insights.audienceReach.suggestedAudiences}
          isLoading={insights.audienceReach.isLoading}
        />

        {/* Recommended Assets */}
        <RecommendedAssetsCard
          assets={insights.recommendedAssets}
          isLoading={insights.isCalculating}
        />

        {/* Recommended Content */}
        <RecommendedContentCard
          content={insights.recommendedContent}
          isLoading={insights.isCalculating}
        />

        {/* Experiment Suggestions */}
        <ExperimentSuggestionsCard
          suggestions={insights.experimentSuggestions}
          isLoading={insights.isCalculating}
        />
      </div>
    </div>
  );
}
