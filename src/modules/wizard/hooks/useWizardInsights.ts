import { useState, useEffect, useRef } from 'react';
import { WizardInsights, getInitialInsights } from '../types';
import { calculateAllInsights } from '../services';
import { CampaignDraft } from '../../ai/types/ai';

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 400;

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for calculating wizard insights based on campaign draft
export function useWizardInsights(draft: Partial<CampaignDraft>): WizardInsights {
  const [insights, setInsights] = useState<WizardInsights>(getInitialInsights());
  const isInitialMount = useRef(true);

  // Create a stable string representation of the draft for comparison
  const draftKey = JSON.stringify({
    title: draft.title,
    keyMessages: draft.keyMessages,
    goals: draft.goals,
    audiences: draft.audiences,
    channels: draft.channels,
    budget: draft.budget,
    brandKit: draft.brandKit,
    startDate: draft.startDate,
    endDate: draft.endDate,
  });

  const debouncedDraftKey = useDebounce(draftKey, DEBOUNCE_DELAY);

  useEffect(() => {
    // Skip initial mount to avoid double-calculation
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }

    let cancelled = false;

    const calculate = async () => {
      // Set loading state
      setInsights(prev => ({
        ...prev,
        isCalculating: true,
      }));

      try {
        const newInsights = await calculateAllInsights(draft);

        if (!cancelled) {
          setInsights(newInsights);
        }
      } catch (error) {
        console.error('Error calculating insights:', error);
        if (!cancelled) {
          setInsights(prev => ({
            ...prev,
            isCalculating: false,
          }));
        }
      }
    };

    calculate();

    return () => {
      cancelled = true;
    };
  }, [debouncedDraftKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return insights;
}
