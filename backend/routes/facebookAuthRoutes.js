import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import oauthTokenService from '../services/oauthTokenService.js';

const router = express.Router();

// Debug environment variables
console.log('🔍 Facebook OAuth Route Environment Check:');
console.log('FACEBOOK_APP_ID:', process.env.FACEBOOK_APP_ID ? `${process.env.FACEBOOK_APP_ID.substring(0, 10)}...` : 'MISSING');
console.log('FACEBOOK_APP_SECRET:', process.env.FACEBOOK_APP_SECRET ? 'SET' : 'MISSING');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Validate environment variables
if (!process.env.FACEBOOK_APP_ID) {
  throw new Error('FACEBOOK_APP_ID environment variable is required');
}
if (!process.env.FACEBOOK_APP_SECRET) {
  throw new Error('FACEBOOK_APP_SECRET environment variable is required');
}

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = `${process.env.BACKEND_URL || 'http://localhost:3010'}/api/auth/facebook/callback`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';

console.log('✅ Facebook OAuth client initialized successfully');
console.log('   Redirect URI:', REDIRECT_URI);

// State storage with longer TTL and better cleanup
const oauthStates = new Map();

// Cleanup function to remove expired states
const cleanupExpiredStates = () => {
  const now = Date.now();
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  
  for (const [key, value] of oauthStates.entries()) {
    if (now - value.timestamp > FIFTEEN_MINUTES) {
      oauthStates.delete(key);
      console.log('🧹 Cleaned up expired Facebook state:', key.substring(0, 10) + '...');
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredStates, 5 * 60 * 1000);

// Debug route
router.get('/auth/facebook/debug', (req, res) => {
  res.json({
    appId: process.env.FACEBOOK_APP_ID ? `${process.env.FACEBOOK_APP_ID.substring(0, 10)}...` : 'MISSING',
    appSecret: process.env.FACEBOOK_APP_SECRET ? 'SET' : 'MISSING',
    redirectUri: REDIRECT_URI,
    frontendUrl: FRONTEND_URL,
    activeStates: oauthStates.size
  });
});

// Initiate Facebook OAuth flow
router.get('/auth/facebook', (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    console.log('🚀 Starting Facebook OAuth flow for:', email);

    // Generate secure state parameter
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state with email and timestamp
    oauthStates.set(state, { 
      email, 
      timestamp: Date.now() 
    });
    
    console.log('🔒 Generated state:', state.substring(0, 10) + '...');
    console.log('📊 Total active states:', oauthStates.size);

    // Facebook permissions for pages and insights
    const scopes = [
      'pages_show_list',           // List Pages the user manages
      'pages_read_engagement',     // Read engagement data
      'pages_read_user_content',   // Read user-generated content
      'read_insights',             // Read insights data
      'pages_manage_metadata',     // Access page metadata
      'public_profile',            // Basic profile info
      'email'                      // Email address
    ];

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `state=${state}&` +
      `scope=${scopes.join(',')}&` +
      `response_type=code`;

    console.log('🔗 Redirecting to Facebook OAuth...');
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error initiating Facebook OAuth:', error);
    res.redirect(`${FRONTEND_URL}/dashboard/social?error=${encodeURIComponent(error.message)}`);
  }
});

// Facebook OAuth callback
router.get('/auth/facebook/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    console.log('📥 Facebook OAuth callback received');
    console.log('   State:', state ? state.substring(0, 10) + '...' : 'MISSING');
    console.log('   Code:', code ? 'RECEIVED' : 'MISSING');
    console.log('   Error:', error || 'NONE');

    // Check for OAuth errors
    if (error) {
      console.error('❌ Facebook OAuth error:', error, error_description);
      return res.redirect(
        `${FRONTEND_URL}/dashboard/social?error=${encodeURIComponent(error_description || error)}`
      );
    }

    // Validate state parameter
    if (!state) {
      console.error('❌ Missing state parameter');
      return res.redirect(
        `${FRONTEND_URL}/dashboard/social?error=Invalid OAuth state`
      );
    }

    const stateData = oauthStates.get(state);
    
    if (!stateData) {
      console.error('❌ Invalid or expired state:', state);
      console.log('📊 Available states:', Array.from(oauthStates.keys()).map(k => k.substring(0, 10) + '...'));
      return res.redirect(
        `${FRONTEND_URL}/dashboard/social?error=OAuth state expired or invalid. Please try again.`
      );
    }

    // Remove used state
    oauthStates.delete(state);
    const { email } = stateData;

    console.log('✅ Valid state found for:', email);

    if (!code) {
      console.error('❌ Missing authorization code');
      return res.redirect(
        `${FRONTEND_URL}/dashboard/social?error=Missing authorization code`
      );
    }

    // Exchange code for access token
    console.log('🔄 Exchanging code for access token...');
    console.log('   Using App ID:', FACEBOOK_APP_ID);
    console.log('   App Secret length:', FACEBOOK_APP_SECRET ? FACEBOOK_APP_SECRET.length : 0, 'chars');
    console.log('   App Secret (partial):', FACEBOOK_APP_SECRET ? FACEBOOK_APP_SECRET.substring(0, 8) + '...' : 'MISSING');
    
    const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
    // Use configured app secret and redirect URI from environment/config
    const tokenParams = {
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      redirect_uri: REDIRECT_URI,
      code: code
    };

    const tokenResponse = await axios.get(tokenUrl, { params: tokenParams });
    const { access_token, expires_in } = tokenResponse.data;

    if (!access_token) {
      throw new Error('Failed to obtain access token from Facebook');
    }

    console.log('✅ Access token obtained');
    console.log('   Expires in:', expires_in, 'seconds');

    // Get long-lived token (60 days instead of 1-2 hours)
    console.log('🔄 Exchanging for long-lived token...');
    const longLivedTokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
    const longLivedParams = {
      grant_type: 'fb_exchange_token',
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      fb_exchange_token: access_token
    };

    const longLivedResponse = await axios.get(longLivedTokenUrl, { params: longLivedParams });
    const longLivedToken = longLivedResponse.data.access_token;
    const longLivedExpiresIn = longLivedResponse.data.expires_in || (60 * 24 * 60 * 60); // 60 days

    console.log('✅ Long-lived token obtained');
    console.log('   Expires in:', longLivedExpiresIn, 'seconds (~', Math.floor(longLivedExpiresIn / 86400), 'days)');

    // Get user info from Facebook
    const userInfoUrl = 'https://graph.facebook.com/v18.0/me';
    const userInfoParams = {
      access_token: longLivedToken,
      fields: 'id,name,email'
    };

    const userInfoResponse = await axios.get(userInfoUrl, { params: userInfoParams });
    const userInfo = userInfoResponse.data;

    console.log('✅ User info retrieved:', userInfo.name, userInfo.email);

    // Store tokens in database using oauthTokenService
    const tokens = {
      access_token: longLivedToken,
      expires_at: Date.now() + (longLivedExpiresIn * 1000),
      scope: tokenParams.scope,
      user_id: userInfo.id,
      user_name: userInfo.name,
      user_email: userInfo.email || email
    };

    const stored = await oauthTokenService.storeTokens(email, tokens, 'facebook');

    if (!stored) {
      throw new Error('Failed to store Facebook tokens');
    }

    console.log('✅ Facebook OAuth completed successfully for:', email);
    res.redirect(`${FRONTEND_URL}/dashboard/social?success=true`);

  } catch (error) {
    console.error('❌ Error in Facebook OAuth callback:', error.message);
    
    // Log detailed error from Facebook
    if (error.response?.data) {
      console.error('📋 Facebook API Error Details:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
    
    const errorMessage = error.response?.data?.error?.message || error.message;
    const errorType = error.response?.data?.error?.type || 'unknown';
    
    console.error(`❌ Error Type: ${errorType}`);
    console.error(`❌ Error Message: ${errorMessage}`);
    
    // Provide helpful error message
    let userMessage = errorMessage;
    if (errorMessage.includes('client secret')) {
      userMessage = 'Invalid Facebook App Secret. Please check your .env file and ensure FACEBOOK_APP_SECRET is complete (32 characters).';
    } else if (errorMessage.includes('redirect_uri')) {
      userMessage = 'Invalid redirect URI. Please check your Facebook App settings.';
    }
    
    res.redirect(
      `${FRONTEND_URL}/dashboard/social?error=${encodeURIComponent(userMessage)}`
    );
  }
});

// Check Facebook connection status
router.get('/auth/facebook/status', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ 
        connected: false, 
        error: 'Email parameter is required' 
      });
    }

    console.log('🔍 Checking Facebook connection status for:', email);

    const isConnected = await oauthTokenService.isConnected(email, 'facebook');

    console.log('✅ Facebook connection status:', isConnected);

    res.json({ 
      connected: isConnected,
      provider: 'facebook'
    });

  } catch (error) {
    console.error('❌ Error checking Facebook connection:', error);
    res.status(500).json({ 
      connected: false, 
      error: error.message 
    });
  }
});

// Disconnect Facebook account
router.post('/auth/facebook/disconnect', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email parameter is required' 
      });
    }

    console.log('🔌 Disconnecting Facebook account for:', email);

    const deleted = await oauthTokenService.deleteTokens(email, 'facebook');

    if (!deleted) {
      throw new Error('Failed to delete Facebook tokens');
    }

    console.log('✅ Facebook account disconnected for:', email);

    res.json({ 
      success: true,
      message: 'Facebook account disconnected successfully' 
    });

  } catch (error) {
    console.error('❌ Error disconnecting Facebook:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
