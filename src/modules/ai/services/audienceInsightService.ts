import { AudienceInsight, CampaignPerformanceData, CampaignRecommendation } from '../types/ai';

// Mock data for Audience Insight Opportunity Explorer
const MOCK_AUDIENCE_INSIGHTS: AudienceInsight[] = [
  {
    id: 'insight-1',
    audienceName: 'Tech-Savvy Millennials',
    opportunity: 'High engagement with video content on mobile devices',
    growthPotential: 'high',
    recommendedActions: [
      'Create short-form video campaigns',
      'Focus on mobile-first experiences',
      'Leverage social media influencers',
    ],
    relatedTrends: ['Mobile video consumption up 45%', 'TikTok engagement rates highest in demographic'],
  },
  {
    id: 'insight-2',
    audienceName: 'Eco-Conscious Consumers',
    opportunity: 'Growing segment interested in sustainability messaging',
    growthPotential: 'high',
    recommendedActions: [
      'Highlight sustainability initiatives',
      'Create educational content about eco-friendly practices',
      'Partner with environmental organizations',
    ],
    relatedTrends: ['73% prefer brands with sustainability commitments', 'Green product searches up 32%'],
  },
  {
    id: 'insight-3',
    audienceName: 'Remote Workers',
    opportunity: 'Increased demand for productivity and wellness solutions',
    growthPotential: 'medium',
    recommendedActions: [
      'Target work-from-home pain points',
      'Promote work-life balance messaging',
      'Focus on email and LinkedIn channels',
    ],
    relatedTrends: ['Remote work stabilized at 28% of workforce', 'Home office spending continues growth'],
  },
  {
    id: 'insight-4',
    audienceName: 'Gen Z Early Adopters',
    opportunity: 'First movers for new product launches and trends',
    growthPotential: 'high',
    recommendedActions: [
      'Launch exclusive early access campaigns',
      'Leverage user-generated content',
      'Focus on authenticity and transparency',
    ],
    relatedTrends: ['Gen Z spending power reaching $360B', 'Preference for brands with social values'],
  },
];

// Mock industry trends and news
const MOCK_INDUSTRY_TRENDS = [
  {
    id: 'trend-1',
    title: 'AI-Powered Personalization',
    description: 'Brands leveraging AI for hyper-personalized customer experiences see 40% higher engagement',
    relevance: 'high',
    suggestedCampaignType: 'Personalized Customer Journey Campaign',
    channels: ['Email', 'Web'],
    newsSource: 'Marketing Week',
  },
  {
    id: 'trend-2',
    title: 'Privacy-First Marketing',
    description: 'With third-party cookies phasing out, first-party data strategies are essential',
    relevance: 'high',
    suggestedCampaignType: 'First-Party Data Collection Campaign',
    channels: ['Web', 'Email'],
    newsSource: 'AdAge',
  },
  {
    id: 'trend-3',
    title: 'Interactive Content Surge',
    description: 'Quizzes, polls, and interactive videos driving 2x more conversions',
    relevance: 'medium',
    suggestedCampaignType: 'Interactive Engagement Campaign',
    channels: ['Social', 'Web'],
    newsSource: 'Content Marketing Institute',
  },
  {
    id: 'trend-4',
    title: 'Micro-Influencer Partnerships',
    description: 'Micro-influencers (10K-100K followers) delivering 60% higher engagement than macro',
    relevance: 'medium',
    suggestedCampaignType: 'Influencer Partnership Campaign',
    channels: ['Social', 'Native Mobile'],
    newsSource: 'Influencer Marketing Hub',
  },
];

export interface AudienceInsightService {
  getAudienceInsights(): Promise<AudienceInsight[]>;
  getIndustryTrends(): Promise<typeof MOCK_INDUSTRY_TRENDS>;
  isAvailable(): boolean;
  generateRecommendations(
    campaigns: CampaignPerformanceData[],
    insights: AudienceInsight[]
  ): CampaignRecommendation[];
}

export class MockAudienceInsightService implements AudienceInsightService {
  private isInstalled: boolean;

  constructor(isInstalled = true) {
    this.isInstalled = isInstalled;
  }

  isAvailable(): boolean {
    return this.isInstalled;
  }

  async getAudienceInsights(): Promise<AudienceInsight[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.isInstalled ? MOCK_AUDIENCE_INSIGHTS : [];
  }

  async getIndustryTrends(): Promise<typeof MOCK_INDUSTRY_TRENDS> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_INDUSTRY_TRENDS;
  }

  generateRecommendations(
    campaigns: CampaignPerformanceData[],
    insights: AudienceInsight[]
  ): CampaignRecommendation[] {
    const recommendations: CampaignRecommendation[] = [];

    // 1. Performance-based recommendations from existing campaigns
    const excellentCampaigns = campaigns.filter(c => c.performance === 'excellent');
    const poorCampaigns = campaigns.filter(c => c.performance === 'poor');

    if (excellentCampaigns.length > 0) {
      const topCampaign = excellentCampaigns[0];
      recommendations.push({
        id: `rec-perf-${topCampaign.id}`,
        type: 'performance-based',
        title: `Build on "${topCampaign.name}" Success`,
        description: `Your "${topCampaign.name}" campaign achieved excellent results. Create a follow-up campaign targeting similar audiences with refreshed messaging.`,
        rationale: `This campaign achieved ${topCampaign.metrics.roi}% ROI and ${topCampaign.metrics.engagement.toLocaleString()} engagements. Replicating this success with new creative could yield similar results.`,
        suggestedChannels: topCampaign.channels,
        suggestedAudiences: topCampaign.audiences,
        estimatedBudget: '$15,000 - $25,000',
        confidence: 'high',
        sourceData: {
          campaignId: topCampaign.id,
          campaignName: topCampaign.name,
          metric: 'ROI',
          value: `${topCampaign.metrics.roi}%`,
        },
      });
    }

    if (poorCampaigns.length > 0) {
      const underperformer = poorCampaigns[0];
      recommendations.push({
        id: `rec-improve-${underperformer.id}`,
        type: 'performance-based',
        title: `Revitalize "${underperformer.name}" Strategy`,
        description: `Your "${underperformer.name}" campaign underperformed. Consider a new approach with different messaging and expanded channel mix.`,
        rationale: `The original campaign had low engagement. A refreshed strategy focusing on different channels and clearer value proposition could improve results.`,
        suggestedChannels: ['Email', 'Social', 'Web'],
        suggestedAudiences: underperformer.audiences,
        estimatedBudget: '$10,000 - $15,000',
        confidence: 'medium',
        sourceData: {
          campaignId: underperformer.id,
          campaignName: underperformer.name,
          metric: 'Engagement',
          value: 'Below target',
        },
      });
    }

    // 2. Audience insight-based recommendations
    if (insights.length > 0) {
      const topInsight = insights.find(i => i.growthPotential === 'high') || insights[0];
      recommendations.push({
        id: `rec-audience-${topInsight.id}`,
        type: 'audience-insight',
        title: `Target ${topInsight.audienceName}`,
        description: topInsight.opportunity,
        rationale: `Audience Insight Explorer identified this as a ${topInsight.growthPotential} growth potential segment. ${topInsight.relatedTrends[0]}.`,
        suggestedChannels: ['Social', 'Native Mobile', 'Email'],
        suggestedAudiences: [topInsight.audienceName],
        estimatedBudget: '$20,000 - $35,000',
        confidence: topInsight.growthPotential === 'high' ? 'high' : 'medium',
        sourceData: {
          trend: topInsight.relatedTrends[0],
        },
      });
    }

    // 3. Trend-based recommendations
    const topTrends = MOCK_INDUSTRY_TRENDS.filter(t => t.relevance === 'high');
    if (topTrends.length > 0) {
      const trend = topTrends[0];
      recommendations.push({
        id: `rec-trend-${trend.id}`,
        type: 'trend-based',
        title: trend.suggestedCampaignType,
        description: trend.description,
        rationale: `Industry analysis shows this trend is gaining momentum. Early adoption could provide competitive advantage.`,
        suggestedChannels: trend.channels,
        estimatedBudget: '$12,000 - $20,000',
        confidence: 'medium',
        sourceData: {
          trend: trend.title,
          newsSource: trend.newsSource,
        },
      });

      // Add another trend recommendation
      if (topTrends.length > 1) {
        const trend2 = topTrends[1];
        recommendations.push({
          id: `rec-trend-${trend2.id}`,
          type: 'trend-based',
          title: trend2.suggestedCampaignType,
          description: trend2.description,
          rationale: `With changing privacy landscape, this approach positions your brand ahead of the curve.`,
          suggestedChannels: trend2.channels,
          estimatedBudget: '$8,000 - $15,000',
          confidence: 'high',
          sourceData: {
            trend: trend2.title,
            newsSource: trend2.newsSource,
          },
        });
      }
    }

    return recommendations;
  }
}

// Mock campaign performance data generator
export function generateMockCampaignPerformance(): CampaignPerformanceData[] {
  return [
    {
      id: 'camp-1',
      name: 'Summer Sale 2024',
      status: 'completed',
      performance: 'excellent',
      metrics: { reach: 450000, engagement: 28500, conversions: 3200, roi: 285 },
      channels: ['Email', 'Social', 'Web'],
      audiences: ['Existing Customers', 'High-Intent Shoppers'],
    },
    {
      id: 'camp-2',
      name: 'Product Launch - Pro Series',
      status: 'active',
      performance: 'good',
      metrics: { reach: 280000, engagement: 15200, conversions: 1850, roi: 165 },
      channels: ['Social', 'Ads', 'Native Mobile'],
      audiences: ['Tech Enthusiasts', 'Early Adopters'],
    },
    {
      id: 'camp-3',
      name: 'Brand Awareness Q3',
      status: 'completed',
      performance: 'poor',
      metrics: { reach: 120000, engagement: 3200, conversions: 280, roi: 45 },
      channels: ['Ads'],
      audiences: ['General Audience'],
    },
    {
      id: 'camp-4',
      name: 'Holiday Preview',
      status: 'active',
      performance: 'good',
      metrics: { reach: 185000, engagement: 12800, conversions: 1420, roi: 195 },
      channels: ['Email', 'Web'],
      audiences: ['Loyal Customers', 'Newsletter Subscribers'],
    },
  ];
}

export function createAudienceInsightService(isInstalled = true): AudienceInsightService {
  return new MockAudienceInsightService(isInstalled);
}
