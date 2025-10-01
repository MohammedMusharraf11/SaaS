import dotenv from 'dotenv';
dotenv.config(); // Ensure environment variables are loaded

import express from 'express';
import { google } from 'googleapis';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Debug environment variables immediately
console.log('🔍 OAuth Route Environment Check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'MISSING');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);

// Check if environment variables are properly loaded
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('❌ GOOGLE_CLIENT_ID is missing from environment variables');
  throw new Error('GOOGLE_CLIENT_ID environment variable is required');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ GOOGLE_CLIENT_SECRET is missing from environment variables');
  throw new Error('GOOGLE_CLIENT_SECRET environment variable is required');
}

if (!process.env.GOOGLE_REDIRECT_URI) {
  console.error('❌ GOOGLE_REDIRECT_URI is missing from environment variables');
  throw new Error('GOOGLE_REDIRECT_URI environment variable is required');
}

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Verify the OAuth client was created properly
console.log('✅ OAuth2 client initialized successfully');

// Store for OAuth states (in production, use Redis or database)
const oauthStates = new Map();

// File-based token storage functions (keep your existing functions)
const getTokensFilePath = () => path.join(process.cwd(), 'data', 'oauth_tokens.json');

const ensureDataDirectory = async () => {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

const saveTokensToFile = async (email, tokens) => {
  await ensureDataDirectory();
  const filePath = getTokensFilePath();
  
  let allTokens = {};
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    allTokens = JSON.parse(data);
  } catch {
    // File doesn't exist, start with empty object
  }
  
  allTokens[email] = {
    ...tokens,
    updated_at: new Date().toISOString()
  };
  
  await fs.writeFile(filePath, JSON.stringify(allTokens, null, 2));
};

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

const deleteTokensFromFile = async (email) => {
  try {
    const filePath = getTokensFilePath();
    const data = await fs.readFile(filePath, 'utf-8');
    const allTokens = JSON.parse(data);
    delete allTokens[email];
    await fs.writeFile(filePath, JSON.stringify(allTokens, null, 2));
  } catch {
    // File doesn't exist or other error, ignore
  }
};

// Add a debug route to test environment variables
router.get('/auth/google/debug', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'MISSING',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    nodeEnv: process.env.NODE_ENV,
    oauthClientConfigured: !!oauth2Client._clientId
  });
});

// Initiate OAuth flow
router.get('/auth/google', (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Log the OAuth configuration being used
    console.log('🔍 Creating OAuth URL with:');
    console.log('Client ID:', oauth2Client._clientId ? `${oauth2Client._clientId.substring(0, 10)}...` : 'MISSING');
    console.log('Redirect URI:', oauth2Client.redirectUri);

    // Generate secure state parameter
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state with email for validation
    oauthStates.set(state, { email, timestamp: Date.now() });
    
    // Clean up old states (older than 10 minutes)
    for (const [key, value] of oauthStates.entries()) {
      if (Date.now() - value.timestamp > 10 * 60 * 1000) {
        oauthStates.delete(key);
      }
    }

    const scopes = [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: state
    });

    console.log('🔒 Generated secure state:', state.substring(0, 10) + '...');
    console.log('🔗 Generated OAuth URL:', authUrl);

    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error initiating OAuth:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow', details: error.message });
  }
});

// Handle OAuth callback
router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('❌ OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      console.error('❌ Missing code or state parameter');
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=missing_parameters`);
    }

    // Validate state parameter
    const stateData = oauthStates.get(state);
    if (!stateData) {
      console.error('❌ Invalid or expired state parameter');
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=invalid_state`);
    }

    // Remove used state
    oauthStates.delete(state);
    console.log('✅ State parameter validated and consumed');

    // Exchange code for tokens
    console.log('🔄 Exchanging authorization code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ Received tokens:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      scope: tokens.scope,
      expiresAt: tokens.expiry_date
    });

    // Set credentials to get user info
    oauth2Client.setCredentials(tokens);

    // Get user information
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    console.log('👤 User info retrieved:', {
      id: userInfo.data.id,
      email: userInfo.data.email,
      name: userInfo.data.name,
      verified: userInfo.data.verified_email
    });

    // Save tokens to file storage
    await saveTokensToFile(stateData.email, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiry_date,
      scope: tokens.scope,
      user_info: userInfo.data
    });

    console.log('💾 Tokens saved successfully for user:', stateData.email);

    // Redirect back to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?success=true`);

  } catch (error) {
    console.error('❌ Error in OAuth callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=${encodeURIComponent(error.message)}`);
  }
});

// Check OAuth status
router.get('/auth/google/status', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const tokens = await getTokensFromFile(email);
    
    if (!tokens) {
      return res.json({ connected: false, email });
    }

    // Check if token is expired
    const now = Date.now();
    const isExpired = tokens.expires_at && now >= tokens.expires_at;

    res.json({
      connected: true,
      email,
      expired: isExpired,
      scope: tokens.scope,
      user_info: tokens.user_info
    });

  } catch (error) {
    console.error('❌ Error checking OAuth status:', error);
    res.status(500).json({ error: 'Failed to check OAuth status' });
  }
});

// Disconnect OAuth
router.post('/auth/google/disconnect', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    await deleteTokensFromFile(email);
    
    console.log('🔓 OAuth tokens deleted for user:', email);
    
    res.json({ success: true, message: 'Successfully disconnected' });

  } catch (error) {
    console.error('❌ Error disconnecting OAuth:', error);
    res.status(500).json({ error: 'Failed to disconnect OAuth' });
  }
});

export default router;