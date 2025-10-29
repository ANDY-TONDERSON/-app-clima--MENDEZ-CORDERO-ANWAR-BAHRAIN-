import type { Weather } from "../data/weather";

export default function WeatherCard({ w }: { w: Weather }) {
  return (
    <section className="current" aria-labelledby="t-current">
      <h2 id="t-current">Clima actual</h2>
      <div className="current-grid">
        <div className="current-left">
          <div className="loc">{w.location}</div>
          <div className="upd">Actualizado: {w.updatedAt}</div>
          <div className="temp">{w.current.tempC}°C</div>
          <div className="desc">{w.current.desc}</div>
          <div className="chips">
            <span className="chip">Humedad: {w.current.humidity}%</span>
            <span className="chip">Viento: {w.current.windKmh} km/h</span>
          </div>
        </div>
        <div className="current-right" aria-hidden>
          <div className="big">🌤️</div>
        </div>
      </div>
    </section>
  );
}
