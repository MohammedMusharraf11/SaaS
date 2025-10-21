import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import oauthTokenService from '../services/oauthTokenService.js';

const router = express.Router();

// Store OAuth state temporarily (in production, use Redis or database)
const oauthStates = new Map();

/**
 * Initiate LinkedIn OAuth flow
 * GET /api/auth/linkedin?email=user@example.com
 */
router.get('/', (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email parameter is required',
        usage: '/api/auth/linkedin?email=user@example.com'
      });
    }

    console.log(`🔐 Initiating LinkedIn OAuth for: ${email}`);

    // Generate state parameter for security
    const state = crypto.randomBytes(32).toString('hex');
    oauthStates.set(state, { email, timestamp: Date.now() });

    // Clean up old states (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, value] of oauthStates.entries()) {
      if (value.timestamp < tenMinutesAgo) {
        oauthStates.delete(key);
      }
    }

    // Use only OpenID Connect scopes (approved by default)
    const scopes = ['openid', 'profile', 'email'].join('%20');
  
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}&` +
      `scope=${scopes}&` +
      `state=${state}`;
    
    console.log(`📤 Redirecting to LinkedIn OAuth URL`);
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error initiating LinkedIn OAuth:', error);
    res.status(500).json({ error: 'Failed to initiate LinkedIn OAuth', details: error.message });
  }
});

/**
 * Handle LinkedIn OAuth callback
 * GET /api/auth/linkedin/callback
 */
router.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;
  
  console.log(`🔙 LinkedIn OAuth callback received`);
  
  if (error) {
    console.error(`❌ LinkedIn OAuth error: ${error} - ${error_description}`);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard/social?error=${error}`);
  }

  if (!code) {
    console.error('❌ No authorization code received');
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard/social?error=no_code`);
  }

  // Verify state parameter
  const stateData = oauthStates.get(state);
  if (!stateData) {
    console.error('❌ Invalid or expired state parameter');
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard/social?error=invalid_state`);
  }

  const { email } = stateData;
  oauthStates.delete(state); // Clean up used state
  
  try {
    console.log(`🔄 Exchanging authorization code for access token...`);
    console.log(`   📧 User email: ${email}`);
    
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token, expires_in, refresh_token } = tokenResponse.data;
    console.log(`✅ Access token obtained (expires in ${expires_in} seconds)`);
    
    // Get user info using OpenID Connect userinfo endpoint
    console.log(`🔄 Fetching user info...`);
    const userResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    const userInfo = userResponse.data;
    console.log(`✅ User info retrieved: ${userInfo.name} (${userInfo.email})`);
    console.log(`   📝 LinkedIn User ID: ${userInfo.sub}`);
    
    // Store tokens using oauthTokenService
    const tokens = {
      access_token: access_token,
      refresh_token: refresh_token || null,
      expiry_date: Date.now() + (expires_in * 1000),
      scope: 'openid profile email',
      token_type: 'Bearer',
      provider_user_id: userInfo.sub,
      provider_user_name: userInfo.name,
      provider_user_email: userInfo.email
    };

    await oauthTokenService.storeTokens(email, tokens, 'linkedin');
    console.log(`✅ LinkedIn tokens stored successfully for ${email}`);
    
    // Redirect back to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/social?connected=linkedin`);
    
  } catch (error) {
    console.error('❌ LinkedIn OAuth error:', error.response?.data || error.message);
    console.error('   Stack:', error.stack);
    
    // Enhanced error logging
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/social?error=linkedin_auth_failed`);
  }
});

/**
 * Check LinkedIn connection status
 * GET /api/auth/linkedin/status?email=user@example.com
 */
router.get('/status', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email parameter is required',
        usage: '/api/auth/linkedin/status?email=user@example.com'
      });
    }

    console.log(`🔍 Checking LinkedIn connection status for: ${email}`);
    const isConnected = await oauthTokenService.isConnected(email, 'linkedin');

    if (isConnected) {
      const tokens = await oauthTokenService.getTokens(email, 'linkedin');
      console.log(`✅ LinkedIn is connected for ${email}`);
      console.log(`   📝 Provider user: ${tokens.provider_user_name || 'Unknown'}`);
      
      res.json({ 
        connected: true,
        provider: 'linkedin',
        userName: tokens.provider_user_name || null,
        userEmail: tokens.provider_user_email || null
      });
    } else {
      console.log(`❌ LinkedIn is not connected for ${email}`);
      res.json({ 
        connected: false,
        provider: 'linkedin'
      });
    }
  } catch (error) {
    console.error('❌ Error checking LinkedIn status:', error);
    res.status(500).json({ 
      error: 'Failed to check connection status',
      details: error.message
    });
  }
});

/**
 * Disconnect LinkedIn account
 * POST /api/auth/linkedin/disconnect?email=user@example.com
 */
router.post('/disconnect', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email parameter is required',
        usage: '/api/auth/linkedin/disconnect?email=user@example.com'
      });
    }

    console.log(`🔌 Disconnecting LinkedIn for: ${email}`);
    await oauthTokenService.disconnect(email, 'linkedin');
    console.log(`✅ LinkedIn disconnected successfully`);

    res.json({ 
      success: true,
      message: 'LinkedIn account disconnected successfully'
    });
  } catch (error) {
    console.error('❌ Error disconnecting LinkedIn:', error);
    res.status(500).json({ 
      error: 'Failed to disconnect LinkedIn',
      details: error.message
    });
  }
});

export default router;
