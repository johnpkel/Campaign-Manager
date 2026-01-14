import { Campaign, CampaignFormData } from '../types';
import { MOCK_CAMPAIGNS } from '../utils/sampleData';

const CONTENT_TYPE_UID = 'cs_campaign_manager';
const API_BASE_URL = 'https://api.contentstack.io/v3';

// Get credentials from environment or config
// In production, these should come from app configuration
const getCredentials = () => ({
  apiKey: import.meta.env.VITE_CONTENTSTACK_API_KEY || '',
  managementToken: import.meta.env.VITE_CONTENTSTACK_MANAGEMENT_TOKEN || '',
});

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

// Contentstack Management API implementation
export class ContentstackCampaignService implements ICampaignService {
  private apiKey: string;
  private managementToken: string;

  constructor(apiKey: string, managementToken: string) {
    this.apiKey = apiKey;
    this.managementToken = managementToken;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'api_key': this.apiKey,
        'authorization': this.managementToken,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error_message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  async fetchCampaigns(): Promise<Campaign[]> {
    try {
      const result = await this.request(`/content_types/${CONTENT_TYPE_UID}/entries`);
      return (result.entries || []).map(this.mapEntryToCampaign);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      throw error;
    }
  }

  async fetchCampaign(uid: string): Promise<Campaign | null> {
    try {
      const result = await this.request(`/content_types/${CONTENT_TYPE_UID}/entries/${uid}`);
      return result.entry ? this.mapEntryToCampaign(result.entry) : null;
    } catch (error) {
      console.error(`Failed to fetch campaign ${uid}:`, error);
      return null;
    }
  }

  async createCampaign(data: CampaignFormData): Promise<Campaign> {
    try {
      const result = await this.request(`/content_types/${CONTENT_TYPE_UID}/entries`, {
        method: 'POST',
        body: JSON.stringify({ entry: this.mapFormDataToEntry(data) }),
      });
      return this.mapEntryToCampaign(result.entry);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  }

  async updateCampaign(uid: string, data: Partial<CampaignFormData>): Promise<Campaign> {
    try {
      const result = await this.request(`/content_types/${CONTENT_TYPE_UID}/entries/${uid}`, {
        method: 'PUT',
        body: JSON.stringify({ entry: this.mapFormDataToEntry(data as CampaignFormData) }),
      });
      return this.mapEntryToCampaign(result.entry);
    } catch (error) {
      console.error(`Failed to update campaign ${uid}:`, error);
      throw error;
    }
  }

  async deleteCampaign(uid: string): Promise<boolean> {
    try {
      await this.request(`/content_types/${CONTENT_TYPE_UID}/entries/${uid}`, {
        method: 'DELETE',
      });
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
      timeline: entry.timeline || [],
      market_research: entry.market_research,
      market_research_links: entry.market_research_links || [],
      brand_kit: entry.brand_kit || [],
      voice_profile: entry.voice_profile || [],
      audiences: entry.audiences || [],
      releases: entry.releases || [],
      entries: entry.entries || [],
      utms: entry.utms || [],
      activity_timeline: entry.activity_timeline || [],
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
      timeline: data.timeline,
      market_research: data.market_research,
      utms: data.utms,
      activity_timeline: data.activity_timeline,
    };
  }
}

// Factory function to create the appropriate service
export function createCampaignService(isStandaloneMode: boolean): ICampaignService {
  const { apiKey, managementToken } = getCredentials();

  // Use Contentstack API if credentials are available, even in standalone mode
  // This allows local development to fetch real data from Contentstack
  if (apiKey && managementToken) {
    console.info('Using Contentstack API campaign service');
    return new ContentstackCampaignService(apiKey, managementToken);
  }

  // Fall back to mock service only if credentials are missing
  if (isStandaloneMode) {
    console.info('Using mock campaign service (standalone mode, no credentials)');
  } else {
    console.info('Using mock campaign service (missing API credentials)');
  }
  return new MockCampaignService();
}
