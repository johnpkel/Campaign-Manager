// Wizard-specific types for the Campaign Wizard feature

// Saved campaign chat for resuming conversations
export interface SavedCampaignChat {
  id: string;
  title: string;
  lastMessage: string;
  currentStep: string;
  updatedAt: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  draftSummary?: {
    goals?: string;
    channels?: string[];
    audienceCount?: number;
  };
}

// Suggested audience with reach calculations
export interface SuggestedAudience {
  id: string;
  name: string;
  memberCount: number;
  percentOfTotal: number;
  matchScore: number;
  selected: boolean;
  description?: string;
}

// Audience reach insight
export interface AudienceReachInsight {
  totalUsers: number;
  percentOfTotalAudience: number;
  suggestedAudiences: SuggestedAudience[];
  isLoading: boolean;
}

// Recommended asset from Asset Manager
export interface RecommendedAsset {
  id: string;
  title: string;
  type: 'image' | 'video' | 'document';
  thumbnailUrl: string;
  relevanceScore: number;
  matchedKeywords: string[];
  selected: boolean;
}

// Recommended content from CMS
export interface RecommendedContent {
  entryUid: string;
  title: string;
  contentType: string;
  url?: string;
  imageUrl?: string;
  relevanceScore: number;
  matchReason: string;
  selected: boolean;
}

// Experiment type
export type ExperimentType = 'ab_test' | 'multi_armed_bandit' | 'personalization';

// Experiment suggestion for Personalize
export interface ExperimentSuggestion {
  id: string;
  type: ExperimentType;
  title: string;
  description: string;
  estimatedLift: string;
  confidence: 'high' | 'medium' | 'low';
  selected: boolean;
}

// Brand alignment issue
export interface BrandAlignmentIssue {
  type: 'color' | 'typography' | 'voice' | 'imagery' | 'tone';
  severity: 'warning' | 'error' | 'info';
  message: string;
}

// Brand Kit alignment insight
export interface BrandKitAlignmentInsight {
  selectedBrandKit: string | null;
  alignmentScore: number; // 0-100
  issues: BrandAlignmentIssue[];
  suggestions: string[];
  isLoading: boolean;
}

// Performance prediction
export interface PerformancePrediction {
  expectedReach: string;
  expectedEngagement: string;
  expectedConversions: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

// Suggested update for campaign improvement
export interface SuggestedUpdate {
  id: string;
  field: string;
  currentValue: string;
  suggestedValue: string;
  impact: 'high' | 'medium' | 'low';
  reason: string;
}

// Campaign score insight
export interface CampaignScoreInsight {
  overallScore: number; // 0-100
  performancePrediction: PerformancePrediction;
  suggestedUpdates: SuggestedUpdate[];
  strengthAreas: string[];
  improvementAreas: string[];
  isLoading: boolean;
}

// Combined wizard insights
export interface WizardInsights {
  audienceReach: AudienceReachInsight;
  recommendedAssets: RecommendedAsset[];
  recommendedContent: RecommendedContent[];
  experimentSuggestions: ExperimentSuggestion[];
  brandKitAlignment: BrandKitAlignmentInsight;
  campaignScore: CampaignScoreInsight;
  isCalculating: boolean;
}

// Initial empty insights state
export function getInitialInsights(): WizardInsights {
  return {
    audienceReach: {
      totalUsers: 0,
      percentOfTotalAudience: 0,
      suggestedAudiences: [],
      isLoading: true,
    },
    recommendedAssets: [],
    recommendedContent: [],
    experimentSuggestions: [],
    brandKitAlignment: {
      selectedBrandKit: null,
      alignmentScore: 0,
      issues: [],
      suggestions: [],
      isLoading: true,
    },
    campaignScore: {
      overallScore: 0,
      performancePrediction: {
        expectedReach: '—',
        expectedEngagement: '—',
        expectedConversions: '—',
        confidenceLevel: 'low',
      },
      suggestedUpdates: [],
      strengthAreas: [],
      improvementAreas: [],
      isLoading: true,
    },
    isCalculating: true,
  };
}

// Wizard step for tracking progress
export type WizardStep =
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
  | 'audience_page_recommendations'
  | 'variant_confirmation'
  | 'experimentation'
  | 'complete';

// Wizard state
export interface WizardState {
  isActive: boolean;
  currentStep: WizardStep;
  insights: WizardInsights;
  insightsPanelCollapsed: boolean;
}
