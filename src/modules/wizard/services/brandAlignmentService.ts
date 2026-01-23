import { BrandKitAlignmentInsight, BrandAlignmentIssue } from '../types';
import { CampaignDraft } from '../../ai/types/ai';

// Mock brand kits with their guidelines
const BRAND_KIT_GUIDELINES: Record<string, {
  name: string;
  toneKeywords: string[];
  avoidKeywords: string[];
  requiredElements: string[];
}> = {
  'Primary Brand': {
    name: 'Primary Brand',
    toneKeywords: ['professional', 'innovative', 'trusted', 'reliable', 'quality'],
    avoidKeywords: ['cheap', 'basic', 'simple', 'discount'],
    requiredElements: ['clear messaging', 'brand voice', 'value proposition'],
  },
  'Product Line A': {
    name: 'Product Line A',
    toneKeywords: ['premium', 'exclusive', 'luxury', 'sophisticated', 'elegant'],
    avoidKeywords: ['budget', 'affordable', 'low-cost'],
    requiredElements: ['product benefits', 'unique features'],
  },
  'Holiday Theme': {
    name: 'Holiday Theme',
    toneKeywords: ['festive', 'celebration', 'joy', 'seasonal', 'special', 'gift'],
    avoidKeywords: ['everyday', 'regular', 'standard'],
    requiredElements: ['seasonal messaging', 'urgency', 'celebration'],
  },
  'Minimal Clean': {
    name: 'Minimal Clean',
    toneKeywords: ['simple', 'clean', 'minimal', 'modern', 'sleek', 'essential'],
    avoidKeywords: ['complex', 'busy', 'cluttered', 'overwhelming'],
    requiredElements: ['clarity', 'focus', 'simplicity'],
  },
};

// Check for tone alignment
function checkToneAlignment(content: string, brandKit: string): { score: number; issues: BrandAlignmentIssue[] } {
  const guidelines = BRAND_KIT_GUIDELINES[brandKit];
  if (!guidelines) {
    return { score: 50, issues: [] };
  }

  const issues: BrandAlignmentIssue[] = [];
  let score = 60; // Base score
  const contentLower = content.toLowerCase();

  // Check for positive tone keywords
  let positiveMatches = 0;
  for (const keyword of guidelines.toneKeywords) {
    if (contentLower.includes(keyword)) {
      positiveMatches++;
      score += 8;
    }
  }

  if (positiveMatches === 0 && content.length > 20) {
    issues.push({
      type: 'tone',
      severity: 'warning',
      message: `Consider incorporating brand tone keywords like "${guidelines.toneKeywords.slice(0, 3).join('", "')}"`,
    });
  }

  // Check for keywords to avoid
  for (const keyword of guidelines.avoidKeywords) {
    if (contentLower.includes(keyword)) {
      score -= 15;
      issues.push({
        type: 'voice',
        severity: 'error',
        message: `The word "${keyword}" may not align with the ${guidelines.name} brand voice`,
      });
    }
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

// Generate improvement suggestions
function generateSuggestions(draft: Partial<CampaignDraft>, brandKit: string, score: number): string[] {
  const suggestions: string[] = [];
  const guidelines = BRAND_KIT_GUIDELINES[brandKit];

  if (!guidelines) return suggestions;

  if (score < 70) {
    suggestions.push(`Strengthen alignment with ${guidelines.name} brand voice`);
  }

  if (!draft.keyMessages || draft.keyMessages.length < 50) {
    suggestions.push('Add more detailed key messages to improve brand alignment scoring');
  }

  // Check for required elements
  const content = `${draft.title || ''} ${draft.keyMessages || ''} ${draft.goals || ''}`.toLowerCase();
  for (const element of guidelines.requiredElements) {
    const elementWords = element.split(' ');
    const hasElement = elementWords.some(word => content.includes(word));
    if (!hasElement) {
      suggestions.push(`Consider adding ${element} to strengthen brand alignment`);
    }
  }

  return suggestions.slice(0, 3);
}

// Calculate brand alignment
export async function calculateBrandAlignment(draft: Partial<CampaignDraft>): Promise<BrandKitAlignmentInsight> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 250));

  const brandKit = draft.brandKit || null;

  if (!brandKit) {
    return {
      selectedBrandKit: null,
      alignmentScore: 0,
      issues: [{
        type: 'tone',
        severity: 'info',
        message: 'Select a Brand Kit to see alignment scoring',
      }],
      suggestions: ['Choose a Brand Kit to ensure consistent brand messaging'],
      isLoading: false,
    };
  }

  // Combine all text content for analysis
  const allContent = [
    draft.title || '',
    draft.keyMessages || '',
    draft.goals || '',
  ].join(' ');

  const { score, issues } = checkToneAlignment(allContent, brandKit);
  const suggestions = generateSuggestions(draft, brandKit, score);

  return {
    selectedBrandKit: brandKit,
    alignmentScore: score,
    issues,
    suggestions,
    isLoading: false,
  };
}
