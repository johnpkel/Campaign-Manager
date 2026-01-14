export type CampaignStatus = 'draft' | 'content_creation' | 'review' | 'active' | 'paused' | 'completed';

export type CampaignChannel = 'Web' | 'Native Mobile' | 'Social' | 'Ads' | 'Email';

export type MilestoneStatus = 'completed' | 'in_progress' | 'pending';

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
  name?: string;
  role?: string;
  initials?: string;
}

// Asset reference structure
export interface AssetReference {
  uid: string;
  url: string;
  filename: string;
  content_type: string;
}

// Timeline milestone structure (group field)
export interface TimelineMilestone {
  milestone_name: string;
  milestone_date: string;
  status: MilestoneStatus;
}

// Brand Kit reference structure
export interface BrandKitReference {
  uid: string;
  title: string;
}

// Voice Profile reference structure
export interface VoiceProfileReference {
  uid: string;
  title: string;
}

// Contentstack Release reference
export interface ReleaseReference {
  uid: string;
  name: string;
}

// Contentstack Entry reference
export interface EntryReference {
  uid: string;
  _content_type_uid: string;
  title?: string;
  image_url?: string;
  tags?: string[];
}

// Lytics Audience reference
export interface AudienceReference {
  id: string;
  name: string;
  count?: number;
}

// Market Research link
export interface MarketResearchLink {
  title: string;
  url: string;
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
  // Phase 2 fields
  timeline?: TimelineMilestone[];
  market_research?: RTEContent;
  market_research_links?: MarketResearchLink[];
  brand_kit?: BrandKitReference[];
  voice_profile?: VoiceProfileReference[];
  audiences?: AudienceReference[];
  releases?: ReleaseReference[];
  entries?: EntryReference[];
  // System fields
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
  // Phase 2 fields
  timeline?: TimelineMilestone[];
  market_research?: RTEContent;
  brand_kit?: BrandKitReference[];
  voice_profile?: VoiceProfileReference[];
  audiences?: AudienceReference[];
  releases?: ReleaseReference[];
  entries?: EntryReference[];
}

export interface CampaignMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  campaignsByStatus: Record<CampaignStatus, number>;
  campaignsByChannel: Record<CampaignChannel, number>;
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  content_creation: 'Content Creation',
  review: 'Review',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
};

export const CAMPAIGN_CHANNEL_LABELS: Record<CampaignChannel, string> = {
  'Web': 'Web',
  'Native Mobile': 'Native Mobile',
  'Social': 'Social Media',
  'Ads': 'Ads',
  'Email': 'Email',
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: '#64748b',
  content_creation: '#8b5cf6',
  review: '#f59e0b',
  active: '#10b981',
  paused: '#f97316',
  completed: '#6366f1',
};

export const ALL_CAMPAIGN_STATUSES: CampaignStatus[] = ['draft', 'content_creation', 'review', 'active', 'paused', 'completed'];

export const ALL_CAMPAIGN_CHANNELS: CampaignChannel[] = ['Web', 'Native Mobile', 'Social', 'Ads', 'Email'];
