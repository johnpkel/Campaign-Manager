import { CampaignFormData, CampaignChannel } from '../../../types/campaign';
import { CampaignDraft } from '../../ai/types/ai';
import { EnrichedCampaignDraft } from '../contexts/WizardContext';

/**
 * Maps channel strings from the draft to valid CampaignChannel types
 */
function mapChannels(channels?: string[]): CampaignChannel[] {
  if (!channels || channels.length === 0) return ['Web'];

  const validChannels: CampaignChannel[] = ['Web', 'Native Mobile', 'Social', 'Ads', 'Email'];
  return channels
    .map(ch => {
      const normalized = ch.trim();
      // Match against valid channels
      const match = validChannels.find(
        vc => vc.toLowerCase() === normalized.toLowerCase()
      );
      return match;
    })
    .filter((ch): ch is CampaignChannel => ch !== undefined);
}

/**
 * Attempts to parse a date string and returns ISO format date (YYYY-MM-DD)
 * Returns null if the string is not a valid date
 */
function parseToISODate(dateStr?: string): string | null {
  if (!dateStr) return null;

  // Check if it's already in ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try to extract a date pattern like "1/29/2026" or "01/29/2026"
  const dateMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    const [, month, day, year] = dateMatch;
    const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  }

  // Try standard Date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Converts the AI-generated CampaignDraft to CampaignFormData for saving to Contentstack
 */
export function mapDraftToFormData(draft: Partial<CampaignDraft> | EnrichedCampaignDraft): CampaignFormData {
  // Default dates: start today, end in 30 days if not specified
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(today.getDate() + 30);

  // Parse dates from draft, falling back to defaults
  const startDate = parseToISODate(draft.startDate) || today.toISOString().split('T')[0];

  // For end date, try to parse it, or calculate from start date
  let endDate = parseToISODate(draft.endDate);
  if (!endDate) {
    // Default to 30 days after start date
    const startDateObj = new Date(startDate);
    startDateObj.setDate(startDateObj.getDate() + 30);
    endDate = startDateObj.toISOString().split('T')[0];
  }

  // Map channels with fallback to ['Web']
  const channels = mapChannels(draft.channels);
  if (channels.length === 0) {
    channels.push('Web');
  }

  // Build form data with only essential fields that work
  // Note: RTE fields (key_messages, campaign_goals, market_research) are excluded
  // because the JSON RTE format needs to match Contentstack's exact schema
  const formData: CampaignFormData = {
    title: draft.title || 'Untitled Campaign',
    start_date: startDate,
    end_date: endDate,
    status: 'active', // New campaigns from wizard are set to active
    channels: channels,
  };

  // Add budget if specified (simple string field)
  if (draft.budget) {
    formData.budget = draft.budget;
  }

  console.log('Mapped draft to form data:', formData);

  return formData;
}

/**
 * Generates a URL for viewing a campaign in the Contentstack UI
 */
export function getCampaignUrl(campaignUid: string, stackApiKey?: string): string {
  // If we have the stack API key, generate a Contentstack URL
  if (stackApiKey) {
    return `https://app.contentstack.com/#!/stack/${stackApiKey}/content-type/cs_campaign_manager/en-us/entry/${campaignUid}/edit`;
  }
  // Otherwise, return a relative URL within the app
  return `/campaigns/${campaignUid}`;
}
