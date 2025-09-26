const analyticsService = {
  async getAnalyticsData(domain) {
    try {
      console.log(`📊 Fetching Analytics data for: ${domain}`);
      
      const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
      if (!propertyId) {
        console.log('⚠️ GA4 Property ID not configured, using mock data for demo');
        
        // Return mock data for testing when GA4 is not configured
        return {
          bounceRate: 45.5,
          avgSessionDuration: 195,
          totalSessions: 1250,
          organicSessions: 850,
          organicBounceRate: 38.2,
          organicPercentage: 68,
          dataAvailable: false, // Mark as mock data
          note: 'Mock data - configure GA4 for real metrics'
        };
      }

      // For now, return null to skip analytics until properly configured
      // This allows the other services (Lighthouse, PageSpeed) to work
      console.log('⚠️ GA4 integration not yet configured, skipping analytics');
      return null;

    } catch (error) {
      console.error(`❌ Analytics API failed for ${domain}:`, error.message);
      return null; // Don't throw, let other services continue
    }
  },

  // Convert bounce rate to score (lower bounce rate = higher score)
  convertBounceRateToScore(bounceRate) {
    if (bounceRate === null || bounceRate === undefined) return null;
    
    // Typical website bounce rates:
    // Excellent: <26%, Good: 26-40%, Average: 41-55%, Poor: 56-70%, Very Poor: >70%
    if (bounceRate <= 26) return 100;
    if (bounceRate <= 40) return 85;
    if (bounceRate <= 55) return 70;
    if (bounceRate <= 70) return 50;
    return 25;
  },

  // Convert session duration to score (longer duration = higher score)
  convertSessionDurationToScore(duration) {
    if (duration === null || duration === undefined) return null;
    
    // Convert seconds to score
    // Excellent: >3min (180s), Good: 2-3min, Average: 1-2min, Poor: <1min
    if (duration >= 180) return 100;
    if (duration >= 120) return 85;
    if (duration >= 60) return 70;
    if (duration >= 30) return 50;
    return 25;
  }
};

export default analyticsService;