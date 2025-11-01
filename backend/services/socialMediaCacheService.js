import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Social Media Cache Service
 * Handles caching of social media metrics in Supabase
 */
class SocialMediaCacheService {
  constructor() {
    this.CACHE_DURATION_MINUTES = 30; // Default cache duration
  }

  /**
   * Get cached metrics for a platform
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform name (facebook, instagram, linkedin)
   * @param {string} period - Time period (day, week, month)
   * @returns {Object|null} Cached data or null if not found/expired
   */
  async getCachedMetrics(userEmail, platform, period = 'month') {
    try {
      console.log(`📦 Checking cache for ${platform} metrics (${userEmail}, period: ${period})`);

      const { data, error } = await supabase
        .from('social_media_cache')
        .select('*')
        .eq('user_email', userEmail)
        .eq('platform', platform)
        .eq('period', period)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - not an error, just cache miss
          console.log(`   ❌ Cache miss for ${platform}`);
          return null;
        }
        throw error;
      }

      if (!data) {
        console.log(`   ❌ Cache miss for ${platform}`);
        return null;
      }

      // Calculate cache age
      const cacheAge = Math.floor((Date.now() - new Date(data.last_fetched_at).getTime()) / 1000 / 60);
      console.log(`   ✅ Cache hit for ${platform} (${cacheAge} minutes old)`);

      // Return formatted data
      return {
        dataAvailable: data.data_available,
        pageName: data.account_name,
        pageId: data.account_id,
        username: data.username,
        accountId: data.account_id,
        name: data.account_name,
        engagementScore: data.engagement_data || {},
        followerGrowth: data.follower_growth || [],
        topPosts: data.top_posts || [],
        reputationBenchmark: data.reputation_data || {},
        lastUpdated: data.last_fetched_at,
        cacheAge: cacheAge,
        period: data.period
      };
    } catch (error) {
      console.error(`❌ Error getting cached metrics for ${platform}:`, error.message);
      return null;
    }
  }

  /**
   * Store metrics in cache
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform name
   * @param {Object} metrics - Metrics data to cache
   * @param {string} period - Time period
   * @returns {boolean} Success status
   */
  async cacheMetrics(userEmail, platform, metrics, period = 'month') {
    try {
      console.log(`💾 Caching ${platform} metrics for ${userEmail}`);

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.CACHE_DURATION_MINUTES);

      const cacheData = {
        user_email: userEmail,
        platform: platform,
        period: period,
        account_id: metrics.pageId || metrics.accountId || null,
        account_name: metrics.pageName || metrics.name || metrics.companyName || null,
        username: metrics.username || null,
        profile_url: metrics.profileUrl || metrics.companyUrl || null,
        engagement_data: metrics.engagementScore || {},
        follower_count: metrics.reputationBenchmark?.followers || 0,
        follower_growth: metrics.followerGrowth || [],
        top_posts: metrics.topPosts || [],
        reputation_data: metrics.reputationBenchmark || {},
        data_available: metrics.dataAvailable !== false,
        error_message: metrics.reason || null,
        last_fetched_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('social_media_cache')
        .upsert(cacheData, {
          onConflict: 'user_email,platform,period'
        });

      if (error) {
        throw error;
      }

      console.log(`   ✅ ${platform} metrics cached successfully (expires in ${this.CACHE_DURATION_MINUTES} minutes)`);
      return true;
    } catch (error) {
      console.error(`❌ Error caching ${platform} metrics:`, error.message);
      return false;
    }
  }

  /**
   * Update connection status
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform name
   * @param {boolean} isConnected - Connection status
   * @param {Object} metadata - Additional metadata
   * @returns {boolean} Success status
   */
  async updateConnectionStatus(userEmail, platform, isConnected, metadata = {}) {
    try {
      console.log(`🔄 Updating ${platform} connection status for ${userEmail}: ${isConnected}`);

      const connectionData = {
        user_email: userEmail,
        platform: platform,
        is_connected: isConnected,
        connection_status: isConnected ? 'connected' : 'disconnected',
        platform_metadata: metadata,
        connected_at: isConnected ? new Date().toISOString() : null,
        disconnected_at: !isConnected ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('social_connections_v2')
        .upsert(connectionData, {
          onConflict: 'user_email,platform'
        });

      if (error) {
        throw error;
      }

      console.log(`   ✅ Connection status updated successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating connection status:`, error.message);
      return false;
    }
  }

  /**
   * Get connection status for a platform
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform name
   * @returns {Object|null} Connection status
   */
  async getConnectionStatus(userEmail, platform) {
    try {
      const { data, error } = await supabase
        .from('social_connections_v2')
        .select('*')
        .eq('user_email', userEmail)
        .eq('platform', platform)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`❌ Error getting connection status:`, error.message);
      return null;
    }
  }

  /**
   * Get all connection statuses for a user
   * @param {string} userEmail - User's email
   * @returns {Array} Array of connection statuses
   */
  async getAllConnectionStatuses(userEmail) {
    try {
      const { data, error } = await supabase
        .from('social_connections_v2')
        .select('*')
        .eq('user_email', userEmail);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`❌ Error getting all connection statuses:`, error.message);
      return [];
    }
  }

  /**
   * Invalidate cache for a platform
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform name
   * @returns {boolean} Success status
   */
  async invalidateCache(userEmail, platform) {
    try {
      console.log(`🗑️  Invalidating ${platform} cache for ${userEmail}`);

      const { error } = await supabase
        .from('social_media_cache')
        .delete()
        .eq('user_email', userEmail)
        .eq('platform', platform);

      if (error) {
        throw error;
      }

      console.log(`   ✅ Cache invalidated successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error invalidating cache:`, error.message);
      return false;
    }
  }

  /**
   * Log fetch history
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform name
   * @param {string} fetchType - Type of fetch
   * @param {string} status - Fetch status
   * @param {Object} details - Additional details
   * @returns {boolean} Success status
   */
  async logFetchHistory(userEmail, platform, fetchType, status, details = {}) {
    try {
      const historyData = {
        user_email: userEmail,
        platform: platform,
        fetch_type: fetchType,
        fetch_status: status,
        duration_ms: details.duration || null,
        data_size_bytes: details.dataSize || null,
        records_fetched: details.recordCount || 0,
        cache_hit: details.cacheHit || false,
        cache_age_minutes: details.cacheAge || null,
        error_message: details.error || null,
        error_code: details.errorCode || null,
        fetched_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('social_media_fetch_history')
        .insert(historyData);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`❌ Error logging fetch history:`, error.message);
      return false;
    }
  }

  /**
   * Get cache statistics for a user
   * @param {string} userEmail - User's email
   * @returns {Object} Cache statistics
   */
  async getCacheStats(userEmail) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_social_cache_status', { p_user_email: userEmail });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`❌ Error getting cache stats:`, error.message);
      return [];
    }
  }

  /**
   * Clean up expired cache entries
   * @returns {number} Number of deleted entries
   */
  async cleanupExpiredCache() {
    try {
      console.log('🧹 Cleaning up expired cache entries...');

      const { data, error } = await supabase
        .rpc('cleanup_expired_social_cache');

      if (error) {
        throw error;
      }

      console.log(`   ✅ Cleaned up ${data || 0} expired entries`);
      return data || 0;
    } catch (error) {
      console.error(`❌ Error cleaning up cache:`, error.message);
      return 0;
    }
  }
}

export default new SocialMediaCacheService();
