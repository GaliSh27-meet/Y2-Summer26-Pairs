import { Dumbbell, CloudSun, CalendarDays, ArrowRight, Activity } from 'lucide-react';

type Props = {
  onStart: () => void;
};

const features = [
  {
    icon: Dumbbell,
    title: 'Personalized Workout Plans',
    description: 'An AI coach interviews you about your goals, schedule, and preferences — then builds a plan that actually fits your life.',
  },
  {
    icon: CloudSun,
    title: 'Weather-Based Recommendations',
    description: 'Live weather for your city decides whether each session should be indoors or outdoors, day by day.',
  },
  {
    icon: CalendarDays,
    title: 'Automatic Calendar Generator',
    description: 'A second AI agent turns your plan into a downloadable calendar — no re-entering anything.',
  },
];

export default function Landing({ onStart }: Props) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">
          <span className="brand-mark">
            <Activity size={18} />
          </span>
          <span className="brand-name">FitFlow AI</span>
        </div>
        <button className="btn-ghost" onClick={onStart}>
          Launch app
        </button>
      </header>

      <section className="hero">
        <div className="hero-badge">
          <span className="dot" /> Two AI agents, one workflow
        </div>
        <h1 className="hero-title">
          FitFlow <span className="hero-accent">AI</span>
        </h1>
        <p className="hero-subtitle">
          Generate personalized workout plans powered by AI and automatically organize them into your calendar.
        </p>
        <button className="btn-primary btn-lg" onClick={onStart}>
          Start Planning <ArrowRight size={18} />
        </button>
      </section>

      <section className="features">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">
              <f.icon size={22} />
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.description}</p>
          </div>
        ))}
      </section>

      <footer className="landing-footer">
        Built with two collaborating AI agents — a Workout Coach and a Calendar Organizer.
      </footer>
    </div>
  );
}
