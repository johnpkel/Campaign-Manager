import { CampaignScoreInsight, SuggestedUpdate, PerformancePrediction } from '../types';
import { CampaignDraft } from '../../ai/types/ai';

// Scoring weights for different aspects
const SCORING_WEIGHTS = {
  title: 10,
  keyMessages: 15,
  goals: 20,
  audiences: 15,
  channels: 10,
  budget: 10,
  dates: 5,
  brandKit: 15,
};

// Calculate individual component scores
function calculateComponentScores(draft: Partial<CampaignDraft>): Record<string, number> {
  const scores: Record<string, number> = {};

  // Title score (0-10)
  if (draft.title) {
    const titleLength = draft.title.length;
    if (titleLength >= 20 && titleLength <= 60) {
      scores.title = 10;
    } else if (titleLength >= 10) {
      scores.title = 7;
    } else {
      scores.title = 4;
    }
  } else {
    scores.title = 0;
  }

  // Key messages score (0-15)
  if (draft.keyMessages) {
    const messageLength = draft.keyMessages.length;
    if (messageLength >= 100) {
      scores.keyMessages = 15;
    } else if (messageLength >= 50) {
      scores.keyMessages = 10;
    } else {
      scores.keyMessages = 5;
    }
  } else {
    scores.keyMessages = 0;
  }

  // Goals score (0-20) - bonus for specific metrics
  if (draft.goals) {
    const hasNumbers = /\d+/.test(draft.goals);
    const hasPercentage = /%/.test(draft.goals);
    const goalLength = draft.goals.length;

    let goalScore = 0;
    if (goalLength >= 50) goalScore += 10;
    else if (goalLength >= 20) goalScore += 5;
    if (hasNumbers) goalScore += 5;
    if (hasPercentage) goalScore += 5;

    scores.goals = Math.min(goalScore, 20);
  } else {
    scores.goals = 0;
  }

  // Audiences score (0-15)
  if (draft.audiences && draft.audiences.length > 0) {
    if (draft.audiences.length >= 3) {
      scores.audiences = 15;
    } else if (draft.audiences.length >= 2) {
      scores.audiences = 12;
    } else {
      scores.audiences = 8;
    }
  } else {
    scores.audiences = 0;
  }

  // Channels score (0-10)
  if (draft.channels && draft.channels.length > 0) {
    if (draft.channels.length >= 3) {
      scores.channels = 10;
    } else if (draft.channels.length >= 2) {
      scores.channels = 8;
    } else {
      scores.channels = 5;
    }
  } else {
    scores.channels = 0;
  }

  // Budget score (0-10)
  if (draft.budget) {
    const budgetMatch = draft.budget.match(/\$?([\d,]+)/);
    if (budgetMatch) {
      const budgetValue = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
      if (budgetValue >= 10000) {
        scores.budget = 10;
      } else if (budgetValue >= 5000) {
        scores.budget = 8;
      } else {
        scores.budget = 5;
      }
    } else {
      scores.budget = 3;
    }
  } else {
    scores.budget = 0;
  }

  // Dates score (0-5)
  if (draft.startDate && draft.endDate) {
    scores.dates = 5;
  } else if (draft.startDate || draft.endDate) {
    scores.dates = 2;
  } else {
    scores.dates = 0;
  }

  // Brand kit score (0-15)
  if (draft.brandKit) {
    scores.brandKit = 15;
  } else {
    scores.brandKit = 0;
  }

  return scores;
}

// Generate suggested updates based on weak areas
function generateSuggestedUpdates(draft: Partial<CampaignDraft>, scores: Record<string, number>): SuggestedUpdate[] {
  const updates: SuggestedUpdate[] = [];

  if (scores.title < SCORING_WEIGHTS.title * 0.7) {
    updates.push({
      id: 'update_title',
      field: 'Title',
      currentValue: draft.title || '(not set)',
      suggestedValue: 'Use a descriptive title between 20-60 characters',
      impact: 'medium',
      reason: 'Clear, descriptive titles improve campaign tracking and team alignment',
    });
  }

  if (scores.goals < SCORING_WEIGHTS.goals * 0.7) {
    updates.push({
      id: 'update_goals',
      field: 'Goals',
      currentValue: draft.goals?.slice(0, 50) || '(not set)',
      suggestedValue: 'Add specific, measurable goals (e.g., "Increase conversions by 25%")',
      impact: 'high',
      reason: 'Measurable goals enable better performance tracking and optimization',
    });
  }

  if (scores.audiences < SCORING_WEIGHTS.audiences * 0.7) {
    updates.push({
      id: 'update_audiences',
      field: 'Audiences',
      currentValue: `${draft.audiences?.length || 0} selected`,
      suggestedValue: 'Select 2-3 targeted audience segments for better reach',
      impact: 'high',
      reason: 'Multiple audience segments allow for personalization and A/B testing',
    });
  }

  if (!draft.brandKit) {
    updates.push({
      id: 'update_brand',
      field: 'Brand Kit',
      currentValue: '(not selected)',
      suggestedValue: 'Select a Brand Kit for consistent messaging',
      impact: 'medium',
      reason: 'Brand consistency improves recognition and trust',
    });
  }

  return updates.slice(0, 4);
}

// Calculate performance prediction based on campaign completeness
function calculatePerformancePrediction(draft: Partial<CampaignDraft>, overallScore: number): PerformancePrediction {
  let confidenceLevel: 'high' | 'medium' | 'low' = 'low';

  if (overallScore >= 80) {
    confidenceLevel = 'high';
  } else if (overallScore >= 50) {
    confidenceLevel = 'medium';
  }

  // Calculate reach based on audiences
  const audienceCount = draft.audiences?.length || 0;
  const baseReach = 10000;
  const expectedReach = audienceCount > 0
    ? `${((baseReach * audienceCount * (overallScore / 100)) / 1000).toFixed(0)}K - ${((baseReach * audienceCount * 2 * (overallScore / 100)) / 1000).toFixed(0)}K`
    : '—';

  // Calculate engagement based on channels and content
  const channelCount = draft.channels?.length || 0;
  const hasGoodContent = (draft.keyMessages?.length || 0) > 50;
  const engagementMultiplier = hasGoodContent ? 1.5 : 1;
  const expectedEngagement = channelCount > 0
    ? `${(2 + channelCount * engagementMultiplier).toFixed(1)}% - ${(4 + channelCount * 2 * engagementMultiplier).toFixed(1)}%`
    : '—';

  // Calculate conversions
  const hasGoals = (draft.goals?.length || 0) > 20;
  const expectedConversions = hasGoals && audienceCount > 0
    ? `${(500 * audienceCount * (overallScore / 100)).toFixed(0)} - ${(1500 * audienceCount * (overallScore / 100)).toFixed(0)}`
    : '—';

  return {
    expectedReach,
    expectedEngagement,
    expectedConversions,
    confidenceLevel,
  };
}

// Identify strength and improvement areas
function identifyAreas(scores: Record<string, number>): { strengths: string[]; improvements: string[] } {
  const strengths: string[] = [];
  const improvements: string[] = [];

  const areaLabels: Record<string, string> = {
    title: 'Campaign naming',
    keyMessages: 'Key messaging',
    goals: 'Goal definition',
    audiences: 'Audience targeting',
    channels: 'Channel strategy',
    budget: 'Budget planning',
    dates: 'Timeline planning',
    brandKit: 'Brand consistency',
  };

  for (const [key, score] of Object.entries(scores)) {
    const weight = SCORING_WEIGHTS[key as keyof typeof SCORING_WEIGHTS] || 10;
    const percentage = (score / weight) * 100;

    if (percentage >= 80) {
      strengths.push(areaLabels[key]);
    } else if (percentage < 50) {
      improvements.push(areaLabels[key]);
    }
  }

  return { strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 3) };
}

// Calculate overall campaign score
export async function calculateCampaignScore(draft: Partial<CampaignDraft>): Promise<CampaignScoreInsight> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const componentScores = calculateComponentScores(draft);
  const overallScore = Object.values(componentScores).reduce((sum, score) => sum + score, 0);
  const suggestedUpdates = generateSuggestedUpdates(draft, componentScores);
  const performancePrediction = calculatePerformancePrediction(draft, overallScore);
  const { strengths, improvements } = identifyAreas(componentScores);

  return {
    overallScore,
    performancePrediction,
    suggestedUpdates,
    strengthAreas: strengths,
    improvementAreas: improvements,
    isLoading: false,
  };
}
