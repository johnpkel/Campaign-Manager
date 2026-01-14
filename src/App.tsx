import { Suspense, lazy } from 'react';
import { AppSdkProvider, CampaignProvider, useAppSdk } from './contexts';
import { ExperienceProvider } from './experience';
import { CollaborationProvider } from './modules/collaboration';
import { AIProvider, AIChatPanel, AIFloatingButton, useAI } from './modules/ai';
import styles from './App.module.css';

const FullPageLocation = lazy(() =>
  import('./pages/FullPageLocation').then((m) => ({ default: m.FullPageLocation }))
);
const DashboardLocation = lazy(() =>
  import('./pages/DashboardLocation').then((m) => ({ default: m.DashboardLocation }))
);
const AppConfigLocation = lazy(() =>
  import('./pages/AppConfigLocation').then((m) => ({ default: m.AppConfigLocation }))
);

function LoadingFallback() {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Loading Campaign Manager...</p>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className={styles.error}>
      <h2>Error</h2>
      <p>{message}</p>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  );
}

function LocationRouter() {
  const { location, isLoading, error } = useAppSdk();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  const renderLocation = () => {
    switch (location) {
      case 'FULL_PAGE_LOCATION':
        return <FullPageLocation />;
      case 'DASHBOARD':
        return <DashboardLocation />;
      case 'APP_CONFIG_WIDGET':
        return <AppConfigLocation />;
      default:
        // Default to Full Page for development/testing
        return <FullPageLocation />;
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderLocation()}
    </Suspense>
  );
}

function AppLayout() {
  const { isOpen } = useAI();

  return (
    <div className={styles.app}>
      <div className={`${styles.mainContent} ${isOpen ? styles.mainContentWithDrawer : ''}`}>
        <LocationRouter />
      </div>
      <AIChatPanel />
      <AIFloatingButton />
    </div>
  );
}

function App() {
  return (
    <AppSdkProvider>
      <ExperienceProvider>
        <CampaignProvider>
          <CollaborationProvider>
            <AIProvider>
              <AppLayout />
            </AIProvider>
          </CollaborationProvider>
        </CampaignProvider>
      </ExperienceProvider>
    </AppSdkProvider>
  );
}

export default App;
