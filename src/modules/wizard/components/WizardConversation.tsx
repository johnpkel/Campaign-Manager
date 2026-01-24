import { useEffect, useRef, useState } from 'react';
import { useWizard } from '../contexts';
import { AIMessageComponent } from '../../ai/components/AIMessage';
import { SavedCampaignChat } from '../types';
import styles from './WizardConversation.module.css';

// Step labels for progress display
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
  audience_page_recommendations: 'Targeting',
  variant_confirmation: 'Variants',
  experimentation: 'Experimentation setup',
  complete: 'Complete',
};

// Progress steps for the progress bar
const PROGRESS_STEPS = [
  'title',
  'key_messages',
  'goals',
  'audiences',
  'channels',
  'brand_kit',
  'review',
  'experimentation',
];

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface WizardConversationProps {
  onExit: () => void;
  onCampaignCreated?: () => void;
}

export function WizardConversation({ onExit, onCampaignCreated }: WizardConversationProps) {
  const {
    messages,
    sendMessage,
    currentStep,
    isCreatingCampaign,
    showChatHistory,
    savedChats,
    startNewCampaign,
    resumeChat,
    backToChatHistory,
    createdCampaign,
    isFinalizingCampaign,
    finalizeCampaign,
    campaignDraft,
  } = useWizard();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(inputValue);
      setInputValue('');
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isSending) return;
    setIsSending(true);
    try {
      await sendMessage(suggestion);
    } finally {
      setIsSending(false);
    }
  };

  // Handle campaign creation confirmation
  const handleConfirmCreate = async () => {
    const result = await finalizeCampaign();
    if (result && onCampaignCreated) {
      // Small delay to show success message before navigating
      setTimeout(() => {
        onCampaignCreated();
      }, 2000);
    }
  };

  // Check if we're at the confirmation step (complete but not yet created)
  const showConfirmation = currentStep === 'complete' && !createdCampaign && !isFinalizingCampaign;

  // Calculate progress percentage
  const currentStepIndex = PROGRESS_STEPS.indexOf(currentStep);
  const progressPercentage = currentStepIndex >= 0
    ? ((currentStepIndex + 1) / PROGRESS_STEPS.length) * 100
    : 10;

  // Render chat history view
  if (showChatHistory) {
    const inProgressChats = savedChats.filter(chat => chat.status === 'in_progress');
    const completedChats = savedChats.filter(chat => chat.status === 'completed');

    return (
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.wizardIcon}>🪄</div>
            <div className={styles.headerText}>
              <h3 className={styles.title}>Campaign Wizard</h3>
              <span className={styles.subtitle}>Create AI-powered campaigns</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.exitButton} onClick={onExit}>
              Exit
            </button>
          </div>
        </div>

        {/* Chat History Content */}
        <div className={styles.chatHistoryContainer}>
          {/* New Campaign CTA */}
          <button className={styles.newCampaignButton} onClick={startNewCampaign}>
            <div className={styles.newCampaignIcon}>✨</div>
            <div className={styles.newCampaignText}>
              <span className={styles.newCampaignTitle}>New Campaign</span>
              <span className={styles.newCampaignSubtitle}>Start a new AI-assisted campaign</span>
            </div>
            <span className={styles.newCampaignArrow}>→</span>
          </button>

          {/* In Progress Chats */}
          {inProgressChats.length > 0 && (
            <div className={styles.chatSection}>
              <h4 className={styles.chatSectionTitle}>Continue Where You Left Off</h4>
              <div className={styles.chatList}>
                {inProgressChats.map((chat) => (
                  <ChatListItem key={chat.id} chat={chat} onResume={resumeChat} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Chats */}
          {completedChats.length > 0 && (
            <div className={styles.chatSection}>
              <h4 className={styles.chatSectionTitle}>Recent Campaigns</h4>
              <div className={styles.chatList}>
                {completedChats.map((chat) => (
                  <ChatListItem key={chat.id} chat={chat} onResume={resumeChat} />
                ))}
              </div>
            </div>
          )}

          {savedChats.length === 0 && (
            <div className={styles.noChatHistory}>
              <span className={styles.noChatIcon}>📋</span>
              <p>No previous campaigns yet</p>
              <span className={styles.noChatSubtext}>Start your first AI-assisted campaign above</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render conversation view
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={backToChatHistory}>
            ←
          </button>
          <div className={styles.wizardIcon}>🪄</div>
          <div className={styles.headerText}>
            <h3 className={styles.title}>Campaign Wizard</h3>
            <span className={styles.subtitle}>
              {isCreatingCampaign
                ? STEP_LABELS[currentStep] || 'In progress'
                : 'Starting wizard...'}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.exitButton} onClick={onExit}>
            Exit
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isCreatingCampaign && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className={styles.progressSteps}>
            {PROGRESS_STEPS.map((step, index) => {
              const stepIndex = PROGRESS_STEPS.indexOf(currentStep);
              const isCompleted = index < stepIndex;
              const isCurrent = step === currentStep;
              return (
                <div
                  key={step}
                  className={`${styles.progressStep} ${isCompleted ? styles.progressStepCompleted : ''} ${isCurrent ? styles.progressStepCurrent : ''}`}
                >
                  <div className={styles.progressDot} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✨</div>
            <p>Starting the Campaign Wizard...</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <AIMessageComponent
              key={index}
              message={message}
              onSelectSuggestion={handleSuggestionClick}
            />
          ))
        )}
        {isSending && (
          <div className={styles.typingIndicator}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {/* Confirmation Card - shown when ready to create */}
        {showConfirmation && (
          <div className={styles.confirmationCard}>
            <div className={styles.confirmationIcon}>✨</div>
            <div className={styles.confirmationContent}>
              <h4 className={styles.confirmationTitle}>Ready to Create Your Campaign</h4>
              <p className={styles.confirmationMessage}>
                <strong>{campaignDraft.title || 'Your campaign'}</strong> is ready to be created.
                This will add it to your active campaigns in Contentstack.
              </p>
              <div className={styles.confirmationSummary}>
                {campaignDraft.channels && campaignDraft.channels.length > 0 && (
                  <span className={styles.summaryItem}>
                    📢 {campaignDraft.channels.join(', ')}
                  </span>
                )}
                {campaignDraft.budget && (
                  <span className={styles.summaryItem}>
                    💰 {campaignDraft.budget}
                  </span>
                )}
              </div>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmCreate}
              >
                Create Campaign
              </button>
            </div>
          </div>
        )}

        {/* Creating Campaign Indicator */}
        {isFinalizingCampaign && !createdCampaign && (
          <div className={styles.creatingBanner}>
            <div className={styles.creatingSpinner} />
            <span>Creating your campaign in Contentstack...</span>
          </div>
        )}

        {/* Campaign Created Success Message */}
        {createdCampaign && (
          <div className={styles.successBanner}>
            <div className={styles.successIcon}>🎉</div>
            <div className={styles.successContent}>
              <h4 className={styles.successTitle}>Campaign Created!</h4>
              <p className={styles.successMessage}>
                <strong>{createdCampaign.title}</strong> has been added to your active campaigns.
              </p>
              <p className={styles.successRedirect}>Redirecting to campaigns list...</p>
              <a
                href={createdCampaign.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.successLink}
              >
                View in Contentstack →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Type your response..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isSending}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!inputValue.trim() || isSending}
        >
          Send
        </button>
      </form>
    </div>
  );
}

// Chat list item component
function ChatListItem({
  chat,
  onResume,
}: {
  chat: SavedCampaignChat;
  onResume: (chatId: string) => void;
}) {
  const getStatusIcon = (status: SavedCampaignChat['status']) => {
    switch (status) {
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      case 'abandoned': return '⏸️';
      default: return '📋';
    }
  };

  const getStepLabel = (step: string) => {
    const labels: Record<string, string> = {
      title: 'Naming',
      key_messages: 'Messages',
      goals: 'Goals',
      audiences: 'Audiences',
      channels: 'Channels',
      brand_kit: 'Branding',
      review: 'Review',
      complete: 'Completed',
    };
    return labels[step] || step;
  };

  return (
    <button className={styles.chatItem} onClick={() => onResume(chat.id)}>
      <div className={styles.chatItemIcon}>{getStatusIcon(chat.status)}</div>
      <div className={styles.chatItemContent}>
        <div className={styles.chatItemHeader}>
          <span className={styles.chatItemTitle}>{chat.title}</span>
          <span className={styles.chatItemTime}>{formatRelativeTime(chat.updatedAt)}</span>
        </div>
        <span className={styles.chatItemMessage}>{chat.lastMessage}</span>
        <div className={styles.chatItemMeta}>
          {chat.status === 'in_progress' && (
            <span className={styles.chatItemStep}>Step: {getStepLabel(chat.currentStep)}</span>
          )}
          {chat.draftSummary?.channels && (
            <span className={styles.chatItemChannels}>
              {chat.draftSummary.channels.slice(0, 2).join(', ')}
              {chat.draftSummary.channels.length > 2 && ` +${chat.draftSummary.channels.length - 2}`}
            </span>
          )}
        </div>
      </div>
      <span className={styles.chatItemArrow}>→</span>
    </button>
  );
}
