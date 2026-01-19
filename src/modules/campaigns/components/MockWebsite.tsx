import { Campaign } from '../types/campaign';
import styles from './MockWebsite.module.css';

interface MockWebsiteProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  highlightEnabled: boolean;
  selectedElement: string | null;
  campaign: Campaign;
}

// Navigation items
const NAV_ITEMS = [
  { label: 'Platform', path: '/platform' },
  { label: 'Products', path: '/products' },
  { label: 'Solutions', path: '/solutions' },
  { label: 'Resources', path: '/resources' },
  { label: 'Pricing', path: '/pricing' },
];

// Highlight wrapper component
function HighlightWrapper({
  id,
  isHighlighted,
  isSelected,
  label,
  children,
  type,
}: {
  id: string;
  isHighlighted: boolean;
  isSelected: boolean;
  label: string;
  children: React.ReactNode;
  type: 'hero' | 'banner' | 'cta' | 'content' | 'image';
}) {
  const typeColors: Record<string, string> = {
    hero: '#6366f1',
    banner: '#8b5cf6',
    cta: '#ec4899',
    content: '#10b981',
    image: '#f59e0b',
  };

  if (!isHighlighted) return <>{children}</>;

  return (
    <div
      className={`${styles.highlightWrapper} ${isSelected ? styles.highlightSelected : ''}`}
      style={{ '--highlight-color': typeColors[type] } as React.CSSProperties}
      data-element-id={id}
    >
      <span className={styles.highlightLabel} style={{ backgroundColor: typeColors[type] }}>
        {label}
      </span>
      {children}
    </div>
  );
}

// Header Component
function SiteHeader({ onNavigate, currentPath }: { onNavigate: (path: string) => void; currentPath: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <button className={styles.logo} onClick={() => onNavigate('/')}>
          <span className={styles.logoIcon}>◆</span>
          <span className={styles.logoText}>Contentstack</span>
        </button>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`${styles.navLink} ${currentPath === item.path ? styles.navLinkActive : ''}`}
              onClick={() => onNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <button className={styles.loginButton}>Log in</button>
          <button className={styles.demoButton}>Get a Demo</button>
        </div>
      </div>
    </header>
  );
}

// Homepage Component
function HomePage({
  highlightEnabled,
  selectedElement,
  campaign,
  onNavigate,
}: {
  highlightEnabled: boolean;
  selectedElement: string | null;
  campaign: Campaign;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <HighlightWrapper
        id="home-hero"
        isHighlighted={highlightEnabled}
        isSelected={selectedElement === 'home-hero'}
        label={`Hero - ${campaign.title}`}
        type="hero"
      >
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeIcon}>✨</span>
              New: AI-Powered Content Intelligence
            </div>
            <h1 className={styles.heroTitle}>
              The Composable DXP for
              <span className={styles.heroHighlight}> Enterprise Scale</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Build, manage, and deliver digital experiences across any channel with the world's most flexible headless CMS platform.
            </p>
            <div className={styles.heroCTAs}>
              <HighlightWrapper
                id="home-cta-primary"
                isHighlighted={highlightEnabled}
                isSelected={selectedElement === 'home-cta-primary'}
                label="Primary CTA"
                type="cta"
              >
                <button className={styles.ctaPrimary}>Start Free Trial</button>
              </HighlightWrapper>
              <button className={styles.ctaSecondary}>Watch Demo →</button>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroImage}>
              <div className={styles.mockDashboard}>
                <div className={styles.dashboardHeader}>
                  <div className={styles.dashboardDots}>
                    <span></span><span></span><span></span>
                  </div>
                  <span>Content Editor</span>
                </div>
                <div className={styles.dashboardContent}>
                  <div className={styles.dashboardSidebar}></div>
                  <div className={styles.dashboardMain}>
                    <div className={styles.dashboardCard}></div>
                    <div className={styles.dashboardCard}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </HighlightWrapper>

      {/* Promo Banner */}
      <HighlightWrapper
        id="home-promo-banner"
        isHighlighted={highlightEnabled}
        isSelected={selectedElement === 'home-promo-banner'}
        label="Promo Banner"
        type="banner"
      >
        <section className={styles.promoBanner}>
          <span className={styles.promoIcon}>🎉</span>
          <span className={styles.promoText}>
            <strong>Limited Time:</strong> {campaign.title} - Get 20% off annual plans
          </span>
          <button className={styles.promoButton}>Learn More</button>
        </section>
      </HighlightWrapper>

      {/* Trust Logos */}
      <section className={styles.trustSection}>
        <p className={styles.trustLabel}>Trusted by industry leaders</p>
        <div className={styles.trustLogos}>
          {['Burberry', 'Sephora', 'Icelandair', 'Mattel', 'Riot Games', 'Chase'].map((brand) => (
            <span key={brand} className={styles.trustLogo}>{brand}</span>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <HighlightWrapper
        id="home-features"
        isHighlighted={highlightEnabled}
        isSelected={selectedElement === 'home-features'}
        label="Features Section"
        type="content"
      >
        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Everything you need to build modern experiences</h2>
            <p className={styles.sectionSubtitle}>
              A complete digital experience platform that scales with your business
            </p>
          </div>
          <div className={styles.featureGrid}>
            {[
              { icon: '🚀', title: 'Headless CMS', desc: 'API-first content management for any frontend' },
              { icon: '🎨', title: 'Visual Builder', desc: 'Drag-and-drop page composition for marketers' },
              { icon: '🤖', title: 'AI Assistant', desc: 'Generate and optimize content with AI' },
              { icon: '🔄', title: 'Automation', desc: 'Workflows and publishing automation' },
              { icon: '📊', title: 'Analytics', desc: 'Content performance insights' },
              { icon: '🔒', title: 'Enterprise Security', desc: 'SOC 2, GDPR, and HIPAA compliant' },
            ].map((feature) => (
              <div key={feature.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </HighlightWrapper>

      {/* CTA Section */}
      <HighlightWrapper
        id="home-cta-section"
        isHighlighted={highlightEnabled}
        isSelected={selectedElement === 'home-cta-section'}
        label="CTA Section"
        type="cta"
      >
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to transform your digital experiences?</h2>
          <p className={styles.ctaSubtitle}>Join thousands of brands delivering exceptional content at scale</p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaPrimary}>Start Free Trial</button>
            <button className={styles.ctaSecondary} onClick={() => onNavigate('/platform')}>
              Explore Platform →
            </button>
          </div>
        </section>
      </HighlightWrapper>
    </div>
  );
}

// Platform Page Component
function PlatformPage({
  highlightEnabled,
  selectedElement,
  campaign,
}: {
  highlightEnabled: boolean;
  selectedElement: string | null;
  campaign: Campaign;
}) {
  return (
    <div className={styles.page}>
      {/* Platform Hero */}
      <HighlightWrapper
        id="platform-hero"
        isHighlighted={highlightEnabled}
        isSelected={selectedElement === 'platform-hero'}
        label={`Hero - ${campaign.title}`}
        type="hero"
      >
        <section className={styles.platformHero}>
          <div className={styles.platformHeroContent}>
            <span className={styles.platformLabel}>PLATFORM</span>
            <h1 className={styles.platformTitle}>
              The Composable Digital Experience Platform
            </h1>
            <p className={styles.platformSubtitle}>
              Build, manage, and optimize content experiences across every touchpoint with our modular, API-first platform.
            </p>
            <div className={styles.platformStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>99.99%</span>
                <span className={styles.statLabel}>Uptime SLA</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>&lt;50ms</span>
                <span className={styles.statLabel}>API Response</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>150+</span>
                <span className={styles.statLabel}>Integrations</span>
              </div>
            </div>
          </div>
        </section>
      </HighlightWrapper>

      {/* Product Cards */}
      <HighlightWrapper
        id="platform-products"
        isHighlighted={highlightEnabled}
        isSelected={selectedElement === 'platform-products'}
        label="Product Cards"
        type="content"
      >
        <section className={styles.productSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Platform Capabilities</h2>
          </div>
          <div className={styles.productGrid}>
            {[
              {
                icon: '📝',
                title: 'Content Management',
                desc: 'Structured content modeling with powerful APIs',
                color: '#6366f1',
              },
              {
                icon: '🎯',
                title: 'Personalization',
                desc: 'Deliver targeted experiences to every audience',
                color: '#ec4899',
              },
              {
                icon: '🔬',
                title: 'Experimentation',
                desc: 'A/B testing and multivariate experiments',
                color: '#8b5cf6',
              },
              {
                icon: '📈',
                title: 'Analytics',
                desc: 'Real-time content performance insights',
                color: '#10b981',
              },
            ].map((product) => (
              <div key={product.title} className={styles.productCard}>
                <div className={styles.productIcon} style={{ backgroundColor: `${product.color}15`, color: product.color }}>
                  {product.icon}
                </div>
                <h3 className={styles.productTitle}>{product.title}</h3>
                <p className={styles.productDesc}>{product.desc}</p>
                <button className={styles.productLink}>Learn more →</button>
              </div>
            ))}
          </div>
        </section>
      </HighlightWrapper>

      {/* Integration Section */}
      <section className={styles.integrationSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Integrate with your stack</h2>
          <p className={styles.sectionSubtitle}>Connect to 150+ tools and services</p>
        </div>
        <div className={styles.integrationLogos}>
          {['React', 'Next.js', 'Vue', 'Angular', 'Gatsby', 'Nuxt', 'Salesforce', 'Marketo'].map((tool) => (
            <span key={tool} className={styles.integrationLogo}>{tool}</span>
          ))}
        </div>
      </section>

      {/* Campaign Banner */}
      <HighlightWrapper
        id="platform-campaign-banner"
        isHighlighted={highlightEnabled}
        isSelected={selectedElement === 'platform-campaign-banner'}
        label={`Campaign Banner - ${campaign.title}`}
        type="banner"
      >
        <section className={styles.campaignBanner}>
          <div className={styles.campaignBannerContent}>
            <span className={styles.campaignBadge}>Special Offer</span>
            <h3 className={styles.campaignBannerTitle}>{campaign.title}</h3>
            <p className={styles.campaignBannerText}>
              Unlock enterprise features with our limited time promotion
            </p>
            <button className={styles.campaignBannerCTA}>Claim Offer</button>
          </div>
        </section>
      </HighlightWrapper>
    </div>
  );
}

// Products Page Component
function ProductsPage({
  highlightEnabled,
  selectedElement,
  campaign,
}: {
  highlightEnabled: boolean;
  selectedElement: string | null;
  campaign: Campaign;
}) {
  return (
    <div className={styles.page}>
      {/* Products Hero */}
      <HighlightWrapper
        id="products-hero"
        isHighlighted={highlightEnabled}
        isSelected={selectedElement === 'products-hero'}
        label={`Hero - ${campaign.title}`}
        type="hero"
      >
        <section className={styles.productsHero}>
          <span className={styles.platformLabel}>PRODUCTS</span>
          <h1 className={styles.platformTitle}>
            Build experiences your customers love
          </h1>
          <p className={styles.platformSubtitle}>
            Explore our suite of products designed to power your digital transformation
          </p>
        </section>
      </HighlightWrapper>

      {/* Product List */}
      <HighlightWrapper
        id="products-list"
        isHighlighted={highlightEnabled}
        isSelected={selectedElement === 'products-list'}
        label="Product List"
        type="content"
      >
        <section className={styles.productListSection}>
          {[
            {
              title: 'Headless CMS',
              desc: 'The foundation for all your content. Create, manage, and deliver structured content across any channel.',
              features: ['Content Modeling', 'Multi-language', 'Workflows', 'Versioning'],
              image: '📄',
            },
            {
              title: 'Visual Builder',
              desc: 'Empower marketers to create landing pages and experiences without developer help.',
              features: ['Drag & Drop', 'Templates', 'Preview', 'Scheduling'],
              image: '🎨',
            },
            {
              title: 'Personalization Engine',
              desc: 'Deliver the right content to the right audience at the right time.',
              features: ['Audience Targeting', 'A/B Testing', 'Real-time', 'Analytics'],
              image: '🎯',
            },
          ].map((product, index) => (
            <div key={product.title} className={`${styles.productListItem} ${index % 2 === 1 ? styles.productListItemReverse : ''}`}>
              <div className={styles.productListContent}>
                <h2 className={styles.productListTitle}>{product.title}</h2>
                <p className={styles.productListDesc}>{product.desc}</p>
                <ul className={styles.productListFeatures}>
                  {product.features.map((f) => (
                    <li key={f}><span className={styles.checkIcon}>✓</span> {f}</li>
                  ))}
                </ul>
                <button className={styles.ctaPrimary}>Learn More</button>
              </div>
              <div className={styles.productListImage}>
                <span className={styles.productListEmoji}>{product.image}</span>
              </div>
            </div>
          ))}
        </section>
      </HighlightWrapper>

      {/* Bottom CTA */}
      <HighlightWrapper
        id="products-cta"
        isHighlighted={highlightEnabled}
        isSelected={selectedElement === 'products-cta'}
        label="CTA Section"
        type="cta"
      >
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>See our products in action</h2>
          <p className={styles.ctaSubtitle}>Schedule a personalized demo with our team</p>
          <button className={styles.ctaPrimary}>Request Demo</button>
        </section>
      </HighlightWrapper>
    </div>
  );
}

// Footer Component
function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <span className={styles.logoIcon}>◆</span>
          <span className={styles.logoText}>Contentstack</span>
          <p className={styles.footerTagline}>The composable DXP for enterprise</p>
        </div>
        <div className={styles.footerLinks}>
          <div className={styles.footerColumn}>
            <h4>Platform</h4>
            <a href="#">Headless CMS</a>
            <a href="#">Visual Builder</a>
            <a href="#">Personalization</a>
          </div>
          <div className={styles.footerColumn}>
            <h4>Resources</h4>
            <a href="#">Documentation</a>
            <a href="#">Blog</a>
            <a href="#">Community</a>
          </div>
          <div className={styles.footerColumn}>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>© 2024 Contentstack. All rights reserved.</span>
      </div>
    </footer>
  );
}

// Main Mock Website Component
export function MockWebsite({
  currentPath,
  onNavigate,
  highlightEnabled,
  selectedElement,
  campaign,
}: MockWebsiteProps) {
  const renderPage = () => {
    switch (currentPath) {
      case '/platform':
        return <PlatformPage highlightEnabled={highlightEnabled} selectedElement={selectedElement} campaign={campaign} />;
      case '/products':
        return <ProductsPage highlightEnabled={highlightEnabled} selectedElement={selectedElement} campaign={campaign} />;
      default:
        return <HomePage highlightEnabled={highlightEnabled} selectedElement={selectedElement} campaign={campaign} onNavigate={onNavigate} />;
    }
  };

  return (
    <div className={styles.website}>
      <SiteHeader onNavigate={onNavigate} currentPath={currentPath} />
      <main className={styles.main}>
        {renderPage()}
      </main>
      <SiteFooter />
    </div>
  );
}
