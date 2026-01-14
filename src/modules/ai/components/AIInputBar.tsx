import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { useAI } from '../contexts/AIContext';
import styles from './AIInputBar.module.css';

export function AIInputBar() {
  const [input, setInput] = useState('');
  const { sendMessage, status } = useAI();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = status === 'thinking' || status === 'streaming';

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isDisabled) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me about your campaigns..."
        rows={1}
        disabled={isDisabled}
      />
      <button
        type="submit"
        className={styles.sendButton}
        disabled={!input.trim() || isDisabled}
      >
        {isDisabled ? (
          <span className={styles.spinner} />
        ) : (
          <span className={styles.sendIcon}>➤</span>
        )}
      </button>
    </form>
  );
}
