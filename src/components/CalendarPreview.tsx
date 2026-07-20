import { useState } from 'react';
import { Download, Trash2, CalendarDays, Clock, MapPin } from 'lucide-react';
import { buildICS, downloadICS } from '../lib/ics';
import { clearCalendarEvents } from '../lib/agents';
import type { CalendarEventRow } from '../lib/supabase';

type Props = {
  events: CalendarEventRow[];
  onCleared: () => Promise<void>;
};

function formatEventTime(ev: CalendarEventRow): string {
  const begin = new Date(ev.begin);
  const end = new Date(ev.end);
  const date = begin.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const time = `${begin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return `${date} · ${time}`;
}

function durationMinutes(ev: CalendarEventRow): number {
  return Math.round((new Date(ev.end).getTime() - new Date(ev.begin).getTime()) / 60000);
}

export default function CalendarPreview({ events, onCleared }: Props) {
  const [confirming, setConfirming] = useState(false);

  const download = () => {
    if (!events.length) return;
    downloadICS('fitflow-workout-calendar.ics', buildICS(events));
  };

  const clearAll = async () => {
    await clearCalendarEvents();
    await onCleared();
    setConfirming(false);
  };

  return (
    <div className="calendar-page">
      <div className="calendar-toolbar">
        <div className="calendar-count">
          <CalendarDays size={18} /> {events.length} event{events.length === 1 ? '' : 's'} scheduled
        </div>
        <div className="calendar-actions">
          <button className="btn-primary" onClick={download} disabled={!events.length}>
            <Download size={16} /> Download .ics
          </button>
          {confirming ? (
            <>
              <button className="btn-danger" onClick={clearAll}>
                <Trash2 size={16} /> Confirm clear
              </button>
              <button className="btn-ghost" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn-ghost" onClick={() => setConfirming(true)} disabled={!events.length}>
              <Trash2 size={16} /> Clear all
            </button>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={32} />
          <p>No events yet. Generate a workout plan in the Coach tab and the calendar will appear here.</p>
        </div>
      ) : (
        <div className="event-list">
          {events.map((ev) => (
            <div className="event-card" key={ev.id}>
              <div className="event-bar" />
              <div className="event-body">
                <div className="event-title">{ev.name}</div>
                <div className="event-time">
                  <Clock size={14} /> {formatEventTime(ev)}
                </div>
                <div className="event-duration">{durationMinutes(ev)} min</div>
                {ev.description && (
                  <p className="event-desc">
                    <MapPin size={12} /> {ev.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
