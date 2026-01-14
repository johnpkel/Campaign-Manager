import {
  Campaign,
  CampaignMetrics,
  CampaignStatus,
  CampaignChannel,
  ALL_CAMPAIGN_STATUSES,
  ALL_CAMPAIGN_CHANNELS,
  CAMPAIGN_STATUS_COLORS,
} from '../types';

export function calculateMetrics(campaigns: Campaign[]): CampaignMetrics {
  const campaignsByStatus: Record<CampaignStatus, number> = {
    draft: 0,
    content_creation: 0,
    review: 0,
    active: 0,
    paused: 0,
    completed: 0,
  };

  const campaignsByChannel: Record<CampaignChannel, number> = {
    'Web': 0,
    'Native Mobile': 0,
    'Social': 0,
    'Ads': 0,
    'Email': 0,
  };

  let activeCampaigns = 0;

  campaigns.forEach((campaign) => {
    if (ALL_CAMPAIGN_STATUSES.includes(campaign.status)) {
      campaignsByStatus[campaign.status]++;
    }

    campaign.channels.forEach((channel) => {
      if (ALL_CAMPAIGN_CHANNELS.includes(channel)) {
        campaignsByChannel[channel]++;
      }
    });

    if (campaign.status === 'active') {
      activeCampaigns++;
    }
  });

  return {
    totalCampaigns: campaigns.length,
    activeCampaigns,
    campaignsByStatus,
    campaignsByChannel,
  };
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusColor(status: CampaignStatus): string {
  return CAMPAIGN_STATUS_COLORS[status] || '#718096';
}
