// services/contentUpdatesService.js - Track content updates via RSS feeds and sitemaps
import axios from 'axios';
import { JSDOM } from 'jsdom';

class ContentUpdatesService {
  constructor() {
    this.rssFeedPaths = [
      '/feed',
      '/rss',
      '/feed.xml',
      '/rss.xml',
      '/atom.xml',
      '/blog/feed',
      '/blog/rss',
      '/feeds/posts/default'
    ];
    
    this.sitemapPaths = [
      '/sitemap.xml',
      '/sitemap_index.xml',
      '/sitemap-index.xml',
      '/sitemap1.xml'
    ];
  }

  /**
   * Get content update activity for a domain
   * Checks RSS feeds and sitemaps for recent updates
   * @param {string} domain - The domain to analyze
   * @returns {Object} Content update data
   */
  async getContentUpdates(domain) {
    const cleanDomain = this.cleanDomain(domain);
    const baseUrl = `https://${cleanDomain}`;

    console.log(`📝 Analyzing content updates for: ${cleanDomain}`);

    const result = {
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
      rss: {
        found: false,
        url: null,
        recentPosts: [],
        totalPosts: 0,
        lastUpdated: null
      },
      sitemap: {
        found: false,
        url: null,
        totalUrls: 0,
        recentlyModified: [],
        lastModified: null
      },
      contentActivity: {
        updateFrequency: 'unknown',
        lastContentDate: null,
        averagePostsPerMonth: 0,
        isActive: false
      }
    };

    try {
      // Try to find and parse RSS feed
      const rssData = await this.findAndParseRSS(baseUrl);
      if (rssData.found) {
        result.rss = rssData;
      }

      // Try to find and parse sitemap
      const sitemapData = await this.findAndParseSitemap(baseUrl);
      if (sitemapData.found) {
        result.sitemap = sitemapData;
      }

      // Analyze content activity
      result.contentActivity = this.analyzeContentActivity(result.rss, result.sitemap);

      console.log(`✅ Content updates analysis complete for ${cleanDomain}`);
      return result;
    } catch (error) {
      console.error(`❌ Error analyzing content updates for ${cleanDomain}:`, error.message);
      result.error = error.message;
      return result;
    }
  }

  /**
   * Find and parse RSS feed
   */
  async findAndParseRSS(baseUrl) {
    const rssResult = {
      found: false,
      url: null,
      recentPosts: [],
      totalPosts: 0,
      lastUpdated: null,
      format: null
    };

    // Try to find RSS feed from HTML first
    try {
      const htmlResponse = await axios.get(baseUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentAnalyzer/1.0)' },
        httpsAgent: new (await import('https')).Agent({ rejectUnauthorized: false })
      });

      const dom = new JSDOM(htmlResponse.data);
      const doc = dom.window.document;

      // Check for RSS/Atom links in HTML head
      const rssLink = doc.querySelector('link[type="application/rss+xml"]') ||
                     doc.querySelector('link[type="application/atom+xml"]');
      
      if (rssLink && rssLink.href) {
        const feedUrl = new URL(rssLink.href, baseUrl).toString();
        const feedData = await this.parseRSSFeed(feedUrl);
        if (feedData.found) {
          return feedData;
        }
      }
    } catch (error) {
      console.log('Could not detect RSS from HTML, trying common paths...');
    }

    // Try common RSS feed paths
    for (const path of this.rssFeedPaths) {
      try {
        const feedUrl = `${baseUrl}${path}`;
        const feedData = await this.parseRSSFeed(feedUrl);
        
        if (feedData.found) {
          return feedData;
        }
      } catch (error) {
        // Continue to next path
        continue;
      }
    }

    return rssResult;
  }

  /**
   * Parse RSS/Atom feed
   */
  async parseRSSFeed(feedUrl) {
    const result = {
      found: false,
      url: feedUrl,
      recentPosts: [],
      totalPosts: 0,
      lastUpdated: null,
      format: null
    };

    try {
      console.log(`  Trying RSS feed: ${feedUrl}`);
      
      const https = await import('https');
      const response = await axios.get(feedUrl, {
        timeout: 10000,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (compatible; ContentAnalyzer/1.0)',
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      const dom = new JSDOM(response.data, { contentType: 'text/xml' });
      const doc = dom.window.document;

      // Check if it's RSS or Atom
      const isRSS = doc.querySelector('rss') || doc.querySelector('channel');
      const isAtom = doc.querySelector('feed');

      if (!isRSS && !isAtom) {
        return result;
      }

      result.found = true;
      result.format = isRSS ? 'RSS' : 'Atom';

      // Parse items
      let items = [];
      if (isRSS) {
        items = Array.from(doc.querySelectorAll('item'));
      } else if (isAtom) {
        items = Array.from(doc.querySelectorAll('entry'));
      }

      result.totalPosts = items.length;

      // Extract recent posts (last 10)
      items.slice(0, 10).forEach(item => {
        try {
          const post = {
            title: this.getTextContent(item, isRSS ? 'title' : 'title'),
            link: this.getTextContent(item, isRSS ? 'link' : 'link'),
            pubDate: this.getTextContent(item, isRSS ? 'pubDate' : 'published') || 
                     this.getTextContent(item, 'updated'),
            description: this.getTextContent(item, isRSS ? 'description' : 'summary'),
            author: this.getTextContent(item, isRSS ? 'author' : 'author > name')
          };

          // Parse date
          if (post.pubDate) {
            post.parsedDate = new Date(post.pubDate);
            post.daysAgo = Math.floor((Date.now() - post.parsedDate) / (1000 * 60 * 60 * 24));
          }

          result.recentPosts.push(post);
        } catch (err) {
          console.error('Error parsing feed item:', err);
        }
      });

      // Get last updated date
      if (result.recentPosts.length > 0 && result.recentPosts[0].parsedDate) {
        result.lastUpdated = result.recentPosts[0].parsedDate.toISOString();
      }

      console.log(`  ✅ Found ${result.format} feed with ${result.totalPosts} posts`);
      return result;
    } catch (error) {
      console.log(`  ❌ Failed to parse RSS feed: ${error.message}`);
      return result;
    }
  }

  /**
   * Find and parse sitemap
   */
  async findAndParseSitemap(baseUrl) {
    const sitemapResult = {
      found: false,
      url: null,
      totalUrls: 0,
      recentlyModified: [],
      lastModified: null
    };

    // Try robots.txt first
    try {
      const https = await import('https');
      const robotsUrl = `${baseUrl}/robots.txt`;
      const robotsResponse = await axios.get(robotsUrl, { 
        timeout: 5000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });
      
      const sitemapMatch = robotsResponse.data.match(/Sitemap:\s*(.+)/i);
      if (sitemapMatch) {
        const sitemapUrl = sitemapMatch[1].trim();
        const sitemapData = await this.parseSitemap(sitemapUrl);
        if (sitemapData.found) {
          return sitemapData;
        }
      }
    } catch (error) {
      console.log('Could not find sitemap in robots.txt, trying common paths...');
    }

    // Try common sitemap paths
    for (const path of this.sitemapPaths) {
      try {
        const sitemapUrl = `${baseUrl}${path}`;
        const sitemapData = await this.parseSitemap(sitemapUrl);
        
        if (sitemapData.found) {
          return sitemapData;
        }
      } catch (error) {
        continue;
      }
    }

    return sitemapResult;
  }

  /**
   * Parse sitemap XML
   */
  async parseSitemap(sitemapUrl) {
    const result = {
      found: false,
      url: sitemapUrl,
      totalUrls: 0,
      recentlyModified: [],
      lastModified: null
    };

    try {
      console.log(`  Trying sitemap: ${sitemapUrl}`);
      
      const https = await import('https');
      const response = await axios.get(sitemapUrl, {
        timeout: 10000,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (compatible; ContentAnalyzer/1.0)',
          'Accept': 'application/xml, text/xml'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      const dom = new JSDOM(response.data, { contentType: 'text/xml' });
      const doc = dom.window.document;

      // Check if it's a sitemap index
      const sitemapIndex = doc.querySelector('sitemapindex');
      if (sitemapIndex) {
        // Parse sitemap index
        const sitemaps = Array.from(doc.querySelectorAll('sitemap'));
        console.log(`  Found sitemap index with ${sitemaps.length} sitemaps`);
        
        // Parse first sitemap from index
        if (sitemaps.length > 0) {
          const firstSitemapLoc = sitemaps[0].querySelector('loc');
          if (firstSitemapLoc) {
            return await this.parseSitemap(firstSitemapLoc.textContent);
          }
        }
        return result;
      }

      // Parse regular sitemap
      const urlElements = Array.from(doc.querySelectorAll('url'));
      
      if (urlElements.length === 0) {
        return result;
      }

      result.found = true;
      result.totalUrls = urlElements.length;

      // Extract URLs with lastmod dates
      const urls = [];
      urlElements.forEach(urlElement => {
        try {
          const loc = urlElement.querySelector('loc')?.textContent;
          const lastmod = urlElement.querySelector('lastmod')?.textContent;
          const changefreq = urlElement.querySelector('changefreq')?.textContent;
          const priority = urlElement.querySelector('priority')?.textContent;

          if (loc) {
            const urlData = {
              loc,
              lastmod,
              changefreq,
              priority
            };

            if (lastmod) {
              urlData.parsedDate = new Date(lastmod);
              urlData.daysAgo = Math.floor((Date.now() - urlData.parsedDate) / (1000 * 60 * 60 * 24));
            }

            urls.push(urlData);
          }
        } catch (err) {
          console.error('Error parsing URL element:', err);
        }
      });

      // Sort by last modified date (most recent first)
      urls.sort((a, b) => {
        if (!a.parsedDate) return 1;
        if (!b.parsedDate) return -1;
        return b.parsedDate - a.parsedDate;
      });

      // Get recently modified URLs (last 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      result.recentlyModified = urls
        .filter(url => url.parsedDate && url.parsedDate >= thirtyDaysAgo)
        .slice(0, 20); // Limit to 20 most recent

      if (urls.length > 0 && urls[0].parsedDate) {
        result.lastModified = urls[0].parsedDate.toISOString();
      }

      console.log(`  ✅ Found sitemap with ${result.totalUrls} URLs, ${result.recentlyModified.length} recently modified`);
      return result;
    } catch (error) {
      console.log(`  ❌ Failed to parse sitemap: ${error.message}`);
      return result;
    }
  }

  /**
   * Analyze content activity based on RSS and sitemap data
   */
  analyzeContentActivity(rssData, sitemapData) {
    const activity = {
      updateFrequency: 'unknown',
      lastContentDate: null,
      averagePostsPerMonth: 0,
      isActive: false,
      recentActivityCount: 0,
      contentVelocity: 'low'
    };

    try {
      // Determine last content date
      const dates = [];
      
      if (rssData.found && rssData.lastUpdated) {
        dates.push(new Date(rssData.lastUpdated));
      }
      
      if (sitemapData.found && sitemapData.lastModified) {
        dates.push(new Date(sitemapData.lastModified));
      }

      if (dates.length > 0) {
        const mostRecentDate = new Date(Math.max(...dates));
        activity.lastContentDate = mostRecentDate.toISOString();
        
        const daysSinceUpdate = Math.floor((Date.now() - mostRecentDate) / (1000 * 60 * 60 * 24));
        
        // Determine if site is actively updated
        activity.isActive = daysSinceUpdate <= 30;
        
        // Determine update frequency
        if (daysSinceUpdate <= 7) {
          activity.updateFrequency = 'weekly';
        } else if (daysSinceUpdate <= 30) {
          activity.updateFrequency = 'monthly';
        } else if (daysSinceUpdate <= 90) {
          activity.updateFrequency = 'quarterly';
        } else {
          activity.updateFrequency = 'inactive';
        }
      }

      // Calculate average posts per month from RSS
      if (rssData.found && rssData.recentPosts.length > 0) {
        const posts = rssData.recentPosts.filter(post => post.parsedDate);
        if (posts.length >= 2) {
          const oldestPost = posts[posts.length - 1];
          const newestPost = posts[0];
          const daysDiff = (newestPost.parsedDate - oldestPost.parsedDate) / (1000 * 60 * 60 * 24);
          
          if (daysDiff > 0) {
            activity.averagePostsPerMonth = Math.round((posts.length / daysDiff) * 30);
          }
        }
      }

      // Count recent activity (last 30 days)
      if (rssData.found) {
        activity.recentActivityCount += rssData.recentPosts.filter(
          post => post.daysAgo <= 30
        ).length;
      }
      
      if (sitemapData.found) {
        activity.recentActivityCount += sitemapData.recentlyModified.length;
      }

      // Determine content velocity
      if (activity.averagePostsPerMonth >= 10) {
        activity.contentVelocity = 'high';
      } else if (activity.averagePostsPerMonth >= 4) {
        activity.contentVelocity = 'medium';
      } else if (activity.averagePostsPerMonth >= 1) {
        activity.contentVelocity = 'low';
      } else {
        activity.contentVelocity = 'minimal';
      }

      return activity;
    } catch (error) {
      console.error('Error analyzing content activity:', error);
      return activity;
    }
  }

  /**
   * Compare content update activity between two sites
   */
  async compareContentUpdates(userDomain, competitorDomain) {
    console.log(`\n🔄 Comparing content updates: ${userDomain} vs ${competitorDomain}`);
    
    const [userData, competitorData] = await Promise.all([
      this.getContentUpdates(userDomain),
      this.getContentUpdates(competitorDomain)
    ]);

    const comparison = {
      userSite: userData,
      competitorSite: competitorData,
      insights: {
        moreActive: null,
        contentGap: null,
        recommendation: null
      }
    };

    // Generate insights
    const userActivity = userData.contentActivity;
    const compActivity = competitorData.contentActivity;

    // Determine who is more active
    if (userActivity.recentActivityCount > compActivity.recentActivityCount) {
      comparison.insights.moreActive = 'user';
    } else if (compActivity.recentActivityCount > userActivity.recentActivityCount) {
      comparison.insights.moreActive = 'competitor';
    } else {
      comparison.insights.moreActive = 'equal';
    }

    // Calculate content gap
    comparison.insights.contentGap = {
      postsPerMonthDiff: compActivity.averagePostsPerMonth - userActivity.averagePostsPerMonth,
      recentActivityDiff: compActivity.recentActivityCount - userActivity.recentActivityCount
    };

    // Generate recommendation
    if (comparison.insights.moreActive === 'competitor') {
      comparison.insights.recommendation = `Your competitor is more active with ${compActivity.recentActivityCount} recent updates vs your ${userActivity.recentActivityCount}. Consider increasing your content publishing frequency to ${compActivity.averagePostsPerMonth} posts per month.`;
    } else if (comparison.insights.moreActive === 'user') {
      comparison.insights.recommendation = `You're publishing more consistently than your competitor. Maintain this momentum!`;
    } else {
      comparison.insights.recommendation = `Both sites have similar content update frequency. Focus on quality and engagement metrics.`;
    }

    return comparison;
  }

  /**
   * Helper: Get text content from XML element
   */
  getTextContent(element, selector) {
    try {
      if (selector.includes('>')) {
        // Handle nested selectors like 'author > name'
        const parts = selector.split('>').map(s => s.trim());
        let current = element;
        for (const part of parts) {
          current = current.querySelector(part);
          if (!current) return null;
        }
        return current.textContent?.trim() || null;
      } else {
        const el = element.querySelector(selector);
        return el?.textContent?.trim() || el?.getAttribute('href') || null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Helper: Clean domain
   */
  cleanDomain(domain) {
    return domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .split('/')[0];
  }
}

export default new ContentUpdatesService();
