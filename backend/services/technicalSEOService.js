// services/technicalSEOService.js - FREE additional technical checks
import axios from 'axios';

const technicalSEOService = {
  async getTechnicalSEOData(domain) {
    try {
      let url = domain.startsWith('http') ? domain : `https://${domain}`;

      console.log(`🔧 Running technical SEO analysis for: ${url}`);

      const checks = await Promise.allSettled([
        this.checkRobotsTxt(url),
        this.checkSitemap(url),
        this.checkSSL(url),
        this.checkMetaTags(url),
        this.checkStructuredData(url)
      ]);

      return {
        robotsTxt: this.getCheckResult(checks[0]),
        sitemap: this.getCheckResult(checks[1]),
        ssl: this.getCheckResult(checks[2]),
        metaTags: this.getCheckResult(checks[3]),
        structuredData: this.getCheckResult(checks[4]),
        overallScore: this.calculateTechnicalScore(checks),
        checkCount: checks.length,
        successfulChecks: checks.filter(check => check.status === 'fulfilled').length,
        dataAvailable: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Technical SEO analysis failed:', error.message);
      return null;
    }
  },

  getCheckResult(promiseResult) {
    return promiseResult.status === 'fulfilled' ? promiseResult.value : null;
  },

  calculateTechnicalScore(checks) {
    const weights = {
      robotsTxt: 20,
      sitemap: 25,
      ssl: 25,
      metaTags: 20,
      structuredData: 10
    };

    let totalScore = 0;
    let totalWeight = 0;

    checks.forEach((check, index) => {
      const checkNames = ['robotsTxt', 'sitemap', 'ssl', 'metaTags', 'structuredData'];
      const checkName = checkNames[index];
      
      if (check.status === 'fulfilled' && check.value && checkName) {
        const score = check.value.score || 0;
        const weight = weights[checkName] || 0;
        
        totalScore += score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  },

  async checkRobotsTxt(url) {
    try {
      const robotsUrl = `${url}/robots.txt`;
      const response = await axios.get(robotsUrl, { 
        timeout: 10000,
        headers: { 'User-Agent': 'SEO-Analyzer-Bot/1.0' }
      });
      
      const content = response.data;
      
      return {
        exists: true,
        content: content.substring(0, 500),
        hasUserAgent: content.includes('User-agent'),
        hasSitemap: content.toLowerCase().includes('sitemap'),
        score: content.includes('User-agent') ? 100 : 50
      };
    } catch (error) {
      return {
        exists: false,
        score: 0,
        issue: 'No robots.txt found or inaccessible'
      };
    }
  },

  async checkSitemap(url) {
    try {
      const sitemapUrls = [
        `${url}/sitemap.xml`,
        `${url}/sitemap_index.xml`,
        `${url}/sitemap1.xml`
      ];

      for (const sitemapUrl of sitemapUrls) {
        try {
          const response = await axios.get(sitemapUrl, { 
            timeout: 10000,
            headers: { 'User-Agent': 'SEO-Analyzer-Bot/1.0' }
          });
          
          return {
            exists: true,
            url: sitemapUrl,
            isXML: response.headers['content-type']?.includes('xml'),
            score: 100
          };
        } catch (error) {
          continue;
        }
      }

      return {
        exists: false,
        score: 0,
        issue: 'No sitemap found'
      };
    } catch (error) {
      return {
        exists: false,
        score: 0,
        issue: 'Error checking sitemap'
      };
    }
  },

  async checkSSL(url) {
    try {
      if (!url.startsWith('https://')) {
        return {
          hasSSL: false,
          score: 0,
          issue: 'Site not using HTTPS'
        };
      }

      const response = await axios.get(url, { 
        timeout: 10000,
        maxRedirects: 5
      });

      return {
        hasSSL: true,
        score: 100,
        status: 'SSL certificate valid'
      };
    } catch (error) {
      return {
        hasSSL: false,
        score: 0,
        issue: 'SSL certificate issue or site inaccessible'
      };
    }
  },

  async checkMetaTags(url) {
    try {
      const response = await axios.get(url, { 
        timeout: 15000,
        headers: { 'User-Agent': 'SEO-Analyzer-Bot/1.0' }
      });
      
      const html = response.data;
      
      // Simple HTML parsing without JSDOM
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
      const viewportMatch = html.match(/<meta\s+name="viewport"/i);
      
      const title = titleMatch ? titleMatch[1].trim() : '';
      const description = descMatch ? descMatch[1].trim() : '';
      const hasViewport = !!viewportMatch;
      
      let score = 0;
      if (title && title.length >= 30 && title.length <= 60) score += 40;
      else if (title) score += 20;
      
      if (description && description.length >= 120 && description.length <= 160) score += 40;
      else if (description) score += 20;
      
      if (hasViewport) score += 20;
      
      return {
        title: {
          exists: !!title,
          content: title,
          length: title.length,
          optimal: title.length >= 30 && title.length <= 60
        },
        metaDescription: {
          exists: !!description,
          content: description,
          length: description.length,
          optimal: description.length >= 120 && description.length <= 160
        },
        viewport: hasViewport,
        score: score
      };
      
    } catch (error) {
      return {
        exists: false,
        score: 0,
        issue: 'Unable to fetch or parse page content'
      };
    }
  },

  async checkStructuredData(url) {
    try {
      const response = await axios.get(url, { 
        timeout: 15000,
        headers: { 'User-Agent': 'SEO-Analyzer-Bot/1.0' }
      });
      
      const html = response.data;
      
      // Check for JSON-LD structured data
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]+)<\/script>/gi);
      const microdataMatch = html.match(/itemtype="/gi);
      
      let score = 0;
      if (jsonLdMatch && jsonLdMatch.length > 0) score += 60;
      if (microdataMatch && microdataMatch.length > 0) score += 40;
      
      return {
        hasJsonLd: !!(jsonLdMatch && jsonLdMatch.length > 0),
        hasMicrodata: !!(microdataMatch && microdataMatch.length > 0),
        jsonLdCount: jsonLdMatch ? jsonLdMatch.length : 0,
        microdataCount: microdataMatch ? microdataMatch.length : 0,
        score: Math.min(score, 100)
      };
      
    } catch (error) {
      return {
        hasJsonLd: false,
        hasMicrodata: false,
        score: 0,
        issue: 'Unable to check structured data'
      };
    }
  }
};

export default technicalSEOService;
