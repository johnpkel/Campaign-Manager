import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAI, AIMessage } from '../../ai';
import { useWizardInsights } from '../hooks';
import { WizardInsights, SavedCampaignChat } from '../types';
import { CampaignDraft } from '../../ai/types/ai';

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
  campaignDraft: Partial<CampaignDraft>;
  currentStep: string;
  isCreatingCampaign: boolean;

  // Wizard-specific state
  insights: WizardInsights;
  isInsightsPanelCollapsed: boolean;

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
}

const WizardContext = createContext<WizardContextValue | null>(null);

interface WizardProviderProps {
  children: ReactNode;
  onExit: () => void;
}

export function WizardProvider({ children, onExit }: WizardProviderProps) {
  const aiContext = useAI();
  const [isInsightsPanelCollapsed, setIsInsightsPanelCollapsed] = useState(false);

  // Chat history state - start with chat history visible
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [savedChats] = useState<SavedCampaignChat[]>(MOCK_SAVED_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Get the campaign draft from AI context
  const campaignDraft = aiContext.campaignCreation?.draft || {};

  // Calculate insights based on campaign draft
  const baseInsights = useWizardInsights(campaignDraft);

  // Local state for selections (managed separately from AI context)
  const [selectedAudiences, setSelectedAudiences] = useState<Set<string>>(new Set());
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [selectedContent, setSelectedContent] = useState<Set<string>>(new Set());
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);

  // Merge selections into insights
  const insights: WizardInsights = {
    ...baseInsights,
    audienceReach: {
      ...baseInsights.audienceReach,
      suggestedAudiences: baseInsights.audienceReach.suggestedAudiences.map(aud => ({
        ...aud,
        selected: selectedAudiences.has(aud.id),
      })),
    },
    recommendedAssets: baseInsights.recommendedAssets.map(asset => ({
      ...asset,
      selected: selectedAssets.has(asset.id),
    })),
    recommendedContent: baseInsights.recommendedContent.map(content => ({
      ...content,
      selected: selectedContent.has(content.entryUid),
    })),
    experimentSuggestions: baseInsights.experimentSuggestions.map(exp => ({
      ...exp,
      selected: exp.id === selectedExperiment,
    })),
  };

  // Toggle insights panel
  const toggleInsightsPanel = useCallback(() => {
    setIsInsightsPanelCollapsed(prev => !prev);
  }, []);

  // Selection handlers
  const selectAudience = useCallback((audienceId: string) => {
    setSelectedAudiences(prev => new Set([...prev, audienceId]));
  }, []);

  const deselectAudience = useCallback((audienceId: string) => {
    setSelectedAudiences(prev => {
      const next = new Set(prev);
      next.delete(audienceId);
      return next;
    });
  }, []);

  const selectAsset = useCallback((assetId: string) => {
    setSelectedAssets(prev => new Set([...prev, assetId]));
  }, []);

  const deselectAsset = useCallback((assetId: string) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      next.delete(assetId);
      return next;
    });
  }, []);

  const selectContent = useCallback((entryUid: string) => {
    setSelectedContent(prev => new Set([...prev, entryUid]));
  }, []);

  const deselectContent = useCallback((entryUid: string) => {
    setSelectedContent(prev => {
      const next = new Set(prev);
      next.delete(entryUid);
      return next;
    });
  }, []);

  const selectExperiment = useCallback((experimentId: string) => {
    setSelectedExperiment(experimentId);
  }, []);

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

  const value: WizardContextValue = {
    // From AI context
    messages: aiContext.messages,
    sendMessage: aiContext.sendMessage,
    campaignDraft,
    currentStep: aiContext.campaignCreation?.currentStep || 'recommendations',
    isCreatingCampaign: aiContext.campaignCreation?.isActive || false,

    // Wizard state
    insights,
    isInsightsPanelCollapsed,

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
