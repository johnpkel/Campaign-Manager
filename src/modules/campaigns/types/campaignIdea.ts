export type IdeaUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface CampaignIdea {
  uid: string;
  key_question: string;
  description: string;
  requester: string;
  urgency: IdeaUrgency;
  potential_opportunity: string;
  insights: string;
  source: 'slack' | 'manual';
  created_at: string;
  updated_at: string;
}

export const URGENCY_LABELS: Record<IdeaUrgency, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const URGENCY_COLORS: Record<IdeaUrgency, string> = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

// Mock campaign ideas data
export const MOCK_CAMPAIGN_IDEAS: CampaignIdea[] = [
  {
    uid: 'idea_001',
    key_question: 'How can we capture the growing interest in sustainable products?',
    description: 'Multiple customers have been asking about eco-friendly options and our competitors are launching green product lines.',
    requester: 'Sarah Chen',
    urgency: 'high',
    potential_opportunity: '$2.5M incremental revenue based on market research showing 40% of millennials prefer sustainable brands',
    insights: 'Lytics data shows 15% increase in searches for "sustainable" and "eco-friendly" on our site over past 3 months',
    source: 'slack',
    created_at: '2026-01-12T14:30:00Z',
    updated_at: '2026-01-12T14:30:00Z',
  },
  {
    uid: 'idea_002',
    key_question: 'Should we run a Valentine\'s Day campaign for our premium gift collection?',
    description: 'Our premium gift items performed well during Black Friday. Valentine\'s Day could be an opportunity to target gift-givers again.',
    requester: 'Mike Rodriguez',
    urgency: 'critical',
    potential_opportunity: '$800K projected based on last year\'s Valentine\'s performance + 20% growth target',
    insights: 'Email open rates for gift-related content are 35% higher than average. Top audience segment: "Gift Shoppers" with 45K members',
    source: 'slack',
    created_at: '2026-01-10T09:15:00Z',
    updated_at: '2026-01-11T16:45:00Z',
  },
  {
    uid: 'idea_003',
    key_question: 'Can we leverage the new product launch for a referral campaign?',
    description: 'The Smart Home Hub launch is getting great early reviews. A referral program could amplify word-of-mouth.',
    requester: 'Emma Thompson',
    urgency: 'medium',
    potential_opportunity: '25% lower CAC through referrals vs paid acquisition, potential 5,000 new customers',
    insights: 'NPS score for early adopters is 72. Brand Advocates segment shows high social sharing behavior.',
    source: 'manual',
    created_at: '2026-01-08T11:00:00Z',
    updated_at: '2026-01-08T11:00:00Z',
  },
  {
    uid: 'idea_004',
    key_question: 'What\'s our strategy for the upcoming industry trade show?',
    description: 'TechConnect 2026 is in March. We need to decide on booth presence, speaking opportunities, and pre/post event campaigns.',
    requester: 'David Park',
    urgency: 'medium',
    potential_opportunity: '150+ qualified B2B leads based on last year. Enterprise segment engagement opportunity.',
    insights: 'Competitor analysis shows 3 major competitors will have presence. Our "Enterprise Decision Makers" audience has grown 28%.',
    source: 'slack',
    created_at: '2026-01-05T15:20:00Z',
    updated_at: '2026-01-07T10:30:00Z',
  },
  {
    uid: 'idea_005',
    key_question: 'Should we create localized campaigns for the APAC market expansion?',
    description: 'With the upcoming APAC launch, we need to consider cultural nuances and local market preferences.',
    requester: 'Lisa Wang',
    urgency: 'low',
    potential_opportunity: 'New market entry: $5M first-year target. Japan and Australia initial focus.',
    insights: 'Web analytics show 12% of traffic already from APAC region with high engagement rates.',
    source: 'manual',
    created_at: '2026-01-03T08:45:00Z',
    updated_at: '2026-01-03T08:45:00Z',
  },
];
