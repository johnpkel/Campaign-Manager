import { useState, useEffect } from 'react';
import { Icon } from '@contentstack/venus-components';
import { useCampaigns } from '../../../contexts';
import { Campaign } from '../types';
import styles from './CampaignModuleCard.module.css';

interface ChannelMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
}

interface CampaignChannelPerformance {
  website?: ChannelMetrics;
  mobile?: ChannelMetrics;
  email?: {
    sent: number;
    opened: number;
    openRate: number;
    clicks: number;
    ctr: number;
  };
}

interface CampaignPerformanceData {
  campaignId: string;
  totalReach: number;
  totalConversions: number;
  totalRevenue: number;
  channels: CampaignChannelPerformance;
}

// Generate mock performance data for a campaign based on its channels
function generateCampaignPerformance(campaign: Campaign): CampaignPerformanceData {
  const channels: CampaignChannelPerformance = {};

  const hasWeb = campaign.channels.includes('Web');
  const hasMobile = campaign.channels.includes('Native Mobile');
  const hasEmail = campaign.channels.includes('Email');
  const hasSocial = campaign.channels.includes('Social');
  const hasAds = campaign.channels.includes('Ads');

  if (hasWeb || hasSocial || hasAds) {
    const baseImpressions = 150000 + Math.floor(Math.random() * 350000);
    const clicks = Math.floor(baseImpressions * (0.04 + Math.random() * 0.04));
    const conversions = Math.floor(clicks * (0.02 + Math.random() * 0.03));
    channels.website = {
      impressions: baseImpressions,
      clicks,
      ctr: (clicks / baseImpressions) * 100,
      conversions,
      conversionRate: (conversions / clicks) * 100,
    };
  }

  if (hasMobile) {
    const baseImpressions = 80000 + Math.floor(Math.random() * 200000);
    const clicks = Math.floor(baseImpressions * (0.05 + Math.random() * 0.05));
    const conversions = Math.floor(clicks * (0.03 + Math.random() * 0.04));
    channels.mobile = {
      impressions: baseImpressions,
      clicks,
      ctr: (clicks / baseImpressions) * 100,
      conversions,
      conversionRate: (conversions / clicks) * 100,
    };
  }

  if (hasEmail) {
    const sent = 25000 + Math.floor(Math.random() * 75000);
    const opened = Math.floor(sent * (0.18 + Math.random() * 0.15));
    const clicks = Math.floor(opened * (0.15 + Math.random() * 0.2));
    channels.email = {
      sent,
      opened,
      openRate: (opened / sent) * 100,
      clicks,
      ctr: (clicks / opened) * 100,
    };
  }

  const totalReach =
    (channels.website?.impressions || 0) +
    (channels.mobile?.impressions || 0) +
    (channels.email?.sent || 0);

  const totalConversions =
    (channels.website?.conversions || 0) +
    (channels.mobile?.conversions || 0) +
    (channels.email?.clicks || 0);

  const budgetNum = parseFloat(campaign.budget?.replace(/[^0-9.]/g, '') || '0');
  const totalRevenue = budgetNum * (1.5 + Math.random() * 2.5);

  return {
    campaignId: campaign.uid,
    totalReach,
    totalConversions,
    totalRevenue,
    channels,
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

export function CampaignModuleCard() {
  const { campaigns, isLoading } = useCampaigns();
  const [performanceData, setPerformanceData] = useState<Map<string, CampaignPerformanceData>>(new Map());

  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  useEffect(() => {
    // Generate mock performance data for each active campaign
    const data = new Map<string, CampaignPerformanceData>();
    activeCampaigns.forEach(campaign => {
      data.set(campaign.uid, generateCampaignPerformance(campaign));
    });
    setPerformanceData(data);
  }, [campaigns]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading campaigns...</span>
      </div>
    );
  }

  // Calculate totals
  const totals = Array.from(performanceData.values()).reduce(
    (acc, perf) => ({
      reach: acc.reach + perf.totalReach,
      conversions: acc.conversions + perf.totalConversions,
      revenue: acc.revenue + perf.totalRevenue,
    }),
    { reach: 0, conversions: 0, revenue: 0 }
  );

  const totalBudget = activeCampaigns.reduce((sum, c) => {
    return sum + parseFloat(c.budget?.replace(/[^0-9.]/g, '') || '0');
  }, 0);

  return (
    <div className={styles.container}>
      {/* Summary Header */}
      <div className={styles.summaryHeader}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{activeCampaigns.length}</span>
          <span className={styles.summaryLabel}>Active</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{formatNumber(totals.reach)}</span>
          <span className={styles.summaryLabel}>Total Reach</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{formatNumber(totals.conversions)}</span>
          <span className={styles.summaryLabel}>Conversions</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{formatCurrency(totalBudget)}</span>
          <span className={styles.summaryLabel}>Budget</span>
        </div>
      </div>

      {/* Campaign List */}
      {activeCampaigns.length > 0 ? (
        <div className={styles.campaignList}>
          {activeCampaigns.map((campaign) => {
            const perf = performanceData.get(campaign.uid);
            return (
              <div key={campaign.uid} className={styles.campaignCard}>
                <div className={styles.campaignHeader}>
                  <div className={styles.campaignTitleSection}>
                    <h4 className={styles.campaignTitle}>{campaign.title}</h4>
                    <span className={styles.campaignBudget}>{campaign.budget || '$0'}</span>
                  </div>
                  {perf && (
                    <div className={styles.campaignTotals}>
                      <span className={styles.campaignTotalItem}>
                        <strong>{formatNumber(perf.totalReach)}</strong> reach
                      </span>
                      <span className={styles.campaignTotalItem}>
                        <strong>{formatNumber(perf.totalConversions)}</strong> conv.
                      </span>
                    </div>
                  )}
                </div>

                {perf && (
                  <div className={styles.channelGrid}>
                    {/* Website Channel */}
                    {perf.channels.website && (
                      <div className={styles.channelCard}>
                        <div className={styles.channelHeader}>
                          <Icon icon="Globe" className={styles.channelIcon} />
                          <span className={styles.channelName}>Web</span>
                        </div>
                        <div className={styles.channelStats}>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{formatNumber(perf.channels.website.impressions)}</span>
                            <span className={styles.statLabel}>Impr.</span>
                          </div>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{perf.channels.website.ctr.toFixed(1)}%</span>
                            <span className={styles.statLabel}>CTR</span>
                          </div>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{formatNumber(perf.channels.website.conversions)}</span>
                            <span className={styles.statLabel}>Conv.</span>
                          </div>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{perf.channels.website.conversionRate.toFixed(1)}%</span>
                            <span className={styles.statLabel}>Rate</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mobile Channel */}
                    {perf.channels.mobile && (
                      <div className={styles.channelCard}>
                        <div className={styles.channelHeader}>
                          <Icon icon="Mobile" className={styles.channelIcon} />
                          <span className={styles.channelName}>Mobile</span>
                        </div>
                        <div className={styles.channelStats}>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{formatNumber(perf.channels.mobile.impressions)}</span>
                            <span className={styles.statLabel}>Impr.</span>
                          </div>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{perf.channels.mobile.ctr.toFixed(1)}%</span>
                            <span className={styles.statLabel}>CTR</span>
                          </div>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{formatNumber(perf.channels.mobile.conversions)}</span>
                            <span className={styles.statLabel}>Conv.</span>
                          </div>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{perf.channels.mobile.conversionRate.toFixed(1)}%</span>
                            <span className={styles.statLabel}>Rate</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email Channel */}
                    {perf.channels.email && (
                      <div className={styles.channelCard}>
                        <div className={styles.channelHeader}>
                          <Icon icon="Email" className={styles.channelIcon} />
                          <span className={styles.channelName}>Email</span>
                        </div>
                        <div className={styles.channelStats}>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{formatNumber(perf.channels.email.sent)}</span>
                            <span className={styles.statLabel}>Sent</span>
                          </div>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{perf.channels.email.openRate.toFixed(1)}%</span>
                            <span className={styles.statLabel}>Open</span>
                          </div>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{formatNumber(perf.channels.email.clicks)}</span>
                            <span className={styles.statLabel}>Clicks</span>
                          </div>
                          <div className={styles.channelStat}>
                            <span className={styles.statValue}>{perf.channels.email.ctr.toFixed(1)}%</span>
                            <span className={styles.statLabel}>CTR</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <Icon icon="Folder" />
          <span>No active campaigns</span>
        </div>
      )}
    </div>
  );
}
