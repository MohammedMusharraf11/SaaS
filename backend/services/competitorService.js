import competitorAnalysisService from './competitorAnalysisService.js';
import competitorPageSpeedService from './competitorPageSpeedService.js';
import competitorLighthouseService from './competitorLighthouseService.js';
import technicalSEOService from './technicalSEOService.js';

const competitorService = {
  /**
   * Comprehensive competitor analysis comparing two websites
   * @param {string} yourSite - Your website domain
   * @param {string} competitorSite - Competitor website domain
   * @returns {Object} Detailed comparison data
   */
  async compareWebsites(yourSite, competitorSite) {
    try {
      console.log(`\n🔄 Starting competitor analysis...`);
      console.log(`   Your Site: ${yourSite}`);
      console.log(`   Competitor: ${competitorSite}\n`);

      // Run analyses SEQUENTIALLY to avoid Chrome instance conflicts
      console.log(`📊 Analyzing YOUR site first: ${yourSite}`);
      const yourAnalysis = await this.analyzeSingleSite(yourSite);
      
      // Add delay between analyses to ensure Chrome instances are fully closed
      console.log(`⏳ Waiting 3 seconds before analyzing competitor...\n`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log(`📊 Now analyzing COMPETITOR site: ${competitorSite}`);
      const competitorAnalysis = await this.analyzeSingleSite(competitorSite);

      console.log(`✅ Analysis completed for both sites\n`);

      // Generate comparison insights
      const comparison = this.generateComparison(yourAnalysis, competitorAnalysis);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        yourSite: {
          domain: yourSite,
          ...yourAnalysis
        },
        competitorSite: {
          domain: competitorSite,
          ...competitorAnalysis
        },
        comparison: comparison
      };

    } catch (error) {
      console.error('❌ Competitor analysis failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Analyze a single website using all available tools
   * @param {string} domain - Website domain to analyze
   * @returns {Object} Complete analysis data
   */
  async analyzeSingleSite(domain) {
    console.log(`📊 Analyzing: ${domain}`);

    try {
      // Run Puppeteer first (needs Chrome)
      console.log(`   🔍 Step 1/4: Puppeteer analysis...`);
      const puppeteerResult = await competitorAnalysisService.analyzeWebsite(domain)
        .catch(err => ({ status: 'rejected', reason: err }));
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
      
      // Run Lighthouse second (needs Chrome)
      console.log(`   🔦 Step 2/4: Lighthouse audit...`);
      const maxRetries = 3;
      let lighthouseResult;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`   🔄 Attempt ${attempt}: Running Lighthouse audit for ${domain}`);
          lighthouseResult = await competitorLighthouseService.analyzeSite(domain);
          break; // Exit loop if successful
        } catch (err) {
          console.error(`   ❌ Attempt ${attempt}: Lighthouse audit failed for ${domain}:`, err.message);
          if (attempt === maxRetries) {
            lighthouseResult = { status: 'rejected', reason: err };
          } else {
            console.log(`   🔄 Retrying Lighthouse audit for ${domain}...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay before retry
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      
      // Run PageSpeed (API call)
      console.log(`   📱 Step 3/4: PageSpeed metrics...`);
      const pagespeedResult = await competitorPageSpeedService.getPageSpeedData(domain)
        .catch(err => ({ status: 'rejected', reason: err }));
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      
      // Run Technical SEO (HTTP requests)
      console.log(`   🔧 Step 4/4: Technical SEO checks...`);
      const technicalSEOResult = await technicalSEOService.getTechnicalSEOData(domain)
        .catch(err => ({ status: 'rejected', reason: err }));

      return {
        // Puppeteer analysis (on-page, content, technology)
        puppeteer: puppeteerResult.status !== 'rejected' ? puppeteerResult : {
          success: false,
          error: puppeteerResult.reason?.message || 'Analysis failed'
        },

        // Lighthouse audit
        lighthouse: lighthouseResult.status !== 'rejected' ? lighthouseResult : {
          dataAvailable: false,
          error: lighthouseResult.reason?.message || 'Audit failed'
        },

        // PageSpeed metrics
        pagespeed: pagespeedResult.status !== 'rejected' ? pagespeedResult : {
          dataAvailable: false,
          error: pagespeedResult.reason?.message || 'PageSpeed failed'
        },

        // Technical SEO
        technicalSEO: technicalSEOResult.status !== 'rejected' ? technicalSEOResult : {
          score: 0,
          error: technicalSEOResult.reason?.message || 'Technical SEO failed'
        }
      };

    } catch (error) {
      console.error(`❌ Error analyzing ${domain}:`, error.message);
      throw error;
    }
  },

  /**
   * Generate comparison insights between two sites
   */
  generateComparison(yourData, competitorData) {
    const comparison = {
      performance: this.comparePerformance(yourData, competitorData),
      seo: this.compareSEO(yourData, competitorData),
      content: this.compareContent(yourData, competitorData),
      technology: this.compareTechnology(yourData, competitorData),
      security: this.compareSecurity(yourData, competitorData)
    };

    // Calculate overall winner and gaps
    comparison.summary = this.generateSummary(comparison);

    return comparison;
  },

  /**
   * Compare performance metrics
   */
  comparePerformance(yourData, competitorData) {
    const yourLighthouse = yourData.lighthouse;
    const compLighthouse = competitorData.lighthouse;
    const yourPagespeed = yourData.pagespeed;
    const compPagespeed = competitorData.pagespeed;

    const comparison = {
      lighthouse: {
        your: {
          performance: yourLighthouse?.categories?.performance?.score || 0,
          accessibility: yourLighthouse?.categories?.accessibility?.score || 0,
          bestPractices: yourLighthouse?.categories?.['best-practices']?.score || 0,
          seo: yourLighthouse?.categories?.seo?.score || 0
        },
        competitor: {
          performance: compLighthouse?.categories?.performance?.score || 0,
          accessibility: compLighthouse?.categories?.accessibility?.score || 0,
          bestPractices: compLighthouse?.categories?.['best-practices']?.score || 0,
          seo: compLighthouse?.categories?.seo?.score || 0
        }
      },
      pagespeed: {
        your: {
          desktop: yourPagespeed?.desktop?.performanceScore || 0,
          mobile: yourPagespeed?.mobile?.performanceScore || 0
        },
        competitor: {
          desktop: compPagespeed?.desktop?.performanceScore || 0,
          mobile: compPagespeed?.mobile?.performanceScore || 0
        }
      }
    };

    // Determine winner
    const yourAvg = (comparison.lighthouse.your.performance + 
                     comparison.pagespeed.your.desktop + 
                     comparison.pagespeed.your.mobile) / 3;
    const compAvg = (comparison.lighthouse.competitor.performance + 
                     comparison.pagespeed.competitor.desktop + 
                     comparison.pagespeed.competitor.mobile) / 3;

    comparison.winner = yourAvg > compAvg ? 'yours' : 'competitor';
    comparison.gap = Math.abs(yourAvg - compAvg).toFixed(1);

    return comparison;
  },

  /**
   * Compare SEO elements
   */
  compareSEO(yourData, competitorData) {
    const yourSEO = yourData.puppeteer?.seo || {};
    const compSEO = competitorData.puppeteer?.seo || {};

    const comparison = {
      metaTags: {
        your: {
          hasTitle: !!yourSEO.title,
          hasDescription: !!yourSEO.metaDescription,
          hasCanonical: !!yourSEO.canonical,
          titleLength: yourSEO.title?.length || 0,
          descriptionLength: yourSEO.metaDescription?.length || 0
        },
        competitor: {
          hasTitle: !!compSEO.title,
          hasDescription: !!compSEO.metaDescription,
          hasCanonical: !!compSEO.canonical,
          titleLength: compSEO.title?.length || 0,
          descriptionLength: compSEO.metaDescription?.length || 0
        }
      },
      headings: {
        your: yourSEO.headings || { h1Count: 0, h2Count: 0, h3Count: 0 },
        competitor: compSEO.headings || { h1Count: 0, h2Count: 0, h3Count: 0 }
      },
      socialMedia: {
        your: {
          hasOpenGraph: !!(yourSEO.openGraph?.title || yourSEO.openGraph?.description),
          hasTwitterCard: !!(yourSEO.twitterCard?.card)
        },
        competitor: {
          hasOpenGraph: !!(compSEO.openGraph?.title || compSEO.openGraph?.description),
          hasTwitterCard: !!(compSEO.twitterCard?.card)
        }
      },
      structuredData: {
        your: yourSEO.schemaMarkup?.length || 0,
        competitor: compSEO.schemaMarkup?.length || 0
      }
    };

    // Calculate SEO score
    const yourScore = this.calculateSEOScore(comparison.metaTags.your, comparison.headings.your, comparison.socialMedia.your, comparison.structuredData.your);
    const compScore = this.calculateSEOScore(comparison.metaTags.competitor, comparison.headings.competitor, comparison.socialMedia.competitor, comparison.structuredData.competitor);

    comparison.scores = { your: yourScore, competitor: compScore };
    comparison.winner = yourScore > compScore ? 'yours' : 'competitor';

    return comparison;
  },

  /**
   * Calculate SEO score
   */
  calculateSEOScore(meta, headings, social, structuredData) {
    let score = 0;
    
    // Meta tags (40 points)
    if (meta.hasTitle) score += 10;
    if (meta.hasDescription) score += 10;
    if (meta.hasCanonical) score += 10;
    if (meta.titleLength >= 30 && meta.titleLength <= 60) score += 5;
    if (meta.descriptionLength >= 120 && meta.descriptionLength <= 160) score += 5;
    
    // Headings (20 points)
    if (headings.h1Count === 1) score += 10; // Exactly one H1
    if (headings.h2Count > 0) score += 5;
    if (headings.h3Count > 0) score += 5;
    
    // Social media (20 points)
    if (social.hasOpenGraph) score += 10;
    if (social.hasTwitterCard) score += 10;
    
    // Structured data (20 points)
    if (structuredData > 0) score += 20;
    
    return score;
  },

  /**
   * Compare content metrics
   */
  compareContent(yourData, competitorData) {
    const yourContent = yourData.puppeteer?.content || {};
    const compContent = competitorData.puppeteer?.content || {};

    return {
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
      winner: (yourContent.wordCount || 0) > (compContent.wordCount || 0) ? 'yours' : 'competitor'
    };
  },

  /**
   * Compare technology stacks
   */
  compareTechnology(yourData, competitorData) {
    const yourTech = yourData.puppeteer?.technology || {};
    const compTech = competitorData.puppeteer?.technology || {};

    return {
      your: {
        cms: yourTech.cms || 'Unknown',
        frameworks: yourTech.frameworks || [],
        analytics: yourTech.analytics || [],
        thirdPartyScripts: yourTech.thirdPartyScripts?.length || 0
      },
      competitor: {
        cms: compTech.cms || 'Unknown',
        frameworks: compTech.frameworks || [],
        analytics: compTech.analytics || [],
        thirdPartyScripts: compTech.thirdPartyScripts?.length || 0
      }
    };
  },

  /**
   * Compare security & technical aspects
   */
  compareSecurity(yourData, competitorData) {
    const yourSecurity = yourData.puppeteer?.security || {};
    const compSecurity = competitorData.puppeteer?.security || {};

    return {
      your: {
        isHTTPS: yourSecurity.isHTTPS || false,
        hasCDN: !!yourSecurity.cdn,
        cdnProvider: yourSecurity.cdn || null,
        hasMixedContent: yourSecurity.mixedContent || false,
        hasRobotsTxt: yourData.puppeteer?.robotsTxt?.exists || false,
        hasSitemap: yourData.puppeteer?.sitemap?.exists || false,
        sitemapUrls: yourData.puppeteer?.sitemap?.urlCount || 0
      },
      competitor: {
        isHTTPS: compSecurity.isHTTPS || false,
        hasCDN: !!compSecurity.cdn,
        cdnProvider: compSecurity.cdn || null,
        hasMixedContent: compSecurity.mixedContent || false,
        hasRobotsTxt: competitorData.puppeteer?.robotsTxt?.exists || false,
        hasSitemap: competitorData.puppeteer?.sitemap?.exists || false,
        sitemapUrls: competitorData.puppeteer?.sitemap?.urlCount || 0
      }
    };
  },

  /**
   * Generate summary and recommendations
   */
  generateSummary(comparison) {
    const summary = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      recommendations: []
    };

    // Performance analysis
    if (comparison.performance.winner === 'yours') {
      summary.strengths.push('Better overall performance scores');
    } else {
      summary.weaknesses.push('Lower performance scores than competitor');
      summary.recommendations.push('Optimize images, reduce JavaScript, and improve server response times');
    }

    // SEO analysis
    if (comparison.seo.winner === 'yours') {
      summary.strengths.push('Better SEO optimization');
    } else {
      summary.weaknesses.push('SEO implementation needs improvement');
      summary.recommendations.push('Improve meta tags, add structured data, and optimize heading structure');
    }

    // Content analysis
    if (comparison.content.winner === 'yours') {
      summary.strengths.push('More comprehensive content');
    } else {
      summary.opportunities.push('Create more in-depth content to match competitor');
    }

    // Security
    if (!comparison.security.your.isHTTPS) {
      summary.weaknesses.push('Not using HTTPS');
      summary.recommendations.push('Implement SSL certificate for security');
    }

    if (!comparison.security.your.hasCDN && comparison.security.competitor.hasCDN) {
      summary.opportunities.push('Implement CDN for better performance');
    }

    return summary;
  }
};

export default competitorService;
