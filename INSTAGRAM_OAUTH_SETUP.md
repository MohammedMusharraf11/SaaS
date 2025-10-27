# Instagram OAuth Setup Guide

## ✅ What Changed

Instagram now uses **OAuth authentication** (like Facebook) instead of a single access token. Each user can connect their own Instagram Business Account!

## 🔧 Setup Required

### 1. Facebook App Configuration

Since Instagram uses Facebook OAuth, you need to configure your Facebook App:

#### Go to Facebook Developers Console
1. Visit: https://developers.facebook.com/apps/
2. Select your app (ID: `2609716136046383`)

#### Add Instagram Permissions
1. Go to **App Review** → **Permissions and Features**
2. Request these permissions:
   - ✅ `instagram_basic` - Basic Instagram account info
   - ✅ `instagram_manage_insights` - Read Instagram insights
   - ✅ `pages_show_list` - List Facebook Pages
   - ✅ `pages_read_engagement` - Read engagement data

3. Click **Request Advanced Access** for each permission

#### Configure OAuth Redirect URIs
1. Go to **Facebook Login** → **Settings**
2. Add these Valid OAuth Redirect URIs:
   ```
   http://localhost:3010/api/auth/instagram/callback
   https://yourdomain.com/api/auth/instagram/callback
   ```

#### Add Instagram Product
1. Go to **Dashboard** → **Add Product**
2. Add **Instagram Graph API**
3. Configure settings

### 2. Environment Variables

Your `.env` already has the required credentials:

```env
INSTAGRAM_APP_ID=2609716136046383
INSTAGRAM_APP_SECRET=ca95c36b88bb93d29e0ff7d53c9d5e39
```

✅ No changes needed!

### 3. Database Setup

The OAuth tokens are stored using `oauthTokenService` which uses Supabase. Make sure your `oauth_tokens` table exists:

```sql
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT,
  scope TEXT,
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  user_email_from_provider VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_email, provider)
);
```

## 🚀 How It Works Now

### User Flow

```
1. User clicks "Connect Instagram"
   ↓
2. Redirects to Facebook OAuth
   ↓
3. User logs in with Facebook
   ↓
4. User grants Instagram permissions
   ↓
5. Facebook redirects back with code
   ↓
6. Backend exchanges code for access token
   ↓
7. Token stored in database (per user)
   ↓
8. User sees their Instagram metrics
```

### Backend Flow

```javascript
// 1. User initiates OAuth
GET /api/auth/instagram?email=user@example.com

// 2. Redirects to Facebook
https://www.facebook.com/v21.0/dialog/oauth?
  client_id=YOUR_APP_ID&
  redirect_uri=http://localhost:3010/api/auth/instagram/callback&
  scope=instagram_basic,instagram_manage_insights,...

// 3. Facebook redirects back
GET /api/auth/instagram/callback?code=...&state=...

// 4. Backend exchanges code for token
POST https://graph.facebook.com/v21.0/oauth/access_token

// 5. Token stored in database
oauthTokenService.storeTokens(email, tokens, 'instagram')

// 6. User redirected to dashboard
Redirect to /dashboard/social?success=true&platform=instagram
```

### Frontend Flow

```javascript
// Check connection status
GET /api/auth/instagram/status?email=user@example.com

// Fetch metrics (uses stored token)
GET /api/instagram/metrics?email=user@example.com&period=month
```

## 📋 API Endpoints

### Authentication
```
GET  /api/auth/instagram                    - Initiate OAuth
GET  /api/auth/instagram/callback           - OAuth callback
GET  /api/auth/instagram/status             - Check connection
POST /api/auth/instagram/disconnect         - Disconnect account
```

### Metrics (all require email parameter)
```
GET /api/instagram/metrics?email=...        - Comprehensive metrics
GET /api/instagram/account?email=...        - Account info
GET /api/instagram/engagement?email=...     - Engagement metrics
GET /api/instagram/top-posts?email=...      - Top posts
GET /api/instagram/follower-growth?email=... - Follower growth
GET /api/instagram/status?email=...         - Connection status
```

## 🧪 Testing

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test OAuth Flow
1. Open dashboard
2. Select "Instagram" from dropdown
3. Click "Connect Instagram"
4. Log in with Facebook
5. Grant Instagram permissions
6. Should redirect back with success

### 4. Verify Token Storage
Check your database:
```sql
SELECT * FROM oauth_tokens WHERE provider = 'instagram';
```

## 🔍 Troubleshooting

### Error: "Invalid OAuth Redirect URI"
**Solution:** Add the redirect URI to your Facebook App settings:
- Go to Facebook Login → Settings
- Add: `http://localhost:3010/api/auth/instagram/callback`

### Error: "Instagram permissions not granted"
**Solution:** 
1. Make sure your Instagram account is a Business or Creator account
2. Ensure it's connected to a Facebook Page
3. You must be an admin of the Facebook Page

### Error: "No Instagram Business Account found"
**Solution:**
1. Convert your Instagram to Business account:
   - Instagram app → Settings → Account → Switch to Professional Account
2. Connect to Facebook Page:
   - Instagram app → Settings → Account → Linked Accounts → Facebook

### Error: "Access token expired"
**Solution:** Tokens expire after 60 days. User needs to reconnect:
1. Click "Disconnect Instagram"
2. Click "Connect Instagram" again

### Error: "Insufficient permissions"
**Solution:** Request advanced access for Instagram permissions in Facebook App Review

## 🔒 Security

### Token Storage
- ✅ Tokens stored in database (not .env)
- ✅ Per-user authentication
- ✅ Encrypted in transit (HTTPS in production)
- ✅ Tokens expire after 60 days

### OAuth State
- ✅ CSRF protection via state parameter
- ✅ State expires after 15 minutes
- ✅ One-time use only

### Best Practices
- ✅ Use HTTPS in production
- ✅ Implement token refresh before expiry
- ✅ Log all OAuth attempts
- ✅ Rate limit OAuth endpoints

## 📊 Comparison: Old vs New

### Old Method (Single Token)
```env
INSTAGRAM_ACCESS_TOKEN=IGAAlFheNA7y9BZA...
```
- ❌ One account for all users
- ❌ Token in .env file
- ❌ Manual token refresh
- ❌ No per-user data

### New Method (OAuth)
```javascript
oauthTokenService.getTokens(email, 'instagram')
```
- ✅ Each user connects their own account
- ✅ Tokens in database
- ✅ Automatic token management
- ✅ Per-user Instagram data

## 🎯 Next Steps

### Immediate
1. ✅ Configure Facebook App permissions
2. ✅ Add OAuth redirect URIs
3. ✅ Test OAuth flow
4. ✅ Verify token storage

### Optional Enhancements
- [ ] Implement automatic token refresh
- [ ] Add token expiry notifications
- [ ] Support multiple Instagram accounts per user
- [ ] Add Instagram Stories insights
- [ ] Implement webhook for real-time updates

## 📞 Support

### Facebook App Issues
- [Facebook App Dashboard](https://developers.facebook.com/apps/)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [App Review Process](https://developers.facebook.com/docs/app-review)

### Code Issues
- Check backend logs for detailed errors
- Verify database connection
- Test OAuth flow step by step
- Check browser console for frontend errors

---

**Status:** ✅ OAuth Implementation Complete  
**Version:** 2.0.0 (OAuth-based)  
**Last Updated:** October 23, 2025
