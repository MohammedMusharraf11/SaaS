-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.competitor_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_domain character varying NOT NULL,
  competitor_domain character varying NOT NULL,
  competitor_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  CONSTRAINT competitor_cache_pkey PRIMARY KEY (id),
  CONSTRAINT fk_competitor_cache_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.google_analytics_cache (
  id integer NOT NULL DEFAULT nextval('google_analytics_cache_id_seq'::regclass),
  user_id text NOT NULL UNIQUE,
  property_id text,
  active_users integer DEFAULT 0,
  sessions integer DEFAULT 0,
  bounce_rate numeric DEFAULT 0,
  avg_session_duration numeric DEFAULT 0,
  page_views integer DEFAULT 0,
  conversions integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  total_social_sessions integer DEFAULT 0,
  total_social_users integer DEFAULT 0,
  total_social_conversions integer DEFAULT 0,
  social_conversion_rate numeric DEFAULT 0,
  social_traffic_percentage numeric DEFAULT 0,
  top_social_sources jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_fetched_at timestamp with time zone DEFAULT now(),
  CONSTRAINT google_analytics_cache_pkey PRIMARY KEY (id),
  CONSTRAINT google_analytics_cache_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_table(id)
);
CREATE TABLE public.lighthouse_cache (
  id integer NOT NULL DEFAULT nextval('lighthouse_cache_id_seq'::regclass),
  user_id text NOT NULL,
  domain text NOT NULL,
  lighthouse_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_fetched_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lighthouse_cache_pkey PRIMARY KEY (id),
  CONSTRAINT lighthouse_cache_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_table(id)
);
CREATE TABLE public.oauth_tokens (
  id integer NOT NULL DEFAULT nextval('oauth_tokens_id_seq'::regclass),
  user_email text NOT NULL,
  provider text NOT NULL DEFAULT 'google'::text,
  access_token text NOT NULL,
  refresh_token text,
  expires_at bigint,
  scope text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT oauth_tokens_pkey PRIMARY KEY (id)
);
CREATE TABLE public.se_ranking_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  domain character varying NOT NULL,
  backlinks_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  CONSTRAINT se_ranking_cache_pkey PRIMARY KEY (id),
  CONSTRAINT fk_se_ranking_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.search_console_cache (
  id integer NOT NULL DEFAULT nextval('search_console_cache_id_seq'::regclass),
  user_id text NOT NULL UNIQUE,
  site_url text NOT NULL,
  domain text,
  total_clicks integer DEFAULT 0,
  total_impressions integer DEFAULT 0,
  average_ctr numeric DEFAULT 0,
  average_position numeric DEFAULT 0,
  organic_traffic integer DEFAULT 0,
  top_queries jsonb,
  top_pages jsonb,
  daily_data jsonb,
  backlinks jsonb,
  lighthouse jsonb,
  date_range_start date,
  date_range_end date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_fetched_at timestamp with time zone DEFAULT now(),
  CONSTRAINT search_console_cache_pkey PRIMARY KEY (id),
  CONSTRAINT search_console_cache_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_table(id)
);
CREATE TABLE public.users_data (
  id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free'::text,
  stripe_id text NOT NULL,
  CONSTRAINT users_data_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users_table (
  id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free'::text,
  stripe_id text DEFAULT ''::text,
  CONSTRAINT users_table_pkey PRIMARY KEY (id)
);