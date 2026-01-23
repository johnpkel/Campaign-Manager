import { RecommendedContent } from '../../types';
import { useWizard } from '../../contexts';
import styles from './RecommendedContentCard.module.css';

interface RecommendedContentCardProps {
  content: RecommendedContent[];
  isLoading: boolean;
}

export function RecommendedContentCard({ content, isLoading }: RecommendedContentCardProps) {
  const { selectContent, deselectContent } = useWizard();

  const handleToggle = (item: RecommendedContent) => {
    if (item.selected) {
      deselectContent(item.entryUid);
    } else {
      selectContent(item.entryUid);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'landing page': return '🚀';
      case 'product page': return '🛍️';
      case 'blog post': return '📝';
      case 'homepage': return '🏠';
      case 'documentation': return '📚';
      case 'about page': return '👋';
      default: return '📄';
    }
  };

  return (
    <div className={`${styles.card} ${isLoading ? styles.cardLoading : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon}>📄</span>
          <h4 className={styles.title}>Recommended Content</h4>
        </div>
        <span className={styles.count}>{content.filter(c => c.selected).length} selected</span>
      </div>

      {content.length > 0 ? (
        <div className={styles.contentList}>
          {content.slice(0, 5).map((item) => (
            <div
              key={item.entryUid}
              className={`${styles.contentItem} ${item.selected ? styles.contentSelected : ''}`}
              onClick={() => handleToggle(item)}
            >
              <div className={styles.contentLeft}>
                {item.imageUrl ? (
                  <div className={styles.contentImage}>
                    <img src={item.imageUrl} alt={item.title} />
                  </div>
                ) : (
                  <div className={styles.contentIconWrapper}>
                    <span className={styles.contentTypeIcon}>{getContentTypeIcon(item.contentType)}</span>
                  </div>
                )}
                <div className={styles.contentInfo}>
                  <span className={styles.contentTitle}>{item.title}</span>
                  <div className={styles.contentMeta}>
                    <span className={styles.contentType}>{item.contentType}</span>
                    {item.url && <span className={styles.contentUrl}>{item.url}</span>}
                  </div>
                  <span className={styles.matchReason}>{item.matchReason}</span>
                </div>
              </div>
              <div className={styles.contentRight}>
                <div className={styles.relevanceBar}>
                  <div
                    className={styles.relevanceFill}
                    style={{ width: `${item.relevanceScore}%` }}
                  />
                </div>
                <span className={styles.relevanceScore}>{item.relevanceScore}%</span>
                <div className={`${styles.checkbox} ${item.selected ? styles.checkboxChecked : ''}`}>
                  {item.selected && '✓'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📄</span>
          <span className={styles.emptyText}>Add campaign details to see content recommendations</span>
        </div>
      )}
    </div>
  );
}
