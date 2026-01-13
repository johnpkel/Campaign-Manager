import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import ContentstackAppSdk from '@contentstack/app-sdk';
import { AppConfig, DEFAULT_APP_CONFIG, LocationType } from '../types';

// Check if running inside Contentstack iframe
const isInsideContentstack = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true; // If we can't access window.top, we're likely in an iframe
  }
};

interface AppSdkContextValue {
  sdk: any | null;
  stack: any | null;
  location: LocationType | null;
  config: AppConfig;
  isLoading: boolean;
  error: string | null;
  isStandaloneMode: boolean;
  locale: string;
  setConfig: (config: AppConfig) => Promise<void>;
}

const AppSdkContext = createContext<AppSdkContextValue | null>(null);

interface AppSdkProviderProps {
  children: ReactNode;
}

export function AppSdkProvider({ children }: AppSdkProviderProps) {
  const [sdk, setSdk] = useState<any | null>(null);
  const [stack, setStack] = useState<any | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [config, setConfigState] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [locale, setLocale] = useState<string>('en-us');

  useEffect(() => {
    const initSdk = async () => {
      // Check if we're running inside Contentstack
      if (!isInsideContentstack()) {
        console.info('Running in standalone development mode');
        setIsStandaloneMode(true);
        setLocation('FULL_PAGE_LOCATION');
        setIsLoading(false);
        return;
      }

      try {
        const appSdk = await ContentstackAppSdk.init();
        setSdk(appSdk);

        // Get stack reference for entry operations
        const stackInstance = (appSdk as any).stack;
        setStack(stackInstance);

        // Get current location
        const locationObj = appSdk.location as any;
        const currentLocation = locationObj?.type as LocationType;
        setLocation(currentLocation);

        // Get current locale if available
        const currentLocale = locationObj?.locale || 'en-us';
        setLocale(currentLocale);

        // Get app configuration
        const appConfig = await appSdk.getConfig();
        if (appConfig && Object.keys(appConfig).length > 0) {
          setConfigState({ ...DEFAULT_APP_CONFIG, ...appConfig });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Contentstack App SDK:', err);
        // Fall back to standalone mode on error
        console.info('Falling back to standalone development mode');
        setIsStandaloneMode(true);
        setLocation('FULL_PAGE_LOCATION');
        setIsLoading(false);
      }
    };

    initSdk();
  }, []);

  const setConfig = async (newConfig: AppConfig) => {
    if (!sdk) return;
    try {
      // In a real app, you would save this config via the SDK
      // For now, we just update local state
      setConfigState(newConfig);
    } catch (err) {
      console.error('Failed to save config:', err);
      throw err;
    }
  };

  return (
    <AppSdkContext.Provider
      value={{
        sdk,
        stack,
        location,
        config,
        isLoading,
        error,
        isStandaloneMode,
        locale,
        setConfig,
      }}
    >
      {children}
    </AppSdkContext.Provider>
  );
}

export function useAppSdk() {
  const context = useContext(AppSdkContext);
  if (!context) {
    throw new Error('useAppSdk must be used within an AppSdkProvider');
  }
  return context;
}
