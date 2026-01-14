import { useEffect, useRef } from 'react';
import { useAI } from '../contexts/AIContext';
import { AIMessageComponent } from './AIMessage';
import { AIInputBar } from './AIInputBar';
import styles from './AIChatPanel.module.css';

const STEP_LABELS: Record<string, string> = {
  recommendations: 'Choosing recommendation',
  title: 'Campaign title',
  key_messages: 'Key messages',
  goals: 'Campaign goals',
  audiences: 'Target audiences',
  dates: 'Campaign dates',
  contributors: 'Team members',
  budget: 'Budget',
  channels: 'Channels',
  market_research: 'Market research',
  brand_kit: 'Brand kit',
  review: 'Review & confirm',
  complete: 'Complete',
};

export function AIChatPanel() {
  const {
    messages,
    status,
    error,
    isOpen,
    closeChat,
    clearMessages,
    isConfigured,
    sendMessage,
    startCampaignCreation,
    selectRecommendation,
    cancelCampaignCreation,
    campaignCreation,
  } = useAI();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleCreateCampaignClick = async () => {
    await startCampaignCreation();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.drawer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.aiIcon}>✨</div>
          <div className={styles.headerText}>
            <h3 className={styles.title}>AI Assistant</h3>
            <span className={styles.subtitle}>
              {campaignCreation.isActive
                ? `Creating campaign: ${STEP_LABELS[campaignCreation.currentStep] || 'In progress'}`
                : isConfigured
                ? 'Powered by Claude'
                : 'Demo Mode'}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          {campaignCreation.isActive && campaignCreation.currentStep !== 'complete' && (
            <button className={styles.cancelButton} onClick={cancelCampaignCreation}>
              Cancel
            </button>
          )}
          {messages.length > 0 && !campaignCreation.isActive && (
            <button className={styles.clearButton} onClick={clearMessages}>
              Clear
            </button>
          )}
          <button className={styles.closeButton} onClick={closeChat}>
            ×
          </button>
        </div>
      </div>

      {campaignCreation.isActive && (
        <div className={styles.progressBar}>
          <div className={styles.progressSteps}>
            {['title', 'key_messages', 'goals', 'audiences', 'dates', 'contributors', 'budget', 'channels', 'brand_kit', 'review'].map(
              (step) => {
                const stepIndex = [
                  'recommendations',
                  'title',
                  'key_messages',
                  'goals',
                  'audiences',
                  'dates',
                  'contributors',
                  'budget',
                  'channels',
                  'market_research',
                  'brand_kit',
                  'review',
                ].indexOf(campaignCreation.currentStep);
                const thisStepIndex = [
                  'recommendations',
                  'title',
                  'key_messages',
                  'goals',
                  'audiences',
                  'dates',
                  'contributors',
                  'budget',
                  'channels',
                  'market_research',
                  'brand_kit',
                  'review',
                ].indexOf(step);
                const isComplete = thisStepIndex < stepIndex;
                const isCurrent = step === campaignCreation.currentStep;

                return (
                  <div
                    key={step}
                    className={`${styles.progressStep} ${isComplete ? styles.progressStepComplete : ''} ${
                      isCurrent ? styles.progressStepCurrent : ''
                    }`}
                  />
                );
              }
            )}
          </div>
        </div>
      )}

      <div className={styles.messages} ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✨</div>
            <h4 className={styles.emptyTitle}>How can I help?</h4>
            <p className={styles.emptyText}>
              Ask me about your campaigns, analytics, or get recommendations for improving performance.
            </p>
            <div className={styles.suggestions}>
              <button className={styles.primarySuggestion} onClick={handleCreateCampaignClick}>
                + Create New Campaign
              </button>
              <button
                className={styles.suggestion}
                onClick={() => handleSuggestionClick('Analyze my active campaigns and suggest improvements')}
              >
                Analyze my campaigns
              </button>
              <button
                className={styles.suggestion}
                onClick={() => handleSuggestionClick('Show me traffic insights and key metrics')}
              >
                Show traffic insights
              </button>
              <button
                className={styles.suggestion}
                onClick={() => handleSuggestionClick('What improvements would you suggest for my marketing strategy?')}
              >
                Suggest improvements
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <AIMessageComponent
                key={message.id}
                message={message}
                onSelectRecommendation={selectRecommendation}
              />
            ))}
            {status === 'thinking' && (
              <div className={styles.thinking}>
                <div className={styles.thinkingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {error && (
              <div className={styles.error}>
                <span>{error}</span>
              </div>
            )}
          </>
        )}
      </div>

      <AIInputBar />

      {!isConfigured && (
        <div className={styles.demoNotice}>
          Demo mode. Add VITE_ANTHROPIC_API_KEY for Claude.
        </div>
      )}
    </div>
  );
}
