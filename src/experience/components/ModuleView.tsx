import { Button, Icon } from '@contentstack/venus-components';
import { useExperience, MODULE_CONFIGS, ModuleId } from '../../experience';
import styles from './ModuleView.module.css';

interface ModuleViewProps {
  moduleId: ModuleId;
  children: React.ReactNode;
}

export function ModuleView({ moduleId, children }: ModuleViewProps) {
  const { navigateToDashboard } = useExperience();
  const config = MODULE_CONFIGS[moduleId];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          buttonType="tertiary"
          icon="ArrowLeft"
          onClick={navigateToDashboard}
          className={styles.backButton}
        >
          Back to Dashboard
        </Button>
        <div className={styles.titleSection}>
          <div
            className={styles.iconWrapper}
            style={{ backgroundColor: `${config.color}15` }}
          >
            <Icon icon={config.icon} style={{ color: config.color }} />
          </div>
          <div>
            <h1 className={styles.title}>{config.title}</h1>
            <p className={styles.description}>{config.description}</p>
          </div>
        </div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
