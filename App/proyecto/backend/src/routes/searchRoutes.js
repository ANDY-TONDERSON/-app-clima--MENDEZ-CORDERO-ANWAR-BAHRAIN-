// backend/src/routes/searchRoutes.js
require('dotenv').config();
const express = require('express');
const router = express.Router();

const API_KEY = process.env.OPENWEATHER_API_KEY;

// Polyfill de fetch (Node 18+ ya tiene fetch; Node más viejito usa node-fetch)
let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = async (...args) => {
    const { default: fetch } = await import('node-fetch');
    return fetch(...args);
  };
}

async function doFetch(url, options) {
  return fetchFn(url, options);
}

// GET /api/search?query=texto
router.get('/', async (req, res) => {
  try {
    const query = (req.query.query || '').trim();

    if (!query || query.length < 2) {
      return res.json([]); // No buscamos si escribe menos de 2 letras
    }

    if (!API_KEY) {
      return res.status(500).json({ error: 'API key de OpenWeather no configurada' });
    }

    const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '10');
    url.searchParams.set('appid', API_KEY);

    const response = await doFetch(url.toString());
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[Search] Error geocoding:', response.status, text);
      return res.status(500).json({ error: 'Error consultando lugares' });
    }

    const data = await response.json();

    const results = data.map(place => ({
      name: [
        place.name,
        place.state,
        place.country
      ].filter(Boolean).join(', '),
      lat: place.lat,
      lon: place.lon,
      country: place.country,
      state: place.state || null
    }));

    res.json(results);
  } catch (err) {
    console.error('[Search] Error interno:', err);
    res.status(500).json({ error: 'Error interno al buscar lugares' });
  }
});

module.exports = router;
