import lighthouseService from '../services/lighthouseService.js';
import pagespeedService from '../services/pagespeedService.js';
import analyticsService from '../services/analyticsService.js';
import scoringService from '../services/scoringService.js';

// Debug: Check if services are properly imported
console.log('Services loaded:', {
  lighthouse: !!lighthouseService,
  pagespeed: !!pagespeedService,
  analytics: !!analyticsService,
  scoring: !!scoringService
});

const healthController = {
  async analyzeWebsite(req, res) {
    try {
      const { domain } = req.body;

      if (!domain) {
        return res.status(400).json({ 
          error: 'Domain is required',
          message: 'Please provide a domain to analyze'
        });
      }

      // Validate domain format (optional)
      const urlRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!urlRegex.test(domain) && !domain.startsWith('http')) {
        return res.status(400).json({ 
          error: 'Invalid domain format',
          message: 'Please provide a valid domain (e.g., example.com or https://example.com)'
        });
      }

      console.log(`🔍 Starting analysis for: ${domain}`);

      // Collect data from all services in parallel
      const [lighthouseData, pagespeedData, analyticsData] = await Promise.allSettled([
        lighthouseService.analyzeSite(domain),
        pagespeedService.getPageSpeedData(domain),
        analyticsService.getAnalyticsData(domain)
      ]);

      // Process results and handle failures
      const processedData = {
        lighthouse: lighthouseData.status === 'fulfilled' ? lighthouseData.value : null,
        pagespeed: pagespeedData.status === 'fulfilled' ? pagespeedData.value : null,
        analytics: analyticsData.status === 'fulfilled' ? analyticsData.value : null
      };

      // Calculate health score
      const healthScore = scoringService.calculateHealthScore(processedData);

      res.json({
        domain,
        overall_score: healthScore.overall,
        technical: healthScore.technical,
        user_experience: healthScore.userExperience,
        seo_health: healthScore.seoHealth,
        timestamp: new Date().toISOString(),
        data_quality: healthScore.dataQuality
      });

    } catch (error) {
      console.error('❌ Error analyzing website:', error);
      res.status(500).json({ 
        error: 'Analysis failed', 
        message: error.message 
      });
    }
  },

  async getHealthReport(req, res) {
    try {
      const { domain } = req.params;

      console.log(`📊 Generating detailed report for: ${domain}`);

      // Get comprehensive data
      const [lighthouseData, pagespeedData, analyticsData] = await Promise.allSettled([
        lighthouseService.analyzeSite(domain),
        pagespeedService.getPageSpeedData(domain),
        analyticsService.getAnalyticsData(domain)
      ]);

      const processedData = {
        lighthouse: lighthouseData.status === 'fulfilled' ? lighthouseData.value : null,
        pagespeed: pagespeedData.status === 'fulfilled' ? pagespeedData.value : null,
        analytics: analyticsData.status === 'fulfilled' ? analyticsData.value : null
      };

      const healthScore = scoringService.calculateHealthScore(processedData);
      const recommendations = scoringService.getRecommendations(processedData, healthScore);

      res.json({
        domain,
        score: healthScore.overall,
        breakdown: {
          technical: {
            score: healthScore.technical,
            lighthouse_performance: processedData.lighthouse?.performance || null,
            core_vitals_score: healthScore.coreVitalsScore
          },
          user_experience: {
            score: healthScore.userExperience,
            bounce_rate: processedData.analytics?.bounceRate || null,
            session_duration: processedData.analytics?.avgSessionDuration || null
          },
          seo_health: {
            score: healthScore.seoHealth,
            lighthouse_seo: processedData.lighthouse?.seo || null,
            accessibility: processedData.lighthouse?.accessibility || null
          }
        },
        recommendations,
        data_sources: {
          lighthouse_available: !!processedData.lighthouse,
          pagespeed_available: !!processedData.pagespeed,
          analytics_available: !!processedData.analytics
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error generating health report:', error);
      res.status(500).json({ 
        error: 'Report generation failed', 
        message: error.message 
      });
    }
  }
};

export default healthController;
