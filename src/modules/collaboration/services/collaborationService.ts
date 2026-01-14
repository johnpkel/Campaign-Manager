import { Activity, Comment, CampaignInProgress, Collaborator, ActivityType } from '../types/collaboration';
import {
  generateMockActivities,
  generateMockComments,
  generateMockCampaignsInProgress,
  getCollaborators,
} from '../utils/mockActivityData';

const STORAGE_KEYS = {
  ACTIVITIES: 'collaboration_activities',
  COMMENTS: 'collaboration_comments',
  CAMPAIGNS_IN_PROGRESS: 'collaboration_campaigns_in_progress',
};

export interface CollaborationService {
  getActivities(): Promise<Activity[]>;
  addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity>;
  getComments(campaignId: string): Promise<Comment[]>;
  addComment(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment>;
  getCampaignsInProgress(): Promise<CampaignInProgress[]>;
  getCollaborators(): Promise<Collaborator[]>;
}

export class LocalStorageCollaborationService implements CollaborationService {
  private initialized = false;

  private initializeIfNeeded(): void {
    if (this.initialized) return;

    // Seed with mock data if empty
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      const activities = generateMockActivities(15);
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS_IN_PROGRESS)) {
      const campaigns = generateMockCampaignsInProgress();
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS_IN_PROGRESS, JSON.stringify(campaigns));
    }

    this.initialized = true;
  }

  async getActivities(): Promise<Activity[]> {
    this.initializeIfNeeded();
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : [];
  }

  async addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    this.initializeIfNeeded();
    const activities = await this.getActivities();

    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    activities.unshift(newActivity);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities.slice(0, 50)));

    return newActivity;
  }

  async getComments(campaignId: string): Promise<Comment[]> {
    this.initializeIfNeeded();
    const key = `${STORAGE_KEYS.COMMENTS}_${campaignId}`;
    let data = localStorage.getItem(key);

    // Generate mock comments if none exist for this campaign
    if (!data) {
      const comments = generateMockComments(campaignId, 5);
      localStorage.setItem(key, JSON.stringify(comments));
      data = JSON.stringify(comments);
    }

    return JSON.parse(data);
  }

  async addComment(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    this.initializeIfNeeded();
    const key = `${STORAGE_KEYS.COMMENTS}_${comment.campaignId}`;
    const comments = await this.getComments(comment.campaignId);

    const now = new Date().toISOString();
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    comments.unshift(newComment);
    localStorage.setItem(key, JSON.stringify(comments));

    // Also add activity for the comment
    await this.addActivity({
      type: 'comment_added',
      actor: comment.author,
      targetId: comment.campaignId,
      targetType: 'comment',
      targetTitle: `Comment on campaign`,
      description: `commented on a campaign`,
    });

    return newComment;
  }

  async getCampaignsInProgress(): Promise<CampaignInProgress[]> {
    this.initializeIfNeeded();
    const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS_IN_PROGRESS);
    return data ? JSON.parse(data) : [];
  }

  async getCollaborators(): Promise<Collaborator[]> {
    return getCollaborators();
  }

  // Helper method to log campaign activities
  async logCampaignActivity(
    type: ActivityType,
    actor: Collaborator,
    campaignId: string,
    campaignTitle: string,
    description?: string
  ): Promise<Activity> {
    const defaultDescriptions: Record<ActivityType, string> = {
      campaign_created: `created "${campaignTitle}"`,
      campaign_updated: `updated "${campaignTitle}"`,
      campaign_status_changed: `changed status of "${campaignTitle}"`,
      comment_added: `commented on "${campaignTitle}"`,
      asset_uploaded: `uploaded assets to "${campaignTitle}"`,
      milestone_completed: `completed a milestone in "${campaignTitle}"`,
      user_mentioned: `mentioned you in "${campaignTitle}"`,
    };

    return this.addActivity({
      type,
      actor,
      targetId: campaignId,
      targetType: 'campaign',
      targetTitle: campaignTitle,
      description: description || defaultDescriptions[type],
    });
  }
}

// Singleton instance
let serviceInstance: CollaborationService | null = null;

export function getCollaborationService(): CollaborationService {
  if (!serviceInstance) {
    serviceInstance = new LocalStorageCollaborationService();
  }
  return serviceInstance;
}
