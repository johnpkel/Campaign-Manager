import { useMemo } from 'react';
import { Icon } from '@contentstack/venus-components';
import { Campaign } from '../types';
import styles from './CampaignRecommendedUpdates.module.css';

interface CampaignRecommendedUpdatesProps {
  campaign: Campaign;
  onActionClick?: (action: RecommendationAction) => void;
}

export type RecommendationSource =
  | 'audience_insights'
  | 'opportunity_explorer'
  | 'market_research'
  | 'performance';

export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface RecommendationAction {
  type: 'view_audience' | 'explore_opportunity' | 'update_content' | 'adjust_targeting' | 'review_budget' | 'add_channel' | 'view_research';
  targetId?: string;
  targetName?: string;
}

export interface Recommendation {
  id: string;
  source: RecommendationSource;
  priority: RecommendationPriority;
  title: string;
  description: string;
  insight: string;
  action: RecommendationAction;
  actionLabel: string;
  metric?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
  };
}

const SOURCE_CONFIG: Record<RecommendationSource, { label: string; icon: string; color: string }> = {
  audience_insights: { label: 'Audience Insights', icon: 'Users', color: '#8b5cf6' },
  opportunity_explorer: { label: 'Opportunity Explorer', icon: 'Target', color: '#0ea5e9' },
  market_research: { label: 'Market Research', icon: 'Search', color: '#f59e0b' },
  performance: { label: 'Performance Alert', icon: 'AlertTriangle', color: '#ef4444' },
};

const PRIORITY_CONFIG: Record<RecommendationPriority, { label: string; color: string }> = {
  high: { label: 'High Priority', color: '#ef4444' },
  medium: { label: 'Medium Priority', color: '#f59e0b' },
  low: { label: 'Low Priority', color: '#10b981' },
};

// Generate recommendations based on campaign data
function generateRecommendations(campaign: Campaign): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Use campaign uid as seed for consistent random data
  const seed = campaign.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (i: number) => {
    const x = Math.sin(seed + i) * 10000;
    return x - Math.floor(x);
  };

  // Audience Insights recommendations
  const audienceNames = [
    'High-Intent Shoppers',
    'Returning Visitors',
    'Cart Abandoners',
    'Brand Advocates',
    'New Prospects',
    'Enterprise Decision Makers',
  ];

  const selectedAudienceIndex = Math.floor(seededRandom(1) * audienceNames.length);
  const audienceGrowth = Math.round(15 + seededRandom(2) * 35);

  recommendations.push({
    id: `rec_audience_${seed}_1`,
    source: 'audience_insights',
    priority: audienceGrowth > 30 ? 'high' : 'medium',
    title: `Untapped audience segment: "${audienceNames[selectedAudienceIndex]}"`,
    description: `This audience shows ${audienceGrowth}% higher engagement with similar campaigns but isn't currently targeted.`,
    insight: `Based on Lytics behavioral data, this segment has strong purchase intent signals matching your campaign goals.`,
    action: { type: 'view_audience', targetId: `aud_${selectedAudienceIndex}`, targetName: audienceNames[selectedAudienceIndex] },
    actionLabel: 'Add to Campaign',
    metric: { label: 'Potential Reach', value: `+${Math.round(seededRandom(3) * 50 + 20)}K`, trend: 'up' },
  });

  // Another audience insight - cross-sell opportunity
  if (campaign.audiences && campaign.audiences.length > 0) {
    const crossSellAudience = audienceNames[(selectedAudienceIndex + 2) % audienceNames.length];
    recommendations.push({
      id: `rec_audience_${seed}_2`,
      source: 'audience_insights',
      priority: 'medium',
      title: `Cross-sell opportunity with "${crossSellAudience}"`,
      description: `${Math.round(seededRandom(4) * 25 + 15)}% of your current audience overlaps with this high-value segment.`,
      insight: `Audience Insights detected behavioral patterns indicating cross-category purchase interest.`,
      action: { type: 'adjust_targeting', targetId: `aud_cross_${seed}`, targetName: crossSellAudience },
      actionLabel: 'Expand Targeting',
      metric: { label: 'Overlap', value: `${Math.round(seededRandom(5) * 25 + 15)}%`, trend: 'neutral' },
    });
  }

  // Opportunity Explorer recommendations
  const opportunityTypes = [
    { title: 'Product page personalization opportunity', desc: 'landing pages showing low conversion for target segment' },
    { title: 'Content gap detected', desc: 'missing content for key customer journey stage' },
    { title: 'Variant testing opportunity', desc: 'A/B test could improve engagement by' },
    { title: 'Localization opportunity', desc: 'high traffic from regions without localized content' },
  ];

  const oppIndex = Math.floor(seededRandom(6) * opportunityTypes.length);
  const oppValue = Math.round(seededRandom(7) * 30 + 10);

  recommendations.push({
    id: `rec_opp_${seed}_1`,
    source: 'opportunity_explorer',
    priority: oppValue > 25 ? 'high' : 'medium',
    title: opportunityTypes[oppIndex].title,
    description: `Opportunity Explorer identified ${opportunityTypes[oppIndex].desc}${oppIndex === 2 ? ` ${oppValue}%` : ''}.`,
    insight: `Creating personalized variants for this campaign's audiences could increase conversions.`,
    action: { type: 'explore_opportunity', targetId: `opp_${oppIndex}` },
    actionLabel: 'View Opportunities',
    metric: { label: 'Est. Impact', value: `+${oppValue}%`, trend: 'up' },
  });

  // Performance-based recommendations (only for active/completed campaigns)
  if (campaign.status === 'active' || campaign.status === 'completed') {
    const performanceIssues = [
      { channel: 'Email', metric: 'open rate', benchmark: '22%', current: `${Math.round(seededRandom(8) * 10 + 8)}%` },
      { channel: 'Social', metric: 'engagement', benchmark: '4.5%', current: `${(seededRandom(9) * 2 + 1).toFixed(1)}%` },
      { channel: 'Ads', metric: 'CTR', benchmark: '3.2%', current: `${(seededRandom(10) * 1.5 + 0.5).toFixed(1)}%` },
      { channel: 'Web', metric: 'bounce rate', benchmark: '35%', current: `${Math.round(seededRandom(11) * 25 + 45)}%` },
    ];

    // Find a channel the campaign is using that has poor performance
    const campaignChannels = campaign.channels || [];
    const underperformingChannel = performanceIssues.find(p =>
      campaignChannels.some(c => c.toLowerCase().includes(p.channel.toLowerCase()))
    );

    if (underperformingChannel) {
      recommendations.push({
        id: `rec_perf_${seed}_1`,
        source: 'performance',
        priority: 'high',
        title: `${underperformingChannel.channel} channel underperforming`,
        description: `Current ${underperformingChannel.metric} (${underperformingChannel.current}) is below benchmark (${underperformingChannel.benchmark}).`,
        insight: `Review creative assets and targeting for this channel. Consider A/B testing new approaches.`,
        action: { type: 'update_content', targetId: underperformingChannel.channel.toLowerCase() },
        actionLabel: 'Review Channel',
        metric: { label: 'vs Benchmark', value: `-${Math.round(seededRandom(12) * 40 + 20)}%`, trend: 'down' },
      });
    }

    // Budget efficiency recommendation
    const budgetNum = parseFloat(campaign.budget?.replace(/[^0-9.]/g, '') || '50000');
    if (budgetNum > 30000) {
      const wastage = Math.round(seededRandom(13) * 15 + 5);
      recommendations.push({
        id: `rec_perf_${seed}_2`,
        source: 'performance',
        priority: wastage > 12 ? 'high' : 'medium',
        title: 'Budget reallocation opportunity',
        description: `${wastage}% of spend is going to low-performing audience segments.`,
        insight: `Reallocating budget to high-intent segments could improve ROI by ${Math.round(wastage * 1.5)}%.`,
        action: { type: 'review_budget' },
        actionLabel: 'Optimize Budget',
        metric: { label: 'Potential Savings', value: `$${Math.round(budgetNum * wastage / 100).toLocaleString()}`, trend: 'up' },
      });
    }
  }

  // Market Research recommendations
  const marketTrends = [
    { trend: 'Rising competitor activity', action: 'Increase share of voice in key channels' },
    { trend: 'Seasonal demand shift', action: 'Adjust messaging to align with current trends' },
    { trend: 'New customer preferences emerging', action: 'Update creative assets to reflect trends' },
    { trend: 'Industry benchmark update', action: 'Review KPIs against latest standards' },
  ];

  const trendIndex = Math.floor(seededRandom(14) * marketTrends.length);
  recommendations.push({
    id: `rec_market_${seed}_1`,
    source: 'market_research',
    priority: 'medium',
    title: marketTrends[trendIndex].trend,
    description: `Market research data indicates ${marketTrends[trendIndex].action.toLowerCase()}.`,
    insight: `Based on competitive analysis and industry reports from the past 30 days.`,
    action: { type: 'view_research' },
    actionLabel: 'View Research',
    metric: { label: 'Relevance', value: `${Math.round(seededRandom(15) * 30 + 70)}%`, trend: 'neutral' },
  });

  // Sort by priority
  const priorityOrder: Record<RecommendationPriority, number> = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function CampaignRecommendedUpdates({ campaign, onActionClick }: CampaignRecommendedUpdatesProps) {
  const recommendations = useMemo(() => generateRecommendations(campaign), [campaign]);

  const handleActionClick = (recommendation: Recommendation) => {
    if (onActionClick) {
      onActionClick(recommendation.action);
    } else {
      // Default behavior - could open a modal or navigate
      console.log('Recommendation action:', recommendation.action);
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <Icon icon="Lightbulb" className={styles.titleIcon} />
            Recommended Updates
          </h2>
          {highPriorityCount > 0 && (
            <span className={styles.alertBadge}>
              {highPriorityCount} High Priority
            </span>
          )}
        </div>
        <span className={styles.subtitle}>
          AI-powered insights from Audience Insights, Opportunity Explorer & Market Research
        </span>
      </div>

      <div className={styles.recommendationsList}>
        {recommendations.map((rec) => {
          const sourceConfig = SOURCE_CONFIG[rec.source];
          const priorityConfig = PRIORITY_CONFIG[rec.priority];

          return (
            <div key={rec.id} className={styles.recommendationCard}>
              <div className={styles.cardHeader}>
                <div className={styles.sourceTag} style={{ backgroundColor: `${sourceConfig.color}15`, color: sourceConfig.color }}>
                  <Icon icon={sourceConfig.icon} className={styles.sourceIcon} />
                  {sourceConfig.label}
                </div>
                <div className={styles.priorityTag} style={{ backgroundColor: `${priorityConfig.color}15`, color: priorityConfig.color }}>
                  {priorityConfig.label}
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.recTitle}>{rec.title}</h3>
                <p className={styles.recDescription}>{rec.description}</p>
                <p className={styles.recInsight}>
                  <Icon icon="Info" className={styles.insightIcon} />
                  {rec.insight}
                </p>
              </div>

              <div className={styles.cardFooter}>
                {rec.metric && (
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>{rec.metric.label}</span>
                    <span
                      className={styles.metricValue}
                      style={{
                        color: rec.metric.trend === 'up' ? '#10b981' :
                               rec.metric.trend === 'down' ? '#ef4444' : '#64748b'
                      }}
                    >
                      {rec.metric.trend === 'up' && '↑ '}
                      {rec.metric.trend === 'down' && '↓ '}
                      {rec.metric.value}
                    </span>
                  </div>
                )}
                <button
                  className={styles.actionButton}
                  onClick={() => handleActionClick(rec)}
                  style={{
                    backgroundColor: sourceConfig.color,
                    borderColor: sourceConfig.color,
                  }}
                >
                  {rec.actionLabel}
                  <Icon icon="ArrowRight" className={styles.actionIcon} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
