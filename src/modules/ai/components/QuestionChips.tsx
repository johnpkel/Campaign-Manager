import { QuestionSuggestion } from '../types/ai';
import styles from './QuestionChips.module.css';

interface QuestionChipsProps {
  suggestions: QuestionSuggestion[];
  onSelect: (value: string) => void;
}

export function QuestionChips({ suggestions, onSelect }: QuestionChipsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.chipsContainer}>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className={styles.chip}
          onClick={() => onSelect(suggestion.value)}
          type="button"
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}
