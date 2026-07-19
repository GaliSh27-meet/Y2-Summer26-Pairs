import { useEffect, useState } from 'react';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import { fetchCalendarEvents, fetchWorkoutPlans } from './lib/agents';
import type { CalendarEventRow, WorkoutPlanRow } from './lib/supabase';

export default function App() {
  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState<CalendarEventRow[]>([]);
  const [plans, setPlans] = useState<WorkoutPlanRow[]>([]);

  const refreshEvents = async () => setEvents(await fetchCalendarEvents());
  const refreshPlans = async () => setPlans(await fetchWorkoutPlans());

  useEffect(() => {
    refreshEvents();
    refreshPlans();
  }, []);

  if (!started) {
    return <Landing onStart={() => setStarted(true)} />;
  }

  return (
    <Dashboard
      events={events}
      plans={plans}
      refreshEvents={refreshEvents}
      refreshPlans={refreshPlans}
      onExit={() => setStarted(false)}
    />
  );
}
