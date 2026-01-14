import { useState } from 'react';
import {
  Campaign,
  CampaignChannel,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CAMPAIGN_CHANNEL_LABELS,
  SUCCESS_INDICATOR_STATUS_LABELS,
  SUCCESS_INDICATOR_STATUS_COLORS,
} from '../types/campaign';
import { CampaignPerformanceHighlights } from './CampaignPerformanceHighlights';
import { CampaignActivityTimeline } from './CampaignActivityTimeline';
import { CampaignRecommendedUpdates } from './CampaignRecommendedUpdates';
import styles from './CampaignDetail.module.css';

interface CampaignDetailProps {
  campaign: Campaign;
  onEdit?: () => void;
  onBack?: () => void;
}

// Channel icons mapping
const CHANNEL_ICONS: Record<CampaignChannel, string> = {
  'Web': '🌐',
  'Native Mobile': '📱',
  'Social': '💬',
  'Ads': '📢',
  'Email': '✉️',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// Helper to calculate progress percentage from current/target values
function calculateProgress(currentValue: string, targetValue: string): number {
  const current = parseFloat(currentValue.replace(/[^0-9.]/g, ''));
  const target = parseFloat(targetValue.replace(/[^0-9.]/g, ''));
  if (isNaN(current) || isNaN(target) || target === 0) return 0;
  return (current / target) * 100;
}

// Helper to render RTE content as bullet points
function renderRTEAsBullets(content: Campaign['key_messages']): string[] {
  if (!content || !content.children) return [];

  const bullets: string[] = [];

  const extractText = (node: any): string => {
    if (node.text) return node.text;
    if (node.children) {
      return node.children.map(extractText).join('');
    }
    return '';
  };

  content.children.forEach((child: any) => {
    const text = extractText(child).trim();
    if (text) bullets.push(text);
  });

  return bullets;
}

export function CampaignDetail({ campaign, onEdit, onBack }: CampaignDetailProps) {
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);

  const voiceProfile = campaign.voice_profile?.[0];
  const keyMessages = renderRTEAsBullets(campaign.key_messages);
  const campaignGoals = renderRTEAsBullets(campaign.campaign_goals);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          {onBack && (
            <button className={styles.backButton} onClick={onBack}>
              ← Back
            </button>
          )}
          <h1 className={styles.title}>{campaign.title}</h1>
          <div className={styles.headerMeta}>
            <span className={styles.dateRange}>
              <span className={styles.calendarIcon}>📅</span>
              {formatDateRange(campaign.start_date, campaign.end_date)}
            </span>
            {voiceProfile && (
              <span className={styles.voiceProfile}>
                <span className={styles.voiceIcon}>🎯</span>
                {voiceProfile.title}
              </span>
            )}
          </div>
        </div>
        <div className={styles.headerActions}>
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: `${CAMPAIGN_STATUS_COLORS[campaign.status]}20`, color: CAMPAIGN_STATUS_COLORS[campaign.status] }}
          >
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </span>
          {onEdit && (
            <button className={styles.editButton} onClick={onEdit}>
              <span className={styles.editIcon}>✏️</span>
              Edit Entry
            </button>
          )}
        </div>
      </div>

      {/* Recommended Updates */}
      <CampaignRecommendedUpdates campaign={campaign} />

      {/* Performance Highlights */}
      {(campaign.status === 'active' || campaign.status === 'completed') && (
        <CampaignPerformanceHighlights campaign={campaign} />
      )}

      {/* Key Messages & Goals */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Key Messages & Goals</h2>
        <div className={styles.card}>
          {keyMessages.length > 0 && (
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Key Messages/Themes</h3>
              <ul className={styles.bulletList}>
                {keyMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}
          {campaignGoals.length > 0 && (
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Campaign Goals</h3>
              <ul className={styles.bulletList}>
                {campaignGoals.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
          {keyMessages.length === 0 && campaignGoals.length === 0 && (
            <p className={styles.emptyText}>No key messages or goals defined yet.</p>
          )}
        </div>
      </section>

      {/* Success Indicators */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🎯</span>
          Success Indicators
        </h2>
        <div className={styles.card}>
          {campaign.success_indicators && campaign.success_indicators.length > 0 ? (
            <div className={styles.successIndicators}>
              {campaign.success_indicators.map((indicator, index) => (
                <div key={index} className={styles.indicatorCard}>
                  <div className={styles.indicatorHeader}>
                    <span className={styles.indicatorName}>{indicator.indicator_name}</span>
                    <span
                      className={styles.indicatorStatus}
                      style={{
                        backgroundColor: `${SUCCESS_INDICATOR_STATUS_COLORS[indicator.status]}15`,
                        color: SUCCESS_INDICATOR_STATUS_COLORS[indicator.status],
                      }}
                    >
                      {SUCCESS_INDICATOR_STATUS_LABELS[indicator.status]}
                    </span>
                  </div>
                  <div className={styles.indicatorValues}>
                    <div className={styles.indicatorValue}>
                      <span className={styles.indicatorValueLabel}>Target</span>
                      <span className={styles.indicatorValueText}>{indicator.target_value}</span>
                    </div>
                    {indicator.current_value && (
                      <div className={styles.indicatorValue}>
                        <span className={styles.indicatorValueLabel}>Current</span>
                        <span className={styles.indicatorValueText}>{indicator.current_value}</span>
                      </div>
                    )}
                  </div>
                  {indicator.current_value && indicator.target_value && (
                    <div className={styles.indicatorProgress}>
                      <div
                        className={styles.indicatorProgressBar}
                        style={{
                          width: `${Math.min(100, calculateProgress(indicator.current_value, indicator.target_value))}%`,
                          backgroundColor: SUCCESS_INDICATOR_STATUS_COLORS[indicator.status],
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No success indicators defined. Add KPIs to track campaign performance.</p>
          )}
        </div>
      </section>

      {/* Audiences & Brand Settings */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Audiences & Brand Settings</h2>
        <div className={styles.card}>
          {campaign.audiences && campaign.audiences.length > 0 && (
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Lytics Audiences</h3>
              <div className={styles.audienceList}>
                {campaign.audiences.map((audience) => (
                  <div key={audience.id} className={styles.audienceRow}>
                    <span className={styles.audienceName}>{audience.name}</span>
                    {audience.count && (
                      <span className={styles.audienceCount}>{audience.count.toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {(campaign.brand_kit || campaign.voice_profile) && (
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Brand Kit & Voice Profile</h3>
              <div className={styles.brandKitList}>
                {campaign.voice_profile?.map((vp) => (
                  <span key={vp.uid} className={styles.brandKitBadge}>
                    {vp.title}
                  </span>
                ))}
                {campaign.brand_kit?.map((bk) => (
                  <span key={bk.uid} className={styles.brandKitBadge}>
                    {bk.title}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!campaign.audiences?.length && !campaign.brand_kit?.length && !campaign.voice_profile?.length && (
            <p className={styles.emptyText}>No audiences or brand settings configured.</p>
          )}
        </div>
      </section>

      {/* Assets Carousel */}
      {campaign.assets && campaign.assets.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏷️</span>
            Assets Carousel
          </h2>
          <div className={styles.card}>
            <div className={styles.assetsCarousel}>
              <div className={styles.assetDisplay}>
                <img
                  src={campaign.assets[activeAssetIndex].url}
                  alt={campaign.assets[activeAssetIndex].filename}
                  className={styles.assetImage}
                />
              </div>
              <div className={styles.assetInfo}>
                <span className={styles.assetName}>{campaign.assets[activeAssetIndex].filename}</span>
                <span className={styles.assetType}>Base asset</span>
              </div>
              {campaign.assets.length > 1 && (
                <div className={styles.assetThumbnails}>
                  {campaign.assets.map((asset, index) => (
                    <button
                      key={asset.uid}
                      className={`${styles.assetThumb} ${index === activeAssetIndex ? styles.assetThumbActive : ''}`}
                      onClick={() => setActiveAssetIndex(index)}
                    >
                      <img src={asset.url} alt={asset.filename} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Channels */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Channels</h2>
        <div className={styles.card}>
          <div className={styles.channelsGrid}>
            {campaign.channels.map((channel, index) => (
              <div key={channel} className={styles.channelCard}>
                <span className={styles.channelIcon}>{CHANNEL_ICONS[channel]}</span>
                <div className={styles.channelInfo}>
                  <span className={styles.channelName}>{CAMPAIGN_CHANNEL_LABELS[channel]}</span>
                  <span className={styles.channelId}>#ch_{String(index + 1).padStart(3, '0')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UTMs */}
      {campaign.utms && campaign.utms.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🔗</span>
            UTM Parameters
          </h2>
          <div className={styles.card}>
            <div className={styles.utmList}>
              {campaign.utms.map((utm, index) => (
                <div key={index} className={styles.utmItem}>
                  <span className={styles.utmCode}>{utm}</span>
                  <button
                    className={styles.utmCopyButton}
                    onClick={() => navigator.clipboard.writeText(utm)}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Market Research */}
      {(campaign.market_research_links && campaign.market_research_links.length > 0) && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Market Research</h2>
          <div className={styles.card}>
            <h3 className={styles.subsectionTitle}>Campaign Resources</h3>
            <div className={styles.researchLinks}>
              {campaign.market_research_links.map((link, index) => (
                <a key={index} href={link.url} className={styles.researchLink} target="_blank" rel="noopener noreferrer">
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Milestones */}
      {campaign.timeline && campaign.timeline.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Milestones</h2>
          <div className={styles.card}>
            <div className={styles.milestones}>
              {campaign.timeline.map((milestone, index) => (
                <div key={index} className={styles.milestoneItem}>
                  <div className={styles.milestoneLeft}>
                    <span className={`${styles.milestoneStatus} ${styles[`status_${milestone.status}`]}`}>
                      {milestone.status === 'completed' && '✓'}
                      {milestone.status === 'in_progress' && '○'}
                      {milestone.status === 'pending' && '○'}
                    </span>
                    <div className={styles.milestoneContent}>
                      <span className={styles.milestoneName}>{milestone.milestone_name}</span>
                      <span className={styles.milestoneStatusLabel}>
                        {milestone.status === 'completed' && 'Completed'}
                        {milestone.status === 'in_progress' && 'In Progress'}
                        {milestone.status === 'pending' && 'Pending'}
                      </span>
                    </div>
                  </div>
                  <span className={styles.milestoneDate}>{formatDate(milestone.milestone_date)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Activity Timeline */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📋</span>
          Activity Timeline
        </h2>
        <div className={styles.card}>
          <CampaignActivityTimeline campaign={campaign} />
        </div>
      </section>

      {/* Contributors */}
      {campaign.contributors && campaign.contributors.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contributors (Reference Field)</h2>
          <div className={styles.card}>
            <div className={styles.contributorsList}>
              {campaign.contributors.map((contributor) => (
                <div key={contributor.uid} className={styles.contributorItem}>
                  <div className={styles.contributorAvatar}>
                    {contributor.initials || contributor.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </div>
                  <div className={styles.contributorInfo}>
                    <span className={styles.contributorName}>{contributor.name || 'Unknown'}</span>
                    <span className={styles.contributorRole}>{contributor.role || 'Contributor'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Campaign Entries */}
      {campaign.entries && campaign.entries.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Campaign Entries</h2>
          <div className={styles.card}>
            <table className={styles.entriesTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {campaign.entries.map((entry) => (
                  <tr key={entry.uid}>
                    <td>
                      {entry.image_url ? (
                        <img src={entry.image_url} alt={entry.title} className={styles.entryImage} />
                      ) : (
                        <div className={styles.entryImagePlaceholder}>📄</div>
                      )}
                    </td>
                    <td className={styles.entryTitle}>{entry.title || 'Untitled'}</td>
                    <td>
                      <div className={styles.entryTags}>
                        {entry.tags?.map((tag, index) => (
                          <span key={index} className={styles.entryTag}>{tag}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
