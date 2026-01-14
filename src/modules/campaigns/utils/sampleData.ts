import { Campaign, RTEContent, MilestoneStatus } from '../types';

// Helper to create simple RTE content
function createRTEContent(text: string): RTEContent {
  return {
    type: 'doc',
    uid: `rte_${Math.random().toString(36).slice(2, 9)}`,
    children: [
      {
        type: 'p',
        uid: `p_${Math.random().toString(36).slice(2, 9)}`,
        children: [{ type: 'text', text }],
      },
    ],
  };
}

// Helper to create RTE content with multiple paragraphs/bullet points
function createRTEBullets(texts: string[]): RTEContent {
  return {
    type: 'doc',
    uid: `rte_${Math.random().toString(36).slice(2, 9)}`,
    children: texts.map((text) => ({
      type: 'p',
      uid: `p_${Math.random().toString(36).slice(2, 9)}`,
      children: [{ type: 'text', text }],
    })),
  };
}

// Helper to create timeline milestone with status
function createMilestone(name: string, date: string, status: MilestoneStatus) {
  return { milestone_name: name, milestone_date: date, status };
}

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    uid: 'blt_campaign_001',
    title: 'Beneath the Reef',
    key_messages: createRTEBullets([
      '"Beneath the Reef" focuses on safeguarding turtle habitats through strategic conservation efforts and community engagement.',
      'The campaign emphasizes the importance of reducing plastic waste, which poses significant threats to marine life, including turtles.',
      'Collaboration with local governments and organizations ensures compliance with environmental regulations and enhances the effectiveness of conservation initiatives.',
      'Educational programs are integral to the campaign, aiming to raise awareness about the critical role turtles play in marine ecosystems.',
      'Data-driven approaches are employed to monitor turtle populations and assess the impact of conservation measures, ensuring transparency and accountability.',
    ]),
    campaign_goals: createRTEBullets([
      'Enhance public awareness about the critical threats facing sea turtles and their habitats, emphasizing the importance of conservation efforts.',
      'Mobilize community engagement through educational programs and volunteer opportunities, fostering a sense of responsibility and action among participants.',
      'Secure funding and resources to support ongoing research and conservation initiatives, ensuring the sustainability of efforts to protect sea turtle populations.',
      'Strengthen partnerships with local and international organizations to amplify the impact of conservation strategies and share best practices.',
      'Implement measurable outcomes to track the progress of conservation efforts, ensuring transparency and accountability in achieving campaign objectives.',
    ]),
    start_date: '2025-07-31',
    end_date: '2026-02-27',
    contributors: [
      { uid: 'user_001', _content_type_uid: 'users', name: 'Alex Johnson', role: 'Product Marketing', initials: 'AJ' },
      { uid: 'user_002', _content_type_uid: 'users', name: 'Mike Rodriguez', role: 'Creative Director', initials: 'MR' },
    ],
    budget: '$85,000',
    status: 'content_creation',
    channels: ['Web', 'Social'],
    assets: [
      { uid: 'asset_001', url: 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=800', filename: 'Indian Tortoise', content_type: 'image/jpeg' },
      { uid: 'asset_002', url: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800', filename: 'Sea Turtle Swimming', content_type: 'image/jpeg' },
    ],
    timeline: [
      createMilestone('Content Creation Complete', '2025-01-14', 'completed'),
      createMilestone('Creative Review & Approval', '2025-01-27', 'completed'),
      createMilestone('Campaign Launch', '2025-01-31', 'completed'),
      createMilestone('Mid-Campaign Optimization', '2025-02-28', 'in_progress'),
      createMilestone('Final Performance Analysis', '2025-04-04', 'pending'),
    ],
    market_research: createRTEContent('The State of Sea Turtles in the West Indian Ocean'),
    market_research_links: [
      { title: 'The State of Sea Turtles in the West Indian Ocean', url: 'https://example.com/sea-turtle-research' },
    ],
    brand_kit: [{ uid: 'bk_001', title: 'Ocean Conservation' }],
    voice_profile: [{ uid: 'vp_001', title: 'Luxury Aspirational Voice' }],
    audiences: [
      { id: 'aud_001', name: 'Premier Customers', count: 5000 },
      { id: 'aud_002', name: 'Potential Premier Customers', count: 5000 },
    ],
    releases: [],
    entries: [
      { uid: 'entry_001', _content_type_uid: 'blog_posts', title: "The Beginner's Guide to Hiking — How to Start Your Trail Journey Confidently", image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=200', tags: ['Outdoors', 'Beginner'] },
      { uid: 'entry_002', _content_type_uid: 'blog_posts', title: '48 Hours of Pure Wellness: A Transformative Spa Retreat Itinerary', image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200', tags: ['Wellness', 'Spa'] },
    ],
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-20T14:30:00Z',
    created_by: 'sarah.johnson',
    updated_by: 'sarah.johnson',
    locale: 'en-us',
  },
  {
    uid: 'blt_campaign_002',
    title: 'Product Launch: Smart Home Hub',
    key_messages: createRTEBullets([
      'Introducing the next generation of smart home control.',
      'One hub to rule them all - seamless integration with 500+ devices.',
      'Privacy-first design with local processing capabilities.',
    ]),
    campaign_goals: createRTEBullets([
      'Generate 10,000 pre-orders in the first month.',
      'Achieve 80% positive sentiment on social media coverage.',
      'Drive 50,000 product page visits during launch week.',
    ]),
    start_date: '2025-02-01',
    end_date: '2025-03-31',
    contributors: [
      { uid: 'user_003', _content_type_uid: 'users', name: 'Emma Wilson', role: 'Product Manager', initials: 'EW' },
      { uid: 'user_001', _content_type_uid: 'users', name: 'Alex Johnson', role: 'Product Marketing', initials: 'AJ' },
    ],
    budget: '$100,000',
    status: 'active',
    channels: ['Web', 'Native Mobile', 'Social', 'Ads'],
    assets: [
      { uid: 'asset_003', url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800', filename: 'Smart Home Hub Product', content_type: 'image/jpeg' },
    ],
    timeline: [
      createMilestone('Teaser Campaign', '2025-02-01', 'completed'),
      createMilestone('Official Announcement', '2025-02-15', 'completed'),
      createMilestone('Pre-order Opens', '2025-03-01', 'in_progress'),
      createMilestone('Launch Day', '2025-03-15', 'pending'),
    ],
    market_research: createRTEContent('Smart home market growing 25% YoY. Main competitors: Amazon Echo, Google Nest, Apple HomeKit. Differentiator: open ecosystem, local processing.'),
    market_research_links: [
      { title: 'Smart Home Market Analysis 2025', url: 'https://example.com/smart-home-market' },
    ],
    brand_kit: [{ uid: 'bk_002', title: 'Tech Innovation' }],
    voice_profile: [{ uid: 'vp_002', title: 'Confident Expert' }],
    audiences: [
      { id: 'aud_003', name: 'Tech Enthusiasts', count: 12000 },
      { id: 'aud_004', name: 'Early Adopters', count: 8500 },
    ],
    releases: [],
    entries: [],
    created_at: '2024-12-01T09:00:00Z',
    updated_at: '2025-01-15T11:00:00Z',
    created_by: 'mike.chen',
    updated_by: 'mike.chen',
    locale: 'en-us',
  },
  {
    uid: 'blt_campaign_003',
    title: 'Brand Awareness - Q4',
    key_messages: createRTEBullets([
      'Building trust through transparency.',
      'Our commitment to sustainability and ethical sourcing.',
      'Leading the industry in eco-friendly practices.',
    ]),
    campaign_goals: createRTEBullets([
      'Increase brand recognition by 15% in target demographics.',
      'Grow social media following by 25%.',
    ]),
    start_date: '2025-04-01',
    end_date: '2025-06-30',
    contributors: [
      { uid: 'user_003', _content_type_uid: 'users', name: 'Emma Wilson', role: 'Brand Director', initials: 'EW' },
    ],
    budget: '$75,000',
    status: 'draft',
    channels: ['Web', 'Social', 'Ads'],
    assets: [],
    timeline: [
      createMilestone('Strategy Finalization', '2025-04-01', 'pending'),
      createMilestone('Content Production', '2025-04-15', 'pending'),
      createMilestone('Campaign Launch', '2025-05-01', 'pending'),
    ],
    market_research: createRTEContent('Brand perception survey shows 67% awareness in target demo. Opportunity to improve trust metrics around sustainability claims.'),
    brand_kit: [{ uid: 'bk_003', title: 'Sustainability Focus' }],
    voice_profile: [{ uid: 'vp_003', title: 'Authentic & Transparent' }],
    audiences: [
      { id: 'aud_005', name: 'Eco-Conscious Shoppers', count: 15000 },
    ],
    releases: [],
    entries: [],
    created_at: '2025-01-20T14:00:00Z',
    updated_at: '2025-01-25T16:00:00Z',
    created_by: 'emma.wilson',
    updated_by: 'emma.wilson',
    locale: 'en-us',
  },
  {
    uid: 'blt_campaign_004',
    title: 'Holiday Gift Guide 2024',
    key_messages: createRTEBullets([
      'Find the perfect gift for everyone on your list.',
      'Curated collections for all budgets and interests.',
      'Free gift wrapping and express shipping available.',
    ]),
    campaign_goals: createRTEBullets([
      'Drive 35% of annual revenue in Q4.',
      'Increase average order value by 20% during holiday period.',
    ]),
    start_date: '2024-11-01',
    end_date: '2024-12-31',
    contributors: [
      { uid: 'user_004', _content_type_uid: 'users', name: 'Alex Rivera', role: 'Campaign Manager', initials: 'AR' },
    ],
    budget: '$80,000',
    status: 'completed',
    channels: ['Web', 'Email', 'Native Mobile', 'Ads'],
    assets: [],
    timeline: [
      createMilestone('Gift Guide Launch', '2024-11-01', 'completed'),
      createMilestone('Black Friday', '2024-11-29', 'completed'),
      createMilestone('Cyber Monday', '2024-12-02', 'completed'),
      createMilestone('Last Ship Date', '2024-12-18', 'completed'),
    ],
    market_research: createRTEContent('Holiday spending projected up 3% YoY. Top gift categories: electronics, home goods, experiences.'),
    brand_kit: [{ uid: 'bk_004', title: 'Holiday Theme' }],
    voice_profile: [{ uid: 'vp_004', title: 'Warm & Festive' }],
    audiences: [
      { id: 'aud_006', name: 'Gift Shoppers', count: 25000 },
      { id: 'aud_007', name: 'Loyal Customers', count: 18000 },
    ],
    releases: [],
    entries: [],
    created_at: '2024-09-15T10:00:00Z',
    updated_at: '2025-01-05T09:00:00Z',
    created_by: 'alex.rivera',
    updated_by: 'alex.rivera',
    locale: 'en-us',
  },
  {
    uid: 'blt_campaign_005',
    title: 'Customer Retention Program',
    key_messages: createRTEBullets([
      'Loyalty rewards that matter.',
      'Exclusive perks for our most valued customers.',
      'Early access to new products and sales.',
    ]),
    campaign_goals: createRTEBullets([
      'Reduce customer churn by 10%.',
      'Increase repeat purchase rate by 15%.',
    ]),
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    contributors: [
      { uid: 'user_005', _content_type_uid: 'users', name: 'Jordan Lee', role: 'Retention Lead', initials: 'JL' },
    ],
    budget: '$45,000',
    status: 'active',
    channels: ['Email', 'Native Mobile'],
    assets: [],
    timeline: [
      createMilestone('Program Launch', '2025-01-01', 'completed'),
      createMilestone('Q1 Review', '2025-04-01', 'pending'),
      createMilestone('Q2 Review', '2025-07-01', 'pending'),
      createMilestone('Q3 Review', '2025-10-01', 'pending'),
    ],
    market_research: createRTEContent('Customer lifetime value analysis shows top 20% of customers drive 60% of revenue. Retention rates currently at 72%.'),
    brand_kit: [{ uid: 'bk_001', title: 'Primary Brand' }],
    voice_profile: [{ uid: 'vp_005', title: 'Personal & Caring' }],
    audiences: [
      { id: 'aud_008', name: 'VIP Customers', count: 5000 },
      { id: 'aud_009', name: 'At-Risk Customers', count: 3200 },
    ],
    releases: [],
    entries: [],
    created_at: '2024-11-01T08:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    created_by: 'jordan.lee',
    updated_by: 'jordan.lee',
    locale: 'en-us',
  },
  {
    uid: 'blt_campaign_006',
    title: 'Spring Collection Launch',
    key_messages: createRTEBullets([
      'Fresh styles for the new season.',
      'Sustainable materials, timeless designs.',
      'Limited edition pieces available now.',
    ]),
    campaign_goals: createRTEBullets([
      'Drive awareness for new spring collection.',
      'Achieve 15,000 units sold in first month.',
    ]),
    start_date: '2025-03-01',
    end_date: '2025-04-30',
    contributors: [
      { uid: 'user_001', _content_type_uid: 'users', name: 'Sarah Johnson', role: 'Marketing Director', initials: 'SJ' },
    ],
    budget: '$60,000',
    status: 'review',
    channels: ['Web', 'Email', 'Social', 'Ads'],
    assets: [
      { uid: 'asset_004', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800', filename: 'Spring Fashion', content_type: 'image/jpeg' },
    ],
    timeline: [
      createMilestone('Collection Finalization', '2025-02-15', 'completed'),
      createMilestone('Photo Shoot', '2025-02-20', 'completed'),
      createMilestone('Creative Review', '2025-02-28', 'in_progress'),
      createMilestone('Launch Day', '2025-03-01', 'pending'),
    ],
    market_research: createRTEContent('Spring fashion trends: pastels, sustainable fabrics, minimalist designs.'),
    brand_kit: [{ uid: 'bk_005', title: 'Fashion Forward' }],
    voice_profile: [{ uid: 'vp_006', title: 'Elegant & Modern' }],
    audiences: [
      { id: 'aud_010', name: 'Fashion Forward', count: 22000 },
    ],
    releases: [],
    entries: [],
    created_at: '2025-01-01T09:00:00Z',
    updated_at: '2025-01-28T14:00:00Z',
    created_by: 'sarah.johnson',
    updated_by: 'sarah.johnson',
    locale: 'en-us',
  },
  {
    uid: 'blt_campaign_007',
    title: 'SEO Content Strategy 2025',
    key_messages: createRTEBullets([
      'Comprehensive content strategy to dominate organic search.',
      'Focus on long-tail keywords and user intent.',
      'Quality content that answers real questions.',
    ]),
    campaign_goals: createRTEBullets([
      'Increase organic traffic by 40%.',
      'Rank in top 3 for 100 target keywords.',
    ]),
    start_date: '2025-01-01',
    end_date: '2025-06-30',
    contributors: [
      { uid: 'user_006', _content_type_uid: 'users', name: 'Mike Chen', role: 'SEO Lead', initials: 'MC' },
    ],
    budget: '$25,000',
    status: 'active',
    channels: ['Web'],
    assets: [],
    timeline: [
      createMilestone('Keyword Research', '2025-01-15', 'completed'),
      createMilestone('Content Calendar', '2025-02-01', 'in_progress'),
      createMilestone('First 50 Articles', '2025-04-01', 'pending'),
      createMilestone('Complete Audit', '2025-06-15', 'pending'),
    ],
    market_research: createRTEContent('SEO audit shows opportunity in informational queries. Competitors weak on technical how-to content.'),
    brand_kit: [{ uid: 'bk_001', title: 'Primary Brand' }],
    voice_profile: [{ uid: 'vp_007', title: 'Helpful & Educational' }],
    audiences: [
      { id: 'aud_011', name: 'Organic Searchers', count: 50000 },
    ],
    releases: [],
    entries: [],
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2025-01-20T16:00:00Z',
    created_by: 'mike.chen',
    updated_by: 'mike.chen',
    locale: 'en-us',
  },
];
