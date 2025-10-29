import { useEffect, useMemo, useRef, useState } from "react";
import { ciudadesMexico, paises } from "./data";
import weatherData from "./data/weather.json";


type Hour = {
  time: string;
  tempC: number;
  icon: string;
  desc: string;
};

type WeatherData = {
  location: string;
  updatedAt: string;
  current: {
    tempC: number;
    desc: string;
    humidity: number;
    windKmh: number;
    pressure: number;
    visibility: number;
  };
  today: {
    date: string;
    hours: Hour[];
  };
};

const normaliza = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function App() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);

  // 🔹 Generar datos dinámicos basados en weather.json
  const dynamicWeather = useMemo(() => {
    const data = structuredClone(weatherData) as WeatherData;


    // Fecha y hora actual
    const now = new Date();
    data.updatedAt = now.toLocaleString("es-MX", {
      dateStyle: "full",
      timeStyle: "short",
    });

    // Simular condiciones climáticas dinámicas
    const temp = 24 + Math.floor(Math.random() * 8); // 24–32 °C
    const humidity = 60 + Math.floor(Math.random() * 20);
    const wind = 10 + Math.floor(Math.random() * 10);
    const pressure = 1005 + Math.floor(Math.random() * 10);
    const visibility = 8 + Math.floor(Math.random() * 3);

    data.current = {
      tempC: temp,
      desc:
        temp > 30
          ? "Soleado"
          : temp > 27
          ? "Parcialmente nublado"
          : "Lluvia ligera",
      humidity,
      windKmh: wind,
      pressure,
      visibility,
    };

    // Generar 24 h de pronóstico dinámico
    data.today.date = now.toISOString().slice(0, 10);
    data.today.hours = Array.from({ length: 24 }, (_, i) => {
      const hourTemp = temp - 2 + Math.round(Math.sin(i / 3) * 2);
      const icons = ["☀️", "⛅", "🌧️", "☁️"];
      const icon = icons[i % icons.length];
      const desc =
        icon === "☀️"
          ? "Despejado"
          : icon === "⛅"
          ? "Parcialmente nublado"
          : icon === "🌧️"
          ? "Lluvia ligera"
          : "Nublado";

      return {
        time: `${String(i).padStart(2, "0")}:00`,
        tempC: hourTemp,
        icon,
        desc,
      };
    });

    return data;
  }, []);

  // Estados del clima
  const [weather, setWeather] = useState(dynamicWeather);

  // Buscador de ciudades
  const base = useMemo(() => [...ciudadesMexico, ...paises], []);

  const resultados = useMemo(() => {
    const q = normaliza(query.trim());
    if (!q) return base.slice(0, 30);
    return base.filter((x) => normaliza(x).includes(q)).slice(0, 30);
  }, [base, query]);

  const existsExact = useMemo(() => {
    const q = normaliza(query.trim());
    return !!q && resultados.some((r) => normaliza(r) === q);
  }, [resultados, query]);

  function applyLocation(name: string) {
    // Generar un clima nuevo cada vez que se cambia de ciudad
    const updated = {
      ...dynamicWeather,
      location: name,
      updatedAt: new Date().toLocaleString("es-MX", {
        dateStyle: "full",
        timeStyle: "short",
      }),
    };
    setWeather(updated);
    setQuery(name);
    closeList();
  }

  function openList() {
    setListOpen(true);
  }
  function closeList() {
    setListOpen(false);
  }
  function toggleList() {
    setListOpen((v) => !v);
  }

  // Cerrar lista al hacer click fuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!listRef.current) return;
      const target = e.target as Node;
      if (listRef.current.contains(target)) return;
      const search = (target as Element).closest?.(".search");
      if (search) return;
      closeList();
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function renderAndOpen() {
    if (!listOpen) openList();
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="side-header">
          <div className="brand">
            <div className="brand-logo">☁️</div>
            <div>TECNM - Clima</div>
          </div>

          <div className="search" role="search">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escribe ciudad"
              autoComplete="off"
              aria-label="Buscar ciudad, estado o país"
              value={query}
              onFocus={() => renderAndOpen()}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!listOpen) openList();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLocation(query.trim() || "—");
                } else if (e.key === "Escape") {
                  closeList();
                }
              }}
            />
            <button
              onClick={() => {
                toggleList();
                if (!listOpen) inputRef.current?.focus();
              }}
              aria-expanded={listOpen ? "true" : "false"}
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Sugerencias */}
        <div
          id="cityList"
          className="suggestions"
          ref={listRef}
          style={{ display: listOpen ? "block" : "none" }}
          aria-live="polite"
          role="listbox"
        >
          {query.trim() && !existsExact && (
            <div
              className="city-item add"
              role="option"
              onClick={() => applyLocation(query.trim())}
            >
              Usar “{query.trim()}”
            </div>
          )}

          {resultados.map((item) => (
            <div
              key={item}
              className="city-item"
              role="option"
              onClick={() => applyLocation(item)}
            >
              {item}
            </div>
          ))}

          {resultados.length === 0 && (
            <div className="city-item add" role="option">
              Usar “{query.trim() || "…"}”
            </div>
          )}
        </div>
      </aside>

      <main className="main">
        <h1>Pronóstico de 24 horas</h1>

        <section className="current-weather">
          <div className="cw-left">
            <div className="cw-loc">{weather.location}</div>
            <div className="cw-date">{weather.updatedAt}</div>
            <div className="cw-temp">{weather.current.tempC}°C</div>
            <div className="cw-desc">{weather.current.desc}</div>
            <div className="cw-details">
              <div className="cw-chip">Humedad: {weather.current.humidity}%</div>
              <div className="cw-chip">Viento: {weather.current.windKmh} km/h</div>
              <div className="cw-chip">Presión: {weather.current.pressure} hPa</div>
              <div className="cw-chip">
                Visibilidad: {weather.current.visibility} km
              </div>
            </div>
          </div>
          <div className="cw-right">
            <div className="big-icon">☁️</div>
          </div>
        </section>

        <section>
          <div className="panel">
            <h2>Próximas 24 horas</h2>
            <p style={{ margin: "8px 0 12px", opacity: ".8" }}>
              Pronóstico detallado por hora.
            </p>
            <div className="scroll-x">
              {weather.today.hours.map((h) => (
                <div key={h.time} className="hour">
                  <div className="t">{h.time}</div>
                  <div className="i">{h.icon}</div>
                  <div className="v">{h.tempC}°C</div>
                  <div className="d">{h.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cards">
          <div className="card">
            <h3>Salida / Puesta</h3>
            <div>☀️ 06:15 • 🌙 18:35</div>
          </div>
          <div className="card">
            <h3>Índice UV</h3>
            <div>{Math.floor(Math.random() * 10)} (UV)</div>
          </div>
          <div className="card">
            <h3>Calidad del aire</h3>
            <div>AQI {30 + Math.floor(Math.random() * 40)} — Buena</div>
          </div>
          <div className="card">
            <h3>Fase lunar</h3>
            <div>🌔 Cuarto creciente</div>
          </div>
        </section>
      </main>
    </div>
  );
}
