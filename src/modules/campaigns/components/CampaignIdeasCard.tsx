import { useState } from 'react';
import { Icon } from '@contentstack/venus-components';
import {
  CampaignIdea,
  MOCK_CAMPAIGN_IDEAS,
  URGENCY_LABELS,
  URGENCY_COLORS,
} from '../types/campaignIdea';
import styles from './CampaignIdeasCard.module.css';

interface CampaignIdeasCardProps {
  onCreateCampaign?: (idea: CampaignIdea) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CampaignIdeasCard({ onCreateCampaign }: CampaignIdeasCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ideas] = useState<CampaignIdea[]>(MOCK_CAMPAIGN_IDEAS);

  // Sort by urgency (critical first) then by date
  const sortedIdeas = [...ideas].sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleToggleExpand = (e: React.MouseEvent, ideaId: string) => {
    e.stopPropagation();
    setExpandedId(expandedId === ideaId ? null : ideaId);
  };

  const handleCreateCampaign = (e: React.MouseEvent, idea: CampaignIdea) => {
    e.stopPropagation();
    if (onCreateCampaign) {
      onCreateCampaign(idea);
    }
  };

  // Count by urgency
  const urgencyCounts = ideas.reduce(
    (acc, idea) => {
      acc[idea.urgency]++;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  return (
    <div className={styles.container}>
      {/* Source Note */}
      <div className={styles.sourceNote}>
        <Icon icon="Info" className={styles.sourceNoteIcon} />
        <span>Ingested from <strong>#mkt-insights</strong> Slack channel or created manually</span>
      </div>

      {/* Summary Header */}
      <div className={styles.summaryHeader}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{ideas.length}</span>
          <span className={styles.summaryLabel}>Ideas in Backlog</span>
        </div>
        <div className={styles.urgencySummary}>
          {urgencyCounts.critical > 0 && (
            <div className={styles.urgencyCount} style={{ color: URGENCY_COLORS.critical }}>
              <span className={styles.urgencyDot} style={{ backgroundColor: URGENCY_COLORS.critical }} />
              <span>{urgencyCounts.critical} Critical</span>
            </div>
          )}
          {urgencyCounts.high > 0 && (
            <div className={styles.urgencyCount} style={{ color: URGENCY_COLORS.high }}>
              <span className={styles.urgencyDot} style={{ backgroundColor: URGENCY_COLORS.high }} />
              <span>{urgencyCounts.high} High</span>
            </div>
          )}
        </div>
      </div>

      {/* Ideas List */}
      <div className={styles.ideasList} onClick={(e) => e.stopPropagation()}>
        {sortedIdeas.map((idea) => {
          const isExpanded = expandedId === idea.uid;

          return (
            <div
              key={idea.uid}
              className={`${styles.ideaCard} ${isExpanded ? styles.ideaCardExpanded : ''}`}
            >
              <div
                className={styles.ideaHeader}
                onClick={(e) => handleToggleExpand(e, idea.uid)}
              >
                <div className={styles.ideaMain}>
                  <div className={styles.ideaTitleRow}>
                    <span
                      className={styles.urgencyBadge}
                      style={{
                        backgroundColor: `${URGENCY_COLORS[idea.urgency]}15`,
                        color: URGENCY_COLORS[idea.urgency],
                      }}
                    >
                      {URGENCY_LABELS[idea.urgency]}
                    </span>
                    <span className={styles.sourceTag}>
                      {idea.source === 'slack' ? (
                        <>
                          <span className={styles.slackIcon}>#</span>
                          Slack
                        </>
                      ) : (
                        <>
                          <Icon icon="Edit" className={styles.manualIcon} />
                          Manual
                        </>
                      )}
                    </span>
                  </div>
                  <h4 className={styles.ideaQuestion}>{idea.key_question}</h4>
                  <div className={styles.ideaMeta}>
                    <span className={styles.requester}>
                      <Icon icon="User" className={styles.metaIcon} />
                      {idea.requester}
                    </span>
                    <span className={styles.timestamp}>
                      {formatTimeAgo(idea.created_at)}
                    </span>
                  </div>
                </div>
                <button className={styles.expandButton}>
                  <Icon icon={isExpanded ? 'ChevronUp' : 'ChevronDown'} />
                </button>
              </div>

              {isExpanded && (
                <div className={styles.ideaDetails}>
                  <div className={styles.detailSection}>
                    <h5 className={styles.detailLabel}>Description</h5>
                    <p className={styles.detailText}>{idea.description}</p>
                  </div>

                  <div className={styles.detailSection}>
                    <h5 className={styles.detailLabel}>
                      <Icon icon="TrendingUp" className={styles.detailIcon} />
                      Potential Opportunity
                    </h5>
                    <p className={styles.detailText}>{idea.potential_opportunity}</p>
                  </div>

                  <div className={styles.detailSection}>
                    <h5 className={styles.detailLabel}>
                      <Icon icon="Lightbulb" className={styles.detailIcon} />
                      Insights
                    </h5>
                    <p className={styles.detailText}>{idea.insights}</p>
                  </div>

                  <div className={styles.ideaActions}>
                    <button
                      className={styles.createCampaignButton}
                      onClick={(e) => handleCreateCampaign(e, idea)}
                    >
                      <Icon icon="Plus" className={styles.buttonIcon} />
                      Create Campaign from Idea
                    </button>
                    <button className={styles.dismissButton}>
                      <Icon icon="Archive" className={styles.buttonIcon} />
                      Archive
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
