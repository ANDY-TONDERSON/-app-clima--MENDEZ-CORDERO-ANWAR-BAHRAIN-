// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weatherRoutes');
const searchRoutes = require('./routes/searchRoutes'); // 👈 NUEVO
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/weather', weatherRoutes);
app.use('/api/search', searchRoutes); // 👈 NUEVO

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
