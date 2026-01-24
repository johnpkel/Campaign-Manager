import { useWizard } from '../contexts';
import { RecommendedAsset, RecommendedContent, ExperimentSuggestion } from '../types';
import styles from './CampaignBriefPanel.module.css';

interface BriefFieldProps {
  label: string;
  value: string | string[] | undefined;
  icon: string;
  isActive?: boolean;
  isEmpty?: boolean;
}

function BriefField({ label, value, icon, isActive, isEmpty }: BriefFieldProps) {
  const displayValue = Array.isArray(value)
    ? value.length > 0 ? value.join(', ') : undefined
    : value;

  return (
    <div className={`${styles.field} ${isActive ? styles.fieldActive : ''} ${isEmpty ? styles.fieldEmpty : ''}`}>
      <div className={styles.fieldHeader}>
        <span className={styles.fieldIcon}>{icon}</span>
        <span className={styles.fieldLabel}>{label}</span>
        {displayValue && <span className={styles.fieldCheck}>✓</span>}
      </div>
      <div className={styles.fieldValue}>
        {displayValue || <span className={styles.placeholder}>Not set yet</span>}
      </div>
    </div>
  );
}

// Component for displaying selected assets with thumbnails
interface AssetsFieldProps {
  assets: RecommendedAsset[];
}

function AssetsField({ assets }: AssetsFieldProps) {
  if (assets.length === 0) {
    return (
      <div className={`${styles.field} ${styles.fieldEmpty}`}>
        <div className={styles.fieldHeader}>
          <span className={styles.fieldIcon}>🏷️</span>
          <span className={styles.fieldLabel}>Selected Assets</span>
        </div>
        <div className={styles.fieldValue}>
          <span className={styles.placeholder}>Select assets from suggestions →</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <span className={styles.fieldIcon}>🏷️</span>
        <span className={styles.fieldLabel}>Selected Assets</span>
        <span className={styles.fieldCheck}>✓</span>
      </div>
      <div className={styles.assetsList}>
        {assets.map(asset => (
          <div key={asset.id} className={styles.assetItem}>
            <img src={asset.thumbnailUrl} alt={asset.title} className={styles.assetThumb} />
            <span className={styles.assetName}>{asset.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component for displaying selected content entries
interface ContentFieldProps {
  content: RecommendedContent[];
}

function ContentField({ content }: ContentFieldProps) {
  if (content.length === 0) {
    return (
      <div className={`${styles.field} ${styles.fieldEmpty}`}>
        <div className={styles.fieldHeader}>
          <span className={styles.fieldIcon}>📰</span>
          <span className={styles.fieldLabel}>Selected Content</span>
        </div>
        <div className={styles.fieldValue}>
          <span className={styles.placeholder}>Select content from suggestions →</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <span className={styles.fieldIcon}>📰</span>
        <span className={styles.fieldLabel}>Selected Content</span>
        <span className={styles.fieldCheck}>✓</span>
      </div>
      <div className={styles.contentList}>
        {content.map(item => (
          <div key={item.entryUid} className={styles.contentItem}>
            {item.imageUrl && <img src={item.imageUrl} alt={item.title} className={styles.contentThumb} />}
            <div className={styles.contentInfo}>
              <span className={styles.contentTitle}>{item.title}</span>
              <span className={styles.contentType}>{item.contentType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component for displaying selected experiment
interface ExperimentFieldProps {
  experiment: ExperimentSuggestion | null | undefined;
}

function ExperimentField({ experiment }: ExperimentFieldProps) {
  if (!experiment) {
    return (
      <div className={`${styles.field} ${styles.fieldEmpty}`}>
        <div className={styles.fieldHeader}>
          <span className={styles.fieldIcon}>🧪</span>
          <span className={styles.fieldLabel}>Experimentation</span>
        </div>
        <div className={styles.fieldValue}>
          <span className={styles.placeholder}>Select experiment from suggestions →</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <span className={styles.fieldIcon}>🧪</span>
        <span className={styles.fieldLabel}>Experimentation</span>
        <span className={styles.fieldCheck}>✓</span>
      </div>
      <div className={styles.experimentDetails}>
        <span className={styles.experimentTitle}>{experiment.title}</span>
        <span className={styles.experimentType}>
          {experiment.type === 'ab_test' ? 'A/B Test' :
           experiment.type === 'multi_armed_bandit' ? 'Multi-Armed Bandit' : 'Personalization'}
        </span>
        <span className={styles.experimentLift}>Est. lift: {experiment.estimatedLift}</span>
      </div>
    </div>
  );
}

export function CampaignBriefPanel() {
  const { campaignDraft, currentStep, showChatHistory, insights } = useWizard();

  // Score data
  const score = insights.campaignScore.overallScore;
  const brandScore = insights.brandKitAlignment.alignmentScore;
  const prediction = insights.campaignScore.performancePrediction;

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#6366f1';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  // Map step to field name for highlighting
  const stepToField: Record<string, string> = {
    title: 'title',
    key_messages: 'keyMessages',
    goals: 'goals',
    audiences: 'audiences',
    dates: 'dates',
    contributors: 'contributors',
    budget: 'budget',
    channels: 'channels',
    market_research: 'marketResearch',
    brand_kit: 'brandKit',
  };

  const activeField = stepToField[currentStep] || '';

  // Format date range
  const dateRange = campaignDraft.startDate && campaignDraft.endDate
    ? `${new Date(campaignDraft.startDate).toLocaleDateString()} – ${new Date(campaignDraft.endDate).toLocaleDateString()}`
    : campaignDraft.startDate
    ? `Starts ${new Date(campaignDraft.startDate).toLocaleDateString()}`
    : undefined;

  // Show placeholder when in chat history view
  if (showChatHistory) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Campaign Brief</h2>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <p className={styles.emptyText}>Start a new campaign or resume an existing one to begin building your brief.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Fixed Campaign Scorecard */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreHeader}>
          <h2 className={styles.title}>Campaign Brief</h2>
        </div>

        <div className={styles.scoreRow}>
          {/* Campaign Score */}
          <div className={styles.scoreItem}>
            <div
              className={styles.scoreCircle}
              style={{ '--score': score, '--color': getScoreColor(score) } as React.CSSProperties}
            >
              <span className={styles.scoreValue} style={{ color: getScoreColor(score) }}>{score}</span>
            </div>
            <div className={styles.scoreInfo}>
              <span className={styles.scoreLabel}>Campaign</span>
              <span className={styles.scoreStatus} style={{ color: getScoreColor(score) }}>
                {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work'}
              </span>
            </div>
          </div>

          {/* Brand Alignment */}
          <div className={styles.scoreItem}>
            <div
              className={styles.scoreCircle}
              style={{ '--score': brandScore, '--color': getScoreColor(brandScore) } as React.CSSProperties}
            >
              <span className={styles.scoreValue} style={{ color: getScoreColor(brandScore) }}>
                {insights.brandKitAlignment.selectedBrandKit ? brandScore : '—'}
              </span>
            </div>
            <div className={styles.scoreInfo}>
              <span className={styles.scoreLabel}>Brand</span>
              <span className={styles.scoreMeta}>
                {insights.brandKitAlignment.selectedBrandKit || 'No kit'}
              </span>
            </div>
          </div>

          {/* Predictions */}
          <div className={styles.predictionsRow}>
            <div className={styles.predictionItem}>
              <span className={styles.predictionValue}>{prediction.expectedReach}</span>
              <span className={styles.predictionLabel}>Reach</span>
            </div>
            <div className={styles.predictionItem}>
              <span className={styles.predictionValue}>{prediction.expectedEngagement}</span>
              <span className={styles.predictionLabel}>Engage</span>
            </div>
            <div className={styles.predictionItem}>
              <span className={styles.predictionValue}>{prediction.expectedConversions}</span>
              <span className={styles.predictionLabel}>Convert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Fields */}
      <div className={styles.fields}>
        <BriefField
          label="Campaign Title"
          value={campaignDraft.title}
          icon="🎯"
          isActive={activeField === 'title'}
          isEmpty={!campaignDraft.title}
        />

        <BriefField
          label="Key Messages"
          value={campaignDraft.keyMessages}
          icon="💬"
          isActive={activeField === 'keyMessages'}
          isEmpty={!campaignDraft.keyMessages}
        />

        <BriefField
          label="Campaign Goals"
          value={campaignDraft.goals}
          icon="🎯"
          isActive={activeField === 'goals'}
          isEmpty={!campaignDraft.goals}
        />

        <BriefField
          label="Target Audiences"
          value={campaignDraft.audiences}
          icon="👥"
          isActive={activeField === 'audiences'}
          isEmpty={!campaignDraft.audiences?.length}
        />

        <BriefField
          label="Campaign Dates"
          value={dateRange}
          icon="📅"
          isActive={activeField === 'dates'}
          isEmpty={!campaignDraft.startDate}
        />

        <BriefField
          label="Channels"
          value={campaignDraft.channels}
          icon="📢"
          isActive={activeField === 'channels'}
          isEmpty={!campaignDraft.channels?.length}
        />

        <BriefField
          label="Budget"
          value={campaignDraft.budget}
          icon="💰"
          isActive={activeField === 'budget'}
          isEmpty={!campaignDraft.budget}
        />

        <BriefField
          label="Contributors"
          value={campaignDraft.contributors}
          icon="👤"
          isActive={activeField === 'contributors'}
          isEmpty={!campaignDraft.contributors?.length}
        />

        <BriefField
          label="Brand Kit"
          value={campaignDraft.brandKit}
          icon="🎨"
          isActive={activeField === 'brandKit'}
          isEmpty={!campaignDraft.brandKit}
        />

        <BriefField
          label="Market Research"
          value={campaignDraft.marketResearch}
          icon="📊"
          isActive={activeField === 'marketResearch'}
          isEmpty={!campaignDraft.marketResearch}
        />

        {/* Selected items from suggestion cards */}
        <div className={styles.selectedSection}>
          <div className={styles.sectionDivider}>
            <span className={styles.sectionLabel}>From Suggestions</span>
          </div>

          <AssetsField assets={campaignDraft.selectedAssets || []} />
          <ContentField content={campaignDraft.selectedContent || []} />
          <ExperimentField experiment={campaignDraft.selectedExperiment} />
        </div>
      </div>
    </div>
  );
}
