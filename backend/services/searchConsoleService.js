// services/searchConsoleService.js - FREE Google Search Console API
import { google } from 'googleapis';

const searchConsoleService = {
  async getSearchConsoleData(domain) {
    try {
      const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      });

      const searchconsole = google.searchconsole({
        version: 'v1',
        auth: auth,
      });

      const siteUrl = domain.startsWith('http') ? domain : `https://${domain}`;
      
      // Calculate dates for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const formatDate = (date) => date.toISOString().split('T')[0];

      // 1. Get search analytics data by query (top queries)
      const queryAnalytics = await searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['query'],
          rowLimit: 100,
          dataState: 'final'
        }
      });

      // 2. Get search analytics data by page (top pages)
      const pageAnalytics = await searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['page'],
          rowLimit: 100,
          dataState: 'final'
        }
      });

      // 3. Get daily data for graph (clicks, impressions, CTR, position by date)
      const dailyAnalytics = await searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['date'],
          dataState: 'final'
        }
      });

      // 4. Get site info and indexing status
      const siteInfo = await searchconsole.sites.get({
        siteUrl: siteUrl
      });

      // Calculate total metrics from query data
      const totalClicks = queryAnalytics.data.rows?.reduce((sum, row) => sum + row.clicks, 0) || 0;
      const totalImpressions = queryAnalytics.data.rows?.reduce((sum, row) => sum + row.impressions, 0) || 0;
      const averageCTR = queryAnalytics.data.rows?.length ? 
        queryAnalytics.data.rows.reduce((sum, row) => sum + row.ctr, 0) / queryAnalytics.data.rows.length : 0;
      const averagePosition = queryAnalytics.data.rows?.length ?
        queryAnalytics.data.rows.reduce((sum, row) => sum + row.position, 0) / queryAnalytics.data.rows.length : 0;

      // Calculate organic traffic (total clicks from all pages)
      const organicTraffic = pageAnalytics.data.rows?.reduce((sum, row) => sum + row.clicks, 0) || 0;

      return {
        // Summary metrics
        totalClicks,
        totalImpressions,
        averageCTR,
        averagePosition,
        organicTraffic,
        
        // Top 10 Queries
        topQueries: queryAnalytics.data.rows?.slice(0, 10).map(row => ({
          query: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position
        })) || [],
        
        // Top Pages by traffic
        topPages: pageAnalytics.data.rows?.slice(0, 10).map(row => ({
          page: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position
        })) || [],
        
        // Daily data for graph
        dailyData: dailyAnalytics.data.rows?.map(row => ({
          date: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position
        })) || [],
        
        siteVerified: siteInfo.data.permissionLevel === 'siteOwner',
        dataAvailable: true,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Search Console API failed:', error.message);
      return null;
    }
  },

  // New method to get backlinks data (linking sites and pages)
  async getBacklinksData(domain) {
    try {
      const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      });

      const searchconsole = google.searchconsole({
        version: 'v1',
        auth: auth,
      });

      const siteUrl = domain.startsWith('http') ? domain : `https://${domain}`;

      // Get links to your site (backlinks)
      const siteLinks = await searchconsole.sites.get({
        siteUrl: siteUrl
      });

      // Note: Google Search Console API doesn't provide detailed backlink data
      // This would need to be supplemented with third-party APIs like Ahrefs, Moz, or Semrush
      // For now, return placeholder structure
      return {
        topLinkingSites: [],
        topLinkingPages: [],
        message: 'Backlink data requires third-party API integration (Ahrefs, Moz, Semrush)',
        dataAvailable: false
      };

    } catch (error) {
      console.error('Backlinks API failed:', error.message);
      return {
        topLinkingSites: [],
        topLinkingPages: [],
        dataAvailable: false
      };
    }
  },

  convertSearchMetricsToScore(data) {
    if (!data) return null;

    const scores = {};

    if (data.averageCTR > 0.03) scores.ctr = 100;
    else if (data.averageCTR > 0.01) scores.ctr = Math.round((data.averageCTR / 0.03) * 100);
    else scores.ctr = 25;

    if (data.averagePosition <= 10) scores.position = 100;
    else if (data.averagePosition <= 30) scores.position = Math.round(((30 - data.averagePosition) / 20) * 100);
    else scores.position = 25;

    const impressionScore = Math.min(100, Math.round((data.totalImpressions / 1000) * 10));
    scores.visibility = impressionScore;

    return {
      ctr: scores.ctr,
      position: scores.position,
      visibility: scores.visibility,
      average: Math.round((scores.ctr + scores.position + scores.visibility) / 3)
    };
  }
};

export default searchConsoleService;
