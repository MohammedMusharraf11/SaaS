# Instagram Integration - Verification Checklist

## ✅ Pre-Flight Checklist

Use this checklist to verify your Instagram integration is working correctly.

---

## 1. Configuration ✓

### Environment Variables
- [x] `INSTAGRAM_APP_ID` is set in `.env`
- [x] `INSTAGRAM_APP_SECRET` is set in `.env`
- [x] `INSTAGRAM_ACCESS_TOKEN` is set in `.env`
- [ ] Access token is valid (not expired)
- [ ] Token has required permissions

**Verify:**
```bash
# Check .env file
cat backend/.env | grep INSTAGRAM
```

**Expected:**
```
INSTAGRAM_APP_ID=2609716136046383
INSTAGRAM_APP_SECRET=ca95c36b88bb93d29e0ff7d53c9d5e39
INSTAGRAM_ACCESS_TOKEN=IGAAlFheNA7y9BZA...
```

---

## 2. Backend Files ✓

### New Files Created
- [x] `backend/services/instagramMetricsService.js`
- [x] `backend/routes/instagramMetricsRoutes.js`
- [x] `backend/test-instagram-metrics.js`
- [x] `backend/test-instagram.bat`
- [x] `backend/INSTAGRAM_SETUP.md`

### Modified Files
- [x] `backend/server.js` (Instagram routes added)

**Verify:**
```bash
# Check files exist
ls backend/services/instagramMetricsService.js
ls backend/routes/instagramMetricsRoutes.js
```

---

## 3. Frontend Files ✓

### Modified Files
- [x] `frontend/components/dashboard/SocialDashboard.tsx`

### Changes Made
- [x] Instagram network option added
- [x] InstagramMetrics interface defined
- [x] Instagram state variables added
- [x] Instagram fetch functions implemented
- [x] Instagram UI components added
- [x] Instagram validation logic added

**Verify:**
```bash
# Check file exists
ls frontend/components/dashboard/SocialDashboard.tsx
```

---

## 4. Backend Testing 🧪

### Run Test Script
```bash
cd backend
node test-instagram-metrics.js
```

### Expected Results
- [ ] ✅ Test 1: Get Instagram Account - PASSED
- [ ] ✅ Test 2: Get Engagement Metrics - PASSED
- [ ] ✅ Test 3: Get Top Posts - PASSED
- [ ] ✅ Test 4: Get Follower Growth - PASSED
- [ ] ✅ Test 5: Get Comprehensive Metrics - PASSED

### If Tests Fail
1. Check access token validity
2. Verify Instagram account is Business/Creator
3. Ensure Instagram is linked to Facebook Page
4. Check backend logs for errors

---

## 5. API Endpoints 🔌

### Test Each Endpoint

#### 1. Status Check
```bash
curl http://localhost:3010/api/instagram/status
```
**Expected:** `{"connected": true, "username": "...", "followers": ...}`

#### 2. Account Info
```bash
curl http://localhost:3010/api/instagram/account
```
**Expected:** Account details with username, followers, etc.

#### 3. Comprehensive Metrics
```bash
curl http://localhost:3010/api/instagram/metrics?period=month
```
**Expected:** Full metrics object with engagement, posts, growth

#### 4. Engagement Only
```bash
curl http://localhost:3010/api/instagram/engagement?period=month
```
**Expected:** Engagement metrics only

#### 5. Top Posts
```bash
curl http://localhost:3010/api/instagram/top-posts?limit=5
```
**Expected:** Array of top 5 posts

#### 6. Follower Growth
```bash
curl http://localhost:3010/api/instagram/follower-growth?days=30
```
**Expected:** Array of daily follower data

### Checklist
- [ ] All endpoints return 200 status
- [ ] All endpoints return valid JSON
- [ ] No error messages in response
- [ ] Data looks correct

---

## 6. Frontend Integration 🎨

### Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Dashboard Checks
- [ ] Dashboard loads without errors
- [ ] Network dropdown shows "Instagram" option
- [ ] Selecting Instagram shows connection modal
- [ ] Modal shows "Instagram Connected" message
- [ ] Clicking "View Instagram Metrics" loads data
- [ ] Engagement Score card displays data
- [ ] Follower Growth chart renders
- [ ] Top Posts table shows posts
- [ ] Reputation Benchmark displays score
- [ ] No console errors

### UI Elements
- [ ] Platform status indicator shows green dot
- [ ] Status shows "Instagram: @username"
- [ ] Download Report button appears
- [ ] Timeframe selector works (7d, 30d, 90d)
- [ ] Data updates when timeframe changes

---

## 7. Data Validation 📊

### Check Data Quality
- [ ] Follower count matches Instagram app
- [ ] Engagement numbers seem reasonable
- [ ] Top posts are actually your posts
- [ ] Dates are recent and correct
- [ ] No null or undefined values displayed

### Metrics Verification
- [ ] Likes count > 0
- [ ] Comments count > 0
- [ ] Engagement rate is calculated
- [ ] Reach/Impressions are present
- [ ] Reputation score is between 0-100

---

## 8. Caching 💾

### Test Cache Behavior
1. [ ] Load Instagram metrics (first time)
2. [ ] Check browser console for "Fetching Instagram metrics..."
3. [ ] Refresh page
4. [ ] Check console for "Using cached instagram data"
5. [ ] Wait 31 minutes
6. [ ] Refresh page
7. [ ] Check console for "Fetching Instagram metrics..." (cache expired)

### Cache Verification
```javascript
// In browser console
localStorage.getItem('social_instagram_test@example.com_30d')
```
**Expected:** JSON string with cached data

---

## 9. Error Handling 🛡️

### Test Error Scenarios

#### Invalid Token
1. [ ] Temporarily change token in .env
2. [ ] Restart backend
3. [ ] Try to load Instagram metrics
4. [ ] Should show error message gracefully
5. [ ] Restore correct token

#### Network Error
1. [ ] Stop backend server
2. [ ] Try to load Instagram metrics
3. [ ] Should show "Network error" message
4. [ ] Start backend server

#### Rate Limit
- [ ] Error message displays if rate limit hit
- [ ] Cached data still accessible
- [ ] Retry works after limit resets

---

## 10. Performance ⚡

### Load Time Checks
- [ ] Initial load < 3 seconds
- [ ] Cached load < 500ms
- [ ] No UI freezing
- [ ] Smooth transitions

### API Efficiency
- [ ] Only 1 API call per metric fetch
- [ ] Parallel requests used (Promise.all)
- [ ] No redundant calls
- [ ] Caching reduces API usage

---

## 11. Cross-Platform Consistency 🔄

### Compare with Other Networks
- [ ] Instagram UI matches Facebook style
- [ ] Instagram UI matches LinkedIn style
- [ ] Same card layouts used
- [ ] Consistent color scheme
- [ ] Same interaction patterns

### Network Switching
- [ ] Switch from Facebook to Instagram - works
- [ ] Switch from Instagram to LinkedIn - works
- [ ] Switch from LinkedIn to Instagram - works
- [ ] Data doesn't mix between networks
- [ ] Each network shows correct data

---

## 12. Documentation 📚

### Files Created
- [x] `INSTAGRAM_QUICKSTART.md`
- [x] `INSTAGRAM_INTEGRATION_SUMMARY.md`
- [x] `INSTAGRAM_ARCHITECTURE.md`
- [x] `INSTAGRAM_CHECKLIST.md` (this file)
- [x] `backend/INSTAGRAM_SETUP.md`

### Documentation Quality
- [ ] Setup guide is clear
- [ ] Troubleshooting section is helpful
- [ ] API examples work
- [ ] Architecture diagram is accurate

---

## 13. Security 🔒

### Security Checks
- [ ] `.env` file is in `.gitignore`
- [ ] No tokens in source code
- [ ] No tokens in console logs
- [ ] CORS configured correctly
- [ ] Error messages don't leak sensitive info

---

## 14. Production Readiness 🚀

### Final Checks
- [ ] All tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] TypeScript compiles without errors
- [ ] Backend starts without errors
- [ ] Frontend builds successfully

### Deployment Prep
- [ ] Access token is long-lived (60 days)
- [ ] Token refresh plan in place
- [ ] Monitoring configured
- [ ] Error logging set up
- [ ] Rate limit handling tested

---

## 15. User Acceptance ✨

### User Experience
- [ ] Dashboard is intuitive
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Data is easy to understand
- [ ] Actions are obvious

### Feature Completeness
- [ ] All metrics display correctly
- [ ] Charts render properly
- [ ] Tables are readable
- [ ] Buttons work as expected
- [ ] Navigation is smooth

---

## Summary

### Quick Status Check
```bash
# Run this to verify everything
cd backend
node test-instagram-metrics.js && echo "✅ Backend OK" || echo "❌ Backend Failed"
```

### Overall Status
- [ ] Configuration: Complete
- [ ] Backend: Complete
- [ ] Frontend: Complete
- [ ] Testing: Complete
- [ ] Documentation: Complete
- [ ] Security: Complete
- [ ] Production Ready: Complete

---

## 🎉 Completion

When all items are checked:
- ✅ Instagram integration is complete
- ✅ Ready for production use
- ✅ Fully documented
- ✅ Tested and verified

---

## Need Help?

If any checks fail:
1. Review `backend/INSTAGRAM_SETUP.md`
2. Check backend logs
3. Run test script: `node test-instagram-metrics.js`
4. Verify access token in Graph API Explorer
5. Check Instagram account is Business/Creator type

---

**Last Updated:** October 23, 2025
**Status:** ✅ Ready for Verification
