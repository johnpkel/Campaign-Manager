import { ModuleCard } from '../../components/common';
import { useExperience, MODULE_CONFIGS } from '../../experience';
import { CampaignModuleCard, UpcomingCampaignsCard } from '../../modules/campaigns/components';
import { AnalyticsModuleCard } from '../../modules/analytics/components';
import { ActivityDigestCard } from '../../modules/collaboration/components';
import styles from './ExperienceDashboard.module.css';

export function ExperienceDashboard() {
  const { navigateToModule } = useExperience();

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Experience Manager</h1>
        <p className={styles.subtitle}>
          Manage your campaigns, analyze performance, and collaborate with your team
        </p>
      </div>

      <div className={styles.grid}>
        <ModuleCard
          config={MODULE_CONFIGS.campaigns}
          onClick={() => navigateToModule('campaigns')}
        >
          <CampaignModuleCard />
        </ModuleCard>

        <ModuleCard
          config={MODULE_CONFIGS.upcoming}
          onClick={() => navigateToModule('campaigns')}
        >
          <UpcomingCampaignsCard />
        </ModuleCard>

        <ModuleCard
          config={MODULE_CONFIGS.analytics}
          onClick={() => navigateToModule('analytics')}
        >
          <AnalyticsModuleCard />
        </ModuleCard>

        <ModuleCard
          config={MODULE_CONFIGS.collaboration}
          onClick={() => navigateToModule('collaboration')}
          fullWidth
        >
          <ActivityDigestCard />
        </ModuleCard>
      </div>
    </div>
  );
}
