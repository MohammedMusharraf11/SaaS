import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsClient = new BetaAnalyticsDataClient();

const analyticsService = {
  async getAnalyticsData(domain) {
    try {
      const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
      if (!propertyId) {
        console.log('⚠️ GA4 Property ID not configured.');
        return null;
      }

      // Query GA4 API for metrics last 30 days
      const [response] = await analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'sessions' },
          { name: 'organicSessions' }
        ]
      });

      const rows = response.rows || [];

      // Example to extract metrics from response
      const metrics = {};
      for (const row of rows) {
        for (let i = 0; i < row.metricValues.length; i++) {
          const metricName = response.metricHeaders[i].name;
          const metricValue = parseFloat(row.metricValues[i].value);
          metrics[metricName] = metricValue;
        }
      }

      return {
        bounceRate: metrics.bounceRate || null,
        avgSessionDuration: metrics.averageSessionDuration || null,
        totalSessions: metrics.sessions || null,
        organicSessions: metrics.organicSessions || null,
        dataAvailable: true
      };

    } catch (error) {
      console.error('❌ Analytics API failed:', error);
      return null; // Allow other services to run if analytics fails
    }
  },

  convertBounceRateToScore(bounceRate) { /* existing code */ },
  convertSessionDurationToScore(duration) { /* existing code */ }
};

export default analyticsService;
