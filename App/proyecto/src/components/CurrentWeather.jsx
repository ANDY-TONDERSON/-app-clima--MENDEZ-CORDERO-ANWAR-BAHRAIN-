import React from 'react';

const CurrentWeather = ({ weather }) => {
  return (
    <section className="current-weather">
      <div className="cw-left">
        <div className="cw-loc">{weather.location}</div>
        <div className="cw-date">{weather.date}</div>
        <div className="cw-temp">{weather.temperature}</div>
        <div className="cw-desc">{weather.description}</div>
        <div className="cw-details">
          <div className="cw-chip">Humedad: {weather.humidity}</div>
          <div className="cw-chip">Viento: {weather.wind}</div>
          <div className="cw-chip">Presión: {weather.pressure}</div>
          <div className="cw-chip">Visibilidad: {weather.visibility}</div>
        </div>
      </div>
      <div className="cw-right">
        <div className="big-icon">{weather.icon}</div>
      </div>
    </section>
  );
};

export default CurrentWeather;