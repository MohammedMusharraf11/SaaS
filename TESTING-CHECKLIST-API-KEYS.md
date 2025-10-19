# Testing Checklist - After API Key Updates

## ✅ Pre-Test Verification

1. **Backend Status**: 
   - [ ] Backend server restarted after .env update
   - [ ] Check terminal for "🚀 SEO Health Score API running on port 3010"
   - [ ] No errors in backend logs

2. **API Keys Updated** (in backend/.env):
   - [x] CHANGE_DETECTION_API_KEY
   - [x] RAPIDAPI_KEY (Facebook/Instagram)
   - [x] SEARCHAPI_KEY (Google Ads)

## 🧪 Testing Steps

### Test 1: Instagram Engagement
1. Open http://localhost:3002 (or your frontend URL)
2. Navigate to Competitor Intelligence
3. **Select a competitor** (or create new analysis)
4. Make sure Instagram usernames are filled:
   - Your Instagram: `rvcollegeofengineering`
   - Competitor Instagram: `pesuniversity`
5. Click **Analyze**
6. Open Browser DevTools (F12) → Console tab
7. **Look for**:
   ```
   📱 YOUR INSTAGRAM FULL STRUCTURE: {
     "success": true,
     "profile": {
       "username": "rvcollegeofengineering",
       "followers": 12963,
       "avgEngagementRate": 0.0235,
       ...
     },
     "engagement": {
       "summary": {
         "avgLikesPerPost": 304,
         "avgCommentsPerPost": 65,
         ...
       }
     }
   }
   ```
8. **Switch to "Social Media" view**
9. **Expected Results**:
   - ✅ Instagram card shows followers (not 0)
   - ✅ Engagement Rate shows percentage (not N/A)
   - ✅ Avg Likes shows number (not N/A)
   - ✅ Avg Comments shows number (not N/A)
   - ✅ Best Posting Days shows badges (not N/A)

### Test 2: Facebook Engagement
1. In same analysis, check Facebook usernames:
   - Your Facebook: `RVCEngineering`
   - Competitor Facebook: `pesuniversity`
2. **Look in Console for**:
   ```
   📘 YOUR FACEBOOK FULL STRUCTURE: {
     "success": true,
     "profile": {
       "username": "RVCEngineering",
       "likes": 45000,
       ...
     },
     "metrics": {
       "followers": 48000,
       ...
     }
   }
   ```
3. **Expected Results**:
   - ✅ Facebook card shows page likes
   - ✅ Shows followers
   - ✅ Engagement rate displays
   - ✅ Avg Reactions/Comments/Shares show

### Test 3: ChangeDetection.io (Content Updates)
1. **Switch to "Content" view**
2. **Look in Backend Logs for**:
   ```
   ✅ Found existing ChangeDetection watch for: agenticforge.tech
   ✅ ChangeDetection data retrieved
   ```
3. **Expected Results**:
   - ✅ ChangeDetection.io card appears (orange border)
   - ✅ Activity Level shows (Very Active/Active/Moderate/etc.)
   - ✅ Total Checks shows number
   - ✅ Changes Found shows number
   - ✅ Recent changes history displays

### Test 4: Google Ads Monitoring
1. **Switch to "Ads" view**
2. **Look in Backend Logs for**:
   ```
   ✅ Got competitor Google Ads data (Total Ads: X)
   ```
3. **Expected Results**:
   - ✅ Google Ads card shows (yellow border)
   - ✅ Total Active Ads shows number (not 0)
   - ✅ Display Ads vs Search Ads breakdown
   - ✅ Estimated Budget displays
   - ✅ Top Keywords show (if available)

### Test 5: Meta Ads Monitoring
1. Still in "Ads" view
2. **Look in Backend Logs for**:
   ```
   ✅ Got competitor Meta Ads data (Total Ads: X)
   ```
3. **Expected Results**:
   - ✅ Meta Ads card shows (blue border)
   - ✅ Total Active Ads shows number
   - ✅ Facebook Ads vs Instagram Ads breakdown
   - ✅ Estimated Spend displays
   - ✅ Ad Formats show (if available)

### Test 6: Technical SEO View
1. **Switch to "Technical Analysis" view**
2. **Expected Results**:
   - ✅ Technology Stack card appears
   - ✅ Security metrics card appears
   - ✅ Performance comparison cards appear (ONLY in this view)
   - ✅ Shows CMS, Frameworks, Analytics
   - ✅ Shows HTTPS, CDN, robots.txt, Sitemap

## 🐛 Troubleshooting

### If Instagram Still Shows N/A:
1. Check browser console for structure
2. Verify followers > 0 in console log
3. Clear browser cache (Ctrl+Shift+R)
4. Check if `yourSite.instagram.profile.followers` exists in console

### If Facebook Still Shows N/A:
1. Check backend logs for errors
2. Look for "429" errors (rate limit)
3. If "429", wait a few minutes and try again
4. Check console log for data structure

### If ChangeDetection Fails:
1. Check backend logs for "Invalid access - API key invalid"
2. Verify API key format in .env (no quotes, no spaces)
3. Try getting new API key from changedetection.io
4. Check if domain is accessible publicly

### If Ads Data Missing:
1. Check backend logs for quota errors
2. Verify SearchApi.io key is valid
3. Verify RapidAPI key is valid
4. Check API dashboards for usage limits

## 📊 Backend Log Patterns to Look For

### ✅ Success Patterns:
```
✅ Found Instagram account: [name] (@username)
   Followers: [number]
✅ Got Instagram engagement data ([number] followers)

✅ Got Facebook engagement data ([number] followers)

✅ Found existing ChangeDetection watch for: [domain]
✅ ChangeDetection data retrieved

✅ Got competitor Google Ads data (Total Ads: [number])
✅ Got competitor Meta Ads data (Total Ads: [number])
```

### ❌ Error Patterns to Watch:
```
❌ Error fetching Instagram CID: [reason]
❌ Error fetching Facebook page info: [reason]
❌ Invalid access - API key invalid
❌ You have exceeded the MONTHLY quota
❌ Request failed with status code 429
```

## 🎯 Expected Final State

After successful analysis with all APIs working:

**Social Media View**:
- Instagram: Followers, Engagement %, Likes, Comments, Best Days ✅
- Facebook: Likes, Followers, Engagement %, Reactions, Comments, Shares ✅

**Content View**:
- ChangeDetection.io card with activity monitoring ✅
- Recent changes history ✅

**Ads View**:
- Google Ads card with campaign details ✅
- Meta Ads card with platform breakdown ✅

**Technical View**:
- Technology stack comparison ✅
- Security analysis ✅
- Performance metrics ✅

## 📝 Quick Debug Commands

### In Browser Console:
```javascript
// After analysis completes, check data:
// (Response will be in Network tab or printed to console)

// Look for these console logs:
"📱 YOUR INSTAGRAM FULL STRUCTURE:"
"📘 YOUR FACEBOOK FULL STRUCTURE:"
"🔍 CompetitorResults FULL DEBUG:"
```

### In Backend Terminal:
```bash
# Watch logs in real-time
tail -f logs.txt

# Or just run the server with console output
npm start
```

## ✨ Success Indicators

You'll know everything is working when you see:

1. **Console shows data structures** with real numbers
2. **No N/A values** in engagement metrics
3. **Cards display** with colored borders
4. **Numbers are formatted** with commas (12,963 not 12963)
5. **Percentages show** with % symbol
6. **Badges appear** for posting days, monitoring status
7. **Backend logs show ✅** for all services
8. **No API errors** in backend logs

---

**Ready to Test?** Run a fresh analysis and check each view! 🚀

**Need Help?** Check browser console and backend logs for specific error messages.
