import { RecommendedContent } from '../types';
import { CampaignDraft } from '../../ai/types/ai';

// Mock CMS content entries
const MOCK_CONTENT: Omit<RecommendedContent, 'relevanceScore' | 'matchReason' | 'selected'>[] = [
  {
    entryUid: 'entry_001',
    title: 'Summer Collection Landing Page',
    contentType: 'Landing Page',
    url: '/summer-collection',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
  },
  {
    entryUid: 'entry_002',
    title: 'New Arrivals Showcase',
    contentType: 'Product Page',
    url: '/new-arrivals',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
  },
  {
    entryUid: 'entry_003',
    title: 'Product Spotlight: Best Sellers',
    contentType: 'Product Page',
    url: '/best-sellers',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop',
  },
  {
    entryUid: 'entry_004',
    title: 'Getting Started Guide',
    contentType: 'Documentation',
    url: '/getting-started',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=200&fit=crop',
  },
  {
    entryUid: 'entry_005',
    title: 'Homepage Hero Section',
    contentType: 'Homepage',
    url: '/',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
  },
  {
    entryUid: 'entry_006',
    title: 'Special Offers & Deals',
    contentType: 'Landing Page',
    url: '/offers',
    imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=200&h=200&fit=crop',
  },
  {
    entryUid: 'entry_007',
    title: 'Customer Success Stories',
    contentType: 'Blog Post',
    url: '/blog/customer-stories',
    imageUrl: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=200&h=200&fit=crop',
  },
  {
    entryUid: 'entry_008',
    title: 'About Our Brand',
    contentType: 'About Page',
    url: '/about',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
  },
];

// Content type relevance for different campaign goals
const CONTENT_TYPE_RELEVANCE: Record<string, string[]> = {
  'Landing Page': ['launch', 'promotion', 'sale', 'campaign', 'offer', 'discount'],
  'Product Page': ['product', 'feature', 'showcase', 'new', 'arrivals', 'collection'],
  'Blog Post': ['awareness', 'education', 'content', 'story', 'engagement'],
  'Homepage': ['brand', 'visibility', 'awareness', 'traffic'],
  'Documentation': ['onboarding', 'guide', 'help', 'support'],
  'About Page': ['brand', 'trust', 'story', 'company'],
};

// Generate match reason based on campaign content
function generateMatchReason(content: typeof MOCK_CONTENT[0], draft: Partial<CampaignDraft>): string {
  const reasons: string[] = [];

  // Check title match
  if (draft.title && content.title.toLowerCase().includes(draft.title.toLowerCase().split(' ')[0])) {
    reasons.push('Title matches campaign theme');
  }

  // Check content type relevance
  if (draft.goals) {
    const relevantTerms = CONTENT_TYPE_RELEVANCE[content.contentType] || [];
    for (const term of relevantTerms) {
      if (draft.goals.toLowerCase().includes(term)) {
        reasons.push(`${content.contentType} aligns with campaign goals`);
        break;
      }
    }
  }

  // Check channel relevance
  if (draft.channels?.includes('Web')) {
    if (content.contentType === 'Landing Page' || content.contentType === 'Homepage') {
      reasons.push('Optimized for web channel');
    }
  }

  if (reasons.length === 0) {
    reasons.push('Relevant content for your campaign');
  }

  return reasons[0];
}

// Calculate content relevance score
function calculateContentRelevance(content: typeof MOCK_CONTENT[0], draft: Partial<CampaignDraft>): number {
  let score = 30; // Base score

  // Title keyword matching
  if (draft.title) {
    const titleWords = draft.title.toLowerCase().split(/\s+/);
    for (const word of titleWords) {
      if (word.length > 2 && content.title.toLowerCase().includes(word)) {
        score += 15;
      }
    }
  }

  // Goals keyword matching
  if (draft.goals) {
    const relevantTerms = CONTENT_TYPE_RELEVANCE[content.contentType] || [];
    for (const term of relevantTerms) {
      if (draft.goals.toLowerCase().includes(term)) {
        score += 20;
      }
    }
  }

  // Channel matching
  if (draft.channels?.includes('Web')) {
    if (['Landing Page', 'Homepage', 'Product Page'].includes(content.contentType)) {
      score += 10;
    }
  }

  if (draft.channels?.includes('Email')) {
    if (['Blog Post', 'Product Page'].includes(content.contentType)) {
      score += 10;
    }
  }

  return Math.min(score, 100);
}

// Get recommended content based on campaign draft
export async function getRecommendedContent(draft: Partial<CampaignDraft>): Promise<RecommendedContent[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 350));

  const scoredContent = MOCK_CONTENT.map(content => ({
    ...content,
    relevanceScore: calculateContentRelevance(content, draft),
    matchReason: generateMatchReason(content, draft),
    selected: false,
  }));

  // Sort by relevance and return top 6
  return scoredContent
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 6);
}
