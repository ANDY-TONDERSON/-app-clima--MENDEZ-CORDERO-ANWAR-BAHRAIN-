// backend/src/services/openWeatherService.js
require('dotenv').config();
const { run } = require('../db');
const cacheService = require('./cacheService');
const statsService = require('./statsService');

// -------------------------------------------------------------
// Polyfill de fetch: funciona en Node 18+ (fetch global)
// y en Node 16/17 usando node-fetch (import dinámico).
// -------------------------------------------------------------
let fetchFn = global.fetch;

if (!fetchFn) {
  // Node viejo sin fetch global
  fetchFn = async (...args) => {
    const { default: fetch } = await import('node-fetch');
    return fetch(...args);
  };
}

// Helper para usar siempre fetchFn
async function doFetch(url, options) {
  return fetchFn(url, options);
}

// -------------------------------------------------------------

const API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_TTL_MINUTES = parseInt(process.env.CACHE_TTL_MINUTES || '10', 10);

function buildCacheKey(city) {
  return `q:${city.trim().toLowerCase()}`;
}

function iconFromId(id) {
  if (id >= 200 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800) return '☀️';
  if (id > 800) return '⛅';
  return '☁️';
}

function mapToFrontend(openData, cityName) {
  const now = new Date();
  const dateStr = now.toLocaleString('es-MX', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const current = openData.current;
  const hourly = openData.hourly || [];

  const currentWeather = {
    location: cityName,
    date: dateStr,
    temperature: `${Math.round(current.temp)}°C`,
    description: current.weather?.[0]?.description || 'Sin descripción',
    humidity: `${current.humidity}%`,
    wind: `${current.wind_speed} m/s`,
    pressure: `${current.pressure} hPa`,
    visibility:
      current.visibility != null ? `${current.visibility / 1000} km` : 'N/D',
    icon: iconFromId(current.weather?.[0]?.id || 800)
  };

  const hourlyForecast = hourly.slice(0, 24).map((h) => {
    const dt = new Date(h.dt * 1000);
    const hourLabel = dt.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return {
      t: hourLabel,
      i: iconFromId(h.weather?.[0]?.id || 800),
      v: `${Math.round(h.temp)}°C`
    };
  });

  const cards = [
    {
      title: 'Sensación térmica',
      content: `${Math.round(current.feels_like)}°C`
    },
    {
      title: 'Índice UV',
      content: current.uvi != null ? `${current.uvi}` : 'N/D'
    },
    {
      title: 'Nubosidad',
      content: current.clouds != null ? `${current.clouds}%` : 'N/D'
    },
    {
      title: 'Presión del aire',
      content: `${current.pressure} hPa`
    }
  ];

  return { currentWeather, hourlyForecast, cards };
}

async function fetchWeatherFromAPI(city) {
  if (!API_KEY) {
    throw new Error('OPENWEATHER_API_KEY no configurada');
  }

  // 1) Geocoding (para obtener lat/lon)
  const geoUrl = new URL('https://api.openweathermap.org/geo/1.0/direct');
  geoUrl.searchParams.set('q', city);
  geoUrl.searchParams.set('limit', '1');
  geoUrl.searchParams.set('appid', API_KEY);

  console.log('[OpenWeather] Geocoding URL:', geoUrl.toString());

  const geoRes = await doFetch(geoUrl.toString());
  if (!geoRes.ok) {
    const text = await geoRes.text().catch(() => '');
    console.error('[OpenWeather] Error geocoding:', geoRes.status, text);
    throw new Error(`Error geocoding (${geoRes.status})`);
  }

  const geoData = await geoRes.json();
  if (!geoData.length) {
    const err = new Error('Ciudad no encontrada');
    err.code = 'CITY_NOT_FOUND';
    throw err;
  }

  const { lat, lon, name, country, state } = geoData[0];
  const fullName = [name, state, country].filter(Boolean).join(', ');

  // 2) One Call API 3.0 (actual + hourly)
  const oneUrl = new URL('https://api.openweathermap.org/data/3.0/onecall');
  oneUrl.searchParams.set('lat', lat);
  oneUrl.searchParams.set('lon', lon);
  oneUrl.searchParams.set('appid', API_KEY);
  oneUrl.searchParams.set('units', 'metric');
  oneUrl.searchParams.set('lang', 'es');
  oneUrl.searchParams.set('exclude', 'minutely,daily,alerts');

  console.log('[OpenWeather] One Call URL:', oneUrl.toString());

  const weatherRes = await doFetch(oneUrl.toString());
  if (!weatherRes.ok) {
    const text = await weatherRes.text().catch(() => '');
    console.error('[OpenWeather] Error One Call:', weatherRes.status, text);
    throw new Error(`Error OpenWeather (${weatherRes.status})`);
  }

  const weatherData = await weatherRes.json();

  const mapped = mapToFrontend(weatherData, fullName);
  return { mapped, lat, lon, fullName };
}

async function getWeather(cityRaw, userId = null) {
  const city = cityRaw.trim();
  const cacheKey = buildCacheKey(city);

  // 1) Intentar caché
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    await statsService.increment('from_cache');
    await statsService.increment('total_requests');

    await run(
      `INSERT INTO weather_queries (user_id, city, lat, lon, source, status_code)
       VALUES (?, ?, ?, ?, 'cache', 200)`,
      [userId, cached.city, cached.lat, cached.lon]
    );

    return cached.data;
  }

  // 2) Llamar a la API
  try {
    const { mapped, lat, lon, fullName } = await fetchWeatherFromAPI(city);

    const expiresAt = new Date(
      Date.now() + CACHE_TTL_MINUTES * 60 * 1000
    ).toISOString();

    await cacheService.set(cacheKey, {
      city: fullName,
      lat,
      lon,
      data: mapped,
      expiresAt
    });

    await statsService.increment('from_api');
    await statsService.increment('total_requests');

    await run(
      `INSERT INTO weather_queries (user_id, city, lat, lon, source, status_code)
       VALUES (?, ?, ?, ?, 'api', 200)`,
      [userId, fullName, lat, lon]
    );

    return mapped;
  } catch (err) {
    console.error('Error al obtener clima:', err);

    await statsService.increment('errors');
    await statsService.increment('total_requests');

    await run(
      `INSERT INTO weather_queries (user_id, city, source, status_code, error_message)
       VALUES (?, ?, 'error', ?, ?)`,
      [userId, city, 500, String(err).slice(0, 250)]
    );

    throw err;
  }
}

module.exports = { getWeather };
