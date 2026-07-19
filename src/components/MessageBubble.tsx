import MarkdownMessage from './MarkdownMessage';

export type ChatMessageItem = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message }: { message: ChatMessageItem }) {
  const isUser = message.role === 'user';
  return (
    <div className={`msg-row ${isUser ? 'msg-user' : 'msg-assistant'}`}>
      <div className="msg-avatar">{isUser ? 'You' : 'AI'}</div>
      <div className="msg-bubble">
        {isUser ? <p className="msg-text">{message.content}</p> : <MarkdownMessage content={message.content} />}
        <span className="msg-time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
