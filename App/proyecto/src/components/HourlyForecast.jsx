import React from 'react';

const HourlyForecast = ({ forecast }) => {
  return (
    <section>
      <div className="panel">
        <h2>Próximas 24 horas</h2>
        <p style={{ margin: '8px 0 12px', opacity: 0.8 }}>
          Pronóstico detallado por hora.
        </p>
        <div className="scroll-x">
          {forecast.map((hour, index) => (
            <div key={index} className="hour">
              <div className="t">{hour.t}</div>
              <div className="i">{hour.i}</div>
              <div className="v">{hour.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HourlyForecast;