import { AnalyticsData, TimeSeriesDataPoint } from '../types/analytics';

function generateTimeSeries(days: number, baseValue: number): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add some variance
    const variance = (Math.random() - 0.5) * baseValue * 0.3;
    const weekendFactor = [0, 6].includes(date.getDay()) ? 0.7 : 1;

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round((baseValue + variance) * weekendFactor),
    });
  }

  return data;
}

export function generateMockAnalyticsData(): AnalyticsData {
  const basePageViews = 125000 + Math.floor(Math.random() * 25000);
  const uniqueVisitors = Math.floor(basePageViews * 0.65);
  const conversions = Math.floor(uniqueVisitors * 0.032);

  return {
    website: {
      pageViews: basePageViews,
      uniqueVisitors,
      bounceRate: 35 + Math.random() * 15,
      avgSessionDuration: 180 + Math.floor(Math.random() * 120),
      conversionRate: 2.5 + Math.random() * 2,
      trends: {
        pageViews: {
          value: basePageViews,
          change: 12.5,
          isPositive: true,
          period: 'vs last month',
        },
        visitors: {
          value: uniqueVisitors,
          change: 8.3,
          isPositive: true,
          period: 'vs last month',
        },
        conversions: {
          value: conversions,
          change: -2.1,
          isPositive: false,
          period: 'vs last month',
        },
      },
    },
    channels: [
      { channel: 'Organic Search', visitors: 45000, conversions: 1200, revenue: 85000, percentage: 35 },
      { channel: 'Direct', visitors: 32000, conversions: 950, revenue: 62000, percentage: 25 },
      { channel: 'Social', visitors: 25000, conversions: 580, revenue: 38000, percentage: 20 },
      { channel: 'Email', visitors: 15000, conversions: 420, revenue: 28000, percentage: 12 },
      { channel: 'Paid Ads', visitors: 10000, conversions: 280, revenue: 18000, percentage: 8 },
    ],
    trafficSources: [
      { source: 'google', medium: 'organic', sessions: 42000, percentage: 33 },
      { source: '(direct)', medium: '(none)', sessions: 32000, percentage: 25 },
      { source: 'facebook', medium: 'social', sessions: 18000, percentage: 14 },
      { source: 'newsletter', medium: 'email', sessions: 15000, percentage: 12 },
      { source: 'google', medium: 'cpc', sessions: 10000, percentage: 8 },
      { source: 'twitter', medium: 'social', sessions: 7000, percentage: 5 },
      { source: 'linkedin', medium: 'social', sessions: 4000, percentage: 3 },
    ],
    pageViewsTimeSeries: generateTimeSeries(30, basePageViews / 30),
    lastUpdated: new Date().toISOString(),
  };
}

// Singleton cached data to maintain consistency within session
let cachedData: AnalyticsData | null = null;

export function getMockAnalyticsData(): AnalyticsData {
  if (!cachedData) {
    cachedData = generateMockAnalyticsData();
  }
  return cachedData;
}

export function refreshMockAnalyticsData(): AnalyticsData {
  cachedData = generateMockAnalyticsData();
  return cachedData;
}
