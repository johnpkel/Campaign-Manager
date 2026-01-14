import { useCollaboration } from '../contexts/CollaborationContext';
import { ActivityItem } from './ActivityItem';
import styles from './ActivityDigestCard.module.css';

export function ActivityDigestCard() {
  const { activities, isLoading, error } = useCollaboration();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading activity...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <span>Failed to load activity</span>
      </div>
    );
  }

  const recentActivities = activities.slice(0, 5);

  if (recentActivities.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyText}>No recent activity</span>
        <span className={styles.emptySubtext}>
          Activity from your team will appear here
        </span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.activityList}>
        {recentActivities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} compact />
        ))}
      </div>
      {activities.length > 5 && (
        <div className={styles.viewMore}>
          <span className={styles.viewMoreText}>
            +{activities.length - 5} more updates
          </span>
        </div>
      )}
    </div>
  );
}
