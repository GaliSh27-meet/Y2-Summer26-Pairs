import { Cloud, CloudRain, CloudSnow, CloudFog, CloudSun, CloudLightning, Sun, Wind, MapPin } from 'lucide-react';
import type { WeatherData } from '../lib/weather';

const ICONS: Record<string, typeof Sun> = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudRain,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
};

export default function WeatherCard({ weather }: { weather: WeatherData }) {
  const Icon = ICONS[weather.icon] ?? Cloud;
  return (
    <div className="weather-card">
      <div className="weather-top">
        <div className="weather-icon">
          <Icon size={28} />
        </div>
        <div className="weather-meta">
          <div className="weather-city">
            <MapPin size={14} /> {weather.city}
          </div>
          <div className="weather-temp">{weather.temperature}°C</div>
          <div className="weather-desc">{weather.description}</div>
        </div>
      </div>
      <div className="weather-bottom">
        <span className="weather-wind">
          <Wind size={14} /> {weather.windspeed} km/h
        </span>
        <span className={`weather-rec ${weather.recommendation}`}>
          Recommended: {weather.recommendation === 'outdoor' ? 'Outdoor' : 'Indoor'}
        </span>
      </div>
    </div>
  );
}
