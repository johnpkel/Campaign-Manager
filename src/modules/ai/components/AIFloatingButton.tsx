import { useAI } from '../contexts/AIContext';
import styles from './AIFloatingButton.module.css';

export function AIFloatingButton() {
  const { toggleChat, isOpen, messages, status } = useAI();

  // Don't render when chat is open
  if (isOpen) return null;

  return (
    <button
      className={styles.button}
      onClick={toggleChat}
      aria-label="Open AI Assistant"
    >
      <span className={styles.icon}>✨</span>
      {messages.length > 0 && (
        <span className={styles.badge}>{messages.length}</span>
      )}
      {status === 'thinking' && (
        <span className={styles.pulse} />
      )}
    </button>
  );
}
