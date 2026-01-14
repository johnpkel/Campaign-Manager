import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ModuleId, ExperienceState } from '../types/experience';

interface ExperienceContextValue extends ExperienceState {
  navigateToModule: (moduleId: ModuleId) => void;
  navigateToDashboard: () => void;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

interface ExperienceProviderProps {
  children: ReactNode;
}

export function ExperienceProvider({ children }: ExperienceProviderProps) {
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const [isModuleExpanded, setIsModuleExpanded] = useState(false);

  const navigateToModule = useCallback((moduleId: ModuleId) => {
    setActiveModule(moduleId);
    setIsModuleExpanded(true);
  }, []);

  const navigateToDashboard = useCallback(() => {
    setActiveModule(null);
    setIsModuleExpanded(false);
  }, []);

  return (
    <ExperienceContext.Provider
      value={{
        activeModule,
        isModuleExpanded,
        navigateToModule,
        navigateToDashboard,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
}
