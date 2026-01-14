import { Icon } from '@contentstack/venus-components';
import { ModuleConfig } from '../../experience/types';
import styles from './ModuleCard.module.css';

interface ModuleCardProps {
  config: ModuleConfig;
  onClick?: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  fullWidth?: boolean;
  clickable?: boolean;
}

export function ModuleCard({ config, onClick, children, actions, fullWidth, clickable = true }: ModuleCardProps) {
  const isClickable = clickable && onClick;

  return (
    <div
      className={`${styles.card} ${fullWidth ? styles.fullWidth : ''} ${!isClickable ? styles.notClickable : ''}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div
            className={styles.iconWrapper}
            style={{ backgroundColor: `${config.color}15` }}
          >
            <Icon icon={config.icon} style={{ color: config.color }} />
          </div>
          <div className={styles.titleText}>
            <h3 className={styles.title}>{config.title}</h3>
            <p className={styles.description}>{config.description}</p>
          </div>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.content}>{children}</div>
      {isClickable && (
        <div className={styles.footer}>
          <span className={styles.viewMore}>
            View details
            <Icon icon="ChevronRight" size="small" />
          </span>
        </div>
      )}
    </div>
  );
}
