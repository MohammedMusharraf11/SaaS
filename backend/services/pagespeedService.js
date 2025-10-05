import axios from 'axios';

const pagespeedService = {
  async getPageSpeedData(domain) {
    let url = domain;
    
    // Ensure URL has protocol
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    try {
      console.log(`📱 Fetching PageSpeed data for: ${url}`);
      
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        console.log('⚠️ Google API key not configured, skipping PageSpeed');
        return {
          dataAvailable: false,
          reason: 'No API key configured'
        };
      }

      // FIXED: Increased timeout and better error handling
      const mobileResponse = await axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed`, {
        params: {
          url: url,
          key: apiKey,
          strategy: 'mobile',
          category: ['performance']
        },
        timeout: 60000, // FIXED: Increased to 60 seconds
        headers: {
          'User-Agent': 'SEO-Health-Analyzer/1.0'
        }
      });

      const mobileData = mobileResponse.data;
      
      // FIXED: Better data extraction
      const result = this.extractPageSpeedData(mobileData);
      
      console.log(`✅ PageSpeed data retrieved for ${domain}`);
      return result;

    } catch (error) {
      console.error(`❌ PageSpeed API failed for ${domain}:`, error.message);
      
      // FIXED: Return structured error response
      return {
        dataAvailable: false,
        reason: error.code === 'ECONNABORTED' ? 'Timeout' : 'API Error',
        error: error.message,
        mobile: {
          labData: {
            lcp: null,
            fid: null,
            cls: null,
            performanceScore: null
          }
        }
      };
    }
  },

  extractPageSpeedData(data) {
    const fieldData = data.loadingExperience;
    const labData = data.lighthouseResult?.audits || {};
    const categories = data.lighthouseResult?.categories || {};

    return {
      mobile: {
        // Field data (real user experience) - preferred when available
        fieldData: fieldData ? {
          lcp: this.extractMetricValue(fieldData.metrics?.LARGEST_CONTENTFUL_PAINT_MS),
          fid: this.extractMetricValue(fieldData.metrics?.FIRST_INPUT_DELAY_MS),
          cls: this.extractMetricValue(fieldData.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE)
        } : null,
        
        // Lab data (Lighthouse) - fallback
        labData: {
          lcp: labData['largest-contentful-paint']?.numericValue || null,
          fid: labData['max-potential-fid']?.numericValue || null,
          cls: labData['cumulative-layout-shift']?.numericValue || null,
          performanceScore: categories.performance ? Math.round(categories.performance.score * 100) : null
        }
      },
      overall_category: fieldData?.overall_category || 'UNKNOWN',
      dataAvailable: true
    };
  },

  // Extract metric value from PageSpeed API response
  extractMetricValue(metric) {
    if (!metric || !metric.percentile) return null;
    return metric.percentile;
  }
};

export default pagespeedService;