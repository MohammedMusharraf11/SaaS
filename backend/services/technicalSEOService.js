// services/technicalSEOService.js - FREE additional technical checks
const axios = require('axios');

const technicalSEOService = {
  async getTechnicalSEOData(domain) {
    try {
      let url = domain.startsWith('http') ? domain : `https://${domain}`;
      
      const checks = await Promise.allSettled([
        this.checkRobotsTxt(url),
        this.checkSitemap(url),
        this.checkSSL(url),
        this.checkMetaTags(url),
        this.checkStructuredData(url)
      ]);

      return {
        robotsTxt: checks[0].status === 'fulfilled' ? checks[0].value : null,
        sitemap: checks[1].status === 'fulfilled' ? checks[1].value : null,
        ssl: checks[2].status === 'fulfilled' ? checks[2].value : null,
        metaTags: checks[3].status === 'fulfilled' ? checks[3].value : null,
        structuredData: checks[4].status === 'fulfilled' ? checks[4].value : null,
        dataAvailable: true
      };
    } catch (error) {
      console.error('Technical SEO checks failed:', error.message);
      return null;
    }
  },

  async checkRobotsTxt(url) {
    try {
      const robotsUrl = `${url}/robots.txt`;
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      return {
        exists: true,
        content: response.data.substring(0, 500), // First 500 chars
        hasUserAgent: response.data.includes('User-agent'),
        hasSitemap: response.data.toLowerCase().includes('sitemap'),
        score: response.data.includes('User-agent') ? 100 : 50
      };
    } catch (error) {
      return {
        exists: false,
        score: 0,
        issue: 'No robots.txt found'
      };
    }
  },

  async checkSitemap(url) {
    try {
      const sitemapUrls = [
        `${url}/sitemap.xml`,
        `${url}/sitemap_index.xml`,
        `${url}/sitemaps/sitemap.xml`
      ];

      for (const sitemapUrl of sitemapUrls) {
        try {
          const response = await axios.get(sitemapUrl, { timeout: 5000 });
          if (response.data.includes('<?xml') && response.data.includes('sitemap')) {
            return {
              exists: true,
              url: sitemapUrl,
              isValid: response.data.includes('</urlset>') || response.data.includes('</sitemapindex>'),
              score: 100
            };
          }
        } catch (e) {
          continue;
        }
      }

      return {
        exists: false,
        score: 0,
        issue: 'No XML sitemap found'
      };
    } catch (error) {
      return {
        exists: false,
        score: 0,
        issue: 'Sitemap check failed'
      };
    }
  },

  async checkSSL(url) {
    try {
      const isHttps = url.startsWith('https://');
      const response = await axios.get(url, { 
        timeout: 5000,
        maxRedirects: 5 
      });
      
      return {
        hasSSL: isHttps,
        redirectsToHttps: response.request.res.responseUrl?.startsWith('https://'),
        score: isHttps ? 100 : 0,
        certificate: isHttps ? 'Valid' : 'Not Found'
      };
    } catch (error) {
      return {
        hasSSL: false,
        score: 0,
        issue: 'SSL check failed'
      };
    }
  },

  async checkMetaTags(url) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const html = response.data;

      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
      const keywordsMatch = html.match(/<meta[^>]*name=["\']keywords["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

      const checks = {
        hasTitle: !!titleMatch,
        titleLength: titleMatch ? titleMatch[1].length : 0,
        hasDescription: !!descMatch,
        descriptionLength: descMatch ? descMatch[1].length : 0,
        hasH1: !!h1Match,
        hasKeywords: !!keywordsMatch
      };

      let score = 0;
      if (checks.hasTitle && checks.titleLength >= 30 && checks.titleLength <= 60) score += 30;
      if (checks.hasDescription && checks.descriptionLength >= 120 && checks.descriptionLength <= 160) score += 30;
      if (checks.hasH1) score += 20;
      if (checks.hasKeywords) score += 10;
      score += 10; // Base score for having HTML

      return {
        ...checks,
        score: Math.min(score, 100),
        title: titleMatch ? titleMatch[1].substring(0, 100) : null,
        description: descMatch ? descMatch[1].substring(0, 200) : null
      };
    } catch (error) {
      return {
        score: 0,
        issue: 'Meta tags check failed'
      };
    }
  },

  async checkStructuredData(url) {
    try {
      // Use Google's Rich Results Testing Tool API (free quota)
      const testUrl = `https://searchconsole.googleapis.com/v1/urlTestingTools/richResults:run`;
      
      // This would require Google API setup, for now return basic check
      const response = await axios.get(url, { timeout: 10000 });
      const html = response.data;

      const hasJsonLd = html.includes('application/ld+json');
      const hasMicrodata = html.includes('itemscope') || html.includes('itemtype');
      const hasRDFa = html.includes('typeof=') || html.includes('property=');

      let score = 0;
      if (hasJsonLd) score += 50;
      if (hasMicrodata) score += 30;
      if (hasRDFa) score += 20;

      return {
        hasStructuredData: hasJsonLd || hasMicrodata || hasRDFa,
        jsonLd: hasJsonLd,
        microdata: hasMicrodata,
        rdfa: hasRDFa,
        score: Math.min(score, 100)
      };
    } catch (error) {
      return {
        score: 0,
        issue: 'Structured data check failed'
      };
    }
  }
};