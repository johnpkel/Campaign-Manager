import {
  AIMessage,
  CampaignRecommendation,
  CampaignCreationStep,
  CampaignDraft,
  AIContext,
} from '../types/ai';
import {
  createAudienceInsightService,
  generateMockCampaignPerformance,
} from './audienceInsightService';

const MOCK_BRAND_KITS = [
  { id: 'bk-1', name: 'Primary Brand' },
  { id: 'bk-2', name: 'Product Line A' },
  { id: 'bk-3', name: 'Holiday Theme' },
  { id: 'bk-4', name: 'Minimal Clean' },
];

const MOCK_CONTRIBUTORS = [
  { id: 'user-1', name: 'Sarah Chen', role: 'Marketing Manager' },
  { id: 'user-2', name: 'Mike Johnson', role: 'Content Lead' },
  { id: 'user-3', name: 'Emma Wilson', role: 'Design Director' },
  { id: 'user-4', name: 'Alex Rivera', role: 'Analytics Lead' },
];

export interface CampaignCreationState {
  isActive: boolean;
  currentStep: CampaignCreationStep;
  draft: Partial<CampaignDraft>;
  recommendations: CampaignRecommendation[];
  selectedRecommendation?: CampaignRecommendation;
}

export function getInitialCampaignCreationState(): CampaignCreationState {
  return {
    isActive: false,
    currentStep: 'recommendations',
    draft: {},
    recommendations: [],
  };
}

export function detectCampaignCreationIntent(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('create') &&
    (lowerMessage.includes('campaign') || lowerMessage.includes('new campaign')) ||
    lowerMessage.includes('help me create') ||
    lowerMessage.includes('start a new campaign') ||
    lowerMessage.includes('guide me through')
  );
}

export async function generateCampaignRecommendations(
  context?: AIContext
): Promise<{ recommendations: CampaignRecommendation[]; message: string }> {
  const audienceService = createAudienceInsightService(context?.hasAudienceExplorer ?? true);
  const campaigns = context?.campaigns || generateMockCampaignPerformance();
  const insights = await audienceService.getAudienceInsights();

  const recommendations = audienceService.generateRecommendations(campaigns, insights);

  const hasAudienceExplorer = audienceService.isAvailable();

  let message = `I've analyzed your data and have some campaign recommendations for you!\n\n`;

  // Group recommendations by type
  const performanceBased = recommendations.filter(r => r.type === 'performance-based');
  const audienceBased = recommendations.filter(r => r.type === 'audience-insight');
  const trendBased = recommendations.filter(r => r.type === 'trend-based');

  if (performanceBased.length > 0) {
    message += `**Based on Your Campaign Performance:**\n`;
    performanceBased.forEach((rec, i) => {
      message += `${i + 1}. **${rec.title}** - ${rec.description}\n`;
      message += `   _${rec.rationale}_\n\n`;
    });
  }

  if (audienceBased.length > 0 && hasAudienceExplorer) {
    message += `**From Audience Insight Explorer:**\n`;
    audienceBased.forEach((rec, i) => {
      message += `${performanceBased.length + i + 1}. **${rec.title}** - ${rec.description}\n`;
      message += `   _${rec.rationale}_\n\n`;
    });
  }

  if (trendBased.length > 0) {
    message += `**Based on Industry Trends:**\n`;
    trendBased.forEach((rec, i) => {
      const num = performanceBased.length + audienceBased.length + i + 1;
      message += `${num}. **${rec.title}** - ${rec.description}\n`;
      if (rec.sourceData?.newsSource) {
        message += `   _Source: ${rec.sourceData.newsSource}_\n\n`;
      }
    });
  }

  message += `\nSelect one of these recommendations or tell me your own campaign idea, and I'll guide you through creating it step by step.`;

  return { recommendations, message };
}

const STEP_QUESTIONS: Record<CampaignCreationStep, (draft: Partial<CampaignDraft>, rec?: CampaignRecommendation) => string> = {
  recommendations: () => '', // Handled separately

  title: (_draft, rec) => {
    let msg = `Let's start with the basics.\n\n**What would you like to name this campaign?**\n\n`;
    if (rec) {
      msg += `Based on your selection, I'd suggest something like:\n`;
      msg += `- "${rec.title} - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}"\n`;
      msg += `- "${rec.title} Initiative"\n\n`;
    }
    msg += `Or enter your own title.`;
    return msg;
  },

  key_messages: (draft) => {
    return `Great choice: **"${draft.title}"**\n\n**What are the key messages and themes for this campaign?**\n\nDescribe the main value propositions, taglines, or messaging pillars you want to communicate. For example:\n- Core value proposition\n- Supporting messages\n- Call-to-action themes`;
  },

  goals: (_draft) => {
    return `**What are the goals for this campaign?**\n\nWhat do you want to achieve? Consider:\n- Awareness goals (reach, impressions)\n- Engagement goals (clicks, interactions)\n- Conversion goals (sign-ups, purchases)\n- Revenue targets\n\nBe as specific as you can with metrics and targets.`;
  },

  audiences: (_draft, rec) => {
    let msg = `**Who is this campaign targeting?**\n\n`;
    if (rec?.suggestedAudiences && rec.suggestedAudiences.length > 0) {
      msg += `Based on your selection, I'd recommend targeting:\n`;
      rec.suggestedAudiences.forEach(a => {
        msg += `- ${a}\n`;
      });
      msg += `\nYou can use these or specify your own target audiences.`;
    } else {
      msg += `Describe your target audience segments. Consider:\n`;
      msg += `- Demographics\n- Behavioral characteristics\n- Customer lifecycle stage`;
    }
    return msg;
  },

  dates: (_draft) => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return `**When should this campaign run?**\n\nProvide start and end dates. For example:\n- Start: ${nextWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n- End: ${nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\nYou can say something like "Start next Monday, run for 6 weeks" or provide specific dates.`;
  },

  contributors: () => {
    let msg = `**Who will be working on this campaign?**\n\nAvailable team members:\n`;
    MOCK_CONTRIBUTORS.forEach(c => {
      msg += `- **${c.name}** (${c.role})\n`;
    });
    msg += `\nList the contributors by name, or say "skip" to add them later.`;
    return msg;
  },

  budget: (_draft, rec) => {
    let msg = `**What's the budget for this campaign?**\n\n`;
    if (rec?.estimatedBudget) {
      msg += `Based on similar campaigns, I'd recommend: **${rec.estimatedBudget}**\n\n`;
    }
    msg += `Enter a specific amount or range (e.g., "$15,000" or "$10K-20K").`;
    return msg;
  },

  channels: (_draft, rec) => {
    let msg = `**Which channels will this campaign use?**\n\nAvailable channels:\n`;
    msg += `- **Web** - Website and landing pages\n`;
    msg += `- **Email** - Email marketing campaigns\n`;
    msg += `- **Social** - Social media platforms\n`;
    msg += `- **Native Mobile** - Mobile app experiences\n`;
    msg += `- **Ads** - Paid advertising\n\n`;

    if (rec?.suggestedChannels && rec.suggestedChannels.length > 0) {
      msg += `Recommended based on your selection: **${rec.suggestedChannels.join(', ')}**\n\n`;
    }
    msg += `List the channels you want to use (e.g., "Web, Email, Social").`;
    return msg;
  },

  market_research: () => {
    return `**Do you have any market research to link to this campaign?**\n\nYou can:\n- Paste a link to research documents\n- Describe key findings to reference\n- Say "skip" to continue without\n\nThis helps maintain context for the campaign strategy.`;
  },

  brand_kit: () => {
    let msg = `**Which Brand Kit should be used for this campaign?**\n\nAvailable Brand Kits:\n`;
    MOCK_BRAND_KITS.forEach(bk => {
      msg += `- **${bk.name}**\n`;
    });
    msg += `\nSelect one or say "skip" to choose later.`;
    return msg;
  },

  review: (draft) => {
    let msg = `**Here's your campaign summary:**\n\n`;
    msg += `**Title:** ${draft.title || 'Not set'}\n`;
    msg += `**Key Messages:** ${draft.keyMessages || 'Not set'}\n`;
    msg += `**Goals:** ${draft.goals || 'Not set'}\n`;
    msg += `**Audiences:** ${draft.audiences?.join(', ') || 'Not set'}\n`;
    msg += `**Dates:** ${draft.startDate || 'TBD'} to ${draft.endDate || 'TBD'}\n`;
    msg += `**Contributors:** ${draft.contributors?.join(', ') || 'None assigned'}\n`;
    msg += `**Budget:** ${draft.budget || 'Not set'}\n`;
    msg += `**Channels:** ${draft.channels?.join(', ') || 'Not set'}\n`;
    msg += `**Market Research:** ${draft.marketResearch || 'None linked'}\n`;
    msg += `**Brand Kit:** ${draft.brandKit || 'Not selected'}\n\n`;
    msg += `Does this look correct? Say **"Create campaign"** to finalize, or tell me what you'd like to change.`;
    return msg;
  },

  complete: (draft) => {
    return `**Campaign "${draft.title}" has been created!**\n\nYour new campaign is now set up and ready to go. You can:\n- View it in the Campaign Manager\n- Start adding content and assets\n- Invite team members to collaborate\n\nIs there anything else you'd like help with?`;
  },
};

const STEP_ORDER: CampaignCreationStep[] = [
  'recommendations',
  'title',
  'key_messages',
  'goals',
  'audiences',
  'dates',
  'contributors',
  'budget',
  'channels',
  'market_research',
  'brand_kit',
  'review',
  'complete',
];

export function getNextStep(currentStep: CampaignCreationStep): CampaignCreationStep {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex < STEP_ORDER.length - 1) {
    return STEP_ORDER[currentIndex + 1];
  }
  return 'complete';
}

export function getStepQuestion(
  step: CampaignCreationStep,
  draft: Partial<CampaignDraft>,
  recommendation?: CampaignRecommendation
): string {
  return STEP_QUESTIONS[step](draft, recommendation);
}

export function parseUserResponse(
  step: CampaignCreationStep,
  userMessage: string,
  currentDraft: Partial<CampaignDraft>
): { draft: Partial<CampaignDraft>; isValid: boolean; errorMessage?: string } {
  const draft = { ...currentDraft };
  const message = userMessage.trim();
  const lowerMessage = message.toLowerCase();

  // Handle skip for optional fields
  if (lowerMessage === 'skip' || lowerMessage === 'none') {
    return { draft, isValid: true };
  }

  switch (step) {
    case 'title':
      if (message.length < 3) {
        return { draft, isValid: false, errorMessage: 'Please provide a campaign title (at least 3 characters).' };
      }
      draft.title = message;
      break;

    case 'key_messages':
      draft.keyMessages = message;
      break;

    case 'goals':
      draft.goals = message;
      break;

    case 'audiences':
      draft.audiences = message.split(',').map(a => a.trim()).filter(a => a.length > 0);
      break;

    case 'dates': {
      // Simple date parsing - in production this would be more sophisticated
      const dateMatch = message.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g);
      if (dateMatch && dateMatch.length >= 2) {
        draft.startDate = dateMatch[0];
        draft.endDate = dateMatch[1];
      } else {
        // Try to parse natural language dates
        const today = new Date();
        if (lowerMessage.includes('next week')) {
          draft.startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
        }
        if (lowerMessage.includes('month') || lowerMessage.includes('4 weeks') || lowerMessage.includes('6 weeks')) {
          const weeks = lowerMessage.includes('6 weeks') ? 6 : 4;
          draft.endDate = new Date(today.getTime() + weeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
        }
        if (!draft.startDate) {
          draft.startDate = message;
        }
        if (!draft.endDate) {
          draft.endDate = 'TBD';
        }
      }
      break;
    }

    case 'contributors':
      draft.contributors = message.split(',').map(c => c.trim()).filter(c => c.length > 0);
      break;

    case 'budget':
      draft.budget = message.replace(/[^\d$,.\-kKmM\s]/g, '');
      break;

    case 'channels':
      draft.channels = message.split(',').map(c => c.trim()).filter(c => c.length > 0);
      break;

    case 'market_research':
      draft.marketResearch = message;
      break;

    case 'brand_kit':
      draft.brandKit = message;
      break;

    case 'review':
      // Handle confirmation or changes
      break;
  }

  return { draft, isValid: true };
}

export function processRecommendationSelection(
  userMessage: string,
  recommendations: CampaignRecommendation[]
): { selectedRecommendation?: CampaignRecommendation; isCustom: boolean } {
  const lowerMessage = userMessage.toLowerCase();

  // Check for number selection (1, 2, 3, etc.)
  const numberMatch = lowerMessage.match(/^(\d+)/);
  if (numberMatch) {
    const index = parseInt(numberMatch[1]) - 1;
    if (index >= 0 && index < recommendations.length) {
      return { selectedRecommendation: recommendations[index], isCustom: false };
    }
  }

  // Check for recommendation title match
  for (const rec of recommendations) {
    if (lowerMessage.includes(rec.title.toLowerCase().substring(0, 20))) {
      return { selectedRecommendation: rec, isCustom: false };
    }
  }

  // Check for keywords indicating they want to use a recommendation
  if (lowerMessage.includes('first') || lowerMessage.includes('option 1')) {
    return { selectedRecommendation: recommendations[0], isCustom: false };
  }
  if (lowerMessage.includes('second') || lowerMessage.includes('option 2')) {
    return { selectedRecommendation: recommendations[1], isCustom: false };
  }

  // Default to custom campaign
  return { selectedRecommendation: undefined, isCustom: true };
}

export function createCampaignCreationMessage(
  content: string,
  step: CampaignCreationStep,
  recommendations?: CampaignRecommendation[],
  draft?: Partial<CampaignDraft>
): AIMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    metadata: {
      type: step === 'recommendations' ? 'recommendation' : 'question',
      recommendations,
      questionType: step,
      campaignDraft: draft,
    },
  };
}
