import { useEffect, useRef, useState } from 'react';
import { CalendarDays, RefreshCw, Download, ArrowRight } from 'lucide-react';
import ChatInput from './ChatInput';
import MessageBubble, { type ChatMessageItem } from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { runOrganizer, persistCalendarEvents } from '../lib/agents';
import { buildICS, downloadICS } from '../lib/ics';
import type { CalendarEventRow, WorkoutPlanRow } from '../lib/supabase';

type Props = {
  events: CalendarEventRow[];
  plans: WorkoutPlanRow[];
  onEventsChanged: () => Promise<void>;
  onViewCalendar: () => void;
};

let idCounter = 0;
const nextId = () => `o-${Date.now()}-${idCounter++}`;

export default function OrganizerChat({ events, plans, onEventsChanged, onViewCalendar }: Props) {
  const latestPlan = plans[0];
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'ready' | 'thinking' | 'building'>('ready');
  const [autoSent, setAutoSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-send the latest plan to the organizer once it appears.
  useEffect(() => {
    if (latestPlan && !autoSent) {
      setAutoSent(true);
      const raw = (latestPlan.raw_response as { events?: unknown } | null)?.events;
      const planEvents = Array.isArray(raw) ? raw : [];
      const summary =
        `Workout plan from Coach: "${latestPlan.summary ?? 'Personalized plan'}" with ${planEvents.length} session(s).`;
      void send(summary);
    }
  }, [latestPlan, autoSent]);

  const send = async (text: string) => {
    const userMsg: ChatMessageItem = { id: nextId(), role: 'user', content: text, createdAt: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    setStatus('thinking');
    try {
      const apiMessages = next.map((m) => ({ role: m.role, content: m.content }));
      const result = await runOrganizer(apiMessages);
      let reply = result.reply || '[Response]: Calendar updated.';

      if (result.toolCall?.type === 'add_events_to_calendar') {
        setStatus('building');
        const list = result.toolCall.input.event_list.map((e) => ({
          name: e.name,
          begin: e.begin,
          end: e.end,
          description: e.description ?? undefined,
        }));
        await persistCalendarEvents(list, latestPlan?.id);
        await onEventsChanged();
        reply += `\n\n[Saved]: ${list.length} event${list.length === 1 ? '' : 's'} added to your calendar. You can download the .ics file from the Calendar Preview tab.`;
      }

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', content: reply, createdAt: Date.now() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          content: `[Response]: Sorry, I hit an error. ${err instanceof Error ? err.message : ''}\n[Next Step]: Try again.`,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      setStatus('ready');
    }
  };

  const reset = () => {
    setMessages([]);
    setAutoSent(false);
  };

  const download = () => {
    if (!events.length) return;
    downloadICS('fitflow-workout-calendar.ics', buildICS(events));
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-avatar organizer-avatar">
          <CalendarDays size={20} />
        </div>
        <div className="chat-meta">
          <div className="chat-title">Calendar Organizer</div>
          <div className="chat-desc">
            Receives the workout schedule from the Coach and turns it into a downloadable calendar.
          </div>
        </div>
        <div className="chat-status">
          <span className={`status-pill ${status}`}>
            {status === 'ready' && <>Ready</>}
            {status === 'thinking' && <>Thinking...</>}
            {status === 'building' && <>Building Calendar...</>}
          </span>
          <button className="btn-ghost" onClick={reset} title="Start over">
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {events.length > 0 && (
        <div className="organizer-actions">
          <button className="btn-primary" onClick={download}>
            <Download size={16} /> Download .ics ({events.length})
          </button>
          <button className="btn-ghost" onClick={onViewCalendar}>
            <ArrowRight size={16} /> Open calendar preview
          </button>
        </div>
      )}

      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <CalendarDays size={32} />
            <p>
              No workout plan yet. Head to the <strong>Workout Coach</strong> tab, answer a few questions, and the
              completed schedule will automatically be sent here.
            </p>
          </div>
        )}
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

      <ChatInput onSend={send} disabled={loading} placeholder="Tell the organizer what to do..." />
    </div>
  );
}
