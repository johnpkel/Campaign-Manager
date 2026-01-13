import { Button, Icon } from '@contentstack/venus-components';
import { useCampaigns } from '../contexts';
import { MetricsCard } from './MetricsCard';
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CampaignStatus,
} from '../types';
import styles from './DashboardWidget.module.css';

export function DashboardWidget() {
  const { campaigns, metrics, isLoading } = useCampaigns();

  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className={styles.widget}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Icon icon="Target" className={styles.headerIcon} />
          <div>
            <h2 className={styles.title}>Campaign Manager</h2>
            <p className={styles.subtitle}>Marketing campaign overview</p>
          </div>
        </div>
        <Button buttonType="secondary" icon="ExternalLink">
          View All
        </Button>
      </div>

      <div className={styles.metricsGrid}>
        <MetricsCard
          title="Total Campaigns"
          value={metrics.totalCampaigns}
          icon="Folder"
          color="#6366f1"
          subtitle="All campaigns"
        />
        <MetricsCard
          title="Active"
          value={metrics.activeCampaigns}
          icon="Play"
          color="#10b981"
          subtitle="Currently running"
        />
        <MetricsCard
          title="Paused"
          value={metrics.campaignsByStatus.paused}
          icon="Pause"
          color="#f59e0b"
          subtitle="On hold"
        />
        <MetricsCard
          title="Completed"
          value={metrics.campaignsByStatus.completed}
          icon="CheckCircle"
          color="#8b5cf6"
          subtitle="Finished"
        />
      </div>

      <div className={styles.sections}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Status Distribution</h3>
          <div className={styles.statusBars}>
            {(Object.entries(metrics.campaignsByStatus) as [CampaignStatus, number][])
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <div key={status} className={styles.statusBar}>
                  <div className={styles.statusInfo}>
                    <span
                      className={styles.statusDot}
                      style={{ backgroundColor: CAMPAIGN_STATUS_COLORS[status] }}
                    />
                    <span className={styles.statusLabel}>
                      {CAMPAIGN_STATUS_LABELS[status]}
                    </span>
                    <span className={styles.statusCount}>{count}</span>
                  </div>
                  <div className={styles.barContainer}>
                    <div
                      className={styles.bar}
                      style={{
                        width: `${(count / metrics.totalCampaigns) * 100}%`,
                        backgroundColor: CAMPAIGN_STATUS_COLORS[status],
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <div className={styles.recentList}>
            {recentCampaigns.map((campaign) => (
              <div key={campaign.uid} className={styles.recentItem}>
                <div className={styles.recentInfo}>
                  <span className={styles.recentName}>{campaign.title}</span>
                  <span className={styles.recentMeta}>
                    {new Date(campaign.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={styles.recentStatus}
                  style={{ backgroundColor: CAMPAIGN_STATUS_COLORS[campaign.status] }}
                >
                  {CAMPAIGN_STATUS_LABELS[campaign.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
