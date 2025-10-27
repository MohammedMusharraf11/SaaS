# Social Media Metrics - Changes Summary

## What Was Fixed

### Problem
- Engagement metrics (likes, comments, shares, engagement rate) were **hardcoded**
- Top posts didn't show post titles/captions
- No way to click through to actual posts

### Solution
- ✅ All metrics now pull from **real Instagram/Facebook API data**
- ✅ Top posts display **captions with clickable links**
- ✅ Created test script to verify API responses

---

## Files Changed

### Backend Services
1. **`backend/services/instagramMetricsService.js`**
   - Added `fullCaption` field to top posts response
   - Ensures caption is always present (fallback to "(No caption)")

2. **`backend/services/facebookMetricsService.js`**
   - Added `fullCaption` field to top posts response
   - Ensures message is always present (fallback to "(No message)")

### Frontend Component
3. **`frontend/components/SocialMediaMetricsCard.tsx`**
   - Updated interfaces to include `fullCaption` field
   - Modified top posts table to show captions
   - Added clickable links to posts
   - Captions truncate with hover tooltip showing full text

### Test Files
4. **`backend/test-social-metrics.js`** (NEW)
   - Comprehensive test script for both Instagram and Facebook APIs
   - Checks all data fields and structure
   - Color-coded console output for easy debugging

5. **`backend/TEST_SOCIAL_METRICS_README.md`** (NEW)
   - Complete guide on running the test
   - Troubleshooting tips
   - Expected output examples

---

## How to Test

### Step 1: Run the Test Script
```bash
cd backend
# Update TEST_EMAIL in test-social-metrics.js first!
node test-social-metrics.js
```

### Step 2: Check the Output
The test will show:
- ✅ Connection status
- ✅ Engagement metrics (likes, comments, shares, engagement rate)
- ✅ Top posts with captions and URLs
- ✅ Follower growth data
- ✅ Reputation benchmark

### Step 3: View in Frontend
1. Start the frontend: `cd frontend && npm run dev`
2. Navigate to Social Media Performance page
3. Select Instagram or Facebook from dropdown
4. Verify:
   - Engagement metrics show real numbers
   - Top posts display with captions
   - Clicking caption opens post in new tab

---

## Visual Changes

### Before (Hardcoded)
```
Top Performing Post
┌──────────────┬────────┬────────┬──────────┬────────┐
│ Format       │ Reach  │ Likes  │ Comments │ Shares │
├──────────────┼────────┼────────┼──────────┼────────┤
│ Single Image │ 27.2K  │ 3K     │ 1K       │ 2.7K   │
│ Video        │ 25.3K  │ 2.4K   │ 1K       │ 1K     │
└──────────────┴────────┴────────┴──────────┴────────┘

Engagement Score: 82% (hardcoded)
Likes: 8.2K (hardcoded)
Comments: 3.4K (hardcoded)
Shares: 7.1K (hardcoded)
```

### After (Dynamic with Captions)
```
Top Performing Post
┌────────────────────────────────┬────────┬────────┬──────────┬────────┐
│ Post                           │ Reach  │ Likes  │ Comments │ Shares │
├────────────────────────────────┼────────┼────────┼──────────┼────────┤
│ Single Image                   │ 2.5K   │ 500    │ 50       │ 10     │
│ 🔗 Check out our latest...     │        │        │          │        │
├────────────────────────────────┼────────┼────────┼──────────┼────────┤
│ Video                          │ 3.2K   │ 650    │ 75       │ 15     │
│ 🔗 Behind the scenes of...     │        │        │          │        │
└────────────────────────────────┴────────┴────────┴──────────┴────────┘

Engagement Score: 70% (calculated from real engagement rate)
Likes: 1.5K (from API)
Comments: 0.3K (from API)
Shares: 0.05K (from API)
```

---

## API Response Structure

### Instagram Metrics Response
```json
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
    "impressions": 15000,
    "profileViews": 500
  },
  "topPosts": [
    {
      "format": "Single Image",
      "reach": "2.5K",
      "likes": "500",
      "comments": "50",
      "shares": "10",
      "caption": "Check out our latest product...",
      "url": "https://www.instagram.com/p/ABC123/",
      "fullCaption": "Check out our latest product launch! 🚀 #newproduct"
    }
  ],
  "followerGrowth": [...],
  "reputationBenchmark": {
    "score": 75,
    "followers": 1234,
    "avgEngagementRate": 3.5,
    "sentiment": "Good"
  }
}
```

### Facebook Metrics Response
```json
{
  "dataAvailable": true,
  "pageName": "Your Page Name",
  "engagementScore": {
    "likes": 2000,
    "comments": 400,
    "shares": 100,
    "engagementRate": 4.2,
    "reach": 15000
  },
  "topPosts": [
    {
      "format": "Post",
      "reach": "3.5K",
      "likes": "600",
      "comments": "80",
      "shares": "20",
      "caption": "Exciting news from our team...",
      "url": "https://www.facebook.com/123456789/posts/987654321",
      "fullCaption": "Exciting news from our team! We're launching something special."
    }
  ],
  "followerGrowth": [...],
  "reputationBenchmark": {...}
}
```

---

## Key Features

### 1. Dynamic Engagement Metrics
- Real likes, comments, shares from API
- Calculated engagement rate based on reach
- Formatted numbers (1500 → 1.5K)

### 2. Clickable Post Captions
- Each post shows truncated caption (100 chars)
- Hover to see full caption in tooltip
- Click to open post in new tab
- Works for both Instagram and Facebook

### 3. Smart Fallbacks
- If API fails, shows mock data
- If no caption, shows "(No caption)"
- If not connected, shows connection prompt

### 4. Real-time Updates
- Data refreshes when changing network
- Data refreshes when changing timeframe
- Automatic user email detection from Supabase

---

## Testing Checklist

- [ ] Run test script successfully
- [ ] Verify Instagram API returns data
- [ ] Verify Facebook API returns data
- [ ] Check engagement metrics are dynamic
- [ ] Verify top posts show captions
- [ ] Test clicking post links
- [ ] Test hover tooltip on captions
- [ ] Test switching between networks
- [ ] Test changing timeframes
- [ ] Verify fallback to mock data when not connected

---

## Troubleshooting

### Issue: "Still seeing hardcoded values"
**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for API errors
4. Run test script to verify API is working

### Issue: "No captions showing"
**Solution:**
1. Check if posts have captions in Instagram/Facebook
2. Run test script to see if `caption` field is in response
3. Check browser console for errors

### Issue: "Links not working"
**Solution:**
1. Verify `url` field is present in API response
2. Check if URL is valid Instagram/Facebook post URL
3. Ensure popup blocker isn't blocking new tabs

---

## Next Steps

1. **Run the test script** to verify everything works
2. **Check the frontend** to see dynamic data
3. **Test with real accounts** that have posts
4. **Monitor console** for any errors
5. **Report any issues** with specific error messages
