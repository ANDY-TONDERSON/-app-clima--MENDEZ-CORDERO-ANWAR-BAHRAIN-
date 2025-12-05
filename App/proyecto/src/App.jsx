import React, { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import CurrentWeather from "./components/CurrentWeather";
import WeatherCard from "./components/WeatherCard";
import HourlyForecast from "./components/HourlyForecast";
import "./App.css";

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLocationChange = async (location) => {
  if (!location || !location.trim()) return;

  try {
    setLoading(true);
    setErrorMsg("");

    const res = await fetch(
      `http://localhost:4000/api/weather?location=${encodeURIComponent(
        location.trim()
      )}`
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error al obtener el clima");
    }

    const data = await res.json();

    setCurrentWeather(data.currentWeather);
    setHourlyForecast(data.hourlyForecast || []);
    setCards(data.cards || []);
  } catch (err) {
    console.error(err);
    setErrorMsg(err.message || "Error desconocido");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="app">
      <Sidebar onLocationChange={handleLocationChange} />

      <main className="main">
        <h1>Pronóstico de 24 horas</h1>

        {loading && <p>Cargando clima...</p>}
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

        {!loading && currentWeather && (
          <>
            <CurrentWeather weather={currentWeather} />

            <section className="cards">
              {cards.map((card, index) => (
                <WeatherCard
                  key={index}
                  title={card.title}
                  content={card.content}
                />
              ))}
            </section>

            <HourlyForecast forecast={hourlyForecast} />
          </>
        )}

        {!loading && !currentWeather && !errorMsg && (
          <p style={{ opacity: 0.7 }}>
            Escribe una ciudad en la barra lateral para ver el clima.
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
