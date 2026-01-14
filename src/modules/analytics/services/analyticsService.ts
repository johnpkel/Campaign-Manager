import { AnalyticsData } from '../types/analytics';
import { getMockAnalyticsData, refreshMockAnalyticsData } from '../utils/mockAnalyticsData';

export interface IAnalyticsService {
  fetchAnalytics(): Promise<AnalyticsData>;
  refreshAnalytics(): Promise<AnalyticsData>;
}

export class MockAnalyticsService implements IAnalyticsService {
  async fetchAnalytics(): Promise<AnalyticsData> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getMockAnalyticsData();
  }

  async refreshAnalytics(): Promise<AnalyticsData> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return refreshMockAnalyticsData();
  }
}

export function createAnalyticsService(): IAnalyticsService {
  return new MockAnalyticsService();
}
