import { useCollaboration } from '../contexts/CollaborationContext';
import { ActivityItem } from './ActivityItem';
import styles from './ActivityFeed.module.css';

export function ActivityFeed() {
  const { activities, isLoading, error, refreshActivities } = useCollaboration();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading activity feed...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <span>Failed to load activity feed</span>
        <button className={styles.retryButton} onClick={refreshActivities}>
          Try again
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📋</div>
        <span className={styles.emptyText}>No activity yet</span>
        <span className={styles.emptySubtext}>
          When you or your team members make changes, they'll appear here
        </span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Activity</h2>
        <button className={styles.refreshButton} onClick={refreshActivities}>
          Refresh
        </button>
      </div>
      <div className={styles.feed}>
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
