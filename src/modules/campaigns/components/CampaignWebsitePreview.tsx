import { useState } from 'react';
import { Campaign } from '../types/campaign';
import { MockWebsite } from './MockWebsite';
import styles from './CampaignWebsitePreview.module.css';

interface CampaignWebsitePreviewProps {
  campaign: Campaign;
}

// Types for modified pages and elements
interface ModifiedElement {
  id: string;
  type: 'hero' | 'banner' | 'cta' | 'content' | 'image';
  description: string;
  variantName?: string;
}

interface ModifiedPage {
  id: string;
  title: string;
  path: string;
  modifiedElements: ModifiedElement[];
  isPersonalized: boolean;
}

// Generate modified pages based on campaign - these map to MockWebsite components
function generateMockModifiedPages(campaign: Campaign): ModifiedPage[] {
  const pages: ModifiedPage[] = [
    {
      id: 'page-home',
      title: 'Homepage',
      path: '/',
      isPersonalized: true,
      modifiedElements: [
        { id: 'home-hero', type: 'hero', description: 'Hero banner with campaign messaging', variantName: `${campaign.title} Hero` },
        { id: 'home-promo-banner', type: 'banner', description: 'Promotional announcement banner' },
        { id: 'home-cta-primary', type: 'cta', description: 'Primary call-to-action button' },
        { id: 'home-features', type: 'content', description: 'Features section with campaign theme' },
        { id: 'home-cta-section', type: 'cta', description: 'Bottom CTA section' },
      ],
    },
    {
      id: 'page-platform',
      title: 'Platform',
      path: '/platform',
      isPersonalized: true,
      modifiedElements: [
        { id: 'platform-hero', type: 'hero', description: 'Platform page hero section', variantName: `${campaign.title} Platform` },
        { id: 'platform-products', type: 'content', description: 'Product capability cards' },
        { id: 'platform-campaign-banner', type: 'banner', description: 'Campaign promotion banner', variantName: campaign.title },
      ],
    },
    {
      id: 'page-products',
      title: 'Products',
      path: '/products',
      isPersonalized: true,
      modifiedElements: [
        { id: 'products-hero', type: 'hero', description: 'Products page hero section' },
        { id: 'products-list', type: 'content', description: 'Product showcase list' },
        { id: 'products-cta', type: 'cta', description: 'Demo request CTA' },
      ],
    },
  ];

  return pages;
}

// Element type icons
const ELEMENT_TYPE_ICONS: Record<ModifiedElement['type'], string> = {
  hero: '🖼️',
  banner: '📢',
  cta: '👆',
  content: '📝',
  image: '🏞️',
};

export function CampaignWebsitePreview({ campaign }: CampaignWebsitePreviewProps) {
  const [currentPath, setCurrentPath] = useState('/');
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set(['page-home']));
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const modifiedPages = generateMockModifiedPages(campaign);
  const totalElements = modifiedPages.reduce((sum, page) => sum + page.modifiedElements.length, 0);

  // Handle navigation
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    // Auto-expand the page in sidebar when navigating
    const page = modifiedPages.find(p => p.path === path);
    if (page && !expandedPages.has(page.id)) {
      setExpandedPages(prev => new Set([...prev, page.id]));
    }
  };

  // Toggle page expansion in sidebar
  const togglePageExpansion = (pageId: string) => {
    setExpandedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  };

  // Handle element selection
  const handleElementSelect = (elementId: string, pagePath: string) => {
    setSelectedElement(elementId);
    setHighlightEnabled(true);
    if (currentPath !== pagePath) {
      handleNavigate(pagePath);
    }
  };

  // Get current page title
  const currentPage = modifiedPages.find(p => p.path === currentPath);
  const currentPageTitle = currentPage?.title || 'Page';

  return (
    <div className={styles.container}>
      {/* Sidebar - Page Directory */}
      <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <button
            className={styles.collapseButton}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
          {!sidebarCollapsed && (
            <>
              <h3 className={styles.sidebarTitle}>Modified Pages</h3>
              <span className={styles.pageCount}>{modifiedPages.length} pages</span>
            </>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className={styles.pageDirectory}>
            <div className={styles.directorySummary}>
              <span className={styles.summaryIcon}>🎯</span>
              <span>{totalElements} elements modified by campaign</span>
            </div>

            <div className={styles.pageList}>
              {modifiedPages.map(page => (
                <div key={page.id} className={styles.pageItem}>
                  <button
                    className={`${styles.pageHeader} ${currentPath === page.path ? styles.pageHeaderActive : ''}`}
                    onClick={() => togglePageExpansion(page.id)}
                  >
                    <span className={styles.pageExpandIcon}>
                      {expandedPages.has(page.id) ? '▼' : '▶'}
                    </span>
                    <span className={styles.pageIcon}>📄</span>
                    <div className={styles.pageInfo}>
                      <span className={styles.pageTitle}>{page.title}</span>
                      <span className={styles.pagePath}>{page.path}</span>
                    </div>
                    {page.isPersonalized && (
                      <span className={styles.personalizedBadge} title="Personalized content">
                        ✨
                      </span>
                    )}
                    <span className={styles.elementCount}>
                      {page.modifiedElements.length}
                    </span>
                  </button>

                  {expandedPages.has(page.id) && (
                    <div className={styles.elementList}>
                      {page.modifiedElements.map(element => (
                        <button
                          key={element.id}
                          className={`${styles.elementItem} ${selectedElement === element.id ? styles.elementItemSelected : ''}`}
                          onClick={() => handleElementSelect(element.id, page.path)}
                        >
                          <span className={styles.elementIcon}>
                            {ELEMENT_TYPE_ICONS[element.type]}
                          </span>
                          <div className={styles.elementInfo}>
                            <span className={styles.elementDescription}>
                              {element.description}
                            </span>
                            {element.variantName && (
                              <span className={styles.variantName}>
                                Variant: {element.variantName}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                      <button
                        className={styles.viewPageButton}
                        onClick={() => handleNavigate(page.path)}
                      >
                        View Page →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Browser Area */}
      <div className={styles.browserArea}>
        {/* Browser Toolbar */}
        <div className={styles.browserToolbar}>
          <div className={styles.browserControls}>
            <button
              className={styles.browserButton}
              onClick={() => handleNavigate('/')}
              title="Go home"
            >
              🏠
            </button>
            <button
              className={styles.browserButton}
              onClick={() => setSelectedElement(null)}
              title="Clear selection"
            >
              ↻
            </button>
          </div>

          <div className={styles.urlBar}>
            <span className={styles.urlIcon}>🔒</span>
            <span className={styles.urlText}>contentstack.com{currentPath}</span>
            <span className={styles.urlPage}>{currentPageTitle}</span>
          </div>

          <div className={styles.highlightToggle}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={highlightEnabled}
                onChange={(e) => {
                  setHighlightEnabled(e.target.checked);
                  if (!e.target.checked) setSelectedElement(null);
                }}
                className={styles.toggleInput}
              />
              <span className={styles.toggleSwitch}></span>
              <span className={styles.toggleText}>
                <span className={styles.toggleIcon}>🎯</span>
                Highlight Campaign Elements
              </span>
            </label>
          </div>
        </div>

        {/* Highlight Legend (when enabled) */}
        {highlightEnabled && (
          <div className={styles.highlightLegend}>
            <span className={styles.legendTitle}>Campaign: {campaign.title}</span>
            <div className={styles.legendItems}>
              <span className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#6366f1' }}></span>
                Hero
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#8b5cf6' }}></span>
                Banner
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#ec4899' }}></span>
                CTA
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></span>
                Content
              </span>
            </div>
          </div>
        )}

        {/* Website Preview */}
        <div className={styles.browserFrame}>
          <MockWebsite
            currentPath={currentPath}
            onNavigate={handleNavigate}
            highlightEnabled={highlightEnabled}
            selectedElement={selectedElement}
            campaign={campaign}
          />
        </div>
      </div>
    </div>
  );
}
