import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { Campaign, CampaignFormData, CampaignMetrics } from '../types';
import { calculateMetrics } from '../utils/campaign';
import { createCampaignService, ICampaignService } from '../services';
import { useAppSdk } from './AppSdkContext';

interface CampaignContextValue {
  campaigns: Campaign[];
  metrics: CampaignMetrics;
  isLoading: boolean;
  error: string | null;
  refreshCampaigns: () => Promise<void>;
  addCampaign: (data: CampaignFormData) => Promise<Campaign>;
  updateCampaign: (uid: string, data: Partial<CampaignFormData>) => Promise<Campaign | null>;
  deleteCampaign: (uid: string) => Promise<boolean>;
  getCampaign: (uid: string) => Campaign | undefined;
}

const CampaignContext = createContext<CampaignContextValue | null>(null);

interface CampaignProviderProps {
  children: ReactNode;
}

export function CampaignProvider({ children }: CampaignProviderProps) {
  const { isStandaloneMode, isLoading: isSdkLoading } = useAppSdk();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create service based on mode - uses Management API when credentials available
  const service = useMemo<ICampaignService>(() => {
    return createCampaignService(isStandaloneMode);
  }, [isStandaloneMode]);

  const metrics = useMemo(() => calculateMetrics(campaigns), [campaigns]);

  const refreshCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCampaigns = await service.fetchCampaigns();
      setCampaigns(fetchedCampaigns);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch campaigns';
      setError(message);
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Initial fetch when SDK is ready
  useEffect(() => {
    if (!isSdkLoading) {
      refreshCampaigns();
    }
  }, [isSdkLoading, refreshCampaigns]);

  const addCampaign = useCallback(async (data: CampaignFormData): Promise<Campaign> => {
    try {
      const newCampaign = await service.createCampaign(data);
      setCampaigns((prev) => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create campaign';
      setError(message);
      throw err;
    }
  }, [service]);

  const updateCampaign = useCallback(
    async (uid: string, data: Partial<CampaignFormData>): Promise<Campaign | null> => {
      try {
        const updatedCampaign = await service.updateCampaign(uid, data);
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.uid === uid ? updatedCampaign : campaign
          )
        );
        return updatedCampaign;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update campaign';
        setError(message);
        throw err;
      }
    },
    [service]
  );

  const deleteCampaign = useCallback(async (uid: string): Promise<boolean> => {
    try {
      const success = await service.deleteCampaign(uid);
      if (success) {
        setCampaigns((prev) => prev.filter((campaign) => campaign.uid !== uid));
      }
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete campaign';
      setError(message);
      throw err;
    }
  }, [service]);

  const getCampaign = useCallback(
    (uid: string): Campaign | undefined => {
      return campaigns.find((campaign) => campaign.uid === uid);
    },
    [campaigns]
  );

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        metrics,
        isLoading,
        error,
        refreshCampaigns,
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
