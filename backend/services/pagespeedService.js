import axios  from 'axios';

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
        throw new Error('Google API key not configured');
      }

      // Get mobile data (prioritized for SEO)
      const mobileResponse = await axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed`, {
        params: {
          url: url,
          key: apiKey,
          strategy: 'mobile',
          category: ['performance']
        },
        timeout: 30000 // 30 second timeout
      });

      const mobileData = mobileResponse.data;
      
      // Extract Core Web Vitals from field data (real user experience)
      const fieldData = mobileData.loadingExperience;
      const labData = mobileData.lighthouseResult.audits;

      const result = {
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
            performanceScore: Math.round(mobileData.lighthouseResult.categories.performance.score * 100)
          }
        },
        overall_category: fieldData?.overall_category || 'UNKNOWN'
      };

      console.log(`✅ PageSpeed data retrieved for ${domain}`);
      return result;

    } catch (error) {
      console.error(`❌ PageSpeed API failed for ${domain}:`, error.message);
      
      // Don't throw error, return null so other services can continue
      if (error.response?.status === 429) {
        console.log('⚠️ PageSpeed API rate limit reached');
      }
      
      return null;
    }
  },

  // Extract metric value from PageSpeed API response
  extractMetricValue(metric) {
    if (!metric || !metric.percentile) return null;
    return metric.percentile;
  },

  // Convert Core Web Vitals to 0-100 scores based on Google thresholds
  convertCoreVitalsToScore(vitals) {
    if (!vitals) return null;

    const scores = {};

    // LCP scoring (Good: <2.5s, Needs Improvement: 2.5-4s, Poor: >4s)
    if (vitals.lcp !== null) {
      const lcp = vitals.lcp / 1000; // Convert to seconds
      if (lcp <= 2.5) scores.lcp = 100;
      else if (lcp <= 4.0) scores.lcp = Math.round(((4.0 - lcp) / 1.5) * 100);
      else scores.lcp = 0;
    }

    // FID scoring (Good: <100ms, Needs Improvement: 100-300ms, Poor: >300ms)
    if (vitals.fid !== null) {
      if (vitals.fid <= 100) scores.fid = 100;
      else if (vitals.fid <= 300) scores.fid = Math.round(((300 - vitals.fid) / 200) * 100);
      else scores.fid = 0;
    }

    // CLS scoring (Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25)
    if (vitals.cls !== null) {
      const cls = vitals.cls / 100; // PageSpeed returns as percentage
      if (cls <= 0.1) scores.cls = 100;
      else if (cls <= 0.25) scores.cls = Math.round(((0.25 - cls) / 0.15) * 100);
      else scores.cls = 0;
    }

    // Calculate average score
    const validScores = Object.values(scores).filter(score => score !== null);
    scores.average = validScores.length > 0 ? 
      Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length) : null;

    return scores;
  }
};

export default pagespeedService;