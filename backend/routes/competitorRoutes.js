import express from 'express';
import competitorService from '../services/competitorService.js';
import competitorAnalysisService from '../services/competitorAnalysisService.js';
import seoCacheService from '../services/seoCacheService.js';
import seRankingService from '../services/seRankingService.js';
import geminiService from '../services/geminiService.js';

const router = express.Router();

/**
 * POST /api/competitor/analyze
 * Compare two websites (yours vs competitor)
 * Uses cached data for your site, fetches fresh data only for competitor
 */
router.post('/analyze', async (req, res) => {
  try {
    const { yourSite, competitorSite, email, forceRefresh } = req.body;

    console.log(`\n📊 Competitor Analysis Request:`);
    console.log(`   Your Site: ${yourSite}`);
    console.log(`   Competitor: ${competitorSite}`);
    console.log(`   Email: ${email}`);
    console.log(`   Force Refresh: ${forceRefresh || false}`);

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
        
        return res.json(fullResult);
      }
    } else {
      console.log('🔄 Force refresh requested, bypassing cache');
    }

    // Cache miss - run fresh analysis
    console.log('📭 No cache found, running fresh competitor analysis...');

    // Get YOUR site data from existing caches (Lighthouse, SE Ranking, etc.)
    const yourSiteData = await getCachedUserSiteData(email, yourSite);
    
    // Fetch fresh data for competitor (Lighthouse, PageSpeed, Technical SEO)
    const competitorData = await competitorService.analyzeSingleSite(competitorSite);

    // Fetch SE Ranking backlinks for competitor (fresh data)
    console.log(`   🔗 Fetching SE Ranking backlinks for competitor: ${competitorSite}`);
    const competitorBacklinks = await fetchSERankingBacklinks(email, competitorSite);
    if (competitorBacklinks) {
      competitorData.backlinks = competitorBacklinks;
      console.log(`   ✅ Got competitor backlinks data`);
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
    if (result.yourSite.backlinks) {
      console.log('   Your Site backlinks keys:', Object.keys(result.yourSite.backlinks));
      console.log('   Your Site totalBacklinks:', result.yourSite.backlinks.totalBacklinks || result.yourSite.backlinks.total_backlinks);
    } else {
      console.log('   ⚠️ Your Site backlinks is missing or undefined');
      console.log('   Your Site data keys:', Object.keys(result.yourSite));
    }

    // Cache the complete comparison (7 days)
    await seoCacheService.saveCompetitorCache(email, yourSite, competitorSite, result, 7);

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
async function getCachedUserSiteData(email, domain) {
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

  // Summary of what we found
  console.log(`   📊 Cached data summary:`);
  console.log(`      - Lighthouse: ${siteData.lighthouse ? '✅' : '❌'}`);
  console.log(`      - PageSpeed: ${siteData.pagespeed ? '✅' : '❌'}`);
  console.log(`      - Technical SEO: ${siteData.technicalSEO ? '✅' : '❌'}`);
  console.log(`      - Puppeteer: ${siteData.puppeteer ? '✅' : '❌'}`);
  console.log(`      - Backlinks: ${siteData.backlinks ? '✅' : '❌'}`);

  // If no cached data found at all, fetch everything
  if (Object.keys(siteData).length === 0) {
    console.log(`   📭 No cached data found, will fetch fresh data`);
    const freshData = await competitorService.analyzeSingleSite(domain);
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

    // Overall winner
    const wins = [
      comparison.performance?.winner,
      comparison.seo?.winner,
      comparison.backlinks?.winner
    ].filter(w => w === 'yours').length;

    const losses = [
      comparison.performance?.winner,
      comparison.seo?.winner,
      comparison.backlinks?.winner
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
