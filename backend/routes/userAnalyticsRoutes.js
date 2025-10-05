import express from 'express';
import userAnalyticsService from '../services/userAnalyticsService.js';

const router = express.Router();

// Get user's GA4 properties
router.get('/analytics/properties', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const result = await userAnalyticsService.getUserProperties(email);
    res.json(result);

  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get user's GA4 analytics data
router.get('/analytics/data', async (req, res) => {
  try {
    const { email, propertyId } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const data = await userAnalyticsService.getUserAnalyticsData(email, propertyId);
    res.json(data);

  } catch (error) {
    console.error('❌ Error fetching analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;