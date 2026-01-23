import { WizardInsights, AudienceReachInsight, ExperimentSuggestion, getInitialInsights } from '../types';
import { CampaignDraft } from '../../ai/types/ai';
import { getRecommendedAssets } from './assetRecommendationService';
import { getRecommendedContent } from './contentRecommendationService';
import { calculateBrandAlignment } from './brandAlignmentService';
import { calculateCampaignScore } from './campaignScoringService';

// Mock Lytics audiences (reusing from campaignCreationService)
const MOCK_LYTICS_AUDIENCES = [
  { id: 'aud_001', name: 'High-Intent Shoppers', memberCount: 45230, description: 'Users who viewed 3+ products in the last 7 days' },
  { id: 'aud_002', name: 'Newsletter Subscribers', memberCount: 128450, description: 'Active email subscribers with 40%+ open rate' },
  { id: 'aud_003', name: 'Returning Customers', memberCount: 32100, description: 'Customers with 2+ purchases in the last 90 days' },
  { id: 'aud_004', name: 'Mobile App Users', memberCount: 67800, description: 'Users who have engaged with the mobile app' },
  { id: 'aud_005', name: 'Social Media Engagers', memberCount: 89200, description: 'Users who clicked from social media campaigns' },
  { id: 'aud_006', name: 'Cart Abandoners', memberCount: 23400, description: 'Users who added items but did not purchase' },
  { id: 'aud_007', name: 'First-Time Visitors', memberCount: 156700, description: 'New users in the last 30 days' },
];

// Total platform users for percentage calculations
const TOTAL_PLATFORM_USERS = 500000;

// Calculate audience match score based on campaign
function calculateAudienceMatchScore(
  audience: typeof MOCK_LYTICS_AUDIENCES[0],
  draft: Partial<CampaignDraft>
): number {
  let score = 50; // Base score

  // Boost score based on channel alignment
  if (draft.channels?.includes('Email') && audience.name.includes('Newsletter')) {
    score += 30;
  }
  if (draft.channels?.includes('Native Mobile') && audience.name.includes('Mobile')) {
    score += 25;
  }
  if (draft.channels?.includes('Social') && audience.name.includes('Social')) {
    score += 25;
  }

  // Boost score based on goals
  if (draft.goals) {
    const goalsLower = draft.goals.toLowerCase();
    if (goalsLower.includes('conversion') && audience.name.includes('High-Intent')) {
      score += 20;
    }
    if (goalsLower.includes('retention') && audience.name.includes('Returning')) {
      score += 20;
    }
    if (goalsLower.includes('awareness') && audience.name.includes('First-Time')) {
      score += 15;
    }
  }

  return Math.min(score, 100);
}

// Calculate audience reach insight
async function calculateAudienceReach(draft: Partial<CampaignDraft>): Promise<AudienceReachInsight> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const scoredAudiences = MOCK_LYTICS_AUDIENCES.map(aud => ({
    id: aud.id,
    name: aud.name,
    memberCount: aud.memberCount,
    percentOfTotal: (aud.memberCount / TOTAL_PLATFORM_USERS) * 100,
    matchScore: calculateAudienceMatchScore(aud, draft),
    selected: false,
    description: aud.description,
  }));

  // Sort by match score
  const sortedAudiences = scoredAudiences.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

  // Calculate total potential reach
  const totalUsers = sortedAudiences.reduce((sum, aud) => sum + aud.memberCount, 0);
  const percentOfTotalAudience = (totalUsers / TOTAL_PLATFORM_USERS) * 100;

  return {
    totalUsers,
    percentOfTotalAudience,
    suggestedAudiences: sortedAudiences,
    isLoading: false,
  };
}

// Generate experiment suggestions
async function generateExperimentSuggestions(draft: Partial<CampaignDraft>): Promise<ExperimentSuggestion[]> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const suggestions: ExperimentSuggestion[] = [];
  const audienceCount = draft.audiences?.length || 0;
  const channelCount = draft.channels?.length || 0;

  // Multi-armed bandit for multiple audiences
  if (audienceCount >= 2) {
    suggestions.push({
      id: 'exp_001',
      type: 'multi_armed_bandit',
      title: 'Multi-Armed Bandit Testing',
      description: `Automatically optimize content delivery across your ${audienceCount} audience segments`,
      estimatedLift: '+15-25%',
      confidence: 'high',
      selected: false,
    });
  }

  // A/B test for different channels
  if (channelCount >= 2) {
    suggestions.push({
      id: 'exp_002',
      type: 'ab_test',
      title: 'Channel-Specific A/B Test',
      description: 'Test different messaging variations across your selected channels',
      estimatedLift: '+10-20%',
      confidence: 'medium',
      selected: false,
    });
  }

  // Personalization based on key messages
  if (draft.keyMessages && draft.keyMessages.length > 50) {
    suggestions.push({
      id: 'exp_003',
      type: 'personalization',
      title: 'Dynamic Content Personalization',
      description: 'Personalize key messages based on user behavior and preferences',
      estimatedLift: '+20-35%',
      confidence: audienceCount > 0 ? 'high' : 'medium',
      selected: false,
    });
  }

  // Default suggestion if none match
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'exp_default',
      type: 'ab_test',
      title: 'Basic A/B Testing',
      description: 'Test two variations of your campaign to identify the best performer',
      estimatedLift: '+5-15%',
      confidence: 'low',
      selected: false,
    });
  }

  return suggestions;
}

// Calculate all insights in parallel
export async function calculateAllInsights(draft: Partial<CampaignDraft>): Promise<WizardInsights> {
  const [
    audienceReach,
    recommendedAssets,
    recommendedContent,
    experimentSuggestions,
    brandKitAlignment,
    campaignScore,
  ] = await Promise.all([
    calculateAudienceReach(draft),
    getRecommendedAssets(draft),
    getRecommendedContent(draft),
    generateExperimentSuggestions(draft),
    calculateBrandAlignment(draft),
    calculateCampaignScore(draft),
  ]);

  return {
    audienceReach,
    recommendedAssets,
    recommendedContent,
    experimentSuggestions,
    brandKitAlignment,
    campaignScore,
    isCalculating: false,
  };
}

// Export initial insights state
export { getInitialInsights };
