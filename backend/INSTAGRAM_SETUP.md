# Instagram Metrics Integration Guide

## Overview
This integration allows you to fetch Instagram Business Account metrics using the Instagram Graph API. It provides comprehensive analytics including engagement metrics, top posts, follower growth, and reputation benchmarks.

## Prerequisites

### 1. Instagram Business Account
- You must have an Instagram Business Account or Creator Account
- The Instagram account must be connected to a Facebook Page
- You need to be an admin of the Facebook Page

### 2. Facebook App Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the **Instagram Graph API** product to your app
4. Configure the following permissions:
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_read_engagement`
   - `pages_show_list`

### 3. Get Your Access Token

#### Option A: Using Graph API Explorer (Recommended for Testing)
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click "Generate Access Token"
4. Select the required permissions:
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_read_engagement`
   - `pages_show_list`
5. Copy the generated access token

#### Option B: Using OAuth Flow (Production)
1. Implement Facebook OAuth in your application
2. Request the required permissions during login
3. Exchange the short-lived token for a long-lived token (60 days)
4. Store the token securely in your database

### 4. Get a Long-Lived Access Token
Short-lived tokens expire in 1 hour. Convert to long-lived (60 days):

```bash
curl -i -X GET "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
# Instagram Configuration
INSTAGRAM_APP_ID=your_facebook_app_id
INSTAGRAM_APP_SECRET=your_facebook_app_secret
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token
```

### Current Configuration
Your `.env` file already has:
```env
INSTAGRAM_APP_ID=2609716136046383
INSTAGRAM_APP_SECRET=ca95c36b88bb93d29e0ff7d53c9d5e39
INSTAGRAM_ACCESS_TOKEN=IGAAlFheNA7y9BZAFRFUXhqMHdMSk9abjgzNlNvUUx2QVcwclM5TlhudDJlNlZADVEtic2EzODhRMGNIWjNtc0JoaHJDRTZAWQk1xMl9LS3hSNDViUHk0ZAWZAnZAksya3FqVHJHTHlwMFpwaDdxdXpYdlhxa3oySDRnZAWhiQ0VGdFgxQQZDZD
```

## API Endpoints

### 1. Get Comprehensive Metrics
```
GET /api/instagram/metrics?period=month
```

**Response:**
```json
{
  "dataAvailable": true,
  "username": "your_username",
  "accountId": "123456789",
  "name": "Your Name",
  "engagementScore": {
    "likes": 1250,
    "comments": 85,
    "saves": 42,
    "shares": 18,
    "engagementRate": 3.45,
    "reach": 15000,
    "impressions": 22500,
    "profileViews": 850
  },
  "followerGrowth": [...],
  "topPosts": [...],
  "reputationBenchmark": {
    "score": 78,
    "followers": 5420,
    "avgEngagementRate": 3.45,
    "sentiment": "Excellent"
  }
}
```

### 2. Get Account Info
```
GET /api/instagram/account
```

### 3. Get Engagement Metrics
```
GET /api/instagram/engagement?period=month
```

### 4. Get Top Posts
```
GET /api/instagram/top-posts?limit=10
```

### 5. Get Follower Growth
```
GET /api/instagram/follower-growth?days=30
```

### 6. Check Connection Status
```
GET /api/instagram/status
```

## Available Metrics

### Account Insights (Daily)
- **Impressions**: Total number of times posts were viewed
- **Reach**: Unique accounts that saw your posts
- **Profile Views**: Number of times your profile was viewed
- **Follower Count**: Current follower count

### Post Insights
- **Impressions**: Times the post was viewed
- **Reach**: Unique accounts that saw the post
- **Likes**: Number of likes
- **Comments**: Number of comments
- **Saves**: Number of times saved
- **Shares**: Number of times shared

### Calculated Metrics
- **Engagement Rate**: (Total Engagement / Reach) × 100
- **Reputation Score**: Composite score based on engagement, followers, and activity
- **Follower Growth**: Daily follower changes

## Testing

### Run the Test Script
```bash
cd backend
node test-instagram-metrics.js
```

Or use the batch file:
```bash
cd backend
test-instagram.bat
```

### Expected Output
```
🧪 Testing Instagram Metrics Service
============================================================

📸 Test 1: Get Instagram Account
------------------------------------------------------------
✅ Account retrieved successfully
   Username: @your_username
   Name: Your Name
   Followers: 5,420
   Posts: 142

📊 Test 2: Get Engagement Metrics (Last 30 days)
------------------------------------------------------------
✅ Engagement metrics retrieved
   Impressions: 22,500
   Reach: 15,000
   Profile Views: 850
   Likes: 1,250
   Comments: 85
   Engagement Rate: 3.45%

... (more tests)
```

## Frontend Integration

The Instagram metrics are already integrated into the Social Dashboard:

1. **Network Selector**: Choose "Instagram" from the dropdown
2. **Auto-Connection**: Instagram connects automatically using the access token
3. **Metrics Display**: View engagement score, follower growth, top posts, and reputation benchmark
4. **Caching**: Data is cached for 30 minutes to reduce API calls

### Usage in Frontend
```typescript
// The dashboard automatically detects Instagram connection
// and fetches metrics when the Instagram network is selected

// Network state
const [network, setNetwork] = useState<'facebook' | 'instagram' | 'linkedin'>('instagram')

// Instagram data
const [instagramData, setInstagramData] = useState<InstagramMetrics | null>(null)
```

## API Rate Limits

### Instagram Graph API Limits
- **Rate Limit**: 200 calls per hour per user
- **Daily Limit**: 4,800 calls per day per user
- **Insights**: 30-day rolling window for most metrics

### Best Practices
1. **Cache Data**: Cache metrics for 30 minutes to reduce API calls
2. **Batch Requests**: Fetch multiple metrics in a single request when possible
3. **Error Handling**: Implement retry logic with exponential backoff
4. **Token Refresh**: Monitor token expiration and refresh before expiry

## Troubleshooting

### Error: "No Instagram Business Account connected"
**Solution**: Ensure your Instagram account is:
1. Converted to a Business or Creator account
2. Connected to a Facebook Page
3. You have admin access to the Facebook Page

### Error: "Invalid OAuth access token"
**Solution**: 
1. Generate a new access token
2. Ensure all required permissions are granted
3. Check if the token has expired (60 days for long-lived tokens)

### Error: "Insufficient permissions"
**Solution**: 
1. Go to Graph API Explorer
2. Regenerate token with all required permissions:
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_read_engagement`
   - `pages_show_list`

### Error: "Insights not available"
**Solution**:
- Insights are only available for Instagram Business/Creator accounts
- Some metrics require a minimum follower count (100+)
- Recent posts (< 24 hours) may not have complete insights

### Error: "Rate limit exceeded"
**Solution**:
1. Implement caching (already done in frontend)
2. Reduce polling frequency
3. Wait for the rate limit window to reset (1 hour)

## Security Best Practices

1. **Never commit tokens**: Keep `.env` in `.gitignore`
2. **Use environment variables**: Store sensitive data in `.env`
3. **Rotate tokens regularly**: Refresh tokens before expiration
4. **Limit permissions**: Only request necessary permissions
5. **Monitor usage**: Track API calls to avoid rate limits

## Additional Resources

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Instagram Insights API](https://developers.facebook.com/docs/instagram-api/guides/insights)
- [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Instagram Graph API documentation
3. Test your access token in Graph API Explorer
4. Check the backend logs for detailed error messages

## Changelog

### Version 1.0.0 (Current)
- ✅ Instagram Business Account integration
- ✅ Comprehensive metrics (engagement, posts, followers)
- ✅ Frontend dashboard integration
- ✅ Caching system (30-minute cache)
- ✅ Error handling and fallbacks
- ✅ Test suite included
