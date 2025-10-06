import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';

const getTokensFilePath = () => path.join(process.cwd(), 'data', 'oauth_tokens.json');

const getTokensFromFile = async (email) => {
  try {
    const filePath = getTokensFilePath();
    const data = await fs.readFile(filePath, 'utf-8');
    const allTokens = JSON.parse(data);
    return allTokens[email] || null;
  } catch {
    return null;
  }
};

const userAnalyticsService = {
  /**
   * Get list of GA4 properties the user has access to
   */
  async getUserProperties(email) {
    try {
      const tokens = await getTokensFromFile(email);
      
      if (!tokens || !tokens.access_token) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      // Create OAuth2 client with user's token
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      
      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expires_at
      });

      // Get GA4 Admin API
      const analyticsAdmin = google.analyticsadmin({
        version: 'v1beta',
        auth: oauth2Client
      });

      // List all GA4 properties user has access to
      const response = await analyticsAdmin.accounts.list();
      
      const properties = [];
      if (response.data.accounts) {
        for (const account of response.data.accounts) {
          try {
            const propsResponse = await analyticsAdmin.properties.list({
              filter: `parent:${account.name}`
            });
            
            if (propsResponse.data.properties) {
              properties.push(...propsResponse.data.properties.map(prop => ({
                id: prop.name.split('/')[1],
                displayName: prop.displayName,
                account: account.displayName
              })));
            }
          } catch (propError) {
            console.warn('⚠️ Error fetching properties for account:', account.name);
          }
        }
      }

      return {
        success: true,
        properties
      };

    } catch (error) {
      console.error('❌ Error fetching user properties:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get Analytics data from user's GA4 property using REST API
   */
  async getUserAnalyticsData(email, propertyId = null) {
    try {
      console.log('📊 Fetching user GA data for:', email);
      
      const tokens = await getTokensFromFile(email);
      
      if (!tokens || !tokens.access_token) {
        return {
          dataAvailable: false,
          reason: 'User not authenticated',
          connected: false
        };
      }

      // If no property ID provided, try to get the first available one
      if (!propertyId) {
        const propertiesResult = await this.getUserProperties(email);
        if (!propertiesResult.success || propertiesResult.properties.length === 0) {
          return {
            dataAvailable: false,
            reason: 'No GA4 properties found',
            connected: true
          };
        }
        propertyId = propertiesResult.properties[0].id;
        console.log('📌 Using first available property:', propertyId);
      }

      // Use REST API instead of gRPC client to avoid authentication issues
      const reportUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
      
      const requestBody = {
        dateRanges: [{ 
          startDate: '30daysAgo', 
          endDate: 'today' 
        }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'screenPageViews' },
          { name: 'conversions' },
          { name: 'totalRevenue' }
        ],
        dimensions: [
          { name: 'date' }
        ]
      };

      const response = await fetch(reportUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GA API error:', response.status, errorText);
        
        // Check if token expired
        if (response.status === 401) {
          return {
            dataAvailable: false,
            reason: 'Authentication token expired. Please reconnect.',
            connected: false
          };
        }
        
        throw new Error(`GA API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ User Analytics data received');

      // Process the response
      const metrics = this.processAnalyticsResponse(data);

      return {
        propertyId,
        activeUsers: metrics.activeUsers,
        sessions: metrics.sessions,
        bounceRate: metrics.bounceRate,
        avgSessionDuration: metrics.averageSessionDuration,
        pageViews: metrics.screenPageViews,
        conversions: metrics.conversions,
        revenue: metrics.totalRevenue,
        dataAvailable: true,
        connected: true,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ User Analytics API failed:', error.message);
      
      return {
        dataAvailable: false,
        reason: error.message.includes('token') ? 'Authentication failed' : 'API error',
        connected: false,
        error: error.message
      };
    }
  },

  processAnalyticsResponse(response) {
    const metrics = {
      activeUsers: 0,
      sessions: 0,
      bounceRate: 0,
      averageSessionDuration: 0,
      screenPageViews: 0,
      conversions: 0,
      totalRevenue: 0
    };

    if (response.rows && response.rows.length > 0) {
      let totalRows = 0;
      
      response.rows.forEach(row => {
        totalRows++;
        row.metricValues.forEach((metricValue, index) => {
          const metricName = response.metricHeaders[index].name;
          const value = parseFloat(metricValue.value) || 0;
          
          switch(metricName) {
            case 'activeUsers':
              metrics.activeUsers += value;
              break;
            case 'sessions':
              metrics.sessions += value;
              break;
            case 'bounceRate':
              metrics.bounceRate += value;
              break;
            case 'averageSessionDuration':
              metrics.averageSessionDuration += value;
              break;
            case 'screenPageViews':
              metrics.screenPageViews += value;
              break;
            case 'conversions':
              metrics.conversions += value;
              break;
            case 'totalRevenue':
              metrics.totalRevenue += value;
              break;
          }
        });
      });

      // Calculate averages for rate/duration metrics
      if (totalRows > 0) {
        metrics.bounceRate = metrics.bounceRate / totalRows;
        metrics.averageSessionDuration = metrics.averageSessionDuration / totalRows;
      }
    }

    return metrics;
  }
};

export default userAnalyticsService;