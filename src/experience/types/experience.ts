export type ModuleId = 'digest' | 'campaigns' | 'upcoming' | 'analytics' | 'collaboration';

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ExperienceState {
  activeModule: ModuleId | null;
  isModuleExpanded: boolean;
}

export const MODULE_CONFIGS: Record<ModuleId, ModuleConfig> = {
  digest: {
    id: 'digest',
    title: 'Daily Digest',
    description: 'Your personalized daily briefing',
    icon: 'Sun',
    color: '#f59e0b',
  },
  campaigns: {
    id: 'campaigns',
    title: 'Active Campaigns',
    description: 'Live campaigns and performance',
    icon: 'Target',
    color: '#6366f1',
  },
  upcoming: {
    id: 'upcoming',
    title: 'Upcoming Campaigns',
    description: 'Launch readiness and timelines',
    icon: 'Calendar',
    color: '#8b5cf6',
  },
  analytics: {
    id: 'analytics',
    title: 'Website Performance',
    description: 'Analytics and performance metrics',
    icon: 'Analytics',
    color: '#10b981',
  },
  collaboration: {
    id: 'collaboration',
    title: 'Recent Updates',
    description: 'Activity feed and collaboration',
    icon: 'Activity',
    color: '#f59e0b',
  },
};
