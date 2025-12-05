// src/services/statsService.js
const { run, get } = require('../db');

async function increment(column) {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const row = await get('SELECT * FROM stats_daily WHERE day = ?', [day]);

  if (!row) {
    const base = { total_requests: 0, from_cache: 0, from_api: 0, errors: 0 };
    base[column] = 1;
    await run(
      `INSERT INTO stats_daily (day, total_requests, from_cache, from_api, errors)
       VALUES (?, ?, ?, ?, ?)`,
      [day, base.total_requests, base.from_cache, base.from_api, base.errors]
    );
  } else {
    await run(
      `UPDATE stats_daily SET ${column} = ${column} + 1 WHERE day = ?`,
      [day]
    );
  }
}

module.exports = { increment };
