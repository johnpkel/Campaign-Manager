import { useMemo, useCallback } from 'react';
import { Icon } from '@contentstack/venus-components';
import { useCampaigns } from '../../../contexts';
import { useAI } from '../../ai';
import { Campaign, CampaignChannel, ALL_CAMPAIGN_CHANNELS } from '../../../types';
import styles from './DailyDigestCard.module.css';

// Mock audience data that could come from Lytics or similar
const AVAILABLE_AUDIENCES = [
  { id: 'aud_1', name: 'High-Value Customers', count: 45230, description: 'Customers with LTV > $500' },
  { id: 'aud_2', name: 'Cart Abandoners', count: 12450, description: 'Users who abandoned cart in last 30 days' },
  { id: 'aud_3', name: 'New Subscribers', count: 8920, description: 'Email subscribers from last 14 days' },
  { id: 'aud_4', name: 'Repeat Purchasers', count: 28100, description: 'Customers with 2+ purchases' },
  { id: 'aud_5', name: 'Inactive Users', count: 34500, description: 'No activity in 60+ days' },
  { id: 'aud_6', name: 'Mobile App Users', count: 19800, description: 'Active mobile app users' },
  { id: 'aud_7', name: 'Social Engagers', count: 15600, description: 'High social media engagement' },
  { id: 'aud_8', name: 'First-Time Visitors', count: 67400, description: 'New website visitors this month' },
];

interface WeekHighlight {
  type: 'launching' | 'ending' | 'milestone' | 'performance';
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface CampaignSuggestion {
  title: string;
  reason: string;
  channels: CampaignChannel[];
  priority: 'high' | 'medium' | 'low';
}

interface UnservedAudience {
  id: string;
  name: string;
  count: number;
  description: string;
  suggestedChannel: CampaignChannel;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function generateWeekHighlights(campaigns: Campaign[]): WeekHighlight[] {
  const highlights: WeekHighlight[] = [];
  const { start, end } = getWeekBounds();

  // Campaigns launching this week
  const launchingThisWeek = campaigns.filter((c) => {
    const startDate = new Date(c.start_date);
    return startDate >= start && startDate <= end && c.status === 'planning';
  });

  launchingThisWeek.forEach((c) => {
    highlights.push({
      type: 'launching',
      title: `${c.title} launches`,
      description: `Scheduled for ${new Date(c.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
      icon: 'Rocket',
      color: '#10b981',
    });
  });

  // Campaigns ending this week
  const endingThisWeek = campaigns.filter((c) => {
    const endDate = new Date(c.end_date);
    return endDate >= start && endDate <= end && c.status === 'active';
  });

  endingThisWeek.forEach((c) => {
    highlights.push({
      type: 'ending',
      title: `${c.title} wrapping up`,
      description: `Ends ${new Date(c.end_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
      icon: 'Flag',
      color: '#f59e0b',
    });
  });

  // Active campaigns performance highlight (mock)
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  if (activeCampaigns.length > 0) {
    const topPerformer = activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)];
    highlights.push({
      type: 'performance',
      title: `${topPerformer.title} performing well`,
      description: `+${Math.floor(12 + Math.random() * 18)}% above target this week`,
      icon: 'TrendingUp',
      color: '#6366f1',
    });
  }

  // If no highlights, add a general status
  if (highlights.length === 0) {
    highlights.push({
      type: 'milestone',
      title: 'All campaigns on track',
      description: `${campaigns.length} total campaigns in your portfolio`,
      icon: 'CheckCircle',
      color: '#10b981',
    });
  }

  return highlights.slice(0, 3);
}

function generateCampaignSuggestions(campaigns: Campaign[]): CampaignSuggestion[] {
  const suggestions: CampaignSuggestion[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();

  // Analyze current channel coverage
  const activeChannels = new Set<CampaignChannel>();
  campaigns
    .filter((c) => c.status === 'active' || c.status === 'planning')
    .forEach((c) => c.channels.forEach((ch) => activeChannels.add(ch)));

  // Suggest for underutilized channels
  const underutilizedChannels = ALL_CAMPAIGN_CHANNELS.filter((ch) => !activeChannels.has(ch));
  if (underutilizedChannels.includes('Email')) {
    suggestions.push({
      title: 'Email Re-engagement Campaign',
      reason: 'No active email campaigns - 34.5K inactive users could be re-engaged',
      channels: ['Email'],
      priority: 'high',
    });
  }

  if (underutilizedChannels.includes('Native Mobile')) {
    suggestions.push({
      title: 'Mobile App Push Campaign',
      reason: 'Mobile channel underutilized - 19.8K app users not being reached',
      channels: ['Native Mobile'],
      priority: 'medium',
    });
  }

  // Seasonal suggestions based on month
  const seasonalSuggestions: Record<number, CampaignSuggestion> = {
    0: { title: 'New Year Resolution Campaign', reason: 'January is prime time for goal-setting content', channels: ['Web', 'Email'], priority: 'high' },
    1: { title: 'Valentine\'s Day Promotion', reason: 'February shopping surge opportunity', channels: ['Web', 'Social', 'Email'], priority: 'high' },
    2: { title: 'Spring Collection Launch', reason: 'Seasonal transition drives new purchases', channels: ['Web', 'Native Mobile'], priority: 'medium' },
    3: { title: 'Earth Day Sustainability Push', reason: 'Growing consumer interest in eco-friendly messaging', channels: ['Social', 'Web'], priority: 'medium' },
    4: { title: 'Mother\'s Day Gift Guide', reason: 'Major gifting holiday approaching', channels: ['Email', 'Web', 'Ads'], priority: 'high' },
    5: { title: 'Summer Kickoff Sale', reason: 'Drive early summer engagement', channels: ['Web', 'Social', 'Email'], priority: 'high' },
    6: { title: 'Mid-Year Review Campaign', reason: 'Re-engage customers with personalized recommendations', channels: ['Email', 'Native Mobile'], priority: 'medium' },
    7: { title: 'Back to School Prep', reason: 'Capture back-to-school shopping momentum', channels: ['Web', 'Ads', 'Email'], priority: 'high' },
    8: { title: 'Fall Preview Campaign', reason: 'Build anticipation for fall releases', channels: ['Social', 'Web'], priority: 'medium' },
    9: { title: 'Halloween Themed Promotion', reason: 'Seasonal engagement opportunity', channels: ['Social', 'Email'], priority: 'medium' },
    10: { title: 'Black Friday/Cyber Monday Prep', reason: 'Critical shopping season - start planning now', channels: ['Web', 'Email', 'Ads', 'Native Mobile'], priority: 'high' },
    11: { title: 'Holiday Gift Campaign', reason: 'Peak shopping season - maximize reach', channels: ['Web', 'Email', 'Social', 'Ads'], priority: 'high' },
  };

  const seasonalSuggestion = seasonalSuggestions[currentMonth];
  // Check if similar campaign doesn't already exist
  const hasSimilar = campaigns.some(
    (c) => c.title.toLowerCase().includes(seasonalSuggestion.title.toLowerCase().split(' ')[0])
  );
  if (!hasSimilar) {
    suggestions.push(seasonalSuggestion);
  }

  // Suggest based on gaps
  const hasRetentionCampaign = campaigns.some(
    (c) => (c.status === 'active' || c.status === 'planning') &&
           (c.title.toLowerCase().includes('retention') || c.title.toLowerCase().includes('loyalty'))
  );
  if (!hasRetentionCampaign) {
    suggestions.push({
      title: 'Customer Loyalty Program',
      reason: '28.1K repeat purchasers could benefit from rewards program',
      channels: ['Email', 'Native Mobile'],
      priority: 'medium',
    });
  }

  return suggestions.slice(0, 3);
}

function findUnservedAudiences(campaigns: Campaign[]): UnservedAudience[] {
  // Get audiences currently being targeted
  const servedAudienceIds = new Set<string>();
  campaigns
    .filter((c) => c.status === 'active' || c.status === 'planning')
    .forEach((c) => {
      c.audiences?.forEach((aud) => servedAudienceIds.add(aud.id));
    });

  // Find audiences not being served
  const unserved: UnservedAudience[] = AVAILABLE_AUDIENCES
    .filter((aud) => !servedAudienceIds.has(aud.id))
    .map((aud) => ({
      ...aud,
      suggestedChannel: getSuggestedChannelForAudience(aud.name),
    }))
    .sort((a, b) => b.count - a.count);

  return unserved.slice(0, 4);
}

function getSuggestedChannelForAudience(audienceName: string): CampaignChannel {
  const name = audienceName.toLowerCase();
  if (name.includes('mobile') || name.includes('app')) return 'Native Mobile';
  if (name.includes('social') || name.includes('engager')) return 'Social';
  if (name.includes('subscriber') || name.includes('email')) return 'Email';
  if (name.includes('cart') || name.includes('visitor')) return 'Web';
  return 'Email'; // Default
}

const PRIORITY_CONFIG = {
  high: { color: '#ef4444', bgColor: '#fef2f2', label: 'High Priority' },
  medium: { color: '#f59e0b', bgColor: '#fffbeb', label: 'Medium' },
  low: { color: '#10b981', bgColor: '#ecfdf5', label: 'Low' },
};

export function DailyDigestCard() {
  const { campaigns, isLoading } = useCampaigns();
  const { openChat, sendMessage } = useAI();

  const weekHighlights = useMemo(() => generateWeekHighlights(campaigns), [campaigns]);
  const suggestions = useMemo(() => generateCampaignSuggestions(campaigns), [campaigns]);
  const unservedAudiences = useMemo(() => findUnservedAudiences(campaigns), [campaigns]);

  const today = new Date();
  const greeting = getGreeting();

  // Handle clicking on a suggested campaign
  const handleSuggestionClick = useCallback(
    (suggestion: CampaignSuggestion) => {
      openChat();
      // Send a message to start creating this specific campaign type
      setTimeout(() => {
        sendMessage(
          `I want to create a new campaign: "${suggestion.title}". ${suggestion.reason}. Suggested channels: ${suggestion.channels.join(', ')}.`
        );
      }, 100);
    },
    [openChat, sendMessage]
  );

  // Handle clicking "create variant" for an audience
  const handleCreateVariant = useCallback(
    (audience: UnservedAudience) => {
      openChat();
      // Send a message to start creating a variant for this audience
      setTimeout(() => {
        sendMessage(
          `Create a new campaign variant targeting the "${audience.name}" audience (${formatNumber(audience.count)} users). This audience consists of: ${audience.description}. Suggested channel: ${audience.suggestedChannel}.`
        );
      }, 100);
    },
    [openChat, sendMessage]
  );

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading your daily digest...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <div className={styles.welcomeSection}>
        <div className={styles.greetingRow}>
          <h2 className={styles.greeting}>{greeting}</h2>
          <span className={styles.date}>{formatDate(today)}</span>
        </div>
        <p className={styles.summary}>
          You have <strong>{campaigns.filter((c) => c.status === 'active').length} active campaigns</strong> running
          and <strong>{campaigns.filter((c) => c.status === 'planning').length} in planning</strong>.
          Here&apos;s what you need to know today.
        </p>
      </div>

      <div className={styles.contentGrid}>
        {/* Week Highlights */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Icon icon="Calendar" className={styles.sectionIcon} />
            This Week
          </h3>
          <div className={styles.highlightsList}>
            {weekHighlights.map((highlight, index) => (
              <div key={index} className={styles.highlightItem}>
                <div
                  className={styles.highlightIcon}
                  style={{ backgroundColor: `${highlight.color}15`, color: highlight.color }}
                >
                  <Icon icon={highlight.icon} />
                </div>
                <div className={styles.highlightContent}>
                  <span className={styles.highlightTitle}>{highlight.title}</span>
                  <span className={styles.highlightDescription}>{highlight.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Suggestions */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Icon icon="Lightbulb" className={styles.sectionIcon} />
            Suggested Campaigns
          </h3>
          <div className={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => {
              const priorityConfig = PRIORITY_CONFIG[suggestion.priority];
              return (
                <div
                  key={index}
                  className={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(suggestion)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSuggestionClick(suggestion)}
                >
                  <div className={styles.suggestionHeader}>
                    <span className={styles.suggestionTitle}>{suggestion.title}</span>
                    <span
                      className={styles.priorityBadge}
                      style={{ backgroundColor: priorityConfig.bgColor, color: priorityConfig.color }}
                    >
                      {priorityConfig.label}
                    </span>
                  </div>
                  <p className={styles.suggestionReason}>{suggestion.reason}</p>
                  <div className={styles.suggestionFooter}>
                    <div className={styles.suggestionChannels}>
                      {suggestion.channels.map((channel) => (
                        <span key={channel} className={styles.channelTag}>{channel}</span>
                      ))}
                    </div>
                    <span className={styles.createCta}>
                      <Icon icon="Plus" className={styles.ctaIcon} />
                      Create
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unserved Audiences */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Icon icon="Users" className={styles.sectionIcon} />
            Audiences to Reach
          </h3>
          <p className={styles.audienceIntro}>
            These audience segments aren&apos;t targeted by any active campaigns:
          </p>
          <div className={styles.audienceList}>
            {unservedAudiences.map((audience) => (
              <div key={audience.id} className={styles.audienceItem}>
                <div className={styles.audienceInfo}>
                  <span className={styles.audienceName}>{audience.name}</span>
                  <span className={styles.audienceCount}>{formatNumber(audience.count)} users</span>
                </div>
                <div className={styles.audienceMeta}>
                  <span className={styles.audienceDescription}>{audience.description}</span>
                </div>
                <div className={styles.audienceActions}>
                  <span className={styles.suggestedChannel}>
                    Try: <strong>{audience.suggestedChannel}</strong>
                  </span>
                  <button
                    className={styles.variantCta}
                    onClick={() => handleCreateVariant(audience)}
                    type="button"
                  >
                    <Icon icon="Copy" className={styles.ctaIcon} />
                    Create variant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
