import { useMemo } from 'react';
import { Campaign } from '../types/campaign';
import styles from './CampaignActivityTimeline.module.css';

interface CampaignActivityTimelineProps {
  campaign: Campaign;
}

// Activity types for CMS operations
type ActivityType =
  | 'campaign_created'
  | 'campaign_updated'
  | 'asset_uploaded'
  | 'entry_added'
  | 'entry_updated'
  | 'published'
  | 'audience_linked'
  | 'brand_kit_applied'
  | 'channel_added'
  | 'milestone_completed'
  | 'comment_added';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  actor: {
    name: string;
    initials: string;
  };
  metadata?: {
    channel?: string;
    assetName?: string;
    entryTitle?: string;
    milestoneName?: string;
  };
}

// Activity type configurations
const ACTIVITY_CONFIG: Record<ActivityType, { icon: string; color: string; bgColor: string }> = {
  campaign_created: { icon: '🎉', color: '#10b981', bgColor: '#d1fae5' },
  campaign_updated: { icon: '✏️', color: '#6366f1', bgColor: '#e0e7ff' },
  asset_uploaded: { icon: '🖼️', color: '#8b5cf6', bgColor: '#ede9fe' },
  entry_added: { icon: '📄', color: '#3b82f6', bgColor: '#dbeafe' },
  entry_updated: { icon: '📝', color: '#0891b2', bgColor: '#cffafe' },
  published: { icon: '🚀', color: '#059669', bgColor: '#a7f3d0' },
  audience_linked: { icon: '👥', color: '#ec4899', bgColor: '#fce7f3' },
  brand_kit_applied: { icon: '🎨', color: '#f59e0b', bgColor: '#fef3c7' },
  channel_added: { icon: '📢', color: '#14b8a6', bgColor: '#ccfbf1' },
  milestone_completed: { icon: '✅', color: '#22c55e', bgColor: '#dcfce7' },
  comment_added: { icon: '💬', color: '#64748b', bgColor: '#f1f5f9' },
};

// Mock actors for activities
const MOCK_ACTORS = [
  { name: 'Sarah Chen', initials: 'SC' },
  { name: 'Mike Johnson', initials: 'MJ' },
  { name: 'Emma Wilson', initials: 'EW' },
  { name: 'Alex Thompson', initials: 'AT' },
  { name: 'Jordan Lee', initials: 'JL' },
];

// Seeded random for consistent mock data
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Generate mock activities based on campaign data
function generateActivities(campaign: Campaign): Activity[] {
  const random = seededRandom(campaign.uid);
  const activities: Activity[] = [];
  const now = new Date();
  const startDate = new Date(campaign.created_at || campaign.start_date);

  // Campaign created
  activities.push({
    id: `${campaign.uid}-created`,
    type: 'campaign_created',
    title: 'Campaign Created',
    description: `Created "${campaign.title}"`,
    timestamp: startDate,
    actor: MOCK_ACTORS[Math.floor(random() * MOCK_ACTORS.length)],
  });

  // Add activities for assets
  if (campaign.assets && campaign.assets.length > 0) {
    campaign.assets.forEach((asset, index) => {
      const daysAfterStart = Math.floor(random() * 3) + 1;
      const timestamp = new Date(startDate);
      timestamp.setDate(timestamp.getDate() + daysAfterStart + index);
      timestamp.setHours(Math.floor(random() * 10) + 9);

      activities.push({
        id: `${campaign.uid}-asset-${asset.uid}`,
        type: 'asset_uploaded',
        title: 'Asset Uploaded',
        description: `Uploaded "${asset.filename}"`,
        timestamp,
        actor: MOCK_ACTORS[Math.floor(random() * MOCK_ACTORS.length)],
        metadata: { assetName: asset.filename },
      });
    });
  }

  // Add activities for entries
  if (campaign.entries && campaign.entries.length > 0) {
    campaign.entries.forEach((entry, index) => {
      const daysAfterStart = Math.floor(random() * 5) + 2;
      const timestamp = new Date(startDate);
      timestamp.setDate(timestamp.getDate() + daysAfterStart + index);
      timestamp.setHours(Math.floor(random() * 10) + 9);

      activities.push({
        id: `${campaign.uid}-entry-${entry.uid}`,
        type: 'entry_added',
        title: 'Entry Added',
        description: `Added "${entry.title || 'Untitled Entry'}" to campaign`,
        timestamp,
        actor: MOCK_ACTORS[Math.floor(random() * MOCK_ACTORS.length)],
        metadata: { entryTitle: entry.title },
      });
    });
  }

  // Add activities for channels
  if (campaign.channels && campaign.channels.length > 0) {
    campaign.channels.forEach((channel, index) => {
      const daysAfterStart = Math.floor(random() * 2) + 1;
      const timestamp = new Date(startDate);
      timestamp.setDate(timestamp.getDate() + daysAfterStart);
      timestamp.setHours(Math.floor(random() * 10) + 9 + index);

      activities.push({
        id: `${campaign.uid}-channel-${channel}`,
        type: 'channel_added',
        title: 'Channel Added',
        description: `Added ${channel} channel`,
        timestamp,
        actor: MOCK_ACTORS[Math.floor(random() * MOCK_ACTORS.length)],
        metadata: { channel },
      });
    });
  }

  // Add activities for audiences
  if (campaign.audiences && campaign.audiences.length > 0) {
    campaign.audiences.forEach((audience, index) => {
      const daysAfterStart = Math.floor(random() * 4) + 2;
      const timestamp = new Date(startDate);
      timestamp.setDate(timestamp.getDate() + daysAfterStart + index);
      timestamp.setHours(Math.floor(random() * 10) + 9);

      activities.push({
        id: `${campaign.uid}-audience-${audience.id}`,
        type: 'audience_linked',
        title: 'Audience Linked',
        description: `Linked "${audience.name}" audience`,
        timestamp,
        actor: MOCK_ACTORS[Math.floor(random() * MOCK_ACTORS.length)],
      });
    });
  }

  // Add brand kit activity
  if (campaign.brand_kit && campaign.brand_kit.length > 0) {
    const daysAfterStart = Math.floor(random() * 3) + 1;
    const timestamp = new Date(startDate);
    timestamp.setDate(timestamp.getDate() + daysAfterStart);
    timestamp.setHours(Math.floor(random() * 10) + 9);

    activities.push({
      id: `${campaign.uid}-brandkit`,
      type: 'brand_kit_applied',
      title: 'Brand Kit Applied',
      description: `Applied "${campaign.brand_kit[0].title}" brand kit`,
      timestamp,
      actor: MOCK_ACTORS[Math.floor(random() * MOCK_ACTORS.length)],
    });
  }

  // Add milestone completions
  if (campaign.timeline) {
    campaign.timeline.forEach((milestone, index) => {
      if (milestone.status === 'completed') {
        const milestoneDate = new Date(milestone.milestone_date);
        milestoneDate.setHours(Math.floor(random() * 10) + 9);

        activities.push({
          id: `${campaign.uid}-milestone-${index}`,
          type: 'milestone_completed',
          title: 'Milestone Completed',
          description: `Completed "${milestone.milestone_name}"`,
          timestamp: milestoneDate,
          actor: MOCK_ACTORS[Math.floor(random() * MOCK_ACTORS.length)],
          metadata: { milestoneName: milestone.milestone_name },
        });
      }
    });
  }

  // Add some update activities
  const numUpdates = Math.floor(random() * 3) + 1;
  for (let i = 0; i < numUpdates; i++) {
    const daysAfterStart = Math.floor(random() * 10) + 3;
    const timestamp = new Date(startDate);
    timestamp.setDate(timestamp.getDate() + daysAfterStart);
    timestamp.setHours(Math.floor(random() * 10) + 9);

    if (timestamp < now) {
      activities.push({
        id: `${campaign.uid}-update-${i}`,
        type: 'campaign_updated',
        title: 'Campaign Updated',
        description: 'Updated campaign details',
        timestamp,
        actor: MOCK_ACTORS[Math.floor(random() * MOCK_ACTORS.length)],
      });
    }
  }

  // Add some comments
  const numComments = Math.floor(random() * 4) + 1;
  const commentMessages = [
    'Great progress on this campaign!',
    'Updated the messaging based on feedback',
    'Ready for review',
    'Let\'s schedule a sync to discuss',
    'Assets look good',
  ];

  for (let i = 0; i < numComments; i++) {
    const daysAfterStart = Math.floor(random() * 14) + 1;
    const timestamp = new Date(startDate);
    timestamp.setDate(timestamp.getDate() + daysAfterStart);
    timestamp.setHours(Math.floor(random() * 10) + 9);

    if (timestamp < now) {
      activities.push({
        id: `${campaign.uid}-comment-${i}`,
        type: 'comment_added',
        title: 'Comment Added',
        description: commentMessages[Math.floor(random() * commentMessages.length)],
        timestamp,
        actor: MOCK_ACTORS[Math.floor(random() * MOCK_ACTORS.length)],
      });
    }
  }

  // Add publish activity for active/completed campaigns
  if (campaign.status === 'active' || campaign.status === 'completed') {
    const launchDate = new Date(campaign.start_date);
    launchDate.setHours(9, 0, 0);

    activities.push({
      id: `${campaign.uid}-published`,
      type: 'published',
      title: 'Campaign Published',
      description: 'Campaign went live',
      timestamp: launchDate,
      actor: MOCK_ACTORS[Math.floor(random() * MOCK_ACTORS.length)],
    });
  }

  // Sort by timestamp descending (most recent first)
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function CampaignActivityTimeline({ campaign }: CampaignActivityTimelineProps) {
  const activities = useMemo(() => generateActivities(campaign), [campaign]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: { date: string; activities: Activity[] }[] = [];
    let currentDate = '';

    activities.forEach((activity) => {
      const dateStr = activity.timestamp.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groups.push({ date: dateStr, activities: [activity] });
      } else {
        groups[groups.length - 1].activities.push(activity);
      }
    });

    return groups;
  }, [activities]);

  return (
    <div className={styles.container}>
      <div className={styles.timelineHeader}>
        <span className={styles.activityCount}>{activities.length} activities</span>
      </div>

      <div className={styles.timeline}>
        {groupedActivities.map((group) => (
          <div key={group.date} className={styles.dateGroup}>
            <div className={styles.dateHeader}>
              <span className={styles.dateLine} />
              <span className={styles.dateLabel}>{group.date}</span>
              <span className={styles.dateLine} />
            </div>

            <div className={styles.activitiesList}>
              {group.activities.map((activity) => {
                const config = ACTIVITY_CONFIG[activity.type];

                return (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.timelineTrack}>
                      <div
                        className={styles.activityIcon}
                        style={{ backgroundColor: config.bgColor }}
                      >
                        {config.icon}
                      </div>
                      <div className={styles.timelineConnector} />
                    </div>

                    <div className={styles.activityContent}>
                      <div className={styles.activityHeader}>
                        <span
                          className={styles.activityTitle}
                          style={{ color: config.color }}
                        >
                          {activity.title}
                        </span>
                        <span
                          className={styles.activityTime}
                          title={formatFullDate(activity.timestamp)}
                        >
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>

                      <p className={styles.activityDescription}>
                        {activity.description}
                      </p>

                      <div className={styles.activityActor}>
                        <div className={styles.actorAvatar}>
                          {activity.actor.initials}
                        </div>
                        <span className={styles.actorName}>{activity.actor.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
