import { useEffect, useRef, useState } from 'react';
import { Dumbbell, RefreshCw, Sparkles } from 'lucide-react';
import ChatInput from './ChatInput';
import MessageBubble, { type ChatMessageItem } from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import WeatherCard from './WeatherCard';
import { runCoach, persistWorkoutPlan } from '../lib/agents';
import type { WeatherData } from '../lib/weather';

type Props = {
  onPlanSaved: () => void;
};

const SUGGESTIONS = [
  'I want to lose weight and train 4 days a week',
  'Build muscle at home, indoor only',
  '3 days a week, 45 min, outdoors in London',
];

let idCounter = 0;
const nextId = () => `m-${Date.now()}-${idCounter++}`;

export default function CoachChat({ onPlanSaved }: Props) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: nextId(),
      role: 'assistant',
      content:
        "[Summary]: Welcome to FitFlow AI.\n[Response]: Hi! I'm your Workout Coach. I'll ask a few quick questions about your body, goals, schedule, and preferred workout location, then build a personalized plan that also checks the weather in your city. Let's start — what's your current weight?\n[Next Step]: Reply with your weight (e.g. \"75 kg\").",
      createdAt: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<'ready' | 'thinking' | 'creating'>('ready');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const userMsg: ChatMessageItem = { id: nextId(), role: 'user', content: text, createdAt: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    setStatus('thinking');
    try {
      const apiMessages = next.map((m) => ({ role: m.role, content: m.content }));
      const result = await runCoach(apiMessages);
      if (result.weather) setWeather(result.weather);

      let assistantText = result.reply || "[Response]: Let's continue. Could you tell me more?";
      setStatus('creating');

      if (result.toolCall?.type === 'save_workout_plan') {
        const input = result.toolCall.input;
        const { plan, events } = await persistWorkoutPlan(input);
        if (plan) {
          assistantText +=
            `\n\n[Saved]: Your workout plan was saved (${events.length} session${events.length === 1 ? '' : 's'}) and automatically sent to the Calendar Organizer.`;
          onPlanSaved();
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', content: assistantText, createdAt: Date.now() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          content: `[Response]: Sorry, I ran into an error while contacting the AI model. ${err instanceof Error ? err.message : ''}\n[Next Step]: Try sending your message again.`,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      setStatus('ready');
    }
  };

  const reset = () => {
    setMessages([
      {
        id: nextId(),
        role: 'assistant',
        content:
          "[Summary]: New conversation started.\n[Response]: Let's build a fresh plan. What's your current weight?\n[Next Step]: Reply with your weight.",
        createdAt: Date.now(),
      },
    ]);
    setWeather(null);
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-avatar coach-avatar">
          <Dumbbell size={20} />
        </div>
        <div className="chat-meta">
          <div className="chat-title">Workout Coach</div>
          <div className="chat-desc">
            Interviews you and creates a complete personalized workout plan.
          </div>
        </div>
        <div className="chat-status">
          <span className={`status-pill ${status}`}>
            {status === 'ready' && <>Ready</>}
            {status === 'thinking' && <>Thinking...</>}
            {status === 'creating' && <>Creating Workout...</>}
          </span>
          <button className="btn-ghost" onClick={reset} title="Start over">
            <RefreshCw size={14} /> New
          </button>
        </div>
      </div>

      {weather && (
        <div className="chat-weather">
          <WeatherCard weather={weather} />
        </div>
      )}

      <div className="chat-scroll" ref={scrollRef}>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {loading && (
          <div className="msg-row msg-assistant">
            <div className="msg-avatar">AI</div>
            <div className="msg-bubble">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion-chip" onClick={() => send(s)}>
              <Sparkles size={12} /> {s}
            </button>
          ))}
        </div>
      )}

      <ChatInput onSend={send} disabled={loading} placeholder="Answer the coach..." />
    </div>
  );
}
