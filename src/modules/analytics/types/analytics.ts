export interface TrendData {
  value: number;
  change: number;
  isPositive: boolean;
  period: string;
}

export interface WebsiteMetrics {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  trends: {
    pageViews: TrendData;
    visitors: TrendData;
    conversions: TrendData;
  };
}

export interface ChannelMetrics {
  channel: string;
  visitors: number;
  conversions: number;
  revenue: number;
  percentage: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  percentage: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface AnalyticsData {
  website: WebsiteMetrics;
  channels: ChannelMetrics[];
  trafficSources: TrafficSource[];
  pageViewsTimeSeries: TimeSeriesDataPoint[];
  lastUpdated: string;
}
