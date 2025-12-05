// src/controllers/weatherController.js
const openWeatherService = require('../services/openWeatherService');

function sanitizeCity(city) {
  const trimmed = (city || '').trim();
  if (!trimmed) return null;

  const regex = /^[\p{L}\s,.-]{1,80}$/u; // letras, espacios, comas, etc.
  if (!regex.test(trimmed)) return null;

  return trimmed;
}

async function getWeather(req, res, next) {
  try {
    const rawCity = req.query.location || req.query.city;
    const city = sanitizeCity(rawCity);

    if (!city) {
      return res
        .status(400)
        .json({ error: 'Parámetro "location" inválido o vacío' });
    }

    const data = await openWeatherService.getWeather(city, null);
    res.json(data);
  } catch (err) {
    if (err.code === 'CITY_NOT_FOUND') {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }
    next(err);
  }
}

module.exports = { getWeather };
