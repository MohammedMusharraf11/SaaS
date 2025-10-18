import express from 'express';
import competitorService from '../services/competitorService.js';
import competitorAnalysisService from '../services/competitorAnalysisService.js';
import seoCacheService from '../services/seoCacheService.js';
import seRankingService from '../services/seRankingService.js';
import geminiService from '../services/geminiService.js';
import instagramEngagementService from '../services/instagramEngagementService.js';
import facebookEngagementService from '../services/facebookEngagementService.js';
import { getGoogleAdsMonitoring } from '../services/googleAdsMonitoringService.js';
import { getMetaAdsMonitoring } from '../services/metaAdsMonitoringService.js';

const router = express.Router();

/**
 * POST /api/competitor/analyze
 * Compare two websites (yours vs competitor)
 * Uses cached data for your site, fetches fresh data only for competitor
 */
router.post('/analyze', async (req, res) => {
  try {
    console.log('\n🔍 RAW REQUEST BODY:', JSON.stringify(req.body, null, 2));
    
    const { 
      yourSite, 
      competitorSite, 
      email, 
      forceRefresh, 
      yourInstagram, 
      competitorInstagram,
      yourFacebook,
      competitorFacebook 
    } = req.body;

    console.log(`\n📊 Competitor Analysis Request:`);
    console.log(`   Your Site: ${yourSite}`);
    console.log(`   Competitor: ${competitorSite}`);
    console.log(`   Email: ${email}`);
    console.log(`   Force Refresh: ${forceRefresh || false}`);
    console.log(`   Your Instagram: ${yourInstagram || 'Not provided'}`);
    console.log(`   Competitor Instagram: ${competitorInstagram || 'Not provided'}`);
    console.log(`   Your Facebook: ${yourFacebook || 'Not provided'}`);
    console.log(`   Competitor Facebook: ${competitorFacebook || 'Not provided'}`);
    console.log(`   Has Instagram? ${!!(yourInstagram || competitorInstagram)}`);
    console.log(`   Has Facebook? ${!!(yourFacebook || competitorFacebook)}`);

    // Validation
    if (!yourSite || !competitorSite) {
      console.error('❌ Validation failed: Missing site URLs');
      return res.status(400).json({
        success: false,
        error: 'Both yourSite and competitorSite are required'
      });
    }

    if (!email) {
      console.error('❌ Validation failed: Missing email');
      return res.status(400).json({
        success: false,
        error: 'User email is required for caching'
      });
    }

    // Check cache first (unless force refresh)
    let cachedResult = null;
    if (forceRefresh !== 'true' && forceRefresh !== true) {
      cachedResult = await seoCacheService.getCompetitorCache(email, yourSite, competitorSite);
      
      if (cachedResult && cachedResult.competitorSite) {
        console.log('✅ Returning cached competitor analysis');
        console.log('🔍 Cached competitor puppeteer.seo.headings:', cachedResult.competitorSite.puppeteer?.seo?.headings);
        
        // Get YOUR site data from existing caches
        const yourSiteData = await getCachedUserSiteData(email, yourSite);
        console.log('🔍 Your site puppeteer.seo.headings:', yourSiteData.puppeteer?.seo?.headings);
        console.log('🔍 Your site pagespeed data:', yourSiteData.pagespeed ? 'EXISTS' : 'MISSING');
        if (yourSiteData.pagespeed) {
          console.log('🔍 Your site pagespeed structure:', JSON.stringify(yourSiteData.pagespeed, null, 2));
        }

        // Fetch fresh Google Ads monitoring data for cached competitor
        console.log(`   🟢 Fetching Google Ads monitoring for cached competitor: ${competitorSite}`);
        try {
          const googleAdsData = await getGoogleAdsMonitoring(competitorSite);
          if (googleAdsData && !googleAdsData.error) {
            cachedResult.competitorSite.googleAds = googleAdsData;
            console.log(`   ✅ Got competitor Google Ads data (Total Ads: ${googleAdsData.totalAds})`);
          } else {
            cachedResult.competitorSite.googleAds = { success: false, error: googleAdsData.error };
            console.warn(`   ⚠️ Failed to fetch competitor Google Ads data:`, googleAdsData.error);
          }
        } catch (error) {
          cachedResult.competitorSite.googleAds = { success: false, error: error.message };
          console.warn(`   ⚠️ Exception in Google Ads monitoring:`, error.message);
        }

        // Fetch fresh Google Ads monitoring data for YOUR cached site
        console.log(`   🟢 Fetching Google Ads monitoring for your cached site: ${yourSite}`);
        try {
          const yourGoogleAdsData = await getGoogleAdsMonitoring(yourSite);
          if (yourGoogleAdsData && !yourGoogleAdsData.error) {
            yourSiteData.googleAds = yourGoogleAdsData;
            console.log(`   ✅ Got your site Google Ads data (Total Ads: ${yourGoogleAdsData.totalAds})`);
          } else {
            yourSiteData.googleAds = { success: false, error: yourGoogleAdsData.error };
            console.warn(`   ⚠️ Failed to fetch your site Google Ads data:`, yourGoogleAdsData.error);
          }
        } catch (error) {
          yourSiteData.googleAds = { success: false, error: error.message };
          console.warn(`   ⚠️ Exception in your site Google Ads monitoring:`, error.message);
        }


        // Fetch fresh Meta Ads monitoring data for cached competitor (username only, no domain fallback)
        if (competitorFacebook) {
          console.log(`   🟣 Fetching Meta Ads monitoring for cached competitor (username only): ${competitorFacebook}`);
          try {
            const metaAdsData = await getMetaAdsMonitoring(competitorFacebook);
            if (metaAdsData && !metaAdsData.error) {
              cachedResult.competitorSite.metaAds = metaAdsData;
              console.log(`   ✅ Got competitor Meta Ads data (Total Ads: ${metaAdsData.totalAds})`);
            } else {
              cachedResult.competitorSite.metaAds = { success: false, error: metaAdsData.error };
              console.warn(`   ⚠️ Failed to fetch competitor Meta Ads data:`, metaAdsData.error);
            }
          } catch (error) {
            cachedResult.competitorSite.metaAds = { success: false, error: error.message };
            console.warn(`   ⚠️ Exception in Meta Ads monitoring:`, error.message);
          }
        } else {
          cachedResult.competitorSite.metaAds = { success: false, error: 'No competitor Facebook username provided.' };
          console.warn('   ⚠️ No competitor Facebook username provided for Meta Ads monitoring.');
        }

        // Fetch fresh Meta Ads monitoring data for YOUR cached site
        const yourMetaQuery = yourFacebook || yourSite;
        console.log(`   🟣 Fetching Meta Ads monitoring for your cached site: ${yourMetaQuery}`);
        try {
          const yourMetaAdsData = await getMetaAdsMonitoring(yourMetaQuery);
          if (yourMetaAdsData && !yourMetaAdsData.error) {
            yourSiteData.metaAds = yourMetaAdsData;
            console.log(`   ✅ Got your site Meta Ads data (Total Ads: ${yourMetaAdsData.totalAds})`);
          } else {
            yourSiteData.metaAds = { success: false, error: yourMetaAdsData.error };
            console.warn(`   ⚠️ Failed to fetch your site Meta Ads data:`, yourMetaAdsData.error);
          }
        } catch (error) {
          yourSiteData.metaAds = { success: false, error: error.message };
          console.warn(`   ⚠️ Exception in your site Meta Ads monitoring:`, error.message);
        }
        
        // Reconstruct full result with comparison
        const fullResult = {
          success: true,
          yourSite: {
            domain: yourSite,
            ...yourSiteData,
            fromCache: true
          },
          competitorSite: {
            domain: competitorSite,
            ...cachedResult.competitorSite,
            fromCache: true
          },
          comparison: generateComparison(yourSiteData, cachedResult.competitorSite),
          timestamp: cachedResult.lastUpdated || new Date().toISOString(),
          cached: true,
          cacheAge: cachedResult.cacheAge
        };
        
        console.log('🔍 Final yourSite.pagespeed in response:', fullResult.yourSite.pagespeed ? 'EXISTS' : 'MISSING');
        console.log('🔍 Generated comparison.seo:', JSON.stringify(fullResult.comparison.seo, null, 2));
        console.log('🔍 Ads data included - Google:', !!fullResult.competitorSite.googleAds, 'Meta:', !!fullResult.competitorSite.metaAds);
        
        return res.json(fullResult);
      }
    } else {
      console.log('🔄 Force refresh requested, bypassing cache');
    }

    // Cache miss - run fresh analysis
    console.log('📭 No cache found, running fresh competitor analysis...');

    // Get YOUR site data from existing caches (Lighthouse, SE Ranking, etc.)
    const yourSiteData = await getCachedUserSiteData(email, yourSite, yourInstagram, yourFacebook);
    
    // Fetch fresh data for competitor (Lighthouse, PageSpeed, Technical SEO, Traffic, Content Updates)
    const competitorData = await competitorService.analyzeSingleSite(competitorSite, null, false);

    // Fetch SE Ranking backlinks for competitor (fresh data)
    console.log(`   🔗 Fetching SE Ranking backlinks for competitor: ${competitorSite}`);
    const competitorBacklinks = await fetchSERankingBacklinks(email, competitorSite);
    if (competitorBacklinks) {
      competitorData.backlinks = competitorBacklinks;
      console.log(`   ✅ Got competitor backlinks data`);
    }

    // Fetch Instagram data for competitor if username provided
    // Fetch Instagram data for competitor if username provided
    if (competitorInstagram) {
      console.log(`   📸 Fetching Instagram engagement for competitor: ${competitorInstagram}`);
      try {
        const instagramData = await instagramEngagementService.getCompleteEngagementMetrics(competitorInstagram);
        if (instagramData.success) {
          competitorData.instagram = instagramData;
          console.log(`   ✅ Got competitor Instagram data (${instagramData.profile.followers.toLocaleString()} followers)`);
        }
      } catch (error) {
        console.warn(`   ⚠️ Failed to fetch competitor Instagram data:`, error.message);
      }
    }

    // Fetch Facebook data for competitor if page provided
    if (competitorFacebook) {
      console.log(`   📘 Fetching Facebook engagement for competitor: ${competitorFacebook}`);
      try {
        const facebookData = await facebookEngagementService.getFullEngagementAnalysis(competitorFacebook);
        if (facebookData) {
          competitorData.facebook = {
            success: true,
            ...facebookData
          };
          console.log(`   ✅ Got competitor Facebook data (${facebookData.metrics.followers.toLocaleString()} followers)`);
        }
      } catch (error) {
        console.warn(`   ⚠️ Failed to fetch competitor Facebook data:`, error.message);
      }
    }

    // Fetch Google Ads monitoring data for competitor
    console.log(`   🟢 Fetching Google Ads monitoring for competitor: ${competitorSite}`);
    try {
      const googleAdsData = await getGoogleAdsMonitoring(competitorSite);
      if (googleAdsData && !googleAdsData.error) {
        competitorData.googleAds = googleAdsData;
        console.log(`   ✅ Got competitor Google Ads data (Total Ads: ${googleAdsData.totalAds})`);
      } else {
        competitorData.googleAds = { success: false, error: googleAdsData.error };
        console.warn(`   ⚠️ Failed to fetch competitor Google Ads data:`, googleAdsData.error);
      }
    } catch (error) {
      competitorData.googleAds = { success: false, error: error.message };
      console.warn(`   ⚠️ Exception in Google Ads monitoring:`, error.message);
    }

    // Fetch Google Ads monitoring data for YOUR site
    console.log(`   🟢 Fetching Google Ads monitoring for your site: ${yourSite}`);
    try {
      const yourGoogleAdsData = await getGoogleAdsMonitoring(yourSite);
      if (yourGoogleAdsData && !yourGoogleAdsData.error) {
        yourSiteData.googleAds = yourGoogleAdsData;
        console.log(`   ✅ Got your site Google Ads data (Total Ads: ${yourGoogleAdsData.totalAds})`);
      } else {
        yourSiteData.googleAds = { success: false, error: yourGoogleAdsData.error };
        console.warn(`   ⚠️ Failed to fetch your site Google Ads data:`, yourGoogleAdsData.error);
      }
    } catch (error) {
      yourSiteData.googleAds = { success: false, error: error.message };
      console.warn(`   ⚠️ Exception in your site Google Ads monitoring:`, error.message);
    }


    // Fetch Meta Ads monitoring data for competitor (using Facebook username only)
    console.log(`[MetaAds] Competitor Facebook username passed:`, competitorFacebook);
    if (competitorFacebook) {
      console.log(`   🟣 Fetching Meta Ads monitoring for competitor (username only): ${competitorFacebook}`);
      try {
        const metaAdsData = await getMetaAdsMonitoring(competitorFacebook);
        console.log(`[MetaAds] Result for competitor username '${competitorFacebook}':`, metaAdsData);
        if (metaAdsData && !metaAdsData.error) {
          competitorData.metaAds = metaAdsData;
          console.log(`   ✅ Got competitor Meta Ads data (Total Ads: ${metaAdsData.totalAds})`);
        } else {
          competitorData.metaAds = { success: false, error: metaAdsData.error };
          console.warn(`   ⚠️ Failed to fetch competitor Meta Ads data:`, metaAdsData.error);
        }
      } catch (error) {
        competitorData.metaAds = { success: false, error: error.message };
        console.warn(`   ⚠️ Exception in Meta Ads monitoring:`, error.message);
      }
    } else {
      competitorData.metaAds = { success: false, error: 'No competitor Facebook username provided.' };
      console.warn('   ⚠️ No competitor Facebook username provided for Meta Ads monitoring.');
    }


    // Fetch Meta Ads monitoring data for YOUR site (using Facebook username only)
    console.log(`[MetaAds] Your Facebook username passed:`, yourFacebook);
    if (yourFacebook) {
      console.log(`   🟣 Fetching Meta Ads monitoring for your site (username only): ${yourFacebook}`);
      try {
        const yourMetaAdsData = await getMetaAdsMonitoring(yourFacebook);
        console.log(`[MetaAds] Result for your username '${yourFacebook}':`, yourMetaAdsData);
        if (yourMetaAdsData && !yourMetaAdsData.error) {
          yourSiteData.metaAds = yourMetaAdsData;
          console.log(`   ✅ Got your site Meta Ads data (Total Ads: ${yourMetaAdsData.totalAds})`);
        } else {
          yourSiteData.metaAds = { success: false, error: yourMetaAdsData.error };
          console.warn(`   ⚠️ Failed to fetch your site Meta Ads data:`, yourMetaAdsData.error);
        }
      } catch (error) {
        yourSiteData.metaAds = { success: false, error: error.message };
        console.warn(`   ⚠️ Exception in your site Meta Ads monitoring:`, error.message);
      }
    } else {
      yourSiteData.metaAds = { success: false, error: 'No Facebook username provided for your site.' };
      console.warn('   ⚠️ No Facebook username provided for your site Meta Ads monitoring.');
    }

    // Build comparison result
    const result = {
      success: true,
      yourSite: {
        domain: yourSite,
        ...yourSiteData,
        fromCache: true
      },
      competitorSite: {
        domain: competitorSite,
        ...competitorData,
        fromCache: false
      },
      comparison: generateComparison(yourSiteData, competitorData),
      timestamp: new Date().toISOString(),
      cached: cachedResult !== null
    };

    // Debug: Log what's being returned
    console.log('📊 Result structure:');
    console.log('   Your Site has backlinks?', !!result.yourSite.backlinks);
    console.log('   Competitor has backlinks?', !!result.competitorSite.backlinks);
    console.log('   Your Site has traffic?', !!result.yourSite.traffic);
    console.log('   Competitor has traffic?', !!result.competitorSite.traffic);
    console.log('   Your Site has content updates?', !!result.yourSite.contentUpdates);
    console.log('   Competitor has content updates?', !!result.competitorSite.contentUpdates);
    if (result.yourSite.backlinks) {
      console.log('   Your Site backlinks keys:', Object.keys(result.yourSite.backlinks));
      console.log('   Your Site totalBacklinks:', result.yourSite.backlinks.totalBacklinks || result.yourSite.backlinks.total_backlinks);
    } else {
      console.log('   ⚠️ Your Site backlinks is missing or undefined');
      console.log('   Your Site data keys:', Object.keys(result.yourSite));
    }

    // Cache the complete comparison (7 days)
    await seoCacheService.saveCompetitorCache(email, yourSite, competitorSite, result, 7);

    console.log('📊 FINAL RESULT STRUCTURE:');
    console.log('   yourSite.traffic:', result.yourSite.traffic ? 'EXISTS' : 'MISSING');
    console.log('   competitorSite.traffic:', result.competitorSite.traffic ? 'EXISTS' : 'MISSING');
    console.log('   yourSite.contentUpdates:', result.yourSite.contentUpdates ? 'EXISTS' : 'MISSING');
    console.log('   competitorSite.contentUpdates:', result.competitorSite.contentUpdates ? 'EXISTS' : 'MISSING');
    console.log('   comparison.traffic:', result.comparison.traffic ? 'EXISTS' : 'MISSING');
    console.log('   comparison.contentUpdates:', result.comparison.contentUpdates ? 'EXISTS' : 'MISSING');

    res.json(result);

  } catch (error) {
    console.error('❌ Competitor analysis route error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/competitor/analyze-single
 * Analyze a single website
 */
router.post('/analyze-single', async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    console.log(`\n📊 Single Site Analysis Request: ${domain}`);

    const result = await competitorService.analyzeSingleSite(domain);

    res.json({
      success: true,
      domain: domain,
      timestamp: new Date().toISOString(),
      data: result
    });

  } catch (error) {
    console.error('❌ Single site analysis route error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/competitor/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Competitor Analysis API',
    timestamp: new Date().toISOString()
  });
});

// ===== HELPER FUNCTIONS =====

/**
 * Get cached data for user's own site (avoids redundant API calls)
 * Pulls from Lighthouse cache, SE Ranking cache, etc.
 */
async function getCachedUserSiteData(email, domain, instagramUsername = null, facebookPage = null) {
  console.log(`   📦 Fetching cached data for user site: ${domain}`);
  
  const siteData = {};

  try {
    // STEP 1: Get Lighthouse data from lighthouse_cache table
    const lighthouseCache = await seoCacheService.getLighthouseCache(email, domain, true); // ignoreExpiry=true
    if (lighthouseCache) {
      console.log(`   🔍 Lighthouse cache structure:`, JSON.stringify(Object.keys(lighthouseCache)));
      console.log(`   🔍 Has categoryScores?`, !!lighthouseCache.categoryScores);
      if (lighthouseCache.categoryScores) {
        console.log(`   🔍 CategoryScores:`, JSON.stringify(lighthouseCache.categoryScores));
      }
      
      // lighthouseCache is the full lighthouse analysis data
      // It contains categoryScores, coreWebVitals, opportunities, etc.
      // Map it to match competitor service structure (which frontend expects)
      siteData.lighthouse = {
        categories: {
          performance: {
            score: (lighthouseCache.categoryScores?.performance || 0) / 100,
            displayValue: lighthouseCache.categoryScores?.performance || 0
          },
          accessibility: {
            score: (lighthouseCache.categoryScores?.accessibility || 0) / 100,
            displayValue: lighthouseCache.categoryScores?.accessibility || 0
          },
          'best-practices': {
            score: (lighthouseCache.categoryScores?.bestPractices || 0) / 100,
            displayValue: lighthouseCache.categoryScores?.bestPractices || 0
          },
          seo: {
            score: (lighthouseCache.categoryScores?.seo || 0) / 100,
            displayValue: lighthouseCache.categoryScores?.seo || 0
          }
        },
        coreWebVitals: lighthouseCache.coreWebVitals || {},
        opportunities: lighthouseCache.opportunities || []
      };
      console.log(`   ✅ Found cached Lighthouse data (Performance: ${siteData.lighthouse.categories.performance.displayValue})`);
    } else {
      console.log(`   ⚠️ No Lighthouse cache found in lighthouse_cache table`);
    }

    // STEP 2: Check search_console_cache for additional data (pagespeed, technical, puppeteer)
    const searchConsoleCache = await seoCacheService.getSearchConsoleCache(email, true); // ignoreExpiry=true
    if (searchConsoleCache) {
      console.log(`✅ Using cached Search Console data`);
      
      // Get PageSpeed data from search console cache
      if (searchConsoleCache.pagespeed) {
        siteData.pagespeed = searchConsoleCache.pagespeed;
        console.log(`   ✅ Found cached PageSpeed data`);
      } else {
        console.log(`   ℹ️ No PageSpeed data in Search Console cache`);
      }

      // Get Technical SEO data
      if (searchConsoleCache.technicalSEO) {
        siteData.technicalSEO = searchConsoleCache.technicalSEO;
        console.log(`   ✅ Found cached Technical SEO data`);
      } else {
        console.log(`   ℹ️ No Technical SEO data in Search Console cache`);
      }

      // Get Puppeteer data
      if (searchConsoleCache.puppeteer) {
        siteData.puppeteer = searchConsoleCache.puppeteer;
        console.log(`   ✅ Found cached Puppeteer data`);
      } else {
        console.log(`   ℹ️ No Puppeteer data in Search Console cache`);
      }
      
      // Legacy: Check if lighthouse data has pagespeed nested inside
      if (searchConsoleCache.lighthouse) {
        const gscLighthouse = searchConsoleCache.lighthouse;
        
        // If we don't have lighthouse scores yet, get them from search console cache
        if (!siteData.lighthouse && gscLighthouse.categoryScores) {
          siteData.lighthouse = {
            categories: {
              performance: {
                score: (gscLighthouse.categoryScores.performance || 0) / 100,
                displayValue: gscLighthouse.categoryScores.performance || 0
              },
              accessibility: {
                score: (gscLighthouse.categoryScores.accessibility || 0) / 100,
                displayValue: gscLighthouse.categoryScores.accessibility || 0
              },
              'best-practices': {
                score: (gscLighthouse.categoryScores.bestPractices || 0) / 100,
                displayValue: gscLighthouse.categoryScores.bestPractices || 0
              },
              seo: {
                score: (gscLighthouse.categoryScores.seo || 0) / 100,
                displayValue: gscLighthouse.categoryScores.seo || 0
              }
            },
            coreWebVitals: gscLighthouse.coreWebVitals || {},
            opportunities: gscLighthouse.opportunities || []
          };
          console.log(`   ✅ Found Lighthouse data in Search Console cache (Performance: ${siteData.lighthouse.categories.performance.displayValue})`);
        }
        
        // Legacy: Check for pagespeed inside lighthouse object
        if (!siteData.pagespeed && gscLighthouse.pagespeed) {
          siteData.pagespeed = gscLighthouse.pagespeed;
          console.log(`   ✅ Found PageSpeed data in lighthouse object (legacy)`);
        }
      }
    } else {
      console.log(`   ⚠️ No Search Console cache found`);
    }

    // STEP 3: Get SE Ranking backlinks from se_ranking_cache table
    const seRankingCache = await seoCacheService.getSERankingCache(email, domain, true); // ignoreExpiry=true
    console.log(`   🔍 SE Ranking cache result:`, seRankingCache ? 'Found' : 'Not found');
    if (seRankingCache) {
      console.log(`   🔍 SE Ranking cache keys:`, Object.keys(seRankingCache));
      console.log(`   🔍 Has backlinks_data?`, !!seRankingCache.backlinks_data);
      console.log(`   🔍 Has totalBacklinks?`, !!seRankingCache.totalBacklinks);
      
      // The getSERankingCache already spreads backlinks_data, so use it directly
      siteData.backlinks = seRankingCache;
      console.log(`   ✅ Found cached SE Ranking backlinks`);
    }

  } catch (error) {
    console.warn(`   ⚠️ Error fetching cached user site data:`, error.message);
  }

  // STEP 4: Get traffic data for user's site (GA/GSC or SimilarWeb)
  console.log(`   📊 Fetching traffic data for user site...`);
  try {
    const userAnalyticsService = (await import('../services/userAnalyticsService.js')).default;
    const similarWebTrafficService = (await import('../services/similarWebTrafficService.js')).default;
    
    const gaData = await userAnalyticsService.getUserAnalyticsData(email);
    if (gaData && gaData.dataAvailable && gaData.sessions !== undefined) {
      // Transform GA data to match SimilarWeb structure
      const totalSessions = gaData.sessions || 0;
      const avgPageViews = gaData.pageViews / totalSessions || 0;
      
      siteData.traffic = {
        success: true,
        source: 'google_analytics',
        timestamp: new Date().toISOString(),
        metrics: {
          monthlyVisits: totalSessions,
          avgVisitDuration: gaData.avgSessionDuration || 0, // in seconds
          pagesPerVisit: avgPageViews.toFixed(2),
          bounceRate: gaData.bounceRate ? (gaData.bounceRate * 100).toFixed(1) + '%' : 'N/A',
          trafficSources: {
            // GA doesn't provide source breakdown in basic call
            direct: 'N/A',
            search: 'N/A',
            social: 'N/A',
            referral: 'N/A',
            mail: 'N/A',
            paid: 'N/A'
          }
        }
      };
      console.log(`   ✅ Got traffic data from Google Analytics (${totalSessions} sessions)`);
    } else {
      // Fallback to SimilarWeb
      console.log(`   ℹ️ GA data not available, trying SimilarWeb...`);
      const similarWebData = await similarWebTrafficService.getCompetitorTraffic(domain);
      if (similarWebData && similarWebData.success) {
        siteData.traffic = similarWebData;
        console.log(`   ✅ Got traffic data from SimilarWeb (fallback)`);
      } else {
        console.log(`   ⚠️ No traffic data available from any source`);
      }
    }
  } catch (error) {
    console.warn(`   ⚠️ Failed to fetch traffic data:`, error.message);
  }

  // STEP 5: Get content updates data for user's site
  console.log(`   📝 Fetching content updates for user site...`);
  try {
    const contentUpdatesService = (await import('../services/contentUpdatesService.js')).default;
    const contentData = await contentUpdatesService.getContentUpdates(domain);
    if (contentData) {
      siteData.contentUpdates = contentData;
      console.log(`   ✅ Got content updates data`);
    }
  } catch (error) {
    console.warn(`   ⚠️ Failed to fetch content updates:`, error.message);
  }

  // STEP 6: Get Instagram engagement data if username provided
  if (instagramUsername) {
    console.log(`   📸 Fetching Instagram engagement for: ${instagramUsername}`);
    try {
      const instagramData = await instagramEngagementService.getCompleteEngagementMetrics(instagramUsername);
      if (instagramData.success) {
        siteData.instagram = instagramData;
        console.log(`   ✅ Got Instagram engagement data (${instagramData.profile.followers.toLocaleString()} followers)`);
      }
    } catch (error) {
      console.warn(`   ⚠️ Failed to fetch Instagram data:`, error.message);
    }
  }

  // STEP 7: Get Facebook engagement data if page provided
  if (facebookPage) {
    console.log(`   📘 Fetching Facebook engagement for: ${facebookPage}`);
    try {
      const facebookData = await facebookEngagementService.getFullEngagementAnalysis(facebookPage);
      if (facebookData) {
        siteData.facebook = {
          success: true,
          ...facebookData
        };
        console.log(`   ✅ Got Facebook engagement data (${facebookData.metrics.followers.toLocaleString()} followers)`);
      }
    } catch (error) {
      console.warn(`   ⚠️ Failed to fetch Facebook data:`, error.message);
    }
  }

  // Summary of what we found
  console.log(`   📊 Cached data summary:`);
  console.log(`      - Lighthouse: ${siteData.lighthouse ? '✅' : '❌'}`);
  console.log(`      - PageSpeed: ${siteData.pagespeed ? '✅' : '❌'}`);
  console.log(`      - Technical SEO: ${siteData.technicalSEO ? '✅' : '❌'}`);
  console.log(`      - Puppeteer: ${siteData.puppeteer ? '✅' : '❌'}`);
  console.log(`      - Backlinks: ${siteData.backlinks ? '✅' : '❌'}`);
  console.log(`      - Traffic: ${siteData.traffic ? '✅' : '❌'}`);
  console.log(`      - Content Updates: ${siteData.contentUpdates ? '✅' : '❌'}`);
  console.log(`      - Instagram: ${siteData.instagram ? '✅' : '❌'}`);
  console.log(`      - Facebook: ${siteData.facebook ? '✅' : '❌'}`);

  // If no cached data found at all, fetch everything
  if (Object.keys(siteData).length === 0) {
    console.log(`   📭 No cached data found, will fetch fresh data`);
    const freshData = await competitorService.analyzeSingleSite(domain, email, true);
    return freshData;
  }

  // If we have some data but missing Puppeteer, fetch it separately
  if (!siteData.puppeteer) {
    console.log(`   🔍 Puppeteer data missing, fetching separately...`);
    try {
      const puppeteerData = await competitorAnalysisService.analyzeWebsite(domain);
      if (puppeteerData && puppeteerData.success !== false) {
        siteData.puppeteer = puppeteerData;
        console.log(`   ✅ Puppeteer analysis completed for user site`);
      }
    } catch (error) {
      console.warn(`   ⚠️ Failed to fetch Puppeteer data:`, error.message);
    }
  }

  // If we have some data but missing PageSpeed, fetch it separately
  if (!siteData.pagespeed) {
    console.log(`   🔍 PageSpeed data missing, fetching separately...`);
    try {
      const pagespeedService = await import('../services/pagespeedService.js');
      const pagespeedData = await pagespeedService.default.getPageSpeedData(domain);
      if (pagespeedData && pagespeedData.dataAvailable) {
        siteData.pagespeed = pagespeedData;
        console.log(`   ✅ PageSpeed analysis completed for user site`);
      }
    } catch (error) {
      console.warn(`   ⚠️ Failed to fetch PageSpeed data:`, error.message);
    }
  }

  return siteData;
}

/**
 * Generate comparison metrics between your site and competitor
 */
function generateComparison(yourData, competitorData) {
  const comparison = {
    performance: null,
    seo: null,
    backlinks: null,
    traffic: null,
    contentUpdates: null,
    instagram: null, // NEW: Instagram engagement
    facebook: null, // NEW: Facebook engagement
    summary: []
  };

  try {
    // Compare Performance Scores
    const yourPerf = yourData.lighthouse?.categories?.performance?.displayValue;
    const compPerf = competitorData.lighthouse?.categories?.performance?.displayValue;
    
    if (yourPerf !== undefined && compPerf !== undefined) {
      const diff = yourPerf - compPerf;
      
      comparison.performance = {
        yours: yourPerf,
        competitor: compPerf,
        difference: diff,
        winner: diff > 0 ? 'yours' : diff < 0 ? 'competitor' : 'tie'
      };

      if (diff > 10) {
        comparison.summary.push('🎉 Your site is significantly faster');
      } else if (diff < -10) {
        comparison.summary.push('⚠️ Competitor site loads much faster');
      }
    }

    // Compare SEO Scores
    const yourSEO = yourData.lighthouse?.categories?.seo?.displayValue;
    const compSEO = competitorData.lighthouse?.categories?.seo?.displayValue;
    
    if (yourSEO !== undefined && compSEO !== undefined) {
      const diff = yourSEO - compSEO;
      
      // Get SEO data - prefer puppeteer.seo for headings, technicalSEO for metaTags
      // Merge both sources to get complete data
      const yourSeoData = {
        ...(yourData.technicalSEO || {}),
        ...(yourData.puppeteer?.seo || {}),
        // Explicitly ensure headings come from puppeteer if available
        headings: yourData.puppeteer?.seo?.headings || yourData.technicalSEO?.headings
      };
      
      const compSeoData = {
        ...(competitorData.technicalSEO || {}),
        ...(competitorData.puppeteer?.seo || {}),
        // Explicitly ensure headings come from puppeteer if available
        headings: competitorData.puppeteer?.seo?.headings || competitorData.technicalSEO?.headings
      };
      
      console.log('🔍 SEO Comparison - yourSeoData.headings:', yourSeoData.headings);
      console.log('🔍 SEO Comparison - compSeoData.headings:', compSeoData.headings);
      
      // Format meta tags for frontend
      const formatMetaTags = (seoData) => {
        if (seoData.metaTags) {
          // technicalSEO format
          return {
            hasTitle: seoData.metaTags.title?.exists || false,
            hasDescription: seoData.metaTags.metaDescription?.exists || false,
            title: seoData.metaTags.title?.content || null,
            description: seoData.metaTags.metaDescription?.content || null
          };
        } else if (seoData.title || seoData.metaDescription !== undefined) {
          // puppeteer format
          return {
            hasTitle: !!seoData.title,
            hasDescription: !!seoData.metaDescription,
            title: seoData.title || null,
            description: seoData.metaDescription || null
          };
        }
        return {};
      };
      
      // Format headings for frontend
      const formatHeadings = (seoData) => {
        if (seoData.headings) {
          const result = {
            h1Count: seoData.headings.h1Count || seoData.headings.h1?.length || 0,
            h2Count: seoData.headings.h2Count || seoData.headings.h2?.length || 0,
            h3Count: seoData.headings.h3Count || seoData.headings.h3?.length || 0
          };
          console.log('🔍 formatHeadings result:', result);
          return result;
        }
        console.log('🔍 formatHeadings - no headings found');
        return { h1Count: 0, h2Count: 0, h3Count: 0 };
      };
      
      const yourMetaTags = formatMetaTags(yourSeoData);
      const compMetaTags = formatMetaTags(compSeoData);
      const yourHeadings = formatHeadings(yourSeoData);
      const compHeadings = formatHeadings(compSeoData);
      
      console.log('🔍 Final yourHeadings:', yourHeadings);
      console.log('🔍 Final compHeadings:', compHeadings);
      
      comparison.seo = {
        yours: yourSEO,
        competitor: compSEO,
        difference: diff,
        winner: diff > 0 ? 'yours' : diff < 0 ? 'competitor' : 'tie',
        // Add scores object for frontend compatibility
        scores: {
          your: yourSEO,
          competitor: compSEO
        },
        // Add detailed SEO metrics (formatted for frontend)
        metaTags: {
          your: yourMetaTags,
          competitor: compMetaTags
        },
        headings: {
          your: yourHeadings,
          competitor: compHeadings
        },
        structuredData: {
          your: yourSeoData.structuredData || yourSeoData.schemaMarkup || {},
          competitor: compSeoData.structuredData || compSeoData.schemaMarkup || {}
        }
      };

      if (diff > 5) {
        comparison.summary.push('✅ Better SEO optimization');
      } else if (diff < -5) {
        comparison.summary.push('📈 Competitor has better SEO score');
      }
    }

    // Compare Backlinks - support both old and new format
    const yourBacklinks = yourData.backlinks?.totalBacklinks || yourData.backlinks?.total_backlinks;
    const compBacklinks = competitorData.backlinks?.totalBacklinks || competitorData.backlinks?.total_backlinks;
    
    if (yourBacklinks !== undefined && compBacklinks !== undefined) {
      const diff = yourBacklinks - compBacklinks;
      
      comparison.backlinks = {
        yours: yourBacklinks,
        competitor: compBacklinks,
        difference: diff,
        winner: diff > 0 ? 'yours' : diff < 0 ? 'competitor' : 'tie'
      };

      if (diff > 100) {
        comparison.summary.push('🔗 Stronger backlink profile');
      } else if (diff < -100) {
        comparison.summary.push('🔗 Competitor has more backlinks');
      }
    }

    // Compare Content (from Puppeteer)
    if (yourData.puppeteer?.content && competitorData.puppeteer?.content) {
      const yourContent = yourData.puppeteer.content;
      const compContent = competitorData.puppeteer.content;
      
      // Flatten the content structure for frontend compatibility
      comparison.content = {
        your: {
          wordCount: yourContent.wordCount || 0,
          paragraphCount: yourContent.paragraphCount || 0,
          imageCount: yourContent.images?.total || 0,
          imageAltCoverage: yourContent.images?.altCoverage || 0,
          totalLinks: yourContent.links?.total || 0,
          internalLinks: yourContent.links?.internal || 0,
          externalLinks: yourContent.links?.external || 0,
          brokenLinks: yourContent.links?.broken || 0
        },
        competitor: {
          wordCount: compContent.wordCount || 0,
          paragraphCount: compContent.paragraphCount || 0,
          imageCount: compContent.images?.total || 0,
          imageAltCoverage: compContent.images?.altCoverage || 0,
          totalLinks: compContent.links?.total || 0,
          internalLinks: compContent.links?.internal || 0,
          externalLinks: compContent.links?.external || 0,
          brokenLinks: compContent.links?.broken || 0
        },
        winner: yourContent.wordCount > compContent.wordCount ? 'yours' : 'competitor'
      };
    }

    // Compare Technology (from Puppeteer)
    if (yourData.puppeteer?.technology && competitorData.puppeteer?.technology) {
      comparison.technology = {
        your: yourData.puppeteer.technology,
        competitor: competitorData.puppeteer.technology
      };
    }

    // Compare Security (from Puppeteer)
    if (yourData.puppeteer?.security && competitorData.puppeteer?.security) {
      comparison.security = {
        your: {
          ...yourData.puppeteer.security,
          hasRobotsTxt: yourData.puppeteer?.robotsTxt?.exists || false,
          hasSitemap: yourData.puppeteer?.sitemap?.exists || false,
          sitemapUrls: yourData.puppeteer?.sitemap?.urlCount || 0
        },
        competitor: {
          ...competitorData.puppeteer.security,
          hasRobotsTxt: competitorData.puppeteer?.robotsTxt?.exists || false,
          hasSitemap: competitorData.puppeteer?.sitemap?.exists || false,
          sitemapUrls: competitorData.puppeteer?.sitemap?.urlCount || 0
        }
      };
    }

    // NEW: Compare Traffic
    if (yourData.traffic || competitorData.traffic) {
      const yourTraffic = yourData.traffic || {};
      const compTraffic = competitorData.traffic || {};
      
      const yourVisits = typeof yourTraffic.metrics?.monthlyVisits === 'number' 
        ? yourTraffic.metrics.monthlyVisits : 0;
      const compVisits = typeof compTraffic.metrics?.monthlyVisits === 'number' 
        ? compTraffic.metrics.monthlyVisits : 0;
      
      comparison.traffic = {
        your: {
          source: yourTraffic.source || 'N/A',
          monthlyVisits: yourTraffic.metrics?.monthlyVisits || 'N/A',
          avgVisitDuration: yourTraffic.metrics?.avgVisitDuration || 'N/A',
          pagesPerVisit: yourTraffic.metrics?.pagesPerVisit || 'N/A',
          bounceRate: yourTraffic.metrics?.bounceRate || 'N/A',
          trafficSources: yourTraffic.metrics?.trafficSources || {}
        },
        competitor: {
          source: compTraffic.source || 'N/A',
          monthlyVisits: compTraffic.metrics?.monthlyVisits || 'N/A',
          avgVisitDuration: compTraffic.metrics?.avgVisitDuration || 'N/A',
          pagesPerVisit: compTraffic.metrics?.pagesPerVisit || 'N/A',
          bounceRate: compTraffic.metrics?.bounceRate || 'N/A',
          trafficSources: compTraffic.metrics?.trafficSources || {}
        },
        difference: compVisits - yourVisits,
        winner: yourVisits > compVisits ? 'yours' : compVisits > yourVisits ? 'competitor' : 'tie'
      };

      if (yourVisits > 0 && compVisits > 0) {
        if (yourVisits > compVisits) {
          comparison.summary.push('📊 Higher website traffic than competitor');
        } else if (compVisits > yourVisits) {
          comparison.summary.push('📊 Competitor has more website traffic');
        }
      }
    }

    // NEW: Compare Content Updates
    if (yourData.contentUpdates || competitorData.contentUpdates) {
      const yourContent = yourData.contentUpdates || {};
      const compContent = competitorData.contentUpdates || {};
      
      comparison.contentUpdates = {
        your: {
          hasRSS: yourContent.rss?.found || false,
          hasSitemap: yourContent.sitemap?.found || false,
          recentPosts: yourContent.rss?.recentPosts?.length || 0,
          totalPosts: yourContent.rss?.totalPosts || 0,
          lastUpdated: yourContent.contentActivity?.lastContentDate || 'Unknown',
          updateFrequency: yourContent.contentActivity?.updateFrequency || 'unknown',
          averagePostsPerMonth: yourContent.contentActivity?.averagePostsPerMonth || 0,
          isActive: yourContent.contentActivity?.isActive || false,
          contentVelocity: yourContent.contentActivity?.contentVelocity || 'unknown'
        },
        competitor: {
          hasRSS: compContent.rss?.found || false,
          hasSitemap: compContent.sitemap?.found || false,
          recentPosts: compContent.rss?.recentPosts?.length || 0,
          totalPosts: compContent.rss?.totalPosts || 0,
          lastUpdated: compContent.contentActivity?.lastContentDate || 'Unknown',
          updateFrequency: compContent.contentActivity?.updateFrequency || 'unknown',
          averagePostsPerMonth: compContent.contentActivity?.averagePostsPerMonth || 0,
          isActive: compContent.contentActivity?.isActive || false,
          contentVelocity: compContent.contentActivity?.contentVelocity || 'unknown'
        },
        winner: (yourContent.contentActivity?.averagePostsPerMonth || 0) > 
                (compContent.contentActivity?.averagePostsPerMonth || 0) ? 'yours' : 'competitor'
      };

      const yourPosts = yourContent.contentActivity?.averagePostsPerMonth || 0;
      const compPosts = compContent.contentActivity?.averagePostsPerMonth || 0;
      
      if (yourPosts > 0 && compPosts > 0) {
        if (yourPosts > compPosts) {
          comparison.summary.push('📝 More active content publishing');
        } else if (compPosts > yourPosts) {
          comparison.summary.push('📝 Competitor publishes content more frequently');
        }
      }
    }

    // NEW: Compare Instagram Engagement
    if (yourData.instagram || competitorData.instagram) {
      const yourInsta = yourData.instagram || {};
      const compInsta = competitorData.instagram || {};
      
      const yourFollowers = yourInsta.profile?.followers || 0;
      const compFollowers = compInsta.profile?.followers || 0;
      const yourInteractions = yourInsta.engagement?.summary?.avgInteractionsPerPost || 0;
      const compInteractions = compInsta.engagement?.summary?.avgInteractionsPerPost || 0;
      const yourEngagementRate = yourInsta.profile?.avgEngagementRate || 0;
      const compEngagementRate = compInsta.profile?.avgEngagementRate || 0;
      
      comparison.instagram = {
        your: {
          username: yourInsta.profile?.username || 'N/A',
          followers: yourFollowers,
          verified: yourInsta.profile?.verified || false,
          avgInteractions: yourInteractions,
          avgLikes: yourInsta.engagement?.summary?.avgLikesPerPost || 0,
          avgComments: yourInsta.engagement?.summary?.avgCommentsPerPost || 0,
          engagementRate: (yourEngagementRate * 100).toFixed(2) + '%',
          qualityScore: yourInsta.profile?.qualityScore ? (yourInsta.profile.qualityScore * 100).toFixed(1) + '%' : 'N/A',
          consistency: yourInsta.engagement?.summary?.consistency || 'N/A',
          bestPostingDays: yourInsta.engagement?.postingPattern?.bestDays?.slice(0, 3).map(d => d.day) || [],
          bestPostingHours: yourInsta.engagement?.postingPattern?.bestHours?.slice(0, 3).map(h => h.hour) || []
        },
        competitor: {
          username: compInsta.profile?.username || 'N/A',
          followers: compFollowers,
          verified: compInsta.profile?.verified || false,
          avgInteractions: compInteractions,
          avgLikes: compInsta.engagement?.summary?.avgLikesPerPost || 0,
          avgComments: compInsta.engagement?.summary?.avgCommentsPerPost || 0,
          engagementRate: (compEngagementRate * 100).toFixed(2) + '%',
          qualityScore: compInsta.profile?.qualityScore ? (compInsta.profile.qualityScore * 100).toFixed(1) + '%' : 'N/A',
          consistency: compInsta.engagement?.summary?.consistency || 'N/A',
          bestPostingDays: compInsta.engagement?.postingPattern?.bestDays?.slice(0, 3).map(d => d.day) || [],
          bestPostingHours: compInsta.engagement?.postingPattern?.bestHours?.slice(0, 3).map(h => h.hour) || []
        },
        winner: {
          followers: yourFollowers > compFollowers ? 'yours' : compFollowers > yourFollowers ? 'competitor' : 'tie',
          engagement: yourEngagementRate > compEngagementRate ? 'yours' : compEngagementRate > yourEngagementRate ? 'competitor' : 'tie',
          interactions: yourInteractions > compInteractions ? 'yours' : compInteractions > yourInteractions ? 'competitor' : 'tie'
        }
      };

      // Add to summary
      if (yourFollowers > 0 || compFollowers > 0) {
        if (yourFollowers > compFollowers) {
          comparison.summary.push('📸 Larger Instagram following');
        } else if (compFollowers > yourFollowers) {
          comparison.summary.push('📸 Competitor has larger Instagram following');
        }
        
        if (yourEngagementRate > compEngagementRate) {
          comparison.summary.push('💬 Higher Instagram engagement rate');
        } else if (compEngagementRate > yourEngagementRate) {
          comparison.summary.push('💬 Competitor has higher Instagram engagement');
        }
      }
    }

    // NEW: Compare Facebook Engagement
    if (yourData.facebook || competitorData.facebook) {
      const yourFB = yourData.facebook || {};
      const compFB = competitorData.facebook || {};
      
      const yourFollowers = yourFB.metrics?.followers || 0;
      const compFollowers = compFB.metrics?.followers || 0;
      const yourLikes = yourFB.metrics?.likes || 0;
      const compLikes = compFB.metrics?.likes || 0;
      const yourEngagementRate = yourFB.metrics?.engagementRate || 0;
      const compEngagementRate = compFB.metrics?.engagementRate || 0;
      const yourTalkingAbout = yourFB.metrics?.talkingAbout || 0;
      const compTalkingAbout = compFB.metrics?.talkingAbout || 0;
      
      comparison.facebook = {
        your: {
          pageName: yourFB.profile?.name || 'N/A',
          username: yourFB.profile?.username || 'N/A',
          followers: yourFollowers,
          likes: yourLikes,
          talkingAbout: yourTalkingAbout,
          engagementRate: yourEngagementRate.toFixed(2) + '%',
          rating: yourFB.profile?.rating || 0,
          ratingPercent: yourFB.profile?.ratingPercent || 0,
          ratingCount: yourFB.profile?.ratingCount || 0,
          category: yourFB.profile?.category || 'N/A',
          activityLevel: yourFB.metrics?.activityLevel || 'Unknown',
          estimatedPostsPerWeek: yourFB.metrics?.estimatedPostsPerWeek || 0,
          link: yourFB.profile?.link || ''
        },
        competitor: {
          pageName: compFB.profile?.name || 'N/A',
          username: compFB.profile?.username || 'N/A',
          followers: compFollowers,
          likes: compLikes,
          talkingAbout: compTalkingAbout,
          engagementRate: compEngagementRate.toFixed(2) + '%',
          rating: compFB.profile?.rating || 0,
          ratingPercent: compFB.profile?.ratingPercent || 0,
          ratingCount: compFB.profile?.ratingCount || 0,
          category: compFB.profile?.category || 'N/A',
          activityLevel: compFB.metrics?.activityLevel || 'Unknown',
          estimatedPostsPerWeek: compFB.metrics?.estimatedPostsPerWeek || 0,
          link: compFB.profile?.link || ''
        },
        winner: {
          followers: yourFollowers > compFollowers ? 'yours' : compFollowers > yourFollowers ? 'competitor' : 'tie',
          likes: yourLikes > compLikes ? 'yours' : compLikes > yourLikes ? 'competitor' : 'tie',
          engagement: yourEngagementRate > compEngagementRate ? 'yours' : compEngagementRate > yourEngagementRate ? 'competitor' : 'tie',
          talkingAbout: yourTalkingAbout > compTalkingAbout ? 'yours' : compTalkingAbout > yourTalkingAbout ? 'competitor' : 'tie'
        }
      };

      // Add to summary
      if (yourFollowers > 0 || compFollowers > 0) {
        if (yourFollowers > compFollowers) {
          comparison.summary.push('📘 Larger Facebook following');
        } else if (compFollowers > yourFollowers) {
          comparison.summary.push('📘 Competitor has larger Facebook following');
        }
        
        if (yourEngagementRate > compEngagementRate) {
          comparison.summary.push('👍 Higher Facebook engagement rate');
        } else if (compEngagementRate > yourEngagementRate) {
          comparison.summary.push('👍 Competitor has higher Facebook engagement');
        }
        
        if (yourTalkingAbout > compTalkingAbout) {
          comparison.summary.push('💬 More people talking about your Facebook page');
        } else if (compTalkingAbout > yourTalkingAbout) {
          comparison.summary.push('💬 More people talking about competitor\'s Facebook page');
        }
      }
    }

    // Overall winner
    const wins = [
      comparison.performance?.winner,
      comparison.seo?.winner,
      comparison.backlinks?.winner,
      comparison.traffic?.winner,
      comparison.contentUpdates?.winner,
      comparison.instagram?.winner?.engagement // Instagram engagement as tiebreaker
    ].filter(w => w === 'yours').length;

    const losses = [
      comparison.performance?.winner,
      comparison.seo?.winner,
      comparison.backlinks?.winner,
      comparison.traffic?.winner, // NEW
      comparison.contentUpdates?.winner // NEW
    ].filter(w => w === 'competitor').length;

    if (wins > losses) {
      comparison.overallWinner = 'yours';
    } else if (losses > wins) {
      comparison.overallWinner = 'competitor';
    } else {
      comparison.overallWinner = 'tie';
    }

  } catch (error) {
    console.warn('⚠️ Error generating comparison:', error.message);
  }

  return comparison;
}

/**
 * Fetch SE Ranking backlinks for a domain
 */
async function fetchSERankingBacklinks(email, domain) {
  try {
    console.log(`   🔗 Fetching SE Ranking backlinks for: ${domain}`);
    const backlinksData = await seRankingService.getBacklinksSummary(domain);
    
    if (backlinksData && backlinksData.available) {
      return backlinksData;
    }
    return null;
  } catch (error) {
    console.warn(`   ⚠️ Failed to fetch backlinks for ${domain}:`, error.message);
    return null;
  }
}

/**
 * POST /api/competitor/ai-recommendations
 * Generate AI-powered recommendations using Google Gemini
 */
router.post('/ai-recommendations', async (req, res) => {
  try {
    const { yourSite, competitorSite, comparison } = req.body;

    console.log(`\n🤖 AI Recommendations Request:`);
    console.log(`   Your Site: ${yourSite?.domain}`);
    console.log(`   Competitor: ${competitorSite?.domain}`);

    // Validation
    if (!yourSite || !competitorSite || !comparison) {
      console.error('❌ Validation failed: Missing required data');
      return res.status(400).json({
        success: false,
        error: 'yourSite, competitorSite, and comparison data are required'
      });
    }

    // Generate recommendations using Gemini AI
    console.log('🤖 Calling Gemini AI service...');
    const recommendations = await geminiService.generateRecommendations(
      yourSite,
      competitorSite,
      comparison
    );

    console.log(`✅ Generated ${recommendations.length} AI recommendations`);

    // Check if these are fallback recommendations
    const isFallback = recommendations.length > 0 && 
                       recommendations[0].title === "Optimize Page Load Speed";

    return res.json({
      success: true,
      recommendations,
      isFallback,
      message: isFallback ? 'AI service temporarily unavailable. Showing general recommendations.' : 'AI-powered recommendations generated successfully.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating AI recommendations:', error);
    
    // Check if it's an API key issue
    if (error.message && error.message.includes('API key')) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not configured. Please contact support.',
        details: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to generate AI recommendations',
      details: error.message
    });
  }
});

export default router;
