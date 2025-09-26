import pagespeedService from './pagespeedService.js';
import analyticsService from './analyticsService.js';

const scoringService = {
  calculateHealthScore(data) {
    const { lighthouse, pagespeed, analytics } = data;

    console.log('🧮 Calculating health score...');

    // Calculate individual component scores
    const technicalScore = this.calculateTechnicalScore(lighthouse, pagespeed);
    const userExperienceScore = this.calculateUserExperienceScore(analytics, pagespeed);
    const seoHealthScore = this.calculateSEOHealthScore(lighthouse);

    // Calculate weighted overall score
    const weights = {
      technical: 0.4,       // 40%
      userExperience: 0.35, // 35%
      seoHealth: 0.25       // 25%
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

    // Calculate overall score
    const overallScore = validScores.length > 0 ?
      Math.round(validScores.reduce((sum, score) => sum + score, 0)) : null;

    // Data quality assessment
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

  calculateTechnicalScore(lighthouse, pagespeed) {
    const scores = [];

    // Lighthouse Performance Score (60% weight)
    if (lighthouse?.performance) {
      scores.push(lighthouse.performance * 0.6);
    }

    // Core Web Vitals from PageSpeed (40% weight)
    if (pagespeed?.mobile) {
      const vitalsData = pagespeed.mobile.fieldData || pagespeed.mobile.labData;
      if (vitalsData) {
        const vitalsScores = pagespeedService.convertCoreVitalsToScore(vitalsData);
        if (vitalsScores?.average) {
          scores.push(vitalsScores.average * 0.4);
        }
      }
    }

    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0)) : null;
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

    // Technical recommendations
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

    // User Experience recommendations
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

    // SEO Health recommendations
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

    // Data quality recommendations
    if (!analytics) {
      recommendations.push({
        category: 'setup',
        priority: 'low',
        title: 'Connect Google Analytics',
        description: 'Add GA4 tracking to get user behavior insights and improve score accuracy',
        impact: 'low'
      });
    }

    // Sort by priority and return top 5
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 5);
  },

  calculateUserExperienceScore(analytics, pagespeed) {
    if (!analytics) return null;

    const scores = [];

    // Bounce Rate (60% weight) - prioritize organic traffic if available
    const bounceRate = analytics.organicSessions > 10 ?
      analytics.organicBounceRate : analytics.bounceRate;

    if (bounceRate !== null) {
      const bounceScore = analyticsService.convertBounceRateToScore(bounceRate);
      if (bounceScore !== null) {
        scores.push(bounceScore * 0.6);
      }
    }

    // Session Duration (40% weight)
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

    // SEO Score (60% weight)
    if (lighthouse.seo) {
      scores.push(lighthouse.seo * 0.6);
    }

    // Accessibility Score (40% weight)
    if (lighthouse.accessibility) {
      scores.push(lighthouse.accessibility * 0.4);
    }

    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => score + sum, 0)) : null;
  },

  // Helper method to get score interpretation
  getScoreInterpretation(score) {
    if (score >= 90) return { level: 'excellent', description: 'Top 10% performance' };
    if (score >= 80) return { level: 'good', description: 'Above average with minor improvements needed' };
    if (score >= 70) return { level: 'fair', description: 'Several optimization opportunities' };
    if (score >= 60) return { level: 'poor', description: 'Significant issues need addressing' };
    return { level: 'critical', description: 'Major problems affecting user experience' };
  }
};

export default scoringService;
