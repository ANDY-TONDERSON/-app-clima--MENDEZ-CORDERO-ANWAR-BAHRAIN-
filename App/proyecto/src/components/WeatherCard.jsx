import React from 'react';

const WeatherCard = ({ title, content }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{content}</div>
    </div>
  );
};

export default WeatherCard;