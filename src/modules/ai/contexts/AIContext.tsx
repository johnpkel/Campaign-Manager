import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  AIMessage,
  AIConfig,
  AIStatus,
  AIContext as AIContextData,
  CampaignRecommendation,
} from '../types/ai';
import { AIService, createAIService } from '../services/aiService';
import {
  CampaignCreationState,
  getInitialCampaignCreationState,
  detectCampaignCreationIntent,
  generateCampaignRecommendations,
  getNextStep,
  getStepQuestion,
  parseUserResponse,
  processRecommendationSelection,
  createCampaignCreationMessage,
} from '../services/campaignCreationService';

interface AIContextValue {
  messages: AIMessage[];
  status: AIStatus;
  error: string | null;
  isOpen: boolean;
  isConfigured: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setContextData: (context: AIContextData) => void;
  // Campaign creation
  campaignCreation: CampaignCreationState;
  startCampaignCreation: () => Promise<void>;
  selectRecommendation: (recommendation: CampaignRecommendation) => void;
  cancelCampaignCreation: () => void;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
  config?: AIConfig;
}

export function AIProvider({ children, config }: AIProviderProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [status, setStatus] = useState<AIStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [contextData, setContextData] = useState<AIContextData>({});
  const [service] = useState<AIService>(() => createAIService(config));
  const [campaignCreation, setCampaignCreation] = useState<CampaignCreationState>(
    getInitialCampaignCreationState()
  );

  const isConfigured = service.isConfigured();

  // Start campaign creation flow
  const startCampaignCreation = useCallback(async () => {
    setStatus('thinking');
    setError(null);

    try {
      const { recommendations, message } = await generateCampaignRecommendations(contextData);

      const assistantMessage = createCampaignCreationMessage(
        message,
        'recommendations',
        recommendations
      );

      setMessages(prev => [...prev, assistantMessage]);
      setCampaignCreation({
        isActive: true,
        currentStep: 'recommendations',
        draft: {},
        recommendations,
      });
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
      setStatus('error');
    }
  }, [contextData]);

  // Select a recommendation
  const selectRecommendation = useCallback((recommendation: CampaignRecommendation) => {
    setCampaignCreation(prev => ({
      ...prev,
      selectedRecommendation: recommendation,
      currentStep: 'title',
    }));

    const question = getStepQuestion('title', {}, recommendation);
    const assistantMessage = createCampaignCreationMessage(question, 'title', undefined, {}, recommendation);

    setMessages(prev => [...prev, assistantMessage]);
  }, []);

  // Cancel campaign creation
  const cancelCampaignCreation = useCallback(() => {
    setCampaignCreation(getInitialCampaignCreationState());

    const assistantMessage: AIMessage = {
      id: `ai-msg-${Date.now()}`,
      role: 'assistant',
      content: 'Campaign creation cancelled. Let me know if you need anything else!',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMessage]);
  }, []);

  // Process campaign creation step response
  const processCampaignCreationResponse = useCallback(
    async (userMessage: string) => {
      const { currentStep, draft, recommendations, selectedRecommendation } = campaignCreation;

      // Handle recommendations step
      if (currentStep === 'recommendations') {
        const { selectedRecommendation: selected, isCustom } = processRecommendationSelection(
          userMessage,
          recommendations
        );

        if (selected) {
          selectRecommendation(selected);
        } else if (isCustom) {
          // User wants a custom campaign
          setCampaignCreation(prev => ({
            ...prev,
            currentStep: 'title',
          }));

          const question = getStepQuestion('title', {});
          const assistantMessage = createCampaignCreationMessage(question, 'title');
          setMessages(prev => [...prev, assistantMessage]);
        }
        return;
      }

      // Handle review step
      if (currentStep === 'review') {
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('create') || lowerMessage.includes('confirm') || lowerMessage.includes('yes')) {
          // Finalize campaign creation
          setCampaignCreation(prev => ({
            ...prev,
            currentStep: 'complete',
          }));

          const completeMessage = getStepQuestion('complete', draft);
          const assistantMessage = createCampaignCreationMessage(completeMessage, 'complete', undefined, draft, selectedRecommendation);
          setMessages(prev => [...prev, assistantMessage]);

          // Reset after completion
          setTimeout(() => {
            setCampaignCreation(getInitialCampaignCreationState());
          }, 1000);
          return;
        }
      }

      // Parse user response and update draft
      const { draft: updatedDraft, isValid, errorMessage } = parseUserResponse(
        currentStep,
        userMessage,
        draft
      );

      if (!isValid && errorMessage) {
        const assistantMessage: AIMessage = {
          id: `ai-msg-${Date.now()}`,
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        return;
      }

      // Move to next step
      const nextStep = getNextStep(currentStep);
      setCampaignCreation(prev => ({
        ...prev,
        currentStep: nextStep,
        draft: updatedDraft,
      }));

      // Generate next question
      const question = getStepQuestion(nextStep, updatedDraft, selectedRecommendation);
      const assistantMessage = createCampaignCreationMessage(
        question,
        nextStep,
        undefined,
        updatedDraft,
        selectedRecommendation
      );
      setMessages(prev => [...prev, assistantMessage]);
    },
    [campaignCreation, selectRecommendation]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Add user message immediately
      const userMessage: AIMessage = {
        id: `user-msg-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setStatus('thinking');
      setError(null);

      // Check if we're in campaign creation flow
      if (campaignCreation.isActive) {
        await processCampaignCreationResponse(content);
        setStatus('idle');
        return;
      }

      // Check if user wants to start campaign creation
      if (detectCampaignCreationIntent(content)) {
        await startCampaignCreation();
        return;
      }

      // Regular AI conversation
      try {
        const assistantMessage = await service.sendMessage(
          content,
          messages,
          contextData,
          {
            onComplete: () => setStatus('idle'),
            onError: (err) => {
              setError(err.message);
              setStatus('error');
            },
          }
        );

        setMessages(prev => [...prev, assistantMessage]);
        setStatus('idle');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        setStatus('error');
      }
    },
    [messages, contextData, service, campaignCreation.isActive, processCampaignCreationResponse, startCampaignCreation]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setStatus('idle');
    setCampaignCreation(getInitialCampaignCreationState());
  }, []);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

  const value: AIContextValue = {
    messages,
    status,
    error,
    isOpen,
    isConfigured,
    sendMessage,
    clearMessages,
    openChat,
    closeChat,
    toggleChat,
    setContextData,
    campaignCreation,
    startCampaignCreation,
    selectRecommendation,
    cancelCampaignCreation,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI(): AIContextValue {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
