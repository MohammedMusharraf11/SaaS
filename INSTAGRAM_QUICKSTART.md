# Instagram Integration - Quick Start Guide

## ✅ What's Done

Instagram metrics are now fully integrated into your social media dashboard! Here's what you can do:

## 🚀 Quick Start (3 Steps)

### Step 1: Verify Configuration
Your `.env` file already has Instagram credentials:
```env
INSTAGRAM_APP_ID=2609716136046383
INSTAGRAM_APP_SECRET=ca95c36b88bb93d29e0ff7d53c9d5e39
INSTAGRAM_ACCESS_TOKEN=IGAAlFheNA7y9BZAFRFUXhqMHdMSk9abjgzNlNvUUx2QVcwclM5TlhudDJlNlZADVEtic2EzODhRMGNIWjNtc0JoaHJDRTZAWQk1xMl9LS3hSNDViUHk0ZAWZAnZAksya3FqVHJHTHlwMFpwaDdxdXpYdlhxa3oySDRnZAWhiQ0VGdFgxQQZDZD
```
✅ No changes needed!

### Step 2: Test the Integration
```bash
cd backend
node test-instagram-metrics.js
```

Expected output:
```
✅ Account retrieved successfully
   Username: @your_username
   Followers: X,XXX
✅ Engagement metrics retrieved
✅ Top posts loaded
✅ All tests completed successfully!
```

### Step 3: Use in Dashboard
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Open dashboard
4. Select **"Instagram"** from network dropdown
5. View your metrics! 📊

## 📊 What You'll See

### Engagement Score Card
- Likes, Comments, Saves
- Engagement Rate
- Real-time data from Instagram

### Follower Growth Chart
- 30-day trend visualization
- Daily follower changes
- Growth indicators

### Top Performing Posts
- Best 4 posts by engagement
- Reach, likes, comments, saves
- Direct links to posts

### Reputation Benchmark
- Overall score (0-100)
- Pentagon visualization
- Sentiment analysis

## 🎯 Key Features

✅ **Auto-Connection**: Uses access token from .env (no OAuth needed)
✅ **Real-Time Data**: Fetches live metrics from Instagram Graph API
✅ **Smart Caching**: 30-minute cache to reduce API calls
✅ **Beautiful UI**: Matches Facebook and LinkedIn design
✅ **Error Handling**: Graceful fallbacks if data unavailable

## 📱 Available Metrics

- **Impressions**: Total post views
- **Reach**: Unique accounts reached
- **Profile Views**: Profile page visits
- **Likes**: Total likes on posts
- **Comments**: Total comments
- **Saves**: Times posts were saved
- **Engagement Rate**: (Engagement / Reach) × 100
- **Follower Count**: Current followers
- **Follower Growth**: Daily changes

## 🔧 API Endpoints

All endpoints are ready to use:

```
GET /api/instagram/metrics?period=month
GET /api/instagram/account
GET /api/instagram/engagement?period=month
GET /api/instagram/top-posts?limit=10
GET /api/instagram/follower-growth?days=30
GET /api/instagram/status
```

## ⚠️ Important Notes

### Requirements:
- ✅ Instagram Business or Creator Account
- ✅ Connected to a Facebook Page
- ✅ Valid access token (expires in 60 days)

### Rate Limits:
- 200 calls/hour per user
- 4,800 calls/day per user
- Caching helps stay within limits

### Token Expiration:
Your access token expires in **60 days**. When it expires:
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Generate new token with same permissions
3. Update `INSTAGRAM_ACCESS_TOKEN` in `.env`
4. Restart backend server

## 🐛 Troubleshooting

### "No Instagram Business Account"
→ Convert your Instagram to Business account and link to Facebook Page

### "Invalid OAuth token"
→ Generate new token in Graph API Explorer

### "Insights not available"
→ Need 100+ followers for some metrics

### "Rate limit exceeded"
→ Wait 1 hour or check caching is working

## 📚 Documentation

- **Full Setup Guide**: `backend/INSTAGRAM_SETUP.md`
- **Integration Summary**: `INSTAGRAM_INTEGRATION_SUMMARY.md`
- **Test Script**: `backend/test-instagram-metrics.js`

## 🎉 You're All Set!

Instagram is now integrated alongside Facebook and LinkedIn. Just select "Instagram" from the dropdown and start viewing your metrics!

---

**Need Help?**
- Check `backend/INSTAGRAM_SETUP.md` for detailed troubleshooting
- Run `test-instagram-metrics.js` to diagnose issues
- Check backend logs for error messages
