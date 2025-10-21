import express from 'express';
import linkedinScraperService from '../services/linkedinScraperService.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

/**
 * Get comprehensive LinkedIn metrics using scraper
 * GET /api/linkedin/metrics?email=user@example.com&companyUrl=https://linkedin.com/company/example
 */
router.get('/metrics', async (req, res) => {
  try {
    const { email, companyUrl } = req.query;

    if (!email) {
      return res.status(400).json({
        dataAvailable: false,
        error: 'Email parameter is required'
      });
    }

    // Check if user has saved LinkedIn company URL
    let linkedinUrl = companyUrl;
    
    if (!linkedinUrl) {
      // Try to get from database
      console.log(`📊 No companyUrl provided, checking database for: ${email}`);
      const { data, error } = await supabase
        .from('social_connections')
        .select('company_url')
        .eq('email', email)
        .eq('platform', 'linkedin')
        .single();

      if (data && data.company_url) {
        linkedinUrl = data.company_url;
        console.log(`   ✅ Found saved URL: ${linkedinUrl}`);
      } else {
        return res.status(400).json({
          dataAvailable: false,
          error: 'LinkedIn company URL is required. Please provide companyUrl parameter or save it first.',
          usage: '/api/linkedin/metrics?email=user@example.com&companyUrl=https://linkedin.com/company/yourcompany'
        });
      }
    }

    // Validate URL
    if (!linkedinScraperService.isValidLinkedInUrl(linkedinUrl)) {
      return res.status(400).json({
        dataAvailable: false,
        error: 'Invalid LinkedIn company URL format',
        example: 'https://www.linkedin.com/company/incresco-technology'
      });
    }

    console.log(`📊 Fetching LinkedIn metrics for: ${email}`);
    console.log(`   🔗 Company URL: ${linkedinUrl}`);
    
    const metrics = await linkedinScraperService.scrapeCompanyPosts(linkedinUrl, 20);
    res.json(metrics);
  } catch (error) {
    console.error('❌ Error in LinkedIn metrics endpoint:', error);
    res.status(500).json({
      dataAvailable: false,
      error: error.message,
      reason: 'Failed to fetch LinkedIn metrics'
    });
  }
});

/**
 * Get user's LinkedIn organizations
 * GET /api/linkedin/organizations?email=user@example.com
 */
router.get('/organizations', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    // Get saved LinkedIn URL from database
    const { data, error } = await supabase
      .from('social_connections')
      .select('company_url, company_name, created_at')
      .eq('email', email)
      .eq('platform', 'linkedin')
      .single();

    if (data) {
      res.json({
        success: true,
        connected: true,
        companyUrl: data.company_url,
        companyName: data.company_name,
        savedAt: data.created_at
      });
    } else {
      res.json({
        success: true,
        connected: false,
        message: 'No LinkedIn company URL saved yet'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching LinkedIn connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Save LinkedIn company URL
 * POST /api/linkedin/save-company
 * Body: { email, companyUrl }
 */
router.post('/save-company', async (req, res) => {
  try {
    const { email, companyUrl } = req.body;

    if (!email || !companyUrl) {
      return res.status(400).json({
        success: false,
        error: 'Email and companyUrl are required'
      });
    }

    // Validate LinkedIn URL
    if (!linkedinScraperService.isValidLinkedInUrl(companyUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid LinkedIn company URL format',
        example: 'https://www.linkedin.com/company/incresco-technology'
      });
    }

    console.log(`💾 Saving LinkedIn company URL for: ${email}`);
    console.log(`   🔗 URL: ${companyUrl}`);

    // Extract company name from URL or fetch via scraper
    const companyName = linkedinScraperService.extractCompanyNameFromUrl(companyUrl);

    // Check if entry exists
    const { data: existing } = await supabase
      .from('social_connections')
      .select('id')
      .eq('email', email)
      .eq('platform', 'linkedin')
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('social_connections')
        .update({
          company_url: companyUrl,
          company_name: companyName,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .eq('platform', 'linkedin');

      if (error) throw error;
      console.log(`   ✅ Updated existing LinkedIn connection`);
    } else {
      // Insert new
      const { error } = await supabase
        .from('social_connections')
        .insert({
          email: email,
          platform: 'linkedin',
          company_url: companyUrl,
          company_name: companyName,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log(`   ✅ Created new LinkedIn connection`);
    }

    res.json({
      success: true,
      message: 'LinkedIn company URL saved successfully',
      companyUrl: companyUrl,
      companyName: companyName
    });
  } catch (error) {
    console.error('❌ Error saving LinkedIn company:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete LinkedIn company connection
 * DELETE /api/linkedin/disconnect?email=user@example.com
 */
router.delete('/disconnect', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    console.log(`� Disconnecting LinkedIn for: ${email}`);

    const { error } = await supabase
      .from('social_connections')
      .delete()
      .eq('email', email)
      .eq('platform', 'linkedin');

    if (error) throw error;

    console.log(`   ✅ LinkedIn connection removed`);

    res.json({
      success: true,
      message: 'LinkedIn company URL removed successfully'
    });
  } catch (error) {
    console.error('❌ Error disconnecting LinkedIn:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
