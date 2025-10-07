import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import healthRoutes from './routes/healthRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import lighthouseRoutes from './routes/lighthouseRoutes.js';
import userAnalyticsRoutes from './routes/userAnalyticsRoutes.js';
import searchConsoleRoutes from './routes/searchConsoleRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api', googleAuthRoutes);
app.use('/api', lighthouseRoutes);
app.use('/api', userAnalyticsRoutes);
app.use('/api', searchConsoleRoutes);

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SEO Health Score API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SEO Health Score API running on port ${PORT}`);
  console.log(`📍 Health endpoint: http://localhost:${PORT}/api/status`);
});

export default app;
