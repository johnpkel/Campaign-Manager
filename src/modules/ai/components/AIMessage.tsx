import { AIMessage as AIMessageType, CampaignRecommendation } from '../types/ai';
import { RecommendationList } from './RecommendationCard';
import styles from './AIMessage.module.css';

interface AIMessageProps {
  message: AIMessageType;
  onSelectRecommendation?: (recommendation: CampaignRecommendation) => void;
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Simple markdown-like formatting for bold text
function formatContent(content: string): React.ReactNode {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function AIMessageComponent({ message, onSelectRecommendation }: AIMessageProps) {
  const isUser = message.role === 'user';
  const hasRecommendations =
    message.metadata?.type === 'recommendation' &&
    message.metadata.recommendations &&
    message.metadata.recommendations.length > 0;

  return (
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      {!isUser && (
        <div className={styles.avatar}>
          <span className={styles.avatarIcon}>✨</span>
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.bubble}>
          <div className={styles.text}>{formatContent(message.content)}</div>
          {hasRecommendations && onSelectRecommendation && (
            <RecommendationList
              recommendations={message.metadata!.recommendations!}
              onSelect={onSelectRecommendation}
            />
          )}
        </div>
        <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
