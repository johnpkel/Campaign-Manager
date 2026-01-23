import { useState, useRef } from 'react';
import { RecommendedAsset } from '../../types';
import { useWizard } from '../../contexts';
import styles from './RecommendedAssetsCard.module.css';

interface RecommendedAssetsCardProps {
  assets: RecommendedAsset[];
  isLoading: boolean;
}

export function RecommendedAssetsCard({ assets, isLoading }: RecommendedAssetsCardProps) {
  const { selectAsset, deselectAsset } = useWizard();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleToggle = (asset: RecommendedAsset) => {
    if (asset.selected) {
      deselectAsset(asset.id);
    } else {
      selectAsset(asset.id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎬';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -120, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 120, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 300);
    }
  };

  return (
    <div className={`${styles.card} ${isLoading ? styles.cardLoading : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon}>🏷️</span>
          <h4 className={styles.title}>Recommended Assets</h4>
        </div>
        <span className={styles.count}>{assets.filter(a => a.selected).length} selected</span>
      </div>

      {assets.length > 0 ? (
        <div className={styles.carouselContainer}>
          {canScrollLeft && (
            <button className={`${styles.carouselBtn} ${styles.carouselBtnLeft}`} onClick={scrollLeft}>
              ‹
            </button>
          )}

          <div
            className={styles.carousel}
            ref={carouselRef}
            onScroll={updateScrollButtons}
          >
            {assets.slice(0, 6).map((asset) => (
              <div
                key={asset.id}
                className={`${styles.assetItem} ${asset.selected ? styles.assetSelected : ''}`}
                onClick={() => handleToggle(asset)}
              >
                <div className={styles.assetThumbnail}>
                  <img src={asset.thumbnailUrl} alt={asset.title} />
                  <div className={styles.assetOverlay}>
                    <span className={styles.typeIcon}>{getTypeIcon(asset.type)}</span>
                  </div>
                  {asset.selected && (
                    <div className={styles.selectedBadge}>✓</div>
                  )}
                </div>
                <span className={styles.assetTitle}>{asset.title}</span>
                <span className={styles.relevanceScore}>{asset.relevanceScore}%</span>
              </div>
            ))}
          </div>

          {canScrollRight && assets.length > 3 && (
            <button className={`${styles.carouselBtn} ${styles.carouselBtnRight}`} onClick={scrollRight}>
              ›
            </button>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🏷️</span>
          <span className={styles.emptyText}>Add campaign details to see asset recommendations</span>
        </div>
      )}
    </div>
  );
}
