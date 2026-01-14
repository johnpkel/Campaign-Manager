import { useMemo } from 'react';
import { Icon } from '@contentstack/venus-components';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Campaign, CampaignChannel } from '../types';
import styles from './CampaignPerformanceHighlights.module.css';

interface PerformanceMetrics {
  totalReach: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  ctr: number;
  conversionRate: number;
  roi: number;
  costPerConversion: number;
  engagementRate: number;
}

interface DailyPerformance {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

interface ChannelBreakdown {
  name: string;
  value: number;
  color: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface CampaignPerformanceHighlightsProps {
  campaign: Campaign;
}

const CHANNEL_COLORS: Record<CampaignChannel, string> = {
  'Web': '#6366f1',
  'Native Mobile': '#8b5cf6',
  'Social': '#ec4899',
  'Ads': '#f59e0b',
  'Email': '#10b981',
};

// Generate mock daily performance data based on campaign dates
function generateDailyPerformance(campaign: Campaign): DailyPerformance[] {
  const startDate = new Date(campaign.start_date);
  const endDate = new Date(campaign.end_date);
  const now = new Date();
  const effectiveEnd = endDate < now ? endDate : now;

  const days: DailyPerformance[] = [];
  const dayCount = Math.min(
    Math.ceil((effectiveEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    90 // Cap at 90 days
  );

  // Use campaign uid as seed for consistent random data
  const seed = campaign.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (i: number) => {
    const x = Math.sin(seed + i) * 10000;
    return x - Math.floor(x);
  };

  const budgetNum = parseFloat(campaign.budget?.replace(/[^0-9.]/g, '') || '50000');
  const dailyBudget = budgetNum / Math.max(dayCount, 1);

  for (let i = 0; i < Math.max(dayCount, 7); i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Create a growth curve with some variance
    const growthFactor = 1 + (i / dayCount) * 0.5; // Gradual growth
    const dayVariance = 0.7 + seededRandom(i) * 0.6; // 70% - 130% variance

    const baseImpressions = (8000 + seededRandom(i * 2) * 12000) * growthFactor * dayVariance;
    const impressions = Math.round(baseImpressions);
    const clicks = Math.round(impressions * (0.03 + seededRandom(i * 3) * 0.04));
    const conversions = Math.round(clicks * (0.02 + seededRandom(i * 4) * 0.03));
    const revenue = conversions * (dailyBudget / 10) * (1.5 + seededRandom(i * 5));

    days.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      impressions,
      clicks,
      conversions,
      revenue: Math.round(revenue),
    });
  }

  return days;
}

// Generate channel breakdown data
function generateChannelBreakdown(campaign: Campaign): ChannelBreakdown[] {
  const seed = campaign.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (i: number) => {
    const x = Math.sin(seed + i * 100) * 10000;
    return x - Math.floor(x);
  };

  return campaign.channels.map((channel, index) => {
    const baseValue = 15000 + seededRandom(index) * 35000;
    const impressions = Math.round(baseValue * (1 + seededRandom(index + 10)));
    const clicks = Math.round(impressions * (0.03 + seededRandom(index + 20) * 0.04));
    const conversions = Math.round(clicks * (0.02 + seededRandom(index + 30) * 0.03));

    return {
      name: channel,
      value: impressions,
      color: CHANNEL_COLORS[channel],
      impressions,
      clicks,
      conversions,
    };
  });
}

// Generate funnel data
function generateFunnelData(metrics: PerformanceMetrics): FunnelStage[] {
  return [
    {
      name: 'Impressions',
      value: metrics.totalImpressions,
      percentage: 100,
      color: '#6366f1',
    },
    {
      name: 'Clicks',
      value: metrics.totalClicks,
      percentage: (metrics.totalClicks / metrics.totalImpressions) * 100,
      color: '#8b5cf6',
    },
    {
      name: 'Engaged',
      value: Math.round(metrics.totalClicks * 0.6),
      percentage: (metrics.totalClicks * 0.6 / metrics.totalImpressions) * 100,
      color: '#a855f7',
    },
    {
      name: 'Conversions',
      value: metrics.totalConversions,
      percentage: (metrics.totalConversions / metrics.totalImpressions) * 100,
      color: '#10b981',
    },
  ];
}

// Calculate overall metrics
function calculateMetrics(dailyData: DailyPerformance[], campaign: Campaign): PerformanceMetrics {
  const totals = dailyData.reduce(
    (acc, day) => ({
      impressions: acc.impressions + day.impressions,
      clicks: acc.clicks + day.clicks,
      conversions: acc.conversions + day.conversions,
      revenue: acc.revenue + day.revenue,
    }),
    { impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  );

  const budgetNum = parseFloat(campaign.budget?.replace(/[^0-9.]/g, '') || '50000');

  return {
    totalReach: Math.round(totals.impressions * 0.7), // Unique reach estimate
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalConversions: totals.conversions,
    totalRevenue: totals.revenue,
    ctr: totals.clicks / totals.impressions * 100,
    conversionRate: totals.conversions / totals.clicks * 100,
    roi: ((totals.revenue - budgetNum) / budgetNum) * 100,
    costPerConversion: budgetNum / totals.conversions,
    engagementRate: (totals.clicks * 1.5) / totals.impressions * 100,
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue')
              ? formatCurrency(entry.value)
              : formatNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CampaignPerformanceHighlights({ campaign }: CampaignPerformanceHighlightsProps) {
  const dailyPerformance = useMemo(() => generateDailyPerformance(campaign), [campaign]);
  const metrics = useMemo(() => calculateMetrics(dailyPerformance, campaign), [dailyPerformance, campaign]);
  const channelBreakdown = useMemo(() => generateChannelBreakdown(campaign), [campaign]);
  const funnelData = useMemo(() => generateFunnelData(metrics), [metrics]);

  // Determine performance status
  const getPerformanceStatus = () => {
    if (metrics.roi > 50) return { label: 'Excellent', color: '#10b981', icon: 'TrendingUp' };
    if (metrics.roi > 20) return { label: 'Good', color: '#6366f1', icon: 'TrendingUp' };
    if (metrics.roi > 0) return { label: 'On Track', color: '#f59e0b', icon: 'Minus' };
    return { label: 'Needs Attention', color: '#ef4444', icon: 'TrendingDown' };
  };

  const status = getPerformanceStatus();

  return (
    <div className={styles.container}>
      {/* Performance Overview Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <Icon icon="Analytics" className={styles.titleIcon} />
            Performance Highlights
          </h2>
          <div
            className={styles.statusBadge}
            style={{ backgroundColor: `${status.color}15`, color: status.color }}
          >
            <Icon icon={status.icon} className={styles.statusIcon} />
            {status.label}
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.dateRange}>
            {new Date(campaign.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(campaign.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#6366f115' }}>
            <Icon icon="Eye" style={{ color: '#6366f1' }} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{formatNumber(metrics.totalReach)}</span>
            <span className={styles.metricLabel}>Total Reach</span>
          </div>
          <span className={styles.metricChange} style={{ color: '#10b981' }}>+12.4%</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#8b5cf615' }}>
            <Icon icon="Cursor" style={{ color: '#8b5cf6' }} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{formatNumber(metrics.totalClicks)}</span>
            <span className={styles.metricLabel}>Clicks</span>
          </div>
          <span className={styles.metricChange} style={{ color: '#10b981' }}>+8.2%</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#10b98115' }}>
            <Icon icon="CheckCircle" style={{ color: '#10b981' }} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{formatNumber(metrics.totalConversions)}</span>
            <span className={styles.metricLabel}>Conversions</span>
          </div>
          <span className={styles.metricChange} style={{ color: '#10b981' }}>+15.7%</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b15' }}>
            <Icon icon="Dollar" style={{ color: '#f59e0b' }} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{formatCurrency(metrics.totalRevenue)}</span>
            <span className={styles.metricLabel}>Revenue</span>
          </div>
          <span className={styles.metricChange} style={{ color: '#10b981' }}>+23.1%</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: metrics.roi > 0 ? '#10b98115' : '#ef444415' }}>
            <Icon icon="TrendingUp" style={{ color: metrics.roi > 0 ? '#10b981' : '#ef4444' }} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{formatPercent(metrics.roi)}</span>
            <span className={styles.metricLabel}>ROI</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Performance Trend Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Performance Trend</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={formatNumber} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorImpressions)"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Distribution */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Channel Distribution</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={channelBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {channelBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatNumber(value)}
                  contentStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.channelLegend}>
              {channelBreakdown.map((channel) => (
                <div key={channel.name} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ backgroundColor: channel.color }} />
                  <span className={styles.legendLabel}>{channel.name}</span>
                  <span className={styles.legendValue}>{formatNumber(channel.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Conversion Funnel</h3>
          <div className={styles.funnelContainer}>
            {funnelData.map((stage, index) => (
              <div key={stage.name} className={styles.funnelStage}>
                <div
                  className={styles.funnelBar}
                  style={{
                    width: `${Math.max(stage.percentage, 10)}%`,
                    backgroundColor: stage.color,
                  }}
                >
                  <span className={styles.funnelLabel}>{stage.name}</span>
                </div>
                <div className={styles.funnelStats}>
                  <span className={styles.funnelValue}>{formatNumber(stage.value)}</span>
                  {index > 0 && (
                    <span className={styles.funnelPercent}>{stage.percentage.toFixed(2)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Key Rates</h3>
          <div className={styles.ratesContainer}>
            <div className={styles.rateItem}>
              <div className={styles.rateHeader}>
                <span className={styles.rateName}>Click-through Rate</span>
                <span className={styles.rateValue}>{formatPercent(metrics.ctr)}</span>
              </div>
              <div className={styles.rateBar}>
                <div
                  className={styles.rateProgress}
                  style={{
                    width: `${Math.min(metrics.ctr * 10, 100)}%`,
                    backgroundColor: '#6366f1',
                  }}
                />
              </div>
              <span className={styles.rateBenchmark}>Benchmark: 3.5%</span>
            </div>

            <div className={styles.rateItem}>
              <div className={styles.rateHeader}>
                <span className={styles.rateName}>Conversion Rate</span>
                <span className={styles.rateValue}>{formatPercent(metrics.conversionRate)}</span>
              </div>
              <div className={styles.rateBar}>
                <div
                  className={styles.rateProgress}
                  style={{
                    width: `${Math.min(metrics.conversionRate * 20, 100)}%`,
                    backgroundColor: '#10b981',
                  }}
                />
              </div>
              <span className={styles.rateBenchmark}>Benchmark: 2.5%</span>
            </div>

            <div className={styles.rateItem}>
              <div className={styles.rateHeader}>
                <span className={styles.rateName}>Engagement Rate</span>
                <span className={styles.rateValue}>{formatPercent(metrics.engagementRate)}</span>
              </div>
              <div className={styles.rateBar}>
                <div
                  className={styles.rateProgress}
                  style={{
                    width: `${Math.min(metrics.engagementRate * 10, 100)}%`,
                    backgroundColor: '#8b5cf6',
                  }}
                />
              </div>
              <span className={styles.rateBenchmark}>Benchmark: 4.0%</span>
            </div>

            <div className={styles.rateItem}>
              <div className={styles.rateHeader}>
                <span className={styles.rateName}>Cost per Conversion</span>
                <span className={styles.rateValue}>{formatCurrency(metrics.costPerConversion)}</span>
              </div>
              <div className={styles.rateBar}>
                <div
                  className={styles.rateProgress}
                  style={{
                    width: `${Math.min((50 / metrics.costPerConversion) * 100, 100)}%`,
                    backgroundColor: '#f59e0b',
                  }}
                />
              </div>
              <span className={styles.rateBenchmark}>Target: $25</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className={styles.chartCardWide}>
        <h3 className={styles.chartTitle}>Revenue & Conversions Over Time</h3>
        <div className={styles.chartContainerWide}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={formatNumber} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `$${formatNumber(v)}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="conversions"
                name="Conversions"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
