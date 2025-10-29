import axios from 'axios';
import userAnalyticsService from './userAnalyticsService.js';

class TrafficService {
  /**
   * Get website traffic data from multiple sources
   * Priority: Google Analytics > Search Console > SimilarWeb
   * Shows Search Console data as fallback when GA4 is empty
   */
  async getTrafficData(email, domain, days = 14) {
    try {
      // Try Google Analytics first (if connected)
      const gaData = await this.getGoogleAnalyticsTraffic(email, days);
      if (gaData && gaData.length > 0) {
        return {
          source: 'google_analytics',
          data: gaData,
          summary: this.calculateSummary(gaData)
        };
      }
    } catch (error) {
      console.log('Google Analytics not available, trying alternatives...');
    }

    try {
      // Try Search Console data as fallback
      const searchConsoleData = await this.getSearchConsoleTraffic(email, domain, days);
      if (searchConsoleData && searchConsoleData.length > 0) {
        return {
          source: 'search_console',
          data: searchConsoleData,
          summary: this.calculateSummary(searchConsoleData)
        };
      }
    } catch (error) {
      console.log('Search Console not available, trying SimilarWeb...');
    }

    try {
      // Try SimilarWeb API (requires API key)
      const similarWebData = await this.getSimilarWebTraffic(domain, days);
      if (similarWebData && similarWebData.length > 0) {
        return {
          source: 'similarweb_estimate',
          data: similarWebData,
          summary: this.calculateSummary(similarWebData)
        };
      }
    } catch (error) {
      console.log('SimilarWeb not available');
    }

    // Return null if no real data available - DO NOT generate fake data
    console.log('⚠️ No real traffic data available. User needs to connect Google Analytics or configure SimilarWeb API.');
    return null;
  }

  /**
   * Get traffic from Google Analytics - REAL DATA ONLY
   * Fetches daily breakdown from GA4 API
   */
  async getGoogleAnalyticsTraffic(email, days = 14) {
    try {
      if (!email) {
        console.log('No email provided - cannot fetch Google Analytics data');
        return null;
      }

      console.log(`📊 Fetching GA4 daily traffic for ${email}...`);

      // Get OAuth client
      const oauthTokenService = (await import('./oauthTokenService.js')).default;
      const oauth2Client = await oauthTokenService.getOAuthClient(email);
      
      if (!oauth2Client) {
        console.log('❌ User not authenticated');
        return null;
      }

      // Get property ID
      const propertiesResult = await userAnalyticsService.getUserProperties(email);
      if (!propertiesResult.success || propertiesResult.properties.length === 0) {
        console.log('❌ No GA4 properties found');
        return null;
      }

      const propertyId = propertiesResult.properties[0].id;
      console.log('📌 Using property:', propertyId);

      // Get credentials
      const credentials = oauth2Client.credentials;
      if (!credentials || !credentials.access_token) {
        console.log('❌ No access token available');
        return null;
      }

      // Fetch daily data from GA4
      const reportUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
      
      const requestBody = {
        dateRanges: [{ 
          startDate: `${days}daysAgo`, 
          endDate: 'yesterday' 
        }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        dimensions: [
          { name: 'date' }
        ],
        orderBys: [
          { dimension: { dimensionName: 'date' }, desc: false }
        ]
      };

      const response = await fetch(reportUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GA API error:', response.status, errorText);
        return null;
      }

      const data = await response.json();

      if (!data.rows || data.rows.length === 0) {
        console.log('❌ No GA4 data rows returned');
        return null;
      }

      // Transform GA4 data to our format
      const trafficData = [];
      
      data.rows.forEach((row, index) => {
        const dateStr = row.dimensionValues[0].value; // Format: YYYYMMDD
        const visitors = parseInt(row.metricValues[0].value) || 0;
        const sessions = parseInt(row.metricValues[1].value) || 0;
        const pageViews = parseInt(row.metricValues[2].value) || 0;

        // Convert YYYYMMDD to YYYY-MM-DD
        const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;

        trafficData.push({
          date: formattedDate,
          day: index + 1,
          visitors: visitors,
          sessions: sessions,
          pageViews: pageViews
        });
      });

      console.log(`✅ Retrieved ${trafficData.length} days of GA4 traffic data`);
      return trafficData;

    } catch (error) {
      console.error('❌ Error fetching GA traffic:', error);
      return null;
    }
  }

  /**
   * Get traffic from Search Console as fallback
   * Uses clicks as proxy for visitors/sessions
   */
  async getSearchConsoleTraffic(email, domain, days = 14) {
    try {
      if (!email) {
        console.log('No email provided - cannot fetch Search Console data');
        return null;
      }

      console.log(`📊 Fetching Search Console traffic for ${email} and ${domain}...`);

      // Import the search console service
      const searchConsoleService = (await import('./searchConsoleService.js')).default;
      
      // Fetch search console data
      const searchData = await searchConsoleService.getUserSearchConsoleData(email);
      
      if (!searchData || !searchData.dailyData || searchData.dailyData.length === 0) {
        console.log('❌ No Search Console data available');
        return null;
      }

      // Transform Search Console daily data to traffic format
      const trafficData = [];
      const recentData = searchData.dailyData.slice(-days); // Get last N days
      
      recentData.forEach((day, index) => {
        trafficData.push({
          date: day.date,
          day: index + 1,
          visitors: day.clicks * 2, // Estimate: 2 page views per click
          sessions: day.clicks, // Use clicks as sessions
          pageViews: day.clicks * 2.5 // Estimate: 2.5 page views per session
        });
      });

      if (trafficData.length === 0) {
        console.log('❌ No Search Console traffic data found');
        return null;
      }

      console.log(`✅ Retrieved ${trafficData.length} days of Search Console traffic data`);
      return trafficData;

    } catch (error) {
      console.error('❌ Error fetching Search Console traffic:', error);
      return null;
    }
  }

  /**
   * Get traffic estimates from SimilarWeb API
   * Note: Requires SIMILARWEB_API_KEY in .env file
   */
  async getSimilarWebTraffic(domain, days = 14) {
    const apiKey = process.env.SIMILARWEB_API_KEY;
    
    if (!apiKey) {
      console.log('SimilarWeb API key not configured');
      return null;
    }

    try {
      // SimilarWeb provides monthly estimates, we'll distribute them daily
      const response = await axios.get(
        `https://api.similarweb.com/v1/website/${domain}/total-traffic-and-engagement/visits`,
        {
          params: {
            api_key: apiKey,
            start_date: this.getDateMonthsAgo(1),
            end_date: this.getCurrentDate(),
            country: 'world',
            granularity: 'daily',
            main_domain_only: false
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.visits) {
        return this.transformSimilarWebData(response.data.visits, days);
      }

      return null;
    } catch (error) {
      console.error('Error fetching SimilarWeb data:', error.message);
      return null;
    }
  }

  /**
   * Generate estimated traffic based on website characteristics
   */
  async getEstimatedTraffic(domain, days = 14) {
    try {
      // Base estimate on domain age, popularity indicators
      const baseVisitors = await this.estimateBaseTraffic(domain);
      
      const trafficData = [];
      let currentVisitors = baseVisitors;

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        
        // Add natural variation (weekends lower, weekdays higher)
        const dayOfWeek = date.getDay();
        const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
        
        // Random variation ±15%
        const randomFactor = 0.85 + Math.random() * 0.3;
        
        currentVisitors = Math.floor(baseVisitors * weekendFactor * randomFactor);

        trafficData.push({
          date: date.toISOString().split('T')[0],
          day: i + 1,
          visitors: currentVisitors,
          sessions: Math.floor(currentVisitors * 1.2),
          pageViews: Math.floor(currentVisitors * 2.5)
        });
      }

      return trafficData;
    } catch (error) {
      console.error('Error generating estimated traffic:', error);
      return this.generateFallbackData(days);
    }
  }

  /**
   * Estimate base traffic from domain characteristics
   */
  async estimateBaseTraffic(domain) {
    try {
      // Check if domain is accessible
      const response = await axios.get(`https://${domain}`, {
        timeout: 5000,
        validateStatus: () => true
      });

      // Base estimate: 100-5000 daily visitors depending on response
      let baseEstimate = 500;

      if (response.status === 200) {
        // More established sites
        baseEstimate = 1000 + Math.floor(Math.random() * 2000);
      } else {
        // Smaller or less accessible sites
        baseEstimate = 100 + Math.floor(Math.random() * 400);
      }

      return baseEstimate;
    } catch (error) {
      // Default for unreachable/error domains
      return 200 + Math.floor(Math.random() * 300);
    }
  }

  /**
   * Generate fallback data when all else fails
   */
  generateFallbackData(days) {
    const data = [];
    let baseValue = 300 + Math.floor(Math.random() * 500);

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      baseValue += Math.floor(Math.random() * 100) - 50;
      baseValue = Math.max(100, baseValue);

      data.push({
        date: date.toISOString().split('T')[0],
        day: i + 1,
        visitors: baseValue,
        sessions: Math.floor(baseValue * 1.15),
        pageViews: Math.floor(baseValue * 2.3)
      });
    }

    return data;
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary(data) {
    if (!data || data.length === 0) {
      return {
        totalVisitors: 0,
        avgDailyVisitors: 0,
        trend: 'stable',
        changePercent: 0
      };
    }

    const totalVisitors = data.reduce((sum, day) => sum + day.visitors, 0);
    const avgDailyVisitors = Math.floor(totalVisitors / data.length);

    // Calculate trend (compare first half vs second half)
    const midpoint = Math.floor(data.length / 2);
    const firstHalfAvg = data.slice(0, midpoint)
      .reduce((sum, day) => sum + day.visitors, 0) / midpoint;
    const secondHalfAvg = data.slice(midpoint)
      .reduce((sum, day) => sum + day.visitors, 0) / (data.length - midpoint);

    const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    let trend = 'stable';
    if (changePercent > 5) trend = 'up';
    else if (changePercent < -5) trend = 'down';

    return {
      totalVisitors,
      avgDailyVisitors,
      trend,
      changePercent: Math.round(changePercent * 10) / 10
    };
  }

  /**
   * Transform SimilarWeb data to our format
   */
  transformSimilarWebData(visits, days) {
    const data = [];
    const recentVisits = visits.slice(-days);

    recentVisits.forEach((visit, index) => {
      data.push({
        date: visit.date,
        day: index + 1,
        visitors: Math.floor(visit.visits / 1000) || 500,
        sessions: Math.floor(visit.visits / 1000 * 1.2) || 600,
        pageViews: Math.floor(visit.visits / 1000 * 2.5) || 1250
      });
    });

    return data;
  }

  // Helper functions
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  getDateMonthsAgo(months) {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date.toISOString().split('T')[0];
  }
}

export default new TrafficService();