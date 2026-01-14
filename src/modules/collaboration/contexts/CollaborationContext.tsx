import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Activity, Comment, CampaignInProgress, Collaborator, ActivityType } from '../types/collaboration';
import { getCollaborationService, CollaborationService } from '../services/collaborationService';

interface CollaborationContextValue {
  activities: Activity[];
  campaignsInProgress: CampaignInProgress[];
  collaborators: Collaborator[];
  currentUser: Collaborator | null;
  isLoading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => Promise<Activity>;
  logCampaignActivity: (
    type: ActivityType,
    campaignId: string,
    campaignTitle: string,
    description?: string
  ) => Promise<Activity | null>;
  getComments: (campaignId: string) => Promise<Comment[]>;
  addComment: (campaignId: string, content: string, mentions?: string[]) => Promise<Comment | null>;
}

const CollaborationContext = createContext<CollaborationContextValue | undefined>(undefined);

interface CollaborationProviderProps {
  children: ReactNode;
}

export function CollaborationProvider({ children }: CollaborationProviderProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [campaignsInProgress, setCampaignsInProgress] = useState<CampaignInProgress[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentUser, setCurrentUser] = useState<Collaborator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [service] = useState<CollaborationService>(() => getCollaborationService());

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [activitiesData, campaignsData, collaboratorsData] = await Promise.all([
        service.getActivities(),
        service.getCampaignsInProgress(),
        service.getCollaborators(),
      ]);

      setActivities(activitiesData);
      setCampaignsInProgress(campaignsData);
      setCollaborators(collaboratorsData);

      // Set the first collaborator as the current user (mock)
      if (collaboratorsData.length > 0) {
        setCurrentUser(collaboratorsData[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collaboration data');
      console.error('Failed to load collaboration data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshActivities = useCallback(async () => {
    try {
      const activitiesData = await service.getActivities();
      setActivities(activitiesData);
    } catch (err) {
      console.error('Failed to refresh activities:', err);
    }
  }, [service]);

  const addActivity = useCallback(
    async (activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> => {
      const newActivity = await service.addActivity(activity);
      setActivities(prev => [newActivity, ...prev]);
      return newActivity;
    },
    [service]
  );

  const logCampaignActivity = useCallback(
    async (
      type: ActivityType,
      campaignId: string,
      campaignTitle: string,
      description?: string
    ): Promise<Activity | null> => {
      if (!currentUser) return null;

      const defaultDescriptions: Record<ActivityType, string> = {
        campaign_created: `created "${campaignTitle}"`,
        campaign_updated: `updated "${campaignTitle}"`,
        campaign_status_changed: `changed status of "${campaignTitle}"`,
        comment_added: `commented on "${campaignTitle}"`,
        asset_uploaded: `uploaded assets to "${campaignTitle}"`,
        milestone_completed: `completed a milestone in "${campaignTitle}"`,
        user_mentioned: `mentioned you in "${campaignTitle}"`,
      };

      return addActivity({
        type,
        actor: currentUser,
        targetId: campaignId,
        targetType: 'campaign',
        targetTitle: campaignTitle,
        description: description || defaultDescriptions[type],
      });
    },
    [addActivity, currentUser]
  );

  const getComments = useCallback(
    async (campaignId: string): Promise<Comment[]> => {
      return service.getComments(campaignId);
    },
    [service]
  );

  const addComment = useCallback(
    async (campaignId: string, content: string, mentions: string[] = []): Promise<Comment | null> => {
      if (!currentUser) return null;

      const comment = await service.addComment({
        author: currentUser,
        content,
        campaignId,
        mentions,
      });

      await refreshActivities();
      return comment;
    },
    [service, currentUser, refreshActivities]
  );

  const value: CollaborationContextValue = {
    activities,
    campaignsInProgress,
    collaborators,
    currentUser,
    isLoading,
    error,
    refreshActivities,
    addActivity,
    logCampaignActivity,
    getComments,
    addComment,
  };

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
}

export function useCollaboration(): CollaborationContextValue {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}
