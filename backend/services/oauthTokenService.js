/**
 * OAuth Token Service
 * Manages persistent OAuth connections for Google Analytics and Search Console
 * Tokens are stored in database and auto-refreshed when expired
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// Validate environment variables (optional for some services)
if (!process.env.SUPABASE_URL) {
  console.warn('⚠️ SUPABASE_URL is not set in environment variables - OAuth features will be limited');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_KEY is not set in environment variables - OAuth features will be limited');
}

console.log('🔍 Supabase Config Check:');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.substring(0, 30)}...` : 'MISSING');
console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const oauthTokenService = {
  /**
   * Store OAuth tokens in database
   * @param {string} userEmail - User's email
   * @param {object} tokens - OAuth tokens from Google
   * @returns {Promise<boolean>} Success status
   */
  async storeTokens(userEmail, tokens) {
    try {
      console.log(`💾 Storing OAuth tokens for: ${userEmail}`);

      const tokenData = {
        user_email: userEmail,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_at: tokens.expiry_date || null,
        scope: tokens.scope || null,
        updated_at: new Date().toISOString()
      };

      // Check if user already has tokens
      const { data: existing } = await supabase
        .from('oauth_tokens')
        .select('id')
        .eq('user_email', userEmail)
        .eq('provider', 'google')
        .single();

      if (existing) {
        // Update existing tokens
        const { error } = await supabase
          .from('oauth_tokens')
          .update(tokenData)
          .eq('id', existing.id);

        if (error) throw error;
        console.log(`✅ OAuth tokens updated for: ${userEmail}`);
      } else {
        // Insert new tokens
        const { error } = await supabase
          .from('oauth_tokens')
          .insert(tokenData);

        if (error) throw error;
        console.log(`✅ OAuth tokens stored for: ${userEmail}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error storing OAuth tokens:', error);
      return false;
    }
  },

  /**
   * Get stored OAuth tokens for a user
   * @param {string} userEmail - User's email
   * @returns {Promise<object|null>} OAuth tokens or null
   */
  async getTokens(userEmail) {
    try {
      console.log(`🔍 Fetching OAuth tokens for: ${userEmail}`);

      const { data, error } = await supabase
        .from('oauth_tokens')
        .select('*')
        .eq('user_email', userEmail)
        .eq('provider', 'google')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`📭 No OAuth tokens found for: ${userEmail}`);
          return null;
        }
        throw error;
      }

      if (!data) {
        console.log(`📭 No OAuth tokens found for: ${userEmail}`);
        return null;
      }

      // Convert to Google OAuth format
      const tokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: data.expires_at,
        scope: data.scope,
        token_type: 'Bearer'
      };

      console.log(`✅ OAuth tokens retrieved for: ${userEmail}`);
      return tokens;
    } catch (error) {
      console.error('❌ Error fetching OAuth tokens:', error);
      return null;
    }
  },

  /**
   * Check if user has valid OAuth connection
   * @param {string} userEmail - User's email
   * @returns {Promise<boolean>} True if connected
   */
  async isConnected(userEmail) {
    try {
      const tokens = await this.getTokens(userEmail);
      return tokens !== null && (tokens.access_token || tokens.refresh_token);
    } catch (error) {
      console.error('❌ Error checking connection:', error);
      return false;
    }
  },

  /**
   * Refresh expired access token using refresh token
   * @param {string} userEmail - User's email
   * @returns {Promise<object|null>} New tokens or null
   */
  async refreshTokens(userEmail) {
    try {
      console.log(`🔄 Refreshing OAuth tokens for: ${userEmail}`);

      const tokens = await this.getTokens(userEmail);
      if (!tokens || !tokens.refresh_token) {
        console.log(`❌ No refresh token available for: ${userEmail}`);
        return null;
      }

      // Set credentials and refresh
      oauth2Client.setCredentials(tokens);
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Store new tokens
      await this.storeTokens(userEmail, credentials);

      console.log(`✅ OAuth tokens refreshed for: ${userEmail}`);
      return credentials;
    } catch (error) {
      console.error('❌ Error refreshing OAuth tokens:', error);
      
      // If refresh fails, connection is broken
      if (error.message?.includes('invalid_grant')) {
        console.log(`⚠️ Invalid refresh token, disconnecting: ${userEmail}`);
        await this.disconnect(userEmail);
      }
      
      return null;
    }
  },

  /**
   * Get valid OAuth client (auto-refreshes if needed)
   * @param {string} userEmail - User's email
   * @returns {Promise<OAuth2Client|null>} Configured OAuth client or null
   */
  async getOAuthClient(userEmail) {
    try {
      let tokens = await this.getTokens(userEmail);
      
      if (!tokens) {
        console.log(`📭 No OAuth connection for: ${userEmail}`);
        return null;
      }

      // Check if token is expired
      const now = Date.now();
      const expiryDate = tokens.expiry_date || 0;

      if (expiryDate && expiryDate < now) {
        console.log(`⏰ Token expired, refreshing for: ${userEmail}`);
        tokens = await this.refreshTokens(userEmail);
        
        if (!tokens) {
          console.log(`❌ Failed to refresh token for: ${userEmail}`);
          return null;
        }
      }

      // Create and configure OAuth client
      const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      
      client.setCredentials(tokens);
      
      console.log(`✅ OAuth client ready for: ${userEmail}`);
      return client;
    } catch (error) {
      console.error('❌ Error getting OAuth client:', error);
      return null;
    }
  },

  /**
   * Disconnect user's OAuth connection
   * @param {string} userEmail - User's email
   * @returns {Promise<boolean>} Success status
   */
  async disconnect(userEmail) {
    try {
      console.log(`🔌 Disconnecting OAuth for: ${userEmail}`);

      // Revoke tokens with Google
      const tokens = await this.getTokens(userEmail);
      if (tokens?.access_token) {
        try {
          await oauth2Client.revokeToken(tokens.access_token);
          console.log(`✅ Token revoked with Google`);
        } catch (error) {
          console.warn('⚠️ Failed to revoke token with Google:', error.message);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('oauth_tokens')
        .delete()
        .eq('user_email', userEmail)
        .eq('provider', 'google');

      if (error) throw error;

      console.log(`✅ OAuth disconnected for: ${userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Error disconnecting OAuth:', error);
      return false;
    }
  },

  /**
   * Get connection status with details
   * @param {string} userEmail - User's email
   * @returns {Promise<object>} Connection status details
   */
  async getConnectionStatus(userEmail) {
    try {
      const tokens = await this.getTokens(userEmail);
      
      if (!tokens) {
        return {
          connected: false,
          message: 'Not connected to Google'
        };
      }

      const now = Date.now();
      const expiryDate = tokens.expiry_date || 0;
      const isExpired = expiryDate && expiryDate < now;

      return {
        connected: true,
        hasRefreshToken: !!tokens.refresh_token,
        isExpired: isExpired,
        expiresAt: expiryDate ? new Date(expiryDate).toISOString() : null,
        scopes: tokens.scope?.split(' ') || [],
        message: isExpired 
          ? 'Token expired, will auto-refresh on next request'
          : 'Connected and active'
      };
    } catch (error) {
      console.error('❌ Error getting connection status:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }
};

export default oauthTokenService;
