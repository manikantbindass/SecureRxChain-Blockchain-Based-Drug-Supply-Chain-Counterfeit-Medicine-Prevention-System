require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const drugRoutes = require('./routes/drugRoutes');
const qrRoutes = require('./routes/qrRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use('/api/', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'SecureRxChain API is running', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SecureRxChain server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
