# Social Media Metrics API Test Guide

## Overview
This test script verifies that the Instagram and Facebook metrics APIs are working correctly and returning the expected data structure.

## Prerequisites

1. **Backend server must be running**
   ```bash
   cd backend
   npm start
   ```

2. **User must have connected their social media accounts**
   - Instagram: Via OAuth flow at `/api/auth/instagram`
   - Facebook: Via OAuth flow at `/api/auth/facebook`

3. **Update the test email**
   - Open `backend/test-social-metrics.js`
   - Change `TEST_EMAIL` to your actual email address (the one you used to connect accounts)

## Running the Test

```bash
cd backend
node test-social-metrics.js
```

## What the Test Checks

### Instagram Metrics (`/api/instagram/metrics`)
- ✅ Engagement Score (likes, comments, shares, saves, engagement rate, reach, impressions)
- ✅ Top Posts (format, reach, likes, comments, shares, caption, URL)
- ✅ Follower Growth (daily follower data with net changes)
- ✅ Reputation Benchmark (score, sentiment, followers, avg engagement rate)

### Facebook Metrics (`/api/facebook/metrics`)
- ✅ Engagement Score (likes, comments, shares, engagement rate, reach)
- ✅ Top Posts (format, reach, likes, comments, shares, message, URL)
- ✅ Follower Growth (daily follower data with net changes)
- ✅ Reputation Benchmark (score, sentiment, followers, avg engagement rate)

### Connection Status
- ✅ Instagram connection status
- ✅ Username and follower count

## Expected Output

### Success Case
```
🚀 Starting Social Media Metrics API Tests
📧 Test Email: your@email.com
🌐 Base URL: http://localhost:5000

============================================================
TESTING INSTAGRAM CONNECTION STATUS
============================================================

ℹ️  Fetching: http://localhost:5000/api/instagram/status?email=your@email.com
✅ Instagram connected: @your_username
   Followers: 1234

============================================================
TESTING INSTAGRAM METRICS
============================================================

ℹ️  Fetching: http://localhost:5000/api/instagram/metrics?email=your@email.com&period=month
✅ Instagram API Response received

📊 Response Structure:
{
  "dataAvailable": true,
  "username": "your_username",
  "engagementScore": {
    "likes": 1500,
    "comments": 300,
    "shares": 50,
    "saves": 100,
    "engagementRate": 3.5,
    "reach": 10000,
    "impressions": 15000
  },
  "topPosts": [...],
  "followerGrowth": [...],
  "reputationBenchmark": {...}
}

✅ Data is available

💬 Engagement Score:
   Likes: 1500
   Comments: 300
   Shares: 50
   Saves: 100
   Engagement Rate: 3.5%
   Reach: 10000
   Impressions: 15000

📝 Top Posts (4 posts):
   Post 1:
      Format: Single Image
      Reach: 2.5K
      Likes: 500
      Comments: 50
      Shares: 10
      Caption: Check out our latest product launch! 🚀...
      URL: https://www.instagram.com/p/ABC123/
...
```

### Error Case (Not Connected)
```
❌ Instagram API test failed
   Status: 500
   Data: {
     "dataAvailable": false,
     "reason": "No Instagram access token found. Please connect your Instagram account."
   }
```

## Troubleshooting

### "No access token found"
- **Solution**: Connect your Instagram/Facebook account via the OAuth flow
- Navigate to: `http://localhost:3000/dashboard` and click "Connect Instagram" or "Connect Facebook"

### "Email parameter is required"
- **Solution**: Update the `TEST_EMAIL` variable in `test-social-metrics.js`

### "Connection refused" or "ECONNREFUSED"
- **Solution**: Make sure the backend server is running on port 5000
- Run: `cd backend && npm start`

### "No Facebook pages found"
- **Solution**: Make sure your Facebook account has at least one page
- You need to be an admin of a Facebook page to fetch metrics

### "Instagram Business Account not found"
- **Solution**: Your Instagram account must be:
  1. A Business or Creator account
  2. Connected to a Facebook page
  3. You must have admin access to that Facebook page

## Frontend Integration

After confirming the API works, the frontend component at `frontend/components/SocialMediaMetricsCard.tsx` will:

1. Fetch data from these endpoints
2. Display engagement metrics dynamically
3. Show top posts with captions and clickable links
4. Render follower growth charts
5. Display reputation benchmark scores

## New Features Added

### Post Titles/Captions
- Top posts now include captions/messages
- Captions are clickable links to the actual posts
- Hover over caption to see full text (truncated to 100 chars in display)
- Opens in new tab when clicked

### Data Structure
```javascript
topPosts: [
  {
    format: "Single Image",
    reach: "2.5K",
    likes: "500",
    comments: "50",
    shares: "10",
    caption: "Check out our latest product...",  // Truncated
    fullCaption: "Check out our latest product launch! 🚀 #newproduct",  // Full text
    url: "https://www.instagram.com/p/ABC123/"
  }
]
```

## Next Steps

1. Run the test to verify API responses
2. Check that all data fields are present
3. Verify the frontend displays the data correctly
4. Test with different timeframes (7d, 30d, 90d)
5. Test switching between Instagram and Facebook
