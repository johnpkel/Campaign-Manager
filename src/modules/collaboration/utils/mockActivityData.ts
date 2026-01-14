import { Activity, Collaborator, ActivityType, Comment, CampaignInProgress } from '../types/collaboration';

const MOCK_COLLABORATORS: Collaborator[] = [
  { id: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@company.com', initials: 'SC', color: '#6366F1' },
  { id: 'user-2', name: 'Mike Johnson', email: 'mike.johnson@company.com', initials: 'MJ', color: '#EC4899' },
  { id: 'user-3', name: 'Emma Williams', email: 'emma.williams@company.com', initials: 'EW', color: '#10B981' },
  { id: 'user-4', name: 'Alex Rodriguez', email: 'alex.rodriguez@company.com', initials: 'AR', color: '#F59E0B' },
  { id: 'user-5', name: 'Jordan Lee', email: 'jordan.lee@company.com', initials: 'JL', color: '#8B5CF6' },
];

const CAMPAIGN_TITLES = [
  'Summer Sale 2024',
  'Product Launch Campaign',
  'Q4 Holiday Marketing',
  'Brand Awareness Drive',
  'Customer Retention Push',
  'New Year Promo',
];

const ACTIVITY_DESCRIPTIONS: Record<ActivityType, string[]> = {
  campaign_created: ['created a new campaign'],
  campaign_updated: ['updated the campaign', 'made changes to', 'revised'],
  campaign_status_changed: ['changed the status of', 'moved to review', 'approved'],
  comment_added: ['commented on', 'left feedback on', 'added notes to'],
  asset_uploaded: ['uploaded assets to', 'added new images to', 'updated media for'],
  milestone_completed: ['completed a milestone in', 'finished a phase of'],
  user_mentioned: ['mentioned you in'],
};

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTimeAgo(index: number): string {
  const now = new Date();
  const minutesAgo = [15, 30, 45, 90, 120, 180, 240, 360, 480, 720, 1440, 2880][index % 12];
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now.toISOString();
}

export function generateMockActivities(count: number = 10): Activity[] {
  const activities: Activity[] = [];
  const types: ActivityType[] = [
    'campaign_updated',
    'comment_added',
    'campaign_created',
    'asset_uploaded',
    'campaign_status_changed',
    'milestone_completed',
  ];

  for (let i = 0; i < count; i++) {
    const type = randomElement(types);
    const actor = randomElement(MOCK_COLLABORATORS);
    const targetTitle = randomElement(CAMPAIGN_TITLES);
    const description = randomElement(ACTIVITY_DESCRIPTIONS[type]);

    activities.push({
      id: `activity-${i + 1}`,
      type,
      actor,
      targetId: `campaign-${(i % 6) + 1}`,
      targetType: 'campaign',
      targetTitle,
      description: `${description} "${targetTitle}"`,
      timestamp: generateTimeAgo(i),
    });
  }

  return activities;
}

export function generateMockComments(campaignId: string, count: number = 5): Comment[] {
  const comments: Comment[] = [];
  const commentTexts = [
    'Looks great! Can we add more CTAs to the landing page?',
    'The visuals are on point. Let\'s make sure the copy matches the tone.',
    'I think we should target a younger demographic with this campaign.',
    'Budget allocation looks good. Moving forward with approval.',
    'Can we get the analytics report from last quarter to compare?',
    'The timeline might be tight. Let\'s discuss priorities.',
    'Love the creative direction! Small tweak on the headline needed.',
    'Great progress so far. Keep up the good work!',
  ];

  for (let i = 0; i < count; i++) {
    const author = randomElement(MOCK_COLLABORATORS);
    comments.push({
      id: `comment-${campaignId}-${i + 1}`,
      author,
      content: randomElement(commentTexts),
      campaignId,
      mentions: i % 3 === 0 ? [randomElement(MOCK_COLLABORATORS).id] : [],
      createdAt: generateTimeAgo(i),
      updatedAt: generateTimeAgo(i),
    });
  }

  return comments;
}

export function generateMockCampaignsInProgress(): CampaignInProgress[] {
  const statuses: Array<'draft' | 'in_review' | 'editing'> = ['draft', 'in_review', 'editing'];

  return CAMPAIGN_TITLES.slice(0, 4).map((title, index) => ({
    campaignId: `campaign-${index + 1}`,
    campaignTitle: title,
    status: statuses[index % 3],
    lastEditor: randomElement(MOCK_COLLABORATORS),
    lastEditedAt: generateTimeAgo(index),
    progress: 25 + Math.floor(Math.random() * 70),
  }));
}

export function getCollaborators(): Collaborator[] {
  return MOCK_COLLABORATORS;
}

export function getCollaboratorById(id: string): Collaborator | undefined {
  return MOCK_COLLABORATORS.find(c => c.id === id);
}
