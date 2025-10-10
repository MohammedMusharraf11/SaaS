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
    const { email, propertyId, dateRange = '30days' } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    console.log('📊 Fetching analytics with range:', dateRange);

    let data;
    // Handle realtime separately
    if (dateRange === 'realtime') {
      data = await userAnalyticsService.getUserRealtimeData(email, propertyId);
    } else {
      // For historical data (7days, 30days), use the regular method
      // The service currently uses 30daysAgo by default
      // We'll pass the dateRange info via property for now
      data = await userAnalyticsService.getUserAnalyticsData(email, propertyId);
      
      // Add dateRange info to response
      if (data.dataAvailable) {
        data.dateRange = dateRange;
      }
    }
    
    res.json(data);

  } catch (error) {
    console.error('❌ Error fetching analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get social media metrics
router.get('/analytics/social', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const data = await userAnalyticsService.getSocialMediaMetrics(email);
    res.json(data);

  } catch (error) {
    console.error('❌ Error fetching social media data:', error);
    res.status(500).json({ error: 'Failed to fetch social media data' });
  }
});

export default router;