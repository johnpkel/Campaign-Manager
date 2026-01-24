import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { useAI, AIMessage } from '../../ai';
import { useWizardInsights } from '../hooks';
import { WizardInsights, SavedCampaignChat, SuggestedAudience, RecommendedAsset, RecommendedContent, ExperimentSuggestion } from '../types';
import { CampaignDraft } from '../../ai/types/ai';
import { Campaign, CampaignFormData } from '../../../types/campaign';
import { mapDraftToFormData, getCampaignUrl } from '../services/campaignDraftMapper';

// Created campaign info for displaying success message and link
export interface CreatedCampaignInfo {
  uid: string;
  title: string;
  url: string;
}

// Extended draft type that includes selected items from suggestions
export interface EnrichedCampaignDraft extends Partial<CampaignDraft> {
  selectedAssets?: RecommendedAsset[];
  selectedContent?: RecommendedContent[];
  selectedExperiment?: ExperimentSuggestion | null;
}

// Mock saved chats for demonstration
const MOCK_SAVED_CHATS: SavedCampaignChat[] = [
  {
    id: 'chat-1',
    title: 'Summer Sale Campaign',
    lastMessage: 'Let me help you set up the target audiences...',
    currentStep: 'audiences',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'in_progress',
    draftSummary: {
      goals: 'Drive seasonal sales',
      channels: ['Web', 'Email'],
      audienceCount: 2,
    },
  },
  {
    id: 'chat-2',
    title: 'Product Launch - Q1',
    lastMessage: 'Great! Now let\'s define the key messages...',
    currentStep: 'key_messages',
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'in_progress',
    draftSummary: {
      goals: 'New product awareness',
      channels: ['Web', 'Social', 'Ads'],
    },
  },
  {
    id: 'chat-3',
    title: 'Holiday Promo 2024',
    lastMessage: 'Campaign created successfully!',
    currentStep: 'complete',
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    status: 'completed',
    draftSummary: {
      goals: 'Holiday season engagement',
      channels: ['Web', 'Email', 'Native Mobile'],
      audienceCount: 4,
    },
  },
];

interface WizardContextValue {
  // Re-exported from AIContext for convenience
  messages: AIMessage[];
  sendMessage: (content: string) => Promise<void>;
  campaignDraft: EnrichedCampaignDraft;
  currentStep: string;
  isCreatingCampaign: boolean;

  // Wizard-specific state
  insights: WizardInsights;
  isInsightsPanelCollapsed: boolean;

  // Created campaign state (after successful creation)
  createdCampaign: CreatedCampaignInfo | null;
  isFinalizingCampaign: boolean;

  // Chat history state
  showChatHistory: boolean;
  savedChats: SavedCampaignChat[];
  activeChatId: string | null;

  // Actions
  toggleInsightsPanel: () => void;
  selectAudience: (audienceId: string) => void;
  deselectAudience: (audienceId: string) => void;
  selectAsset: (assetId: string) => void;
  deselectAsset: (assetId: string) => void;
  selectContent: (entryUid: string) => void;
  deselectContent: (entryUid: string) => void;
  selectExperiment: (experimentId: string) => void;

  // Chat history actions
  startNewCampaign: () => Promise<void>;
  resumeChat: (chatId: string) => void;
  backToChatHistory: () => void;

  // Lifecycle
  exitWizard: () => void;
  startWizard: () => Promise<void>;
  finalizeCampaign: () => Promise<CreatedCampaignInfo | null>;
}

const WizardContext = createContext<WizardContextValue | null>(null);

interface WizardProviderProps {
  children: ReactNode;
  onExit: () => void;
  onCampaignCreate?: (data: CampaignFormData) => Promise<Campaign>;
  stackApiKey?: string;
}

export function WizardProvider({ children, onExit, onCampaignCreate, stackApiKey }: WizardProviderProps) {
  const aiContext = useAI();
  const [isInsightsPanelCollapsed, setIsInsightsPanelCollapsed] = useState(false);

  // Chat history state - start with chat history visible
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [savedChats] = useState<SavedCampaignChat[]>(MOCK_SAVED_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Campaign creation state
  const [createdCampaign, setCreatedCampaign] = useState<CreatedCampaignInfo | null>(null);
  const [isFinalizingCampaign, setIsFinalizingCampaign] = useState(false);

  // Get the campaign draft from AI context
  const campaignDraft = aiContext.campaignCreation?.draft || {};

  // Calculate insights based on campaign draft
  const baseInsights = useWizardInsights(campaignDraft);

  // Local state for selections with full item data
  const [selectedAudienceItems, setSelectedAudienceItems] = useState<Map<string, SuggestedAudience>>(new Map());
  const [selectedAssetItems, setSelectedAssetItems] = useState<Map<string, RecommendedAsset>>(new Map());
  const [selectedContentItems, setSelectedContentItems] = useState<Map<string, RecommendedContent>>(new Map());
  const [selectedExperimentItem, setSelectedExperimentItem] = useState<ExperimentSuggestion | null>(null);

  // Merge selections into insights for UI display
  const insights: WizardInsights = {
    ...baseInsights,
    audienceReach: {
      ...baseInsights.audienceReach,
      suggestedAudiences: baseInsights.audienceReach.suggestedAudiences.map(aud => ({
        ...aud,
        selected: selectedAudienceItems.has(aud.id),
      })),
    },
    recommendedAssets: baseInsights.recommendedAssets.map(asset => ({
      ...asset,
      selected: selectedAssetItems.has(asset.id),
    })),
    recommendedContent: baseInsights.recommendedContent.map(content => ({
      ...content,
      selected: selectedContentItems.has(content.entryUid),
    })),
    experimentSuggestions: baseInsights.experimentSuggestions.map(exp => ({
      ...exp,
      selected: exp.id === selectedExperimentItem?.id,
    })),
  };

  // Create enriched campaign draft that includes selected suggestions
  const enrichedCampaignDraft: EnrichedCampaignDraft = useMemo(() => {
    // Get audience names from selected audience items
    const selectedAudienceNames = Array.from(selectedAudienceItems.values()).map(aud => aud.name);

    // Merge AI draft audiences with user-selected audiences (avoid duplicates)
    const aiAudiences = campaignDraft.audiences || [];
    const mergedAudiences = [...new Set([...aiAudiences, ...selectedAudienceNames])];

    return {
      ...campaignDraft,
      audiences: mergedAudiences.length > 0 ? mergedAudiences : undefined,
      selectedAssets: Array.from(selectedAssetItems.values()),
      selectedContent: Array.from(selectedContentItems.values()),
      selectedExperiment: selectedExperimentItem,
    };
  }, [campaignDraft, selectedAudienceItems, selectedAssetItems, selectedContentItems, selectedExperimentItem]);

  // Toggle insights panel
  const toggleInsightsPanel = useCallback(() => {
    setIsInsightsPanelCollapsed(prev => !prev);
  }, []);

  // Selection handlers - store full item data for use in campaign draft
  const selectAudience = useCallback((audienceId: string) => {
    const audience = baseInsights.audienceReach.suggestedAudiences.find(a => a.id === audienceId);
    if (audience) {
      setSelectedAudienceItems(prev => new Map(prev).set(audienceId, audience));
    }
  }, [baseInsights.audienceReach.suggestedAudiences]);

  const deselectAudience = useCallback((audienceId: string) => {
    setSelectedAudienceItems(prev => {
      const next = new Map(prev);
      next.delete(audienceId);
      return next;
    });
  }, []);

  const selectAsset = useCallback((assetId: string) => {
    const asset = baseInsights.recommendedAssets.find(a => a.id === assetId);
    if (asset) {
      setSelectedAssetItems(prev => new Map(prev).set(assetId, asset));
    }
  }, [baseInsights.recommendedAssets]);

  const deselectAsset = useCallback((assetId: string) => {
    setSelectedAssetItems(prev => {
      const next = new Map(prev);
      next.delete(assetId);
      return next;
    });
  }, []);

  const selectContent = useCallback((entryUid: string) => {
    const content = baseInsights.recommendedContent.find(c => c.entryUid === entryUid);
    if (content) {
      setSelectedContentItems(prev => new Map(prev).set(entryUid, content));
    }
  }, [baseInsights.recommendedContent]);

  const deselectContent = useCallback((entryUid: string) => {
    setSelectedContentItems(prev => {
      const next = new Map(prev);
      next.delete(entryUid);
      return next;
    });
  }, []);

  const selectExperiment = useCallback((experimentId: string) => {
    const experiment = baseInsights.experimentSuggestions.find(e => e.id === experimentId);
    if (experiment) {
      setSelectedExperimentItem(experiment);
    }
  }, [baseInsights.experimentSuggestions]);

  // Start the wizard (trigger AI campaign creation)
  const startWizard = useCallback(async () => {
    if (!aiContext.campaignCreation?.isActive) {
      await aiContext.startCampaignCreation();
    }
  }, [aiContext]);

  // Start a new campaign from chat history
  const startNewCampaign = useCallback(async () => {
    setActiveChatId(null);
    setShowChatHistory(false);
    await aiContext.startCampaignCreation();
  }, [aiContext]);

  // Resume an existing chat
  const resumeChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setShowChatHistory(false);
    // In a real implementation, this would load the saved conversation
    // For now, we'll start a new campaign creation as a placeholder
    aiContext.startCampaignCreation();
  }, [aiContext]);

  // Go back to chat history view
  const backToChatHistory = useCallback(() => {
    if (aiContext.campaignCreation?.isActive) {
      aiContext.cancelCampaignCreation();
    }
    setShowChatHistory(true);
    setActiveChatId(null);
  }, [aiContext]);

  // Exit wizard
  const exitWizard = useCallback(() => {
    if (aiContext.campaignCreation?.isActive) {
      aiContext.cancelCampaignCreation();
    }
    onExit();
  }, [aiContext, onExit]);

  // Finalize campaign - create it in Contentstack
  const finalizeCampaign = useCallback(async (): Promise<CreatedCampaignInfo | null> => {
    if (!onCampaignCreate || isFinalizingCampaign || createdCampaign) {
      return createdCampaign;
    }

    setIsFinalizingCampaign(true);

    try {
      // Map the enriched draft to form data
      const formData = mapDraftToFormData(enrichedCampaignDraft);

      // Create the campaign in Contentstack
      const campaign = await onCampaignCreate(formData);

      // Generate the campaign URL
      const url = getCampaignUrl(campaign.uid, stackApiKey);

      const createdInfo: CreatedCampaignInfo = {
        uid: campaign.uid,
        title: campaign.title,
        url: url,
      };

      setCreatedCampaign(createdInfo);
      setIsFinalizingCampaign(false);

      return createdInfo;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      setIsFinalizingCampaign(false);
      return null;
    }
  }, [onCampaignCreate, isFinalizingCampaign, createdCampaign, enrichedCampaignDraft, stackApiKey]);

  // Track current step (no auto-finalization - user must confirm)
  const currentStep = aiContext.campaignCreation?.currentStep || 'recommendations';

  // Reset created campaign state when starting a new campaign
  useEffect(() => {
    if (currentStep === 'recommendations') {
      setCreatedCampaign(null);
    }
  }, [currentStep]);

  const value: WizardContextValue = {
    // From AI context (enriched with selections)
    messages: aiContext.messages,
    sendMessage: aiContext.sendMessage,
    campaignDraft: enrichedCampaignDraft,
    currentStep,
    isCreatingCampaign: aiContext.campaignCreation?.isActive || false,

    // Wizard state
    insights,
    isInsightsPanelCollapsed,

    // Created campaign state
    createdCampaign,
    isFinalizingCampaign,

    // Chat history state
    showChatHistory,
    savedChats,
    activeChatId,

    // Actions
    toggleInsightsPanel,
    selectAudience,
    deselectAudience,
    selectAsset,
    deselectAsset,
    selectContent,
    deselectContent,
    selectExperiment,

    // Chat history actions
    startNewCampaign,
    resumeChat,
    backToChatHistory,

    // Lifecycle
    exitWizard,
    startWizard,
    finalizeCampaign,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
