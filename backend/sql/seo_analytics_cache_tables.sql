-- ============================================
-- SEO Analytics Cache Tables
-- ============================================
-- Purpose: Cache Google Search Console (GSC) and Google Analytics (GA) data
-- to avoid refetching on every page load/navigation
-- Data is refreshed only when older than 1 hour
-- ============================================

-- Table 1: Search Console (GSC) Cache
-- Stores all GSC data including queries, pages, daily metrics, backlinks, and lighthouse
CREATE TABLE IF NOT EXISTS public.search_console_cache (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users_table(id) ON DELETE CASCADE,
    
    -- Site information
    site_url TEXT NOT NULL,
    domain TEXT,
    
    -- Aggregated metrics
    total_clicks INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    average_ctr DECIMAL(5,4) DEFAULT 0,
    average_position DECIMAL(6,2) DEFAULT 0,
    organic_traffic INTEGER DEFAULT 0,
    
    -- Top queries (stored as JSON array)
    top_queries JSONB,
    
    -- Top pages (stored as JSON array)
    top_pages JSONB,
    
    -- Daily data for graphs (stored as JSON array)
    daily_data JSONB,
    
    -- Backlinks data (stored as JSON object)
    backlinks JSONB,
    
    -- Lighthouse/PageSpeed data (stored as JSON object)
    lighthouse JSONB,
    
    -- Date range information
    date_range_start DATE,
    date_range_end DATE,
    
    -- Cache metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one cache entry per user
    UNIQUE(user_id)
);

-- Table 2: Google Analytics (GA4) Cache
-- Stores GA4 data including metrics and social media data
CREATE TABLE IF NOT EXISTS public.google_analytics_cache (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users_table(id) ON DELETE CASCADE,
    
    -- Property information
    property_id TEXT,
    
    -- Main metrics
    active_users INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration DECIMAL(10,2) DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Social media metrics
    total_social_sessions INTEGER DEFAULT 0,
    total_social_users INTEGER DEFAULT 0,
    total_social_conversions INTEGER DEFAULT 0,
    social_conversion_rate DECIMAL(5,2) DEFAULT 0,
    social_traffic_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Top social sources (stored as JSON array)
    top_social_sources JSONB,
    
    -- Cache metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one cache entry per user
    UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_console_cache_user_id ON public.search_console_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_search_console_cache_updated_at ON public.search_console_cache(updated_at);
CREATE INDEX IF NOT EXISTS idx_google_analytics_cache_user_id ON public.google_analytics_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_google_analytics_cache_updated_at ON public.google_analytics_cache(updated_at);

-- Add comments for documentation
COMMENT ON TABLE public.search_console_cache IS 'Caches Google Search Console data to avoid refetching on every page load. Data is refreshed when older than 1 hour.';
COMMENT ON TABLE public.google_analytics_cache IS 'Caches Google Analytics (GA4) data to avoid refetching on every page load. Data is refreshed when older than 1 hour.';

COMMENT ON COLUMN public.search_console_cache.top_queries IS 'Array of top 10 search queries with clicks, impressions, CTR, and position';
COMMENT ON COLUMN public.search_console_cache.top_pages IS 'Array of top 10 pages with clicks, impressions, CTR, and position';
COMMENT ON COLUMN public.search_console_cache.daily_data IS 'Array of daily metrics for graphs (date, clicks, impressions, CTR, position)';
COMMENT ON COLUMN public.search_console_cache.backlinks IS 'Object containing backlinks data (topLinkingSites, topLinkingPages, totalBacklinks, etc.)';
COMMENT ON COLUMN public.search_console_cache.lighthouse IS 'Object containing Lighthouse/PageSpeed data (performance, accessibility, SEO scores, etc.)';

COMMENT ON COLUMN public.google_analytics_cache.top_social_sources IS 'Array of top social media sources with sessions, users, conversions, and bounce rate';
