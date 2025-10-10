import express from 'express';
import competitorService from '../services/competitorService.js';

const router = express.Router();

/**
 * POST /api/competitor/analyze
 * Compare two websites (yours vs competitor)
 */
router.post('/analyze', async (req, res) => {
  try {
    const { yourSite, competitorSite } = req.body;

    // Validation
    if (!yourSite || !competitorSite) {
      return res.status(400).json({
        success: false,
        error: 'Both yourSite and competitorSite are required'
      });
    }

    console.log(`\n📊 Competitor Analysis Request:`);
    console.log(`   Your Site: ${yourSite}`);
    console.log(`   Competitor: ${competitorSite}`);

    // Run comparison
    const result = await competitorService.compareWebsites(yourSite, competitorSite);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Competitor analysis route error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
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

export default router;
