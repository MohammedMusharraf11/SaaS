# Testing Competitor Intelligence Feature

## Quick Test Guide

### Prerequisites
1. ✅ Backend server running on `http://localhost:5000`
2. ✅ Frontend server running on `http://localhost:3000`
3. ✅ Supabase database table `competitor_cache` created
4. ✅ SE Ranking API key configured in backend
5. ✅ User logged in to get email

### Test 1: First Analysis (Cache Miss)
**Expected Flow:**
```
User Input → API Call → Fetch User's Cached Data → Fetch Competitor Fresh Data → Display Results
```

**Steps:**
1. Navigate to Competitor Intelligence page
2. Enter your site: `example.com`
3. Enter competitor: `competitor.com`
4. Click "Analyze Competition"
5. Wait 15-25 seconds (fresh data fetch)

**Expected Result:**
- ✅ Loading spinner shows "Analyzing..."
- ✅ Results display with backlinks comparison
- ✅ Your site shows "Cached" badge
- ✅ Competitor shows "Fresh Data" badge
- ✅ NO cache alert banner (first request)

**Backend Logs:**
```
📊 Competitor Analysis Request:
   Your Site: example.com
   Competitor: competitor.com
📭 No cache found, running fresh competitor analysis...
   📦 Fetching cached data for user site: example.com
   ✅ Found cached Lighthouse data
   ✅ Found cached SE Ranking backlinks
   🔗 Fetching SE Ranking backlinks for competitor: competitor.com
   ✅ Got competitor backlinks data
```

---

### Test 2: Second Analysis (Cache Hit)
**Expected Flow:**
```
User Input → API Call → Return Cached Comparison → Display Results (< 1 second)
```

**Steps:**
1. Use SAME inputs as Test 1
2. Click "Analyze Competition"
3. Results should appear instantly

**Expected Result:**
- ✅ Results appear in < 1 second
- ✅ Blue cache alert banner appears at top
- ✅ Alert says "Results loaded from cache (7-day cache)"
- ✅ "Refresh now" button available in alert
- ✅ Response includes `"cached": true`

**Backend Logs:**
```
📊 Competitor Analysis Request:
   Your Site: example.com
   Competitor: competitor.com
✅ Returning cached competitor analysis
```

---

### Test 3: Different Competitor (Partial Cache)
**Expected Flow:**
```
User Input → API Call → Use Cached User Data → Fetch New Competitor → Display Results
```

**Steps:**
1. Enter your site: `example.com` (same as before)
2. Enter competitor: `different-competitor.com` (NEW)
3. Click "Analyze Competition"

**Expected Result:**
- ✅ Takes 10-15 seconds (only fetching competitor)
- ✅ Your site data loads instantly (from cache)
- ✅ Competitor data fetches fresh
- ✅ NO cache alert (new comparison)

**Backend Logs:**
```
📊 Competitor Analysis Request:
   Your Site: example.com
   Competitor: different-competitor.com
📭 No cache found, running fresh competitor analysis...
   📦 Fetching cached data for user site: example.com
   ✅ Found cached Lighthouse data
   ✅ Found cached SE Ranking backlinks
   🔗 Fetching SE Ranking backlinks for competitor: different-competitor.com
```

---

### Test 4: Force Refresh
**Expected Flow:**
```
User Input with forceRefresh=true → Fetch All Fresh Data → Update Cache → Display
```

**Steps:**
1. Use cached comparison from Test 2
2. Click "Refresh now" button in cache alert
3. Wait for fresh analysis

**Expected Result:**
- ✅ Cache alert disappears
- ✅ Loading spinner appears
- ✅ Fresh data fetched for competitor
- ✅ Cached data still used for your site (efficient!)
- ✅ New comparison saved to cache

---

### Test 5: Backlinks Display
**Check All Metrics:**
```
✅ Total Backlinks (large number, prominent)
✅ Referring Domains
✅ Referring IPs
✅ Referring Subnets
✅ DoFollow Links
✅ Comparison difference calculation
✅ Winner badge (green "You're Leading" or red "Competitor Leading")
```

**Expected UI:**
- Blue card for your site
- Red card for competitor site
- Grid layout with metrics
- Difference summary at bottom
- Numbers formatted with commas (1,234)

---

### Test 6: No Backlinks Data
**Scenario:** Competitor has no backlinks in SE Ranking

**Steps:**
1. Enter competitor with no backlinks data
2. Analyze

**Expected Result:**
- ✅ Backlinks section still appears
- ✅ Shows "No backlinks data available" message
- ✅ Other sections (Performance, SEO) still work
- ✅ No JavaScript errors in console

---

### Test 7: Missing User Email
**Scenario:** User not logged in or session expired

**Steps:**
1. Clear browser session/cookies
2. Try to analyze

**Expected Result:**
- ✅ Error message: "User session not found. Please refresh the page."
- ✅ Analyze button disabled or shows error
- ✅ No API call made

---

## Visual Verification

### 1. Cache Alert Banner
```
┌─────────────────────────────────────────────────────┐
│ 🕐 Results loaded from cache (7-day cache). Data is │
│    up to 7 days old. Refresh now                    │
└─────────────────────────────────────────────────────┘
```
- Light blue background (`bg-blue-50`)
- Clock icon
- Underlined "Refresh now" link

### 2. Backlinks Comparison Card
```
┌─────────────────────────────────────────────────────┐
│ 🔗 Backlinks Comparison      [You're Leading 🏆]    │
│ Backlink profile analysis from SE Ranking           │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [YOUR SITE]              [COMPETITOR]              │
│  example.com 📦Cached     competitor.com 🆕Fresh    │
│                                                      │
│  Total Backlinks          Total Backlinks           │
│  1,234                    987                       │
│                                                      │
│  Referring Domains: 456   Referring Domains: 234    │
│  Referring IPs: 389       Referring IPs: 198        │
│  Referring Subnets: 312   Referring Subnets: 167    │
│  DoFollow Links: 890      DoFollow Links: 567       │
│                                                      │
├─────────────────────────────────────────────────────┤
│         Backlinks Difference: +247                  │
│         Your Total: 1,234  | Competitor: 987        │
└─────────────────────────────────────────────────────┘
```

---

## API Testing (Postman/curl)

### Test Request
```bash
curl -X POST http://localhost:5000/api/competitor/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "yourSite": "example.com",
    "competitorSite": "competitor.com",
    "forceRefresh": false
  }'
```

### Expected Response (First Call - Cache Miss)
```json
{
  "success": true,
  "cached": false,
  "yourSite": {
    "domain": "example.com",
    "fromCache": true,
    "backlinks": {
      "total_backlinks": 1234,
      "referring_domains": 456,
      "referring_ips": 389,
      "referring_subnets": 312,
      "dofollow": 890,
      "nofollow": 344
    },
    "lighthouse": {
      "performance": 85,
      "seo": 92
    }
  },
  "competitor": {
    "domain": "competitor.com",
    "fromCache": false,
    "backlinks": {
      "total_backlinks": 987,
      "referring_domains": 234
    },
    "lighthouse": {
      "performance": 78,
      "seo": 88
    }
  },
  "comparison": {
    "backlinks": {
      "yours": 1234,
      "competitor": 987,
      "difference": 247,
      "winner": "yours"
    },
    "summary": [
      "🔗 Stronger backlink profile",
      "🎉 Your site is significantly faster"
    ],
    "overallWinner": "yours"
  },
  "timestamp": "2025-10-12T10:30:00.000Z"
}
```

### Expected Response (Second Call - Cache Hit)
```json
{
  "success": true,
  "cached": true,
  // ... same data as above ...
}
```

---

## Database Verification

### Check Cache Entry
```sql
SELECT 
  user_domain,
  competitor_domain,
  created_at,
  expires_at,
  (competitor_data->>'comparison'->'backlinks'->>'winner') as backlinks_winner
FROM competitor_cache
WHERE user_id = 'test@example.com'
ORDER BY created_at DESC
LIMIT 5;
```

### Verify Cache Duration
```sql
SELECT 
  user_domain,
  competitor_domain,
  expires_at - created_at AS cache_duration,
  now() < expires_at AS is_valid
FROM competitor_cache
WHERE user_id = 'test@example.com';
```

**Expected:** `cache_duration` should be `7 days`

---

## Performance Benchmarks

| Scenario | Expected Time | Cache Used |
|----------|--------------|------------|
| First analysis (both fresh) | 20-30 seconds | None |
| Same comparison (cached) | < 500ms | Competitor cache |
| Different competitor (user cached) | 10-15 seconds | User's Lighthouse + SE Ranking |
| Force refresh | 15-25 seconds | User's data only |

---

## Error Handling Tests

### Test 1: Invalid Domain
```json
{"yourSite": "invalid", "competitorSite": "competitor.com"}
```
**Expected:** Error message "Please enter a valid URL"

### Test 2: Missing Email
```json
{"yourSite": "example.com", "competitorSite": "competitor.com"}
// No email field
```
**Expected:** 400 error "User email is required for caching"

### Test 3: SE Ranking API Failure
**Expected:** 
- Backlinks section shows "No backlinks data available"
- Other sections still work
- Comparison continues without backlinks data

---

## Console Logs to Check

**Browser Console:**
- ✅ No React errors
- ✅ No TypeScript errors
- ✅ Successful API responses (200 status)

**Backend Console:**
- ✅ Cache hit/miss logs
- ✅ SE Ranking API calls logged
- ✅ No uncaught errors

---

## Success Criteria

- [ ] Cache works correctly (hit/miss)
- [ ] Backlinks display for both sites
- [ ] Cache alert shows on cached results
- [ ] Refresh button works
- [ ] Performance improves on cached requests (20-50x faster)
- [ ] SE Ranking only called for backlinks (not other metrics)
- [ ] Graceful handling of missing data
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Database entries created correctly

---

**Test Duration:** ~15 minutes  
**Critical Tests:** 1, 2, 5 (cache, backlinks display)  
**Nice to Have:** 6, 7 (error handling)
