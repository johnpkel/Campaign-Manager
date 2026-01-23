import { RecommendedAsset } from '../types';
import { CampaignDraft } from '../../ai/types/ai';

// Mock assets that would come from Contentstack Asset Manager
const MOCK_ASSETS: Omit<RecommendedAsset, 'relevanceScore' | 'matchedKeywords' | 'selected'>[] = [
  {
    id: 'asset_001',
    title: 'Summer Sale Hero Banner',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop',
  },
  {
    id: 'asset_002',
    title: 'Product Showcase Video',
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=200&h=200&fit=crop',
  },
  {
    id: 'asset_003',
    title: 'Holiday Promotional Graphics',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=200&h=200&fit=crop',
  },
  {
    id: 'asset_004',
    title: 'Brand Guidelines PDF',
    type: 'document',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&h=200&fit=crop',
  },
  {
    id: 'asset_005',
    title: 'Social Media Templates',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
  },
  {
    id: 'asset_006',
    title: 'Email Header Graphics',
    type: 'image',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=200&h=200&fit=crop',
  },
  {
    id: 'asset_007',
    title: 'Product Launch Presentation',
    type: 'document',
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop',
  },
  {
    id: 'asset_008',
    title: 'Testimonial Video Clips',
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  },
];

// Keywords associated with each asset for matching
const ASSET_KEYWORDS: Record<string, string[]> = {
  asset_001: ['summer', 'sale', 'discount', 'hero', 'banner', 'promotion'],
  asset_002: ['product', 'showcase', 'video', 'demo', 'feature'],
  asset_003: ['holiday', 'promotional', 'seasonal', 'festive', 'christmas'],
  asset_004: ['brand', 'guidelines', 'style', 'document', 'guide'],
  asset_005: ['social', 'media', 'template', 'instagram', 'facebook', 'twitter'],
  asset_006: ['email', 'header', 'newsletter', 'marketing'],
  asset_007: ['launch', 'presentation', 'product', 'deck', 'slides'],
  asset_008: ['testimonial', 'customer', 'review', 'video', 'social proof'],
};

// Extract keywords from campaign draft
function extractKeywords(draft: Partial<CampaignDraft>): string[] {
  const keywords: string[] = [];

  if (draft.title) {
    keywords.push(...draft.title.toLowerCase().split(/\s+/));
  }

  if (draft.keyMessages) {
    keywords.push(...draft.keyMessages.toLowerCase().split(/\s+/));
  }

  if (draft.goals) {
    keywords.push(...draft.goals.toLowerCase().split(/\s+/));
  }

  if (draft.channels) {
    keywords.push(...draft.channels.map(c => c.toLowerCase()));
  }

  // Filter out common words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  return [...new Set(keywords.filter(k => k.length > 2 && !stopWords.includes(k)))];
}

// Calculate relevance score for an asset
function calculateAssetRelevance(assetId: string, campaignKeywords: string[]): { score: number; matched: string[] } {
  const assetKeywords = ASSET_KEYWORDS[assetId] || [];
  const matched: string[] = [];
  let score = 0;

  for (const keyword of campaignKeywords) {
    for (const assetKeyword of assetKeywords) {
      if (assetKeyword.includes(keyword) || keyword.includes(assetKeyword)) {
        matched.push(assetKeyword);
        score += 20;
      }
    }
  }

  // Cap score at 100
  return { score: Math.min(score, 100), matched: [...new Set(matched)] };
}

// Get recommended assets based on campaign draft
export async function getRecommendedAssets(draft: Partial<CampaignDraft>): Promise<RecommendedAsset[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const keywords = extractKeywords(draft);

  if (keywords.length === 0) {
    // Return top assets with base scores if no keywords
    return MOCK_ASSETS.slice(0, 4).map(asset => ({
      ...asset,
      relevanceScore: 50,
      matchedKeywords: [],
      selected: false,
    }));
  }

  const scoredAssets = MOCK_ASSETS.map(asset => {
    const { score, matched } = calculateAssetRelevance(asset.id, keywords);
    return {
      ...asset,
      relevanceScore: score,
      matchedKeywords: matched,
      selected: false,
    };
  });

  // Sort by relevance and return top 6
  return scoredAssets
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 6);
}
