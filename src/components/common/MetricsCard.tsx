import { Icon } from '@contentstack/venus-components';
import styles from './MetricsCard.module.css';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function MetricsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = '#6366f1',
}: MetricsCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {icon && (
          <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15` }}>
            <Icon icon={icon} className={styles.icon} style={{ color }} />
          </div>
        )}
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        {trend && (
          <span
            className={`${styles.trend} ${
              trend.isPositive ? styles.positive : styles.negative
            }`}
          >
            <Icon icon={trend.isPositive ? 'ArrowUp' : 'ArrowDown'} size="small" />
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
    </div>
  );
}
