import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Campaign, CampaignFormData, CampaignMetrics } from '../types';
import { generateId, calculateMetrics, createCampaign } from '../utils/campaign';
import { SAMPLE_CAMPAIGNS } from '../utils/sampleData';

interface CampaignContextValue {
  campaigns: Campaign[];
  metrics: CampaignMetrics;
  isLoading: boolean;
  addCampaign: (data: CampaignFormData) => Campaign;
  updateCampaign: (id: string, data: Partial<CampaignFormData>) => Campaign | null;
  deleteCampaign: (id: string) => boolean;
  getCampaign: (id: string) => Campaign | undefined;
}

const CampaignContext = createContext<CampaignContextValue | null>(null);

interface CampaignProviderProps {
  children: ReactNode;
}

export function CampaignProvider({ children }: CampaignProviderProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(SAMPLE_CAMPAIGNS);
  const [isLoading] = useState(false);

  const metrics = calculateMetrics(campaigns);

  const addCampaign = useCallback((data: CampaignFormData): Campaign => {
    const newCampaign = createCampaign(data);
    setCampaigns((prev) => [...prev, newCampaign]);
    return newCampaign;
  }, []);

  const updateCampaign = useCallback(
    (id: string, data: Partial<CampaignFormData>): Campaign | null => {
      let updatedCampaign: Campaign | null = null;
      setCampaigns((prev) =>
        prev.map((campaign) => {
          if (campaign.id === id) {
            updatedCampaign = {
              ...campaign,
              ...data,
              updatedAt: new Date().toISOString(),
            };
            return updatedCampaign;
          }
          return campaign;
        })
      );
      return updatedCampaign;
    },
    []
  );

  const deleteCampaign = useCallback((id: string): boolean => {
    let deleted = false;
    setCampaigns((prev) => {
      const newCampaigns = prev.filter((campaign) => campaign.id !== id);
      deleted = newCampaigns.length < prev.length;
      return newCampaigns;
    });
    return deleted;
  }, []);

  const getCampaign = useCallback(
    (id: string): Campaign | undefined => {
      return campaigns.find((campaign) => campaign.id === id);
    },
    [campaigns]
  );

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        metrics,
        isLoading,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        getCampaign,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
}
