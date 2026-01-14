import { AIMessage, AIConfig, AIStreamCallbacks, AIContext } from '../types/ai';

const DEFAULT_SYSTEM_PROMPT = `You are an AI assistant for the Experience Manager platform. You help users manage their marketing campaigns, analyze performance data, and provide actionable recommendations.

You have access to the following context:
- Campaign management: Create, edit, and track marketing campaigns
- Analytics: Website traffic, conversion rates, channel performance
- Collaboration: Team activity and comments

When providing recommendations:
1. Be specific and actionable
2. Reference actual data when available
3. Suggest concrete next steps
4. Keep responses concise but helpful`;

export interface AIService {
  sendMessage(
    userMessage: string,
    conversationHistory: AIMessage[],
    context?: AIContext,
    callbacks?: AIStreamCallbacks
  ): Promise<AIMessage>;

  isConfigured(): boolean;
}

export class ClaudeAIService implements AIService {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private systemPrompt: string;

  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.maxTokens = config.maxTokens || 1024;
    this.systemPrompt = config.systemPrompt || DEFAULT_SYSTEM_PROMPT;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private buildSystemPromptWithContext(context?: AIContext): string {
    let prompt = this.systemPrompt;

    if (context) {
      prompt += '\n\n--- Current Context ---\n';

      if (context.activeCampaigns !== undefined) {
        prompt += `Active Campaigns: ${context.activeCampaigns}\n`;
      }
      if (context.totalBudget !== undefined) {
        prompt += `Total Budget: $${context.totalBudget.toLocaleString()}\n`;
      }
      if (context.analyticsHighlights && context.analyticsHighlights.length > 0) {
        prompt += `Analytics Highlights:\n${context.analyticsHighlights.map(h => `- ${h}`).join('\n')}\n`;
      }
      if (context.recentActivity && context.recentActivity.length > 0) {
        prompt += `Recent Activity:\n${context.recentActivity.map(a => `- ${a}`).join('\n')}\n`;
      }
    }

    return prompt;
  }

  async sendMessage(
    userMessage: string,
    conversationHistory: AIMessage[],
    context?: AIContext,
    callbacks?: AIStreamCallbacks
  ): Promise<AIMessage> {
    if (!this.isConfigured()) {
      throw new Error('AI service is not configured. Please add your API key.');
    }

    const systemPrompt = this.buildSystemPromptWithContext(context);

    const messages = conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    messages.push({ role: 'user', content: userMessage });

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          system: systemPrompt,
          messages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get AI response');
      }

      const data = await response.json();
      const assistantContent = data.content[0]?.text || 'No response generated.';

      const assistantMessage: AIMessage = {
        id: `ai-msg-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString(),
      };

      callbacks?.onComplete?.(assistantContent);

      return assistantMessage;
    } catch (error) {
      callbacks?.onError?.(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }
}

export class MockAIService implements AIService {
  private mockResponses: Record<string, string> = {
    campaign: `Based on your current campaigns, here are my recommendations:

1. **Summer Sale 2024** is performing well with high engagement. Consider increasing its budget by 15% to capitalize on momentum.

2. **Product Launch** could benefit from more A/B testing on the landing page. The current conversion rate of 2.8% has room for improvement.

3. Your Q4 planning should start soon. Based on last year's data, allocating budget early for holiday campaigns typically yields 20% better results.

Would you like me to create a detailed action plan for any of these suggestions?`,

    analytics: `Looking at your analytics data, I notice several trends:

**Traffic Insights:**
- Organic search is your top performer at 35% of traffic
- Social traffic has grown 15% month-over-month
- Direct traffic indicates strong brand recognition

**Recommendations:**
1. Double down on SEO for your top-performing content
2. The social growth suggests your recent campaigns are working - consider extending them
3. Email conversion rate (4.2%) is higher than average - expand your email list

Would you like me to dive deeper into any of these areas?`,

    default: `I can help you with several things:

- **Campaign Management**: Create, edit, or analyze your marketing campaigns
- **Analytics Review**: Understand your traffic patterns and performance metrics
- **Recommendations**: Get actionable suggestions based on your data
- **Content Ideas**: Brainstorm campaign themes and messaging

What would you like to explore?`,
  };

  isConfigured(): boolean {
    return true; // Mock is always "configured"
  }

  async sendMessage(
    userMessage: string,
    _conversationHistory: AIMessage[],
    _context?: AIContext,
    callbacks?: AIStreamCallbacks
  ): Promise<AIMessage> {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    let response = this.mockResponses.default;

    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('campaign') || lowerMessage.includes('budget')) {
      response = this.mockResponses.campaign;
    } else if (lowerMessage.includes('analytics') || lowerMessage.includes('traffic') || lowerMessage.includes('performance')) {
      response = this.mockResponses.analytics;
    }

    const assistantMessage: AIMessage = {
      id: `ai-msg-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    callbacks?.onComplete?.(response);

    return assistantMessage;
  }
}

// Factory function to create appropriate service
export function createAIService(config?: AIConfig): AIService {
  if (config?.apiKey) {
    return new ClaudeAIService(config);
  }

  // Check for environment variable
  const envApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (envApiKey) {
    return new ClaudeAIService({ ...config, apiKey: envApiKey });
  }

  // Fall back to mock
  return new MockAIService();
}
