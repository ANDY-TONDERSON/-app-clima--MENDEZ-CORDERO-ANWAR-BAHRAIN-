import type { Weather } from "../data/weather";


export default function ForecastList({ w }: { w: Weather }) {
  return (
    <section className="panel" aria-labelledby="t-24h">
      <h2 id="t-24h">Próximas 24 horas</h2>
      <p className="muted">Pronóstico por hora (datos simulados).</p>
      <div className="hours">
        {w.today.hours.map((h) => (
          <div className="hour" key={h.time} role="group" aria-label={`${h.time}, ${h.desc}, ${h.tempC} grados`}>
            <div className="t">{h.time}</div>
            <div className="i">{h.icon}</div>
            <div className="v">{h.tempC}°C</div>
          </div>
        ))}
      </div>
    </section>
  );
}
