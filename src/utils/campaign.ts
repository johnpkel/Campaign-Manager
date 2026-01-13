import {
  Campaign,
  CampaignFormData,
  CampaignMetrics,
  CampaignStatus,
  CampaignChannel,
} from '../types';

export function generateId(): string {
  return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createCampaign(data: CampaignFormData): Campaign {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    ...data,
    spent: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function calculateMetrics(campaigns: Campaign[]): CampaignMetrics {
  const campaignsByStatus: Record<CampaignStatus, number> = {
    draft: 0,
    scheduled: 0,
    active: 0,
    paused: 0,
    completed: 0,
  };

  const campaignsByChannel: Record<CampaignChannel, number> = {
    email: 0,
    social: 0,
    ppc: 0,
    display: 0,
    content: 0,
    seo: 0,
  };

  let totalBudget = 0;
  let totalSpent = 0;
  let activeCampaigns = 0;

  campaigns.forEach((campaign) => {
    campaignsByStatus[campaign.status]++;

    campaign.channels.forEach((channel) => {
      campaignsByChannel[channel]++;
    });

    totalBudget += campaign.budget;
    totalSpent += campaign.spent;

    if (campaign.status === 'active') {
      activeCampaigns++;
    }
  });

  return {
    totalCampaigns: campaigns.length,
    activeCampaigns,
    totalBudget,
    totalSpent,
    campaignsByStatus,
    campaignsByChannel,
  };
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusColor(status: CampaignStatus): string {
  const colors: Record<CampaignStatus, string> = {
    draft: '#718096',
    scheduled: '#3182CE',
    active: '#38A169',
    paused: '#DD6B20',
    completed: '#805AD5',
  };
  return colors[status];
}
