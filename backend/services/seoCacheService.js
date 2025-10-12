import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not configured for cache service');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Cache duration: 1 hour (in milliseconds)
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const seoCacheService = {
  /**
   * Check if cached data is still valid (less than 1 hour old)
   */
  isCacheValid(lastFetchedAt) {
    if (!lastFetchedAt) return false;
    const cacheAge = Date.now() - new Date(lastFetchedAt).getTime();
    return cacheAge < CACHE_DURATION;
  },

  /**
   * Get user ID from email
   */
  async getUserIdByEmail(email) {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    console.log('🔍 Looking up user by email:', email);

    const { data, error } = await supabase
      .from('users_table')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching user ID:', error);
      return null;
    }

    if (!data) {
      console.warn('⚠️ No user found with email:', email);
      return null;
    }

    console.log('✅ Found user ID:', data.id);
    return data.id;
  },

  /**
   * Get cached Search Console data
   */
  async getSearchConsoleCache(email) {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not configured, skipping cache');
        return null;
      }

      const userId = await this.getUserIdByEmail(email);
      if (!userId) {
        console.warn('⚠️ User not found in database');
        return null;
      }

      const { data, error } = await supabase
        .from('search_console_cache')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No cache entry found
          console.log('📭 No cache entry found for Search Console');
          return null;
        }
        console.error('❌ Error fetching Search Console cache:', error);
        return null;
      }

      // Check if cache is still valid
      if (!this.isCacheValid(data.last_fetched_at)) {
        console.log('⏰ Search Console cache expired');
        return null;
      }

      console.log('✅ Using cached Search Console data');
      return {
        dataAvailable: true,
        totalClicks: data.total_clicks,
        totalImpressions: data.total_impressions,
        averageCTR: parseFloat(data.average_ctr),
        averagePosition: parseFloat(data.average_position),
        organicTraffic: data.organic_traffic,
        topQueries: data.top_queries,
        topPages: data.top_pages,
        dailyData: data.daily_data,
        lighthouse: data.lighthouse,
        backlinks: data.backlinks,
        siteUrl: data.site_url,
        domain: data.domain,
        dateRange: {
          startDate: data.date_range_start,
          endDate: data.date_range_end
        },
        lastUpdated: data.last_fetched_at,
        fromCache: true
      };
    } catch (error) {
      console.error('❌ Error in getSearchConsoleCache:', error);
      return null;
    }
  },

  /**
   * Save Search Console data to cache
   */
  async saveSearchConsoleCache(email, data) {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not configured, skipping cache save');
        return false;
      }

      const userId = await this.getUserIdByEmail(email);
      if (!userId) {
        console.warn('⚠️ User not found in database, cannot save cache');
        return false;
      }

      const cacheData = {
        user_id: userId,
        site_url: data.siteUrl || '',
        domain: data.domain || '',
        total_clicks: data.totalClicks || 0,
        total_impressions: data.totalImpressions || 0,
        average_ctr: data.averageCTR || 0,
        average_position: data.averagePosition || 0,
        organic_traffic: data.organicTraffic || 0,
        top_queries: data.topQueries || [],
        top_pages: data.topPages || [],
        daily_data: data.dailyData || [],
        backlinks: data.backlinks || {},
        lighthouse: data.lighthouse || null,
        date_range_start: data.dateRange?.startDate || null,
        date_range_end: data.dateRange?.endDate || null,
        updated_at: new Date().toISOString(),
        last_fetched_at: new Date().toISOString()
      };

      // Upsert (insert or update)
      const { error } = await supabase
        .from('search_console_cache')
        .upsert(cacheData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ Error saving Search Console cache:', error);
        return false;
      }

      console.log('✅ Search Console data cached successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in saveSearchConsoleCache:', error);
      return false;
    }
  },

  /**
   * Get cached Google Analytics data
   */
  async getGoogleAnalyticsCache(email) {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not configured, skipping cache');
        return null;
      }

      const userId = await this.getUserIdByEmail(email);
      if (!userId) {
        console.warn('⚠️ User not found in database');
        return null;
      }

      const { data, error } = await supabase
        .from('google_analytics_cache')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No cache entry found
          console.log('📭 No cache entry found for Google Analytics');
          return null;
        }
        console.error('❌ Error fetching Google Analytics cache:', error);
        return null;
      }

      // Check if cache is still valid
      if (!this.isCacheValid(data.last_fetched_at)) {
        console.log('⏰ Google Analytics cache expired');
        return null;
      }

      console.log('✅ Using cached Google Analytics data');
      return {
        propertyId: data.property_id,
        activeUsers: data.active_users,
        sessions: data.sessions,
        bounceRate: parseFloat(data.bounce_rate),
        avgSessionDuration: parseFloat(data.avg_session_duration),
        pageViews: data.page_views,
        conversions: data.conversions,
        revenue: parseFloat(data.revenue),
        dataAvailable: true,
        connected: true,
        lastUpdated: data.last_fetched_at,
        fromCache: true
      };
    } catch (error) {
      console.error('❌ Error in getGoogleAnalyticsCache:', error);
      return null;
    }
  },

  /**
   * Save Google Analytics data to cache
   */
  async saveGoogleAnalyticsCache(email, data) {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not configured, skipping cache save');
        return false;
      }

      const userId = await this.getUserIdByEmail(email);
      if (!userId) {
        console.warn('⚠️ User not found in database, cannot save cache');
        return false;
      }

      const cacheData = {
        user_id: userId,
        property_id: data.propertyId || null,
        active_users: data.activeUsers || 0,
        sessions: data.sessions || 0,
        bounce_rate: data.bounceRate || 0,
        avg_session_duration: data.avgSessionDuration || 0,
        page_views: data.pageViews || 0,
        conversions: data.conversions || 0,
        revenue: data.revenue || 0,
        total_social_sessions: data.totalSocialSessions || 0,
        total_social_users: data.totalSocialUsers || 0,
        total_social_conversions: data.totalSocialConversions || 0,
        social_conversion_rate: data.socialConversionRate || 0,
        social_traffic_percentage: data.socialTrafficPercentage || 0,
        top_social_sources: data.topSocialSources || [],
        updated_at: new Date().toISOString(),
        last_fetched_at: new Date().toISOString()
      };

      // Upsert (insert or update)
      const { error } = await supabase
        .from('google_analytics_cache')
        .upsert(cacheData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ Error saving Google Analytics cache:', error);
        return false;
      }

      console.log('✅ Google Analytics data cached successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in saveGoogleAnalyticsCache:', error);
      return false;
    }
  },

  /**
   * Get cached Social Media metrics
   */
  async getSocialMediaCache(email) {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not configured, skipping cache');
        return null;
      }

      const userId = await this.getUserIdByEmail(email);
      if (!userId) {
        console.warn('⚠️ User not found in database');
        return null;
      }

      const { data, error } = await supabase
        .from('google_analytics_cache')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📭 No cache entry found for Social Media');
          return null;
        }
        console.error('❌ Error fetching Social Media cache:', error);
        return null;
      }

      // Check if cache is still valid
      if (!this.isCacheValid(data.last_fetched_at)) {
        console.log('⏰ Social Media cache expired');
        return null;
      }

      console.log('✅ Using cached Social Media data');
      return {
        totalSocialSessions: data.total_social_sessions,
        totalSocialUsers: data.total_social_users,
        totalSocialConversions: data.total_social_conversions,
        socialConversionRate: parseFloat(data.social_conversion_rate),
        socialTrafficPercentage: parseFloat(data.social_traffic_percentage),
        topSocialSources: data.top_social_sources || [],
        dataAvailable: true,
        connected: true,
        lastUpdated: data.last_fetched_at,
        fromCache: true
      };
    } catch (error) {
      console.error('❌ Error in getSocialMediaCache:', error);
      return null;
    }
  },

  /**
   * Clear cache for a user (useful for manual refresh)
   */
  async clearUserCache(email) {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not configured');
        return false;
      }

      const userId = await this.getUserIdByEmail(email);
      if (!userId) {
        return false;
      }

      // Delete both caches
      await supabase.from('search_console_cache').delete().eq('user_id', userId);
      await supabase.from('google_analytics_cache').delete().eq('user_id', userId);
      await supabase.from('lighthouse_cache').delete().eq('user_id', userId);

      console.log('✅ Cache cleared for user');
      return true;
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      return false;
    }
  },

  /**
   * Get cached Lighthouse data for a specific domain
   * @param {string} email - User email
   * @param {string} domain - Domain to get Lighthouse data for
   * @param {boolean} ignoreExpiry - If true, return data even if expired (for fallback)
   */
  async getLighthouseCache(email, domain, ignoreExpiry = false) {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not configured, skipping cache');
        return null;
      }

      const userId = await this.getUserIdByEmail(email);
      if (!userId) {
        console.warn('⚠️ User not found in database');
        return null;
      }

      const { data, error } = await supabase
        .from('lighthouse_cache')
        .select('*')
        .eq('user_id', userId)
        .eq('domain', domain)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📭 No cache entry found for Lighthouse');
          return null;
        }
        console.error('❌ Error fetching Lighthouse cache:', error);
        return null;
      }

      // Check if cache is still valid (unless ignoreExpiry is true)
      if (!ignoreExpiry && !this.isCacheValid(data.last_fetched_at)) {
        console.log('⏰ Lighthouse cache expired');
        return null;
      }

      if (ignoreExpiry) {
        console.log('✅ Using expired Lighthouse cache (fallback mode)');
      } else {
        console.log('✅ Using cached Lighthouse data');
      }

      return data.lighthouse_data;
    } catch (error) {
      console.error('❌ Error in getLighthouseCache:', error);
      return null;
    }
  },

  /**
   * Save Lighthouse data to cache
   * @param {string} email - User email
   * @param {string} domain - Domain the data is for
   * @param {object} lighthouseData - Lighthouse analysis results
   */
  async saveLighthouseCache(email, domain, lighthouseData) {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not configured, skipping cache save');
        return false;
      }

      if (!lighthouseData) {
        console.warn('⚠️ No lighthouse data to cache');
        return false;
      }

      const userId = await this.getUserIdByEmail(email);
      if (!userId) {
        console.warn('⚠️ User not found in database, cannot save cache');
        return false;
      }

      const cacheData = {
        user_id: userId,
        domain: domain,
        lighthouse_data: lighthouseData,
        updated_at: new Date().toISOString(),
        last_fetched_at: new Date().toISOString()
      };

      // Upsert (insert or update) - use compound unique constraint on user_id + domain
      const { error } = await supabase
        .from('lighthouse_cache')
        .upsert(cacheData, {
          onConflict: 'user_id,domain',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ Error saving Lighthouse cache:', error);
        return false;
      }

      console.log('✅ Lighthouse data cached successfully for domain:', domain);
      return true;
    } catch (error) {
      console.error('❌ Error in saveLighthouseCache:', error);
      return false;
    }
  }
};

export default seoCacheService;
