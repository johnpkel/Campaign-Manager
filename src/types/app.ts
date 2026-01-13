export interface AppConfig {
  defaultCurrency: string;
  dateFormat: string;
  defaultOwner: string;
  enableNotifications: boolean;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  defaultCurrency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  defaultOwner: '',
  enableNotifications: true,
};

export type LocationType =
  | 'FULL_PAGE_LOCATION'
  | 'DASHBOARD'
  | 'APP_CONFIG_WIDGET';
