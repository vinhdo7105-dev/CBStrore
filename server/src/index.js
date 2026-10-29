const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config(); // Fallback to current working directory
const express = require('express');
const cors = require('cors');
const db = require('./db');

const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const builderRouter = require('./routes/builder');
const bannersRouter = require('./routes/banners');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/builder', builderRouter);
app.use('/api/banners', bannersRouter);

// Database & Server Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: db.getDatabaseStatus()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra sự cố trên máy chủ.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server after initializing DB
async function startServer() {
  await db.initDatabase();
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 PC Store API Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}/api/products`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

startServer();
