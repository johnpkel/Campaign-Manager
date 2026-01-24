import { WizardConversation } from './WizardConversation';
import { CampaignBriefPanel } from './CampaignBriefPanel';
import { WizardInsightsPanel } from './WizardInsightsPanel';
import { useWizard } from '../contexts';
import styles from './CampaignWizard.module.css';

interface CampaignWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function CampaignWizard({ onComplete, onCancel }: CampaignWizardProps) {
  const { isInsightsPanelCollapsed, exitWizard } = useWizard();

  const handleExit = () => {
    exitWizard();
    onCancel?.();
  };

  // Called after campaign is created and user should be redirected
  const handleCampaignCreated = () => {
    onComplete?.();
  };

  return (
    <div className={styles.wizardContainer}>
      {/* Left Panel - AI Conversation (25%) */}
      <div className={styles.conversationPanel}>
        <WizardConversation onExit={handleExit} onCampaignCreated={handleCampaignCreated} />
      </div>

      {/* Center Panel - Campaign Brief with Scorecard (50%) */}
      <div className={styles.briefPanel}>
        <CampaignBriefPanel />
      </div>

      {/* Right Panel - Suggestion Cards (25%) */}
      <div
        className={`${styles.suggestionsPanel} ${isInsightsPanelCollapsed ? styles.suggestionsPanelCollapsed : ''}`}
      >
        <WizardInsightsPanel />
      </div>
    </div>
  );
}
