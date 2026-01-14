import { useState, useEffect } from 'react';
import { Icon } from '@contentstack/venus-components';
import { createAnalyticsService } from '../services/analyticsService';
import { AnalyticsData } from '../types/analytics';
import styles from './AnalyticsModuleCard.module.css';

const analyticsService = createAnalyticsService();

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function AnalyticsModuleCard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsService.fetchAnalytics().then((result) => {
      setData(result);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !data) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading analytics...</span>
      </div>
    );
  }

  const { website, channels } = data;

  return (
    <div className={styles.container}>
      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <span className={styles.metricValue}>
              {formatNumber(website.pageViews)}
            </span>
            <span
              className={`${styles.trend} ${
                website.trends.pageViews.isPositive ? styles.positive : styles.negative
              }`}
            >
              <Icon
                icon={website.trends.pageViews.isPositive ? 'ArrowUp' : 'ArrowDown'}
                size="small"
              />
              {Math.abs(website.trends.pageViews.change)}%
            </span>
          </div>
          <span className={styles.metricLabel}>Page Views</span>
        </div>

        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <span className={styles.metricValue}>
              {formatNumber(website.uniqueVisitors)}
            </span>
            <span
              className={`${styles.trend} ${
                website.trends.visitors.isPositive ? styles.positive : styles.negative
              }`}
            >
              <Icon
                icon={website.trends.visitors.isPositive ? 'ArrowUp' : 'ArrowDown'}
                size="small"
              />
              {Math.abs(website.trends.visitors.change)}%
            </span>
          </div>
          <span className={styles.metricLabel}>Visitors</span>
        </div>

        <div className={styles.metric}>
          <span className={styles.metricValue}>{website.conversionRate.toFixed(1)}%</span>
          <span className={styles.metricLabel}>Conversion Rate</span>
        </div>

        <div className={styles.metric}>
          <span className={styles.metricValue}>
            {formatDuration(website.avgSessionDuration)}
          </span>
          <span className={styles.metricLabel}>Avg. Session</span>
        </div>
      </div>

      <div className={styles.channelsSection}>
        <span className={styles.sectionLabel}>Top Channels</span>
        <div className={styles.channelBars}>
          {channels.slice(0, 4).map((channel) => (
            <div key={channel.channel} className={styles.channelRow}>
              <span className={styles.channelName}>{channel.channel}</span>
              <div className={styles.channelBarWrapper}>
                <div
                  className={styles.channelBar}
                  style={{ width: `${channel.percentage}%` }}
                />
              </div>
              <span className={styles.channelPercent}>{channel.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
