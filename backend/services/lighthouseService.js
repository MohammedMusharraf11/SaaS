import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const lighthouseService = {
  async analyzeSite(domain) {
    let chrome;
    let url = domain;
    
    // Ensure URL has protocol
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    try {
      console.log(`🔦 Running Lighthouse audit for: ${url}`);
      
      // Launch Chrome
      chrome = await launch({
        chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
      });

      // Lighthouse options
      const options = {
        logLevel: 'error',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
      };

      // Run Lighthouse audit
      const runnerResult = await lighthouse(url, options);
      
      if (!runnerResult || !runnerResult.lhr) {
        throw new Error('Lighthouse audit failed - no results returned');
      }

      const { categories, audits } = runnerResult.lhr;

      // Extract scores and key metrics
      const result = {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
        metrics: {
          firstContentfulPaint: audits['first-contentful-paint'].numericValue,
          largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
          firstInputDelay: audits['max-potential-fid']?.numericValue || null,
          cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue,
          speedIndex: audits['speed-index'].numericValue,
          totalBlockingTime: audits['total-blocking-time'].numericValue
        },
        opportunities: audits['opportunities'] ? Object.keys(audits['opportunities']).slice(0, 3) : []
      };

      console.log(`✅ Lighthouse audit completed for ${domain}`);
      return result;

    } catch (error) {
      console.error(`❌ Lighthouse audit failed for ${domain}:`, error.message);
      throw new Error(`Lighthouse analysis failed: ${error.message}`);
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  },

  // Helper method to convert milliseconds to seconds
  msToSeconds(ms) {
    return ms ? Math.round(ms / 1000 * 100) / 100 : null;
  },

  // Extract key performance metrics in readable format
  formatMetrics(metrics) {
    return {
      fcp: this.msToSeconds(metrics.firstContentfulPaint),
      lcp: this.msToSeconds(metrics.largestContentfulPaint),
      fid: this.msToSeconds(metrics.firstInputDelay),
      cls: Math.round(metrics.cumulativeLayoutShift * 1000) / 1000,
      si: this.msToSeconds(metrics.speedIndex),
      tbt: this.msToSeconds(metrics.totalBlockingTime)
    };
  }
};

export default lighthouseService;