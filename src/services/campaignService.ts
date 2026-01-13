import { Campaign, CampaignFormData } from '../types';
import { MOCK_CAMPAIGNS } from '../utils/sampleData';

const CONTENT_TYPE_UID = 'cs_campaign_manager';

export interface ICampaignService {
  fetchCampaigns(): Promise<Campaign[]>;
  fetchCampaign(uid: string): Promise<Campaign | null>;
  createCampaign(data: CampaignFormData): Promise<Campaign>;
  updateCampaign(uid: string, data: Partial<CampaignFormData>): Promise<Campaign>;
  deleteCampaign(uid: string): Promise<boolean>;
}

// Mock implementation for standalone development mode
export class MockCampaignService implements ICampaignService {
  private campaigns: Campaign[] = [...MOCK_CAMPAIGNS];

  async fetchCampaigns(): Promise<Campaign[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...this.campaigns];
  }

  async fetchCampaign(uid: string): Promise<Campaign | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.campaigns.find((c) => c.uid === uid) || null;
  }

  async createCampaign(data: CampaignFormData): Promise<Campaign> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const now = new Date().toISOString();
    const newCampaign: Campaign = {
      uid: `blt_mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      ...data,
      created_at: now,
      updated_at: now,
      created_by: 'mock_user',
      updated_by: 'mock_user',
      locale: 'en-us',
    };
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  async updateCampaign(uid: string, data: Partial<CampaignFormData>): Promise<Campaign> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = this.campaigns.findIndex((c) => c.uid === uid);
    if (index === -1) {
      throw new Error(`Campaign with uid ${uid} not found`);
    }
    const updatedCampaign: Campaign = {
      ...this.campaigns[index],
      ...data,
      updated_at: new Date().toISOString(),
      updated_by: 'mock_user',
    };
    this.campaigns[index] = updatedCampaign;
    return updatedCampaign;
  }

  async deleteCampaign(uid: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = this.campaigns.findIndex((c) => c.uid === uid);
    if (index === -1) {
      return false;
    }
    this.campaigns.splice(index, 1);
    return true;
  }
}

// Contentstack SDK implementation
export class ContentstackCampaignService implements ICampaignService {
  private stack: any;

  constructor(stack: any) {
    this.stack = stack;
  }

  async fetchCampaigns(): Promise<Campaign[]> {
    try {
      const query = this.stack.ContentType(CONTENT_TYPE_UID).Entry.Query();
      const result = await query.find();
      return (result.entries || []).map(this.mapEntryToCampaign);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      throw error;
    }
  }

  async fetchCampaign(uid: string): Promise<Campaign | null> {
    try {
      const entry = await this.stack
        .ContentType(CONTENT_TYPE_UID)
        .Entry(uid)
        .fetch();
      return entry ? this.mapEntryToCampaign(entry) : null;
    } catch (error) {
      console.error(`Failed to fetch campaign ${uid}:`, error);
      return null;
    }
  }

  async createCampaign(data: CampaignFormData): Promise<Campaign> {
    try {
      const entry = await this.stack
        .ContentType(CONTENT_TYPE_UID)
        .Entry.create({ entry: this.mapFormDataToEntry(data) });
      return this.mapEntryToCampaign(entry);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  }

  async updateCampaign(uid: string, data: Partial<CampaignFormData>): Promise<Campaign> {
    try {
      const entry = await this.stack
        .ContentType(CONTENT_TYPE_UID)
        .Entry(uid)
        .update({ entry: this.mapFormDataToEntry(data as CampaignFormData) });
      return this.mapEntryToCampaign(entry);
    } catch (error) {
      console.error(`Failed to update campaign ${uid}:`, error);
      throw error;
    }
  }

  async deleteCampaign(uid: string): Promise<boolean> {
    try {
      await this.stack.ContentType(CONTENT_TYPE_UID).Entry(uid).delete();
      return true;
    } catch (error) {
      console.error(`Failed to delete campaign ${uid}:`, error);
      return false;
    }
  }

  private mapEntryToCampaign(entry: any): Campaign {
    return {
      uid: entry.uid,
      title: entry.title || '',
      key_messages: entry.key_messages,
      campaign_goals: entry.campaign_goals,
      start_date: entry.start_date || '',
      end_date: entry.end_date || '',
      contributors: entry.contributors || [],
      budget: entry.budget || '',
      status: entry.status || 'active',
      channels: entry.channels || [],
      assets: entry.assets || [],
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: entry.updated_at || new Date().toISOString(),
      created_by: entry.created_by || '',
      updated_by: entry.updated_by || '',
      locale: entry.locale || 'en-us',
    };
  }

  private mapFormDataToEntry(data: CampaignFormData): Record<string, unknown> {
    return {
      title: data.title,
      key_messages: data.key_messages,
      campaign_goals: data.campaign_goals,
      start_date: data.start_date,
      end_date: data.end_date,
      contributors: data.contributors,
      budget: data.budget,
      status: data.status,
      channels: data.channels,
      assets: data.assets,
    };
  }
}

// Factory function to create the appropriate service
export function createCampaignService(isStandaloneMode: boolean, stack?: any): ICampaignService {
  if (isStandaloneMode || !stack) {
    return new MockCampaignService();
  }
  return new ContentstackCampaignService(stack);
}
