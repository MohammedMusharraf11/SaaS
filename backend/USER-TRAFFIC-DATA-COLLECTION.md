# How User Site Traffic Data is Collected

## Overview
The system uses a **tiered approach** to collect traffic data for the user's website:

```
Priority 1: Google Analytics (GA4) → Connected via OAuth
Priority 2: Google Search Console (GSC) → Connected via OAuth  
Priority 3: SimilarWeb API → Fallback for estimates
```

---

## Detailed Flow

### 1. User's Site Traffic (Your Website)

#### Step 1: Check Google Analytics Connection
The system first checks if the user has connected their Google Analytics (GA4) property:

**Location:** `backend/services/userAnalyticsService.js`

```javascript
async getUserAnalyticsData(email, propertyId = null)
```

**What it does:**
- Uses OAuth2 client to authenticate with user's Google account
- Fetches last 30 days of analytics data via Google Analytics Data API
- Returns metrics including:
  - Active users
  - Sessions (used as visits)
  - Bounce rate
  - Average session duration
  - Page views
  - Conversions
  - Revenue

**Data Source:** Real data from user's GA4 property (most accurate)

#### Step 2: Fallback to SimilarWeb (if GA not available)
If Google Analytics is not connected or fails, the system falls back to SimilarWeb:

**Location:** `backend/services/similarWebTrafficService.js`

```javascript
async getCompetitorTraffic(domain)
```

**What it does:**
- Calls SimilarWeb Traffic API via RapidAPI
- Gets estimated traffic data
- Less accurate than GA but provides industry-wide comparison

---

### 2. Competitor Traffic

For competitor websites, we **always use SimilarWeb** because we don't have access to their Google Analytics:

**API Endpoint:** `https://similarweb-traffic.p.rapidapi.com/traffic?domain={domain}`

**Metrics Returned:**
- Monthly visits
- Average visit duration
- Pages per visit
- Bounce rate
- Traffic sources breakdown (direct, search, social, referral, mail, paid)
- Global rank, country rank, category rank

---

## OAuth Connection Flow

### How Users Connect Google Analytics

1. **User clicks "Connect Google Analytics"** in the dashboard
2. **OAuth Flow Starts:**
   - Redirects to Google OAuth consent screen
   - User grants permissions for Analytics read-only access
   - Google returns authorization code
3. **Token Storage:**
   - Access token and refresh token stored in `backend/data/oauth_tokens.json`
   - Tokens are encrypted and associated with user's email
4. **Auto-Refresh:**
   - When access token expires (1 hour), system automatically refreshes it
   - No user intervention needed

**OAuth Scopes Required:**
```javascript
'https://www.googleapis.com/auth/analytics.readonly'
'https://www.googleapis.com/auth/webmasters.readonly' // For GSC
```

---

## Code Integration

### In competitorService.js

```javascript
async analyzeSingleSite(domain, email = null, isUserSite = false) {
  // ... other analysis ...
  
  // NEW: Get traffic data
  let trafficResult;
  if (isUserSite && email) {
    // For user's site, try GA/GSC first
    try {
      const gaData = await userAnalyticsService.getUserAnalyticsData(email);
      if (gaData && gaData.sessions) {
        trafficResult = {
          success: true,
          source: 'google_analytics',
          data: gaData,
          metrics: {
            monthlyVisits: Object.values(gaData.sessions || {}).reduce((a, b) => a + b, 0),
            avgDailyVisits: Object.values(gaData.sessions || {}).reduce((a, b) => a + b, 0) / 
                           Object.keys(gaData.sessions || {}).length
          }
        };
      } else {
        // Fallback to SimilarWeb
        trafficResult = await similarWebTrafficService.getCompetitorTraffic(domain);
      }
    } catch (err) {
      // Fallback to SimilarWeb
      trafficResult = await similarWebTrafficService.getCompetitorTraffic(domain);
    }
  } else {
    // For competitor, use SimilarWeb
    trafficResult = await similarWebTrafficService.getCompetitorTraffic(domain);
  }
  
  return {
    // ... other metrics ...
    traffic: trafficResult
  };
}
```

---

## Data Accuracy

### Google Analytics (User's Site)
✅ **Highly Accurate**
- Real data from actual website
- Updated in near real-time
- Includes all traffic sources
- Most reliable for decision-making

### SimilarWeb (Competitor Sites)
⚠️ **Estimated/Modeled Data**
- Based on panel data and algorithms
- Good for general trends and comparisons
- May not be accurate for smaller sites (<10k monthly visits)
- Best for competitive analysis and benchmarking

---

## Example Response

### User's Site (with GA connected):
```json
{
  "traffic": {
    "success": true,
    "source": "google_analytics",
    "metrics": {
      "monthlyVisits": 45230,
      "avgVisitDuration": 185,
      "pagesPerVisit": 3.2,
      "bounceRate": 42.5
    }
  }
}
```

### Competitor Site (via SimilarWeb):
```json
{
  "traffic": {
    "success": true,
    "source": "similarweb_rapidapi",
    "metrics": {
      "monthlyVisits": 125000,
      "avgVisitDuration": 210,
      "pagesPerVisit": 4.1,
      "bounceRate": 38.2,
      "trafficSources": {
        "direct": 32.5,
        "search": 45.2,
        "social": 12.8,
        "referral": 9.5
      },
      "globalRank": 125432
    },
    "trends": [
      { "month": "2025-05", "visits": 118000 },
      { "month": "2025-06", "visits": 122000 },
      { "month": "2025-07", "visits": 125000 }
    ]
  }
}
```

---

## Frontend Display

The frontend (`CompetitorResults.tsx`) shows:

1. **Traffic Comparison Card**
   - Monthly visits for both sites
   - Bounce rate, pages per visit, avg duration
   - Traffic sources breakdown (pie charts)
   - Winner badge

2. **Traffic Gap Insight**
   - Visual indicator of traffic difference
   - Recommendations if competitor has more traffic

3. **Data Source Badge**
   - Shows where data came from (GA vs SimilarWeb)
   - Helps users understand accuracy level

---

## Setup Requirements

### Environment Variables
```env
# RapidAPI Key for SimilarWeb
RAPIDAPI_KEY=your_rapidapi_key_here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

### User Actions Required
1. **Connect Google Analytics:**
   - Go to Dashboard
   - Click "Connect Google Analytics"
   - Authorize the app
   - Select GA4 property

2. **Enter Website URL:**
   - Must match the domain in GA4 property
   - System automatically links them via email

---

## Benefits of This Approach

### For User's Site:
✅ Real, accurate data from GA4
✅ No API costs for traffic data
✅ Historical data available
✅ Trust in data accuracy

### For Competitor Analysis:
✅ No need for competitor's GA access
✅ Industry-standard estimation (SimilarWeb)
✅ Good for benchmarking and comparison
✅ Identify traffic gaps and opportunities

### Fallback Protection:
✅ If GA connection fails, SimilarWeb provides estimate
✅ System never breaks due to missing data
✅ Clear indication of data source to user

---

## Troubleshooting

### "No traffic data available for your site"
**Cause:** Google Analytics not connected
**Solution:** 
1. Click "Connect Google Analytics" in dashboard
2. Complete OAuth flow
3. Re-run competitor analysis

### "Traffic data shows N/A"
**Cause:** SimilarWeb doesn't have data for small sites
**Solution:** 
- Connect Google Analytics for accurate data
- Or wait for site to grow (>5k monthly visits for SimilarWeb coverage)

### "Authentication token expired"
**Cause:** OAuth refresh token expired (rare)
**Solution:**
1. Disconnect Google Analytics
2. Reconnect with OAuth flow
3. Tokens will be refreshed

---

## Future Enhancements

Potential improvements:
1. Add Google Search Console traffic metrics
2. Support multiple GA4 properties per user
3. Historical traffic trend charts
4. Traffic forecasting using AI
5. Traffic source optimization recommendations
6. Competitor traffic alerts (when they spike)
