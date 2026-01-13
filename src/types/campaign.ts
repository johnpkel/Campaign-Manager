export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';

export type CampaignChannel = 'email' | 'social' | 'ppc' | 'display' | 'content' | 'seo';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  channels: CampaignChannel[];
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  owner: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFormData {
  name: string;
  description: string;
  status: CampaignStatus;
  channels: CampaignChannel[];
  startDate: string;
  endDate: string;
  budget: number;
  owner: string;
  tags: string[];
}

export interface CampaignMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  campaignsByStatus: Record<CampaignStatus, number>;
  campaignsByChannel: Record<CampaignChannel, number>;
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
};

export const CAMPAIGN_CHANNEL_LABELS: Record<CampaignChannel, string> = {
  email: 'Email',
  social: 'Social Media',
  ppc: 'PPC',
  display: 'Display Ads',
  content: 'Content',
  seo: 'SEO',
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: '#718096',
  scheduled: '#3182CE',
  active: '#38A169',
  paused: '#DD6B20',
  completed: '#805AD5',
};
