import lighthouseService from '../services/lighthouseService.js';
import pagespeedService from '../services/pagespeedService.js';
import analyticsService from '../services/analyticsService.js';
import scoringService from '../services/scoringService.js';
import searchConsoleService from '../services/searchConsoleService.js';
import technicalSEOService from '../services/technicalSEOService.js';

// Debug: Check if services are properly imported
console.log('🔧 Services loaded:', {
  lighthouse: !!lighthouseService,
  pagespeed: !!pagespeedService,
  analytics: !!analyticsService,
  scoring: !!scoringService,
  searchConsole: !!searchConsoleService,  // NEW
  technicalSEO: !!technicalSEOService     // NEW
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

      console.log(`🔍 Starting enhanced analysis for: ${domain}`);

      // Collect data from ALL services in parallel (including new ones)
      const [lighthouseData, pagespeedData, analyticsData, searchConsoleData, technicalSEOData] = await Promise.allSettled([
        lighthouseService.analyzeSite(domain),
        pagespeedService.getPageSpeedData(domain),
        analyticsService.getAnalyticsData(domain),
        searchConsoleService.getSearchConsoleData(domain),  // NEW
        technicalSEOService.getTechnicalSEOData(domain)     // NEW
      ]);

      // Process results and handle failures
      const processedData = {
        lighthouse: lighthouseData.status === 'fulfilled' ? lighthouseData.value : null,
        pagespeed: pagespeedData.status === 'fulfilled' ? pagespeedData.value : null,
        analytics: analyticsData.status === 'fulfilled' ? analyticsData.value : null,
        searchConsole: searchConsoleData.status === 'fulfilled' ? searchConsoleData.value : null,  // NEW
        technicalSEO: technicalSEOData.status === 'fulfilled' ? technicalSEOData.value : null      // NEW
      };

      // Calculate enhanced health score (now with 5 categories)
      const healthScore = scoringService.calculateEnhancedHealthScore(processedData);

      res.json({
        domain,
        overall_score: healthScore.overall,
        // Updated breakdown with new categories
        breakdown: {
          technical: healthScore.breakdown.technical,
          user_experience: healthScore.breakdown.userExperience,
          seo_health: healthScore.breakdown.seoHealth,
          search_visibility: healthScore.breakdown.searchVisibility,  // NEW
          technical_seo: healthScore.breakdown.technicalSEO           // NEW
        },
        timestamp: new Date().toISOString(),
        data_quality: {
          level: healthController.assessDataQuality(processedData),
          sources: {
            lighthouse_available: !!processedData.lighthouse,
            pagespeed_available: !!processedData.pagespeed,
            analytics_available: !!processedData.analytics,
            search_console_available: !!processedData.searchConsole,  // NEW
            technical_seo_available: !!processedData.technicalSEO     // NEW
          }
        }
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

      console.log(`📊 Generating enhanced detailed report for: ${domain}`);

      // Get comprehensive data from ALL services
      const [lighthouseData, pagespeedData, analyticsData, searchConsoleData, technicalSEOData] = await Promise.allSettled([
        lighthouseService.analyzeSite(domain),
        pagespeedService.getPageSpeedData(domain),
        analyticsService.getAnalyticsData(domain),
        searchConsoleService.getSearchConsoleData(domain),  // NEW
        technicalSEOService.getTechnicalSEOData(domain)     // NEW
      ]);

      const processedData = {
        lighthouse: lighthouseData.status === 'fulfilled' ? lighthouseData.value : null,
        pagespeed: pagespeedData.status === 'fulfilled' ? pagespeedData.value : null,
        analytics: analyticsData.status === 'fulfilled' ? analyticsData.value : null,
        searchConsole: searchConsoleData.status === 'fulfilled' ? searchConsoleData.value : null,  // NEW
        technicalSEO: technicalSEOData.status === 'fulfilled' ? technicalSEOData.value : null      // NEW
      };

      const healthScore = scoringService.calculateEnhancedHealthScore(processedData);
      const recommendations = scoringService.getEnhancedRecommendations(processedData, healthScore);

      res.json({
        domain,
        score: healthScore.overall,
        breakdown: {
          technical: {
            score: healthScore.breakdown.technical,
            lighthouse_performance: processedData.lighthouse?.performance || null,
            core_vitals_score: processedData.pagespeed ? scoringService.calculateCoreVitalsScore(processedData.pagespeed) : null
          },
          user_experience: {
            score: healthScore.breakdown.userExperience,
            bounce_rate: processedData.analytics?.bounceRate || null,
            session_duration: processedData.analytics?.avgSessionDuration || null
          },
          seo_health: {
            score: healthScore.breakdown.seoHealth,
            lighthouse_seo: processedData.lighthouse?.seo || null,
            accessibility: processedData.lighthouse?.accessibility || null
          },
          // NEW: Search Visibility breakdown
          search_visibility: {
            score: healthScore.breakdown.searchVisibility,
            total_clicks: processedData.searchConsole?.totalClicks || null,
            total_impressions: processedData.searchConsole?.totalImpressions || null,
            average_ctr: processedData.searchConsole?.averageCTR ? (processedData.searchConsole.averageCTR * 100).toFixed(2) + '%' : null,
            average_position: processedData.searchConsole?.averagePosition ? Math.round(processedData.searchConsole.averagePosition) : null,
            top_queries: processedData.searchConsole?.topQueries?.slice(0, 5) || []
          },
          // NEW: Technical SEO breakdown  
          technical_seo: {
            score: healthScore.breakdown.technicalSEO,
            robots_txt: {
              exists: processedData.technicalSEO?.robotsTxt?.exists || false,
              score: processedData.technicalSEO?.robotsTxt?.score || 0,
              has_sitemap: processedData.technicalSEO?.robotsTxt?.hasSitemap || false
            },
            sitemap: {
              exists: processedData.technicalSEO?.sitemap?.exists || false,
              score: processedData.technicalSEO?.sitemap?.score || 0,
              url: processedData.technicalSEO?.sitemap?.url || null
            },
            ssl: {
              has_ssl: processedData.technicalSEO?.ssl?.hasSSL || false,
              score: processedData.technicalSEO?.ssl?.score || 0,
              redirects_to_https: processedData.technicalSEO?.ssl?.redirectsToHttps || false
            },
            meta_tags: {
              score: processedData.technicalSEO?.metaTags?.score || 0,
              has_title: processedData.technicalSEO?.metaTags?.hasTitle || false,
              has_description: processedData.technicalSEO?.metaTags?.hasDescription || false,
              title_length: processedData.technicalSEO?.metaTags?.titleLength || 0,
              description_length: processedData.technicalSEO?.metaTags?.descriptionLength || 0
            },
            structured_data: {
              has_structured_data: processedData.technicalSEO?.structuredData?.hasStructuredData || false,
              score: processedData.technicalSEO?.structuredData?.score || 0,
              json_ld: processedData.technicalSEO?.structuredData?.jsonLd || false
            }
          }
        },
        recommendations,
        data_sources: {
          lighthouse_available: !!processedData.lighthouse,
          pagespeed_available: !!processedData.pagespeed,
          analytics_available: !!processedData.analytics,
          search_console_available: !!processedData.searchConsole,  // NEW
          technical_seo_available: !!processedData.technicalSEO     // NEW
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
  },

  // Helper method to assess data quality
  assessDataQuality(data) {
    const totalSources = 5; // lighthouse, pagespeed, analytics, searchConsole, technicalSEO
    const availableSources = Object.values(data).filter(Boolean).length;
    const completeness = (availableSources / totalSources) * 100;

    if (completeness >= 80) return 'high';
    if (completeness >= 60) return 'medium';
    return 'limited';
  }
};

export default healthController;