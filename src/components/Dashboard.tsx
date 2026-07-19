import { useEffect, useRef, useState } from 'react';
import { Dumbbell, CalendarDays, Download, Sparkles, LogOut, Calendar as CalIcon } from 'lucide-react';
import CoachChat from './CoachChat';
import OrganizerChat from './OrganizerChat';
import CalendarPreview from './CalendarPreview';
import type { CalendarEventRow, WorkoutPlanRow } from '../lib/supabase';

type Agent = 'coach' | 'organizer' | 'calendar';

type Props = {
  events: CalendarEventRow[];
  plans: WorkoutPlanRow[];
  refreshEvents: () => Promise<void>;
  refreshPlans: () => Promise<void>;
  onExit: () => void;
};

export default function Dashboard({ events, plans, refreshEvents, refreshPlans, onExit }: Props) {
  const [agent, setAgent] = useState<Agent>('coach');
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 4500);
  };

  useEffect(() => {
    return () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    };
  }, []);

  const navItems: Array<{ id: Agent; label: string; icon: typeof Dumbbell; sub: string }> = [
    { id: 'coach', label: 'Workout Coach', icon: Dumbbell, sub: 'Agent 1' },
    { id: 'organizer', label: 'Calendar Organizer', icon: CalendarDays, sub: 'Agent 2' },
    { id: 'calendar', label: 'Calendar Preview', icon: CalIcon, sub: 'Download .ics' },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>
          <span className="brand-name">FitFlow AI</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = agent === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => setAgent(item.id)}
              >
                <span className="nav-icon">
                  <item.icon size={18} />
                </span>
                <span className="nav-text">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-sub">{item.sub}</span>
                </span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-stat">
            <span className="stat-label">Workout plans</span>
            <span className="stat-value">{plans.length}</span>
          </div>
          <div className="sidebar-stat">
            <span className="stat-label">Calendar events</span>
            <span className="stat-value">{events.length}</span>
          </div>
          <button className="btn-ghost btn-block" onClick={onExit}>
            <LogOut size={16} /> Exit to home
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            {agent === 'coach' && 'Workout Coach'}
            {agent === 'organizer' && 'Calendar Organizer'}
            {agent === 'calendar' && 'Calendar Preview'}
          </div>
          <div className="topbar-actions">
            {events.length > 0 && (
              <button
                className="btn-ghost"
                onClick={() => setAgent('calendar')}
              >
                <Download size={16} /> {events.length} event{events.length === 1 ? '' : 's'}
              </button>
            )}
          </div>
        </header>

        {notice && (
          <div className="notice">
            <span className="notice-dot" /> {notice}
          </div>
        )}

        <section className="content">
          {agent === 'coach' && (
            <CoachChat
              onPlanSaved={() => {
                refreshPlans();
                refreshEvents();
                showNotice('Workout plan successfully sent to Calendar Organizer.');
                setAgent('organizer');
              }}
            />
          )}
          {agent === 'organizer' && (
            <OrganizerChat
              events={events}
              plans={plans}
              onEventsChanged={async () => {
                await refreshEvents();
                showNotice('Calendar updated.');
              }}
              onViewCalendar={() => setAgent('calendar')}
            />
          )}
          {agent === 'calendar' && (
            <CalendarPreview events={events} onCleared={refreshEvents} />
          )}
        </section>
      </main>
    </div>
  );
}
