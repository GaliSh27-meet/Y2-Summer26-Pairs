import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + 'px';
    }
  }, [text]);

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText('');
  };

  return (
    <div className="chat-input">
      <textarea
        ref={ref}
        className="chat-textarea"
        placeholder={placeholder ?? 'Type your message...'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={1}
      />
      <button className="btn-primary btn-send" onClick={submit} disabled={disabled || !text.trim()}>
        <Send size={16} /> Send
      </button>
    </div>
  );
}
