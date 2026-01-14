export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: AIMessageMetadata;
}

export interface AIMessageMetadata {
  type?: 'recommendation' | 'question' | 'confirmation' | 'standard';
  recommendations?: CampaignRecommendation[];
  questionType?: CampaignCreationStep;
  campaignDraft?: Partial<CampaignDraft>;
}

export type CampaignCreationStep =
  | 'recommendations'
  | 'title'
  | 'key_messages'
  | 'goals'
  | 'audiences'
  | 'dates'
  | 'contributors'
  | 'budget'
  | 'channels'
  | 'market_research'
  | 'brand_kit'
  | 'review'
  | 'complete';

export interface CampaignRecommendation {
  id: string;
  type: 'performance-based' | 'audience-insight' | 'trend-based';
  title: string;
  description: string;
  rationale: string;
  suggestedChannels?: string[];
  suggestedAudiences?: string[];
  estimatedBudget?: string;
  confidence: 'high' | 'medium' | 'low';
  sourceData?: {
    campaignId?: string;
    campaignName?: string;
    metric?: string;
    value?: string;
    trend?: string;
    newsSource?: string;
  };
}

export interface CampaignDraft {
  title: string;
  keyMessages: string;
  goals: string;
  audiences: string[];
  startDate: string;
  endDate: string;
  contributors: string[];
  budget: string;
  channels: string[];
  marketResearch: string;
  brandKit: string;
}

export interface AudienceInsight {
  id: string;
  audienceName: string;
  opportunity: string;
  growthPotential: 'high' | 'medium' | 'low';
  recommendedActions: string[];
  relatedTrends: string[];
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  context?: AIContext;
  createdAt: string;
  updatedAt: string;
}

export interface AIContext {
  activeCampaigns?: number;
  totalBudget?: number;
  recentActivity?: string[];
  analyticsHighlights?: string[];
  campaigns?: CampaignPerformanceData[];
  audienceInsights?: AudienceInsight[];
  hasAudienceExplorer?: boolean;
}

export interface CampaignPerformanceData {
  id: string;
  name: string;
  status: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  metrics: {
    reach: number;
    engagement: number;
    conversions: number;
    roi: number;
  };
  channels: string[];
  audiences: string[];
}

export interface AIConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIStreamCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export type AIStatus = 'idle' | 'thinking' | 'streaming' | 'error';
