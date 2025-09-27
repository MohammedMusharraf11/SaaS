import pagespeedService from './pagespeedService.js';
import analyticsService from './analyticsService.js';

const scoringService = {
  calculateHealthScore(data) {
    const { lighthouse, pagespeed, analytics } = data;
    console.log('🧮 Calculating health score...');
    const technicalScore = this.calculateTechnicalScore(lighthouse, pagespeed);
    const userExperienceScore = this.calculateUserExperienceScore(analytics, pagespeed);
    const seoHealthScore = this.calculateSEOHealthScore(lighthouse);

    const weights = {
      technical: 0.4,
      userExperience: 0.35,
      seoHealth: 0.25
    };

    const validScores = [];
    const scoreBreakdown = {};

    if (technicalScore !== null) {
      validScores.push(technicalScore * weights.technical);
      scoreBreakdown.technical = technicalScore;
    }

    if (userExperienceScore !== null) {
      validScores.push(userExperienceScore * weights.userExperience);
      scoreBreakdown.userExperience = userExperienceScore;
    }

    if (seoHealthScore !== null) {
      validScores.push(seoHealthScore * weights.seoHealth);
      scoreBreakdown.seoHealth = seoHealthScore;
    }

    const overallScore = validScores.length > 0 ?
      Math.round(validScores.reduce((sum, score) => sum + score, 0)) : null;

    const dataQuality = this.assessDataQuality(data);

    return {
      overall: overallScore,
      technical: scoreBreakdown.technical,
      userExperience: scoreBreakdown.userExperience,
      seoHealth: scoreBreakdown.seoHealth,
      dataQuality,
      coreVitalsScore: this.calculateCoreVitalsScore(pagespeed)
    };
  },

  calculateEnhancedHealthScore(data) {
    const { lighthouse, pagespeed, analytics, searchConsole, technicalSEO } = data;
    console.log('🧮 Calculating enhanced health score...');
    const technicalScore = this.calculateTechnicalScore(lighthouse, pagespeed);
    const userExperienceScore = this.calculateUserExperienceScore(analytics, pagespeed);
    const seoHealthScore = this.calculateSEOHealthScore(lighthouse);
    const searchVisibilityScore = this.calculateSearchVisibilityScore(searchConsole);
    const technicalSEOScore = this.calculateTechnicalSEOScore(technicalSEO);

    const weights = {
      technical: 0.25,
      userExperience: 0.20,
      seoHealth: 0.20,
      searchVisibility: 0.20,
      technicalSEO: 0.15
    };

    const validScores = [];
    const scoreBreakdown = {};

    if (technicalScore !== null) {
      validScores.push(technicalScore * weights.technical);
      scoreBreakdown.technical = technicalScore;
    }
    if (userExperienceScore !== null) {
      validScores.push(userExperienceScore * weights.userExperience);
      scoreBreakdown.userExperience = userExperienceScore;
    }
    if (seoHealthScore !== null) {
      validScores.push(seoHealthScore * weights.seoHealth);
      scoreBreakdown.seoHealth = seoHealthScore;
    }
    if (searchVisibilityScore !== null) {
      validScores.push(searchVisibilityScore * weights.searchVisibility);
      scoreBreakdown.searchVisibility = searchVisibilityScore;
    }
    if (technicalSEOScore !== null) {
      validScores.push(technicalSEOScore * weights.technicalSEO);
      scoreBreakdown.technicalSEO = technicalSEOScore;
    }

    const overallScore = validScores.length > 0 ?
      Math.round(validScores.reduce((sum, score) => sum + score, 0)) : null;

    const dataQuality = this.assessDataQuality(data);

    return {
      overall: overallScore,
      breakdown: scoreBreakdown,
      dataQuality,
      coreVitalsScore: this.calculateCoreVitalsScore(pagespeed)
    };
  },

  getEnhancedRecommendations(data, scores) {
    const recommendations = this.getRecommendations(data, scores);

    // Search visibility recommendation
    if (scores.searchVisibility && scores.searchVisibility < 70) {
      recommendations.push({
        category: 'search_visibility',
        priority: 'medium',
        title: 'Improve Search Visibility',
        description: 'Increase keyword coverage, improve CTR, and enhance indexing.',
        impact: 'medium'
      });
    }

    // Technical SEO recommendation
    if (scores.technicalSEO && scores.technicalSEO < 70) {
      recommendations.push({
        category: 'technical_seo',
        priority: 'medium',
        title: 'Fix technical SEO issues',
        description: 'Review robots.txt, sitemaps, SSL, meta tags, and structured data.',
        impact: 'medium'
      });
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 5);
  },

  calculateTechnicalScore(lighthouse, pagespeed) {
    const scores = [];
    if (lighthouse?.performance) {
      scores.push(lighthouse.performance * 0.6);
    }
    if (pagespeed?.mobile) {
      const vitalsData = pagespeed.mobile.fieldData || pagespeed.mobile.labData;
      if (vitalsData) {
        const vitalsScores = pagespeedService.convertCoreVitalsToScore(vitalsData);
        if (vitalsScores?.average) {
          scores.push(vitalsScores.average * 0.4);
        }
      }
    }
    return scores.length > 0 ?
      Math.round(scores.reduce((sum, score) => sum + score, 0)) : null;
  },

  calculateCoreVitalsScore(pagespeed) {
    if (!pagespeed?.mobile) return null;
    const vitalsData = pagespeed.mobile.fieldData || pagespeed.mobile.labData;
    if (!vitalsData) return null;
    const vitalsScores = pagespeedService.convertCoreVitalsToScore(vitalsData);
    return vitalsScores?.average || null;
  },

  assessDataQuality(data) {
    const { lighthouse, pagespeed, analytics } = data;
    const sources = {
      lighthouse: !!lighthouse,
      pagespeed: !!pagespeed,
      analytics: !!analytics && analytics.totalSessions > 0
    };
    const availableSources = Object.values(sources).filter(Boolean).length;
    const totalSources = Object.keys(sources).length;
    let quality = 'limited';
    if (availableSources === totalSources) quality = 'high';
    else if (availableSources >= 2) quality = 'medium';
    return {
      level: quality,
      sources,
      completeness: Math.round((availableSources / totalSources) * 100)
    };
  },

  getRecommendations(data, scores) {
    const recommendations = [];
    const { lighthouse, pagespeed, analytics } = data;

    if (scores.technical && scores.technical < 70) {
      if (lighthouse?.performance < 70) {
        recommendations.push({
          category: 'performance',
          priority: 'high',
          title: 'Improve Core Web Vitals',
          description: 'Focus on Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)',
          impact: 'high'
        });
      }
      if (pagespeed?.mobile?.labData?.lcp > 2500) {
        recommendations.push({
          category: 'performance',
          priority: 'high',
          title: 'Optimize Largest Contentful Paint',
          description: 'Reduce LCP to under 2.5 seconds by optimizing images and server response times',
          impact: 'high'
        });
      }
    }
    if (scores.userExperience && scores.userExperience < 70) {
      const bounceRate = analytics?.organicBounceRate || analytics?.bounceRate;
      if (bounceRate > 60) {
        recommendations.push({
          category: 'user_experience',
          priority: 'medium',
          title: 'Reduce bounce rate',
          description: 'Improve page content relevance and loading speed to keep users engaged',
          impact: 'medium'
        });
      }
      if (analytics?.avgSessionDuration < 60) {
        recommendations.push({
          category: 'user_experience',
          priority: 'medium',
          title: 'Increase session duration',
          description: 'Add more engaging content and improve internal linking to keep users longer',
          impact: 'medium'
        });
      }
    }
    if (scores.seoHealth && scores.seoHealth < 80) {
      if (lighthouse?.seo < 80) {
        recommendations.push({
          category: 'seo',
          priority: 'medium',
          title: 'Fix SEO fundamentals',
          description: 'Improve meta descriptions, title tags, and heading structure',
          impact: 'medium'
        });
      }
      if (lighthouse?.accessibility < 80) {
        recommendations.push({
          category: 'accessibility',
          priority: 'medium',
          title: 'Improve accessibility',
          description: 'Add alt text to images and improve color contrast ratios',
          impact: 'medium'
        });
      }
    }
    if (!analytics) {
      recommendations.push({
        category: 'setup',
        priority: 'low',
        title: 'Connect Google Analytics',
        description: 'Add GA4 tracking to get user behavior insights and improve score accuracy',
        impact: 'low'
      });
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 5);
  },

  calculateUserExperienceScore(analytics, pagespeed) {
    if (!analytics) return null;
    const scores = [];
    const bounceRate = analytics.organicSessions > 10 ? analytics.organicBounceRate : analytics.bounceRate;
    if (bounceRate !== null) {
      const bounceScore = analyticsService.convertBounceRateToScore(bounceRate);
      if (bounceScore !== null) {
        scores.push(bounceScore * 0.6);
      }
    }
    if (analytics.avgSessionDuration !== null) {
      const durationScore = analyticsService.convertSessionDurationToScore(analytics.avgSessionDuration);
      if (durationScore !== null) {
        scores.push(durationScore * 0.4);
      }
    }
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0)) : null;
  },

  calculateSEOHealthScore(lighthouse) {
    if (!lighthouse) return null;
    const scores = [];
    if (lighthouse.seo) {
      scores.push(lighthouse.seo * 0.6);
    }
    if (lighthouse.accessibility) {
      scores.push(lighthouse.accessibility * 0.4);
    }
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0)) : null;
  },

  calculateSearchVisibilityScore(searchConsoleData) {
    if (!searchConsoleData) return null;
    return this.convertSearchMetricsToScore(searchConsoleData)?.average || null;
  },

  calculateTechnicalSEOScore(technicalSEOData) {
    if (!technicalSEOData) return null;
    const scores = [];
    if (technicalSEOData.robotsTxt?.score) scores.push(technicalSEOData.robotsTxt.score * 0.2);
    if (technicalSEOData.sitemap?.score) scores.push(technicalSEOData.sitemap.score * 0.2);
    if (technicalSEOData.ssl?.score) scores.push(technicalSEOData.ssl.score * 0.25);
    if (technicalSEOData.metaTags?.score) scores.push(technicalSEOData.metaTags.score * 0.25);
    if (technicalSEOData.structuredData?.score) scores.push(technicalSEOData.structuredData.score * 0.1);
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0)) : null;
  },

  convertSearchMetricsToScore(searchConsoleData) {
    // Replace with your logic
    return { average: 75 };
  },

  getScoreInterpretation(score) {
    if (score >= 90) return { level: 'excellent', description: 'Top 10% performance' };
    if (score >= 80) return { level: 'good', description: 'Above average with minor improvements needed' };
    if (score >= 70) return { level: 'fair', description: 'Several optimization opportunities' };
    if (score >= 60) return { level: 'poor', description: 'Significant issues need addressing' };
    return { level: 'critical', description: 'Major problems affecting user experience' };
  }
};

export default scoringService;
