export type CampaignStatus = 'active' | 'paused' | 'completed';

export type CampaignChannel = 'Web' | 'Native Mobile' | 'Social' | 'Ads' | 'Email';

// JSON RTE content structure (Contentstack's JSON RTE format)
export interface RTENode {
  type: string;
  attrs?: Record<string, unknown>;
  uid?: string;
  text?: string;
  children?: RTENode[];
}

export interface RTEContent {
  type: string;
  attrs?: Record<string, unknown>;
  uid: string;
  children: RTENode[];
}

// Reference field structure for Contributors
export interface ContributorReference {
  uid: string;
  _content_type_uid: string;
}

// Asset reference structure
export interface AssetReference {
  uid: string;
  url: string;
  filename: string;
  content_type: string;
}

// Main Campaign interface matching Contentstack entry structure
export interface Campaign {
  uid: string;
  title: string;
  key_messages?: RTEContent;
  campaign_goals?: RTEContent;
  start_date: string;
  end_date: string;
  contributors?: ContributorReference[];
  budget?: string;
  status: CampaignStatus;
  channels: CampaignChannel[];
  assets?: AssetReference[];
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  locale: string;
}

// Form data for creating/editing campaigns
export interface CampaignFormData {
  title: string;
  key_messages?: RTEContent;
  campaign_goals?: RTEContent;
  start_date: string;
  end_date: string;
  contributors?: ContributorReference[];
  budget?: string;
  status: CampaignStatus;
  channels: CampaignChannel[];
  assets?: AssetReference[];
}

export interface CampaignMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  campaignsByStatus: Record<CampaignStatus, number>;
  campaignsByChannel: Record<CampaignChannel, number>;
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
};

export const CAMPAIGN_CHANNEL_LABELS: Record<CampaignChannel, string> = {
  'Web': 'Web',
  'Native Mobile': 'Native Mobile',
  'Social': 'Social',
  'Ads': 'Ads',
  'Email': 'Email',
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  active: '#38A169',
  paused: '#DD6B20',
  completed: '#805AD5',
};

export const ALL_CAMPAIGN_STATUSES: CampaignStatus[] = ['active', 'paused', 'completed'];

export const ALL_CAMPAIGN_CHANNELS: CampaignChannel[] = ['Web', 'Native Mobile', 'Social', 'Ads', 'Email'];
