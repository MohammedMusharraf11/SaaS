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

      // Get search analytics data (last 30 days)
      const searchAnalytics = await searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: '2025-08-28', // 30 days ago
          endDate: '2025-09-27',   // today
          dimensions: ['query'],
          rowLimit: 100,
          dataState: 'final'
        }
      });

      // Get site info and indexing status
      const siteInfo = await searchconsole.sites.get({
        siteUrl: siteUrl
      });

      return {
        totalClicks: searchAnalytics.data.rows?.reduce((sum, row) => sum + row.clicks, 0) || 0,
        totalImpressions: searchAnalytics.data.rows?.reduce((sum, row) => sum + row.impressions, 0) || 0,
        averageCTR: searchAnalytics.data.rows?.length ? 
          searchAnalytics.data.rows.reduce((sum, row) => sum + row.ctr, 0) / searchAnalytics.data.rows.length : 0,
        averagePosition: searchAnalytics.data.rows?.length ?
          searchAnalytics.data.rows.reduce((sum, row) => sum + row.position, 0) / searchAnalytics.data.rows.length : 0,
        topQueries: searchAnalytics.data.rows?.slice(0, 10).map(row => ({
          query: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position
        })) || [],
        siteVerified: siteInfo.data.permissionLevel === 'siteOwner',
        dataAvailable: true
      };

    } catch (error) {
      console.error('Search Console API failed:', error.message);
      return null;
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
