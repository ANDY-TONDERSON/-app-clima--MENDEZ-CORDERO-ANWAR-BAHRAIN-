// src/db.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'weather.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'schema.sql');

const db = new sqlite3.Database(DB_PATH);

const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema, (err) => {
  if (err) {
    console.error('Error al inicializar la BD:', err);
  } else {
    console.log('Base de datos SQLite inicializada');
  }
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this); // this.lastID, this.changes
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { db, run, get, all };
