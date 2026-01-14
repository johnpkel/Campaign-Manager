import { Activity } from '../types/collaboration';
import styles from './ActivityItem.module.css';

interface ActivityItemProps {
  activity: Activity;
  compact?: boolean;
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now.getTime() - activityTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return activityTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getActivityIcon(type: Activity['type']): string {
  const icons: Record<Activity['type'], string> = {
    campaign_created: '+',
    campaign_updated: '↻',
    campaign_status_changed: '◎',
    comment_added: '💬',
    asset_uploaded: '📎',
    milestone_completed: '✓',
    user_mentioned: '@',
  };
  return icons[type];
}

export function ActivityItem({ activity, compact = false }: ActivityItemProps) {
  const { actor, description, timestamp, type } = activity;

  if (compact) {
    return (
      <div className={styles.compactItem}>
        <div
          className={styles.avatarSmall}
          style={{ backgroundColor: actor.color }}
        >
          {actor.initials}
        </div>
        <div className={styles.compactContent}>
          <span className={styles.actorName}>{actor.name}</span>
          <span className={styles.compactDescription}>{description}</span>
        </div>
        <span className={styles.timestamp}>{getRelativeTime(timestamp)}</span>
      </div>
    );
  }

  return (
    <div className={styles.item}>
      <div className={styles.avatarWrapper}>
        <div
          className={styles.avatar}
          style={{ backgroundColor: actor.color }}
        >
          {actor.initials}
        </div>
        <span className={styles.activityIcon}>{getActivityIcon(type)}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.actorName}>{actor.name}</span>
          <span className={styles.timestamp}>{getRelativeTime(timestamp)}</span>
        </div>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}
