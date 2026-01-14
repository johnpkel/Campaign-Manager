export type ActivityType =
  | 'campaign_created'
  | 'campaign_updated'
  | 'campaign_status_changed'
  | 'comment_added'
  | 'asset_uploaded'
  | 'milestone_completed'
  | 'user_mentioned';

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  color: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  actor: Collaborator;
  targetId: string;
  targetType: 'campaign' | 'asset' | 'comment';
  targetTitle: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface Comment {
  id: string;
  author: Collaborator;
  content: string;
  campaignId: string;
  parentId?: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignInProgress {
  campaignId: string;
  campaignTitle: string;
  status: 'draft' | 'in_review' | 'editing';
  lastEditor: Collaborator;
  lastEditedAt: string;
  progress: number;
}
