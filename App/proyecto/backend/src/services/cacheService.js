// src/services/cacheService.js
const { get, run } = require('../db');

async function getValidRow(cacheKey) {
  const nowIso = new Date().toISOString();
  return get(
    `SELECT * FROM weather_cache WHERE cache_key = ? AND expires_at > ?`,
    [cacheKey, nowIso]
  );
}

async function getFromCache(cacheKey) {
  const row = await getValidRow(cacheKey);
  if (!row) return null;

  try {
    const data = JSON.parse(row.data_json);
    return {
      city: row.city,
      lat: row.lat,
      lon: row.lon,
      data
    };
  } catch {
    return null;
  }
}

async function setCache(cacheKey, { city, lat, lon, data, expiresAt }) {
  const json = JSON.stringify(data);
  await run(
    `INSERT INTO weather_cache (cache_key, city, lat, lon, data_json, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET
       city = excluded.city,
       lat = excluded.lat,
       lon = excluded.lon,
       data_json = excluded.data_json,
       expires_at = excluded.expires_at`,
    [cacheKey, city, lat, lon, json, expiresAt]
  );
}

module.exports = {
  get: getFromCache,
  set: setCache
};
