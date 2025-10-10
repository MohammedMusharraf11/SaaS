import express from 'express';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import lighthouseService from '../services/lighthouseService.js';

const router = express.Router();

// File-based token storage functions
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

const saveTokensToFile = async (email, tokens) => {
  try {
    const filePath = getTokensFilePath();
    let allTokens = {};
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      allTokens = JSON.parse(data);
    } catch {
      // File doesn't exist yet
    }
    
    allTokens[email] = tokens;
    await fs.writeFile(filePath, JSON.stringify(allTokens, null, 2));
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
};

// Get user's Search Console data
router.get('/search-console/data', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email parameter is required',
        dataAvailable: false,
        reason: 'Missing email parameter'
      });
    }

    console.log(`📊 Fetching Search Console data for: ${email}`);

    // Get stored tokens for this user
    const tokens = await getTokensFromFile(email);
    
    if (!tokens) {
      console.log('⚠️ No tokens found for user');
      return res.json({
        dataAvailable: false,
        reason: 'Google account not connected. Please connect your account first.'
      });
    }

    // Create OAuth2 client with user's tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(tokens);

    // Check if token needs refresh
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      console.log('🔄 Refreshing expired token...');
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        await saveTokensToFile(email, credentials);
        oauth2Client.setCredentials(credentials);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.message);
        return res.json({
          dataAvailable: false,
          reason: 'Authentication expired. Please reconnect your Google account.'
        });
      }
    }

    // Get Search Console service
    const searchConsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    // List all sites the user has access to
    let sites;
    try {
      const sitesResponse = await searchConsole.sites.list();
      sites = sitesResponse.data.siteEntry || [];
      console.log(`✅ Found ${sites.length} sites in Search Console`);
    } catch (error) {
      console.error('❌ Error fetching sites:', error.message);
      
      // Check if it's a permission issue
      if (error.code === 403 || error.message.includes('insufficient')) {
        return res.json({
          dataAvailable: false,
          reason: 'Search Console permission not granted. Please reconnect your account with Search Console access.'
        });
      }
      
      return res.json({
        dataAvailable: false,
        reason: 'Unable to access Search Console. Please ensure you have Search Console set up and try reconnecting.'
      });
    }

    if (sites.length === 0) {
      return res.json({
        dataAvailable: false,
        reason: 'No sites found in Google Search Console. Please add and verify a site first at https://search.google.com/search-console'
      });
    }

    // Use the first site (or you can modify to select a specific one)
    const siteUrl = sites[0].siteUrl;
    console.log(`📍 Using site: ${siteUrl}`);

    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    // Get search analytics data
    let analyticsResponse;
    try {
      analyticsResponse = await searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['query'],
          rowLimit: 100,
          dataState: 'all' // Use 'all' instead of 'final' for more recent data
        }
      });
    } catch (error) {
      console.error('❌ Error fetching search analytics:', error.message);
      return res.json({
        dataAvailable: false,
        reason: 'Unable to fetch search analytics data. The site may not have enough data yet.'
      });
    }

    // Get page analytics data (top pages)
    let pageAnalyticsResponse;
    try {
      pageAnalyticsResponse = await searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['page'],
          rowLimit: 100,
          dataState: 'all'
        }
      });
    } catch (error) {
      console.error('⚠️ Error fetching page analytics:', error.message);
      pageAnalyticsResponse = { data: { rows: [] } };
    }

    // Get daily analytics data for graph
    let dailyAnalyticsResponse;
    try {
      dailyAnalyticsResponse = await searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['date'],
          dataState: 'all'
        }
      });
    } catch (error) {
      console.error('⚠️ Error fetching daily analytics:', error.message);
      dailyAnalyticsResponse = { data: { rows: [] } };
    }

    const rows = analyticsResponse.data.rows || [];
    const pageRows = pageAnalyticsResponse.data.rows || [];
    const dailyRows = dailyAnalyticsResponse.data.rows || [];
    console.log(`📈 Retrieved ${rows.length} query rows, ${pageRows.length} page rows, ${dailyRows.length} daily rows`);

    if (rows.length === 0) {
      return res.json({
        dataAvailable: false,
        reason: 'No search data available for this site in the last 30 days. The site may be new or not indexed yet.',
        siteUrl
      });
    }

    // Calculate aggregated metrics
    const totalClicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
    const totalImpressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
    const averageCTR = rows.length > 0 
      ? rows.reduce((sum, row) => sum + (row.ctr || 0), 0) / rows.length 
      : 0;
    const averagePosition = rows.length > 0 
      ? rows.reduce((sum, row) => sum + (row.position || 0), 0) / rows.length 
      : 0;

    // Calculate organic traffic (total clicks from all pages)
    const organicTraffic = pageRows.reduce((sum, row) => sum + (row.clicks || 0), 0);

    // Get top queries
    const topQueries = rows
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)
      .map(row => ({
        query: row.keys?.[0] || 'Unknown',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));

    // Get top pages
    const topPages = pageRows
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)
      .map(row => ({
        page: row.keys?.[0] || 'Unknown',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));

    // Get daily data for graph
    const dailyData = dailyRows
      .sort((a, b) => (a.keys?.[0] || '').localeCompare(b.keys?.[0] || ''))
      .map(row => ({
        date: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));

    // Attempt to get backlinks/top linking pages dynamically. The public
    // Search Console v1 API typically does not expose backlink lists. We try
    // a best-effort call to the searchConsoleService helper which will
    // attempt any available endpoints; if unavailable, return a helpful note.
    let backlinksResult = {
      available: false,
      topLinkingSites: [],
      topLinkingPages: [],
      totalBacklinks: 0,
      note: ''
    };

    try {
      const searchConsoleService = (await import('../services/searchConsoleService.js')).default;

      // Try to use the per-user oauth2 client to fetch backlink-like data
      const backlinksAttempt = await searchConsoleService.getBacklinksDataWithClient(oauth2Client, siteUrl).catch(() => null);

      if (backlinksAttempt) {
        if (backlinksAttempt.dataAvailable) {
          backlinksResult.available = true;
          backlinksResult.topLinkingSites = backlinksAttempt.topLinkingSites || [];
          backlinksResult.topLinkingPages = backlinksAttempt.topLinkingPages || [];
          backlinksResult.note = backlinksAttempt.note || '';
        } else {
          // API does not expose backlink lists — surface the explanatory message
          backlinksResult.note = backlinksAttempt.message || backlinksAttempt.recommendation || backlinksAttempt.note || '';
        }
      } else {
        // If attempt returned null, provide a safe note
        backlinksResult.note = 'Backlink data not available via Search Console API. Consider integrating a backlinks provider (Ahrefs, Moz, Semrush).';
      }
    } catch (err) {
      console.log('\u26a0\ufe0f Backlinks retrieval failed:', err.message);
      backlinksResult.note = backlinksResult.note || `Backlinks retrieval error: ${err.message}`;
    }

    console.log('✅ Search Console data retrieved successfully');
    console.log(`📊 Stats: ${totalClicks} clicks, ${totalImpressions} impressions, ${organicTraffic} organic traffic`);

    // Extract clean domain from siteUrl for Lighthouse analysis
    let domain = siteUrl;
    
    // Handle different GSC URL formats
    if (domain.startsWith('sc-domain:')) {
      // Domain property format: sc-domain:example.com -> example.com
      domain = domain.replace('sc-domain:', '');
      console.log(`📍 Extracted domain from sc-domain format: ${domain}`);
    } else {
      // URL prefix format: https://example.com/ -> example.com
      domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      console.log(`📍 Extracted domain from URL format: ${domain}`);
    }
    
    console.log(`🔦 Fetching Lighthouse data for domain: ${domain}`);
    
    // Fetch Lighthouse/PageSpeed data using existing service
    let lighthouseData = null;
    try {
      console.log('📞 Calling lighthouseService.analyzeSite...');
      lighthouseData = await lighthouseService.analyzeSite(domain);
      console.log('📬 Received response from lighthouseService:', lighthouseData ? 'DATA' : 'NULL');
      if (lighthouseData) {
        console.log(`✅ Lighthouse: Performance ${lighthouseData.categoryScores.performance}%`);
      } else {
        console.log(`⚠️ Lighthouse data not available`);
      }
    } catch (lighthouseError) {
      console.error('❌ Lighthouse fetch failed:', lighthouseError.message);
      console.error('❌ Error stack:', lighthouseError.stack);
      lighthouseData = null;
    }

    res.json({
      dataAvailable: true,
      totalClicks,
      totalImpressions,
      averageCTR,
      averagePosition,
      organicTraffic,
      topQueries,
      topPages,
      dailyData,
      lighthouse: lighthouseData, // Add Lighthouse data
      backlinks: {
        available: backlinksResult.available,
        topLinkingSites: backlinksResult.topLinkingSites,
        topLinkingPages: backlinksResult.topLinkingPages,
        totalBacklinks: backlinksResult.totalBacklinks || 0,
        note: backlinksResult.note || ''
      },
      siteUrl,
      domain, // Add domain info
      dateRange: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching Search Console data:', error);
    
    // Handle specific error cases
    if (error.code === 403) {
      return res.json({
        dataAvailable: false,
        reason: 'Access denied. Please ensure you have granted Search Console permissions and try reconnecting.'
      });
    }
    
    if (error.code === 401) {
      return res.json({
        dataAvailable: false,
        reason: 'Authentication failed. Please reconnect your Google account.'
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch Search Console data',
      dataAvailable: false,
      reason: error.message || 'An unexpected error occurred'
    });
  }
});

// Get list of sites in Search Console
router.get('/search-console/sites', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const tokens = await getTokensFromFile(email);
    
    if (!tokens) {
      return res.json({
        sites: [],
        message: 'Google account not connected'
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(tokens);

    const searchConsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    const sitesResponse = await searchConsole.sites.list();
    const sites = sitesResponse.data.siteEntry || [];

    res.json({
      sites: sites.map(site => ({
        siteUrl: site.siteUrl,
        permissionLevel: site.permissionLevel
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching sites:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sites',
      sites: []
    });
  }
});

// Get backlinks data
router.get('/search-console/backlinks', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const tokens = await getTokensFromFile(email);
    
    if (!tokens) {
      return res.json({
        dataAvailable: false,
        message: 'Google account not connected'
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(tokens);

    const searchConsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    // Get sites list
    const sitesResponse = await searchConsole.sites.list();
    const sites = sitesResponse.data.siteEntry || [];
    
    if (sites.length === 0) {
      return res.json({
        dataAvailable: false,
        message: 'No sites found in Search Console'
      });
    }

    const siteUrl = sites[0].siteUrl;

    // Note: Google Search Console API v1 has very limited backlink support
    // Backlink data is primarily available through the Search Console UI
    // For comprehensive backlink analysis, third-party tools are recommended
    
    res.json({
      dataAvailable: false,
      siteUrl: siteUrl,
      message: 'Backlink data is limited in Google Search Console API',
      note: 'GSC API v1 does not provide detailed backlink data. You can view backlinks in the Search Console UI at https://search.google.com/search-console under "Links" section.',
      recommendation: 'For comprehensive backlink analysis, consider using: Ahrefs, Moz, Semrush, or Majestic',
      topLinkingSites: [],
      topLinkingPages: []
    });

  } catch (error) {
    console.error('❌ Error fetching backlinks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch backlinks data',
      dataAvailable: false
    });
  }
});

export default router;
