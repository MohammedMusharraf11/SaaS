# How to Test if Cache is Working

## Quick Test

### 1. Open Browser Console (F12)
Before clicking "Analyze", you'll see these logs:

### 2. First Analysis (No Cache)
```
🔍 Checking cache status before analysis...
📊 Cache Status: { cached: false, message: 'No cache found' }
❌ NO CACHE - Will run full analysis
🔍 Sending request to /api/competitor/analyze
... (wait 10-30 seconds) ...
✅ Received response
⏱️ Response Time: 15.23 seconds
📊 Cache Status: ❌ CACHE MISS
🐌 Full analysis takes 10-30 seconds
```

### 3. Second Analysis (With Cache)
Click "Analyze" again on the SAME competitor:

```
🔍 Checking cache status before analysis...
📊 Cache Status: { cached: true, cacheAge: 0, message: 'Cache found! Age: 0 hours' }
✅ CACHE EXISTS - Should return instantly!
   Age: 0 hours
🔍 Sending request to /api/competitor/analyze
✅ Received response
⏱️ Response Time: 0.85 seconds  ← FAST!
📊 Cache Status: ✅ CACHE HIT
⏰ Cache Age: 0 hours
🚀 Cache hit should be < 2 seconds!
```

## What to Look For

### Cache is Working ✅
- Response time < 2 seconds
- Console shows "✅ CACHE HIT"
- Blue alert appears: "Cached Results (Loaded Instantly)"
- Backend logs show: "✅ [CompetitorCache] Cache hit!"

### Cache is NOT Working ❌
- Response time > 10 seconds
- Console shows "❌ CACHE MISS"
- No blue alert
- Backend logs show: "📭 [CompetitorCache] No cache found"

## Manual Cache Check

You can also check cache status manually:

### Using Browser:
```
http://localhost:3010/api/debug/cache-status?email=YOUR_EMAIL&yourSite=YOUR_DOMAIN&competitorSite=COMPETITOR_DOMAIN
```

Example:
```
http://localhost:3010/api/debug/cache-status?email=iammusharraf11@gmail.com&yourSite=agenticforge.tech&competitorSite=pes.edu
```

Response if cached:
```json
{
  "success": true,
  "cached": true,
  "cacheAge": 2,
  "lastUpdated": "2025-10-22T10:30:00.000Z",
  "hasTechnology": true,
  "hasTraffic": true,
  "message": "Cache found! Age: 2 hours"
}
```

Response if not cached:
```json
{
  "success": true,
  "cached": false,
  "message": "No cache found for this analysis"
}
```

## Clear Cache (For Testing)

### Using curl:
```bash
curl -X DELETE http://localhost:3010/api/debug/clear-cache \
  -H "Content-Type: application/json" \
  -d '{
    "email": "YOUR_EMAIL",
    "yourSite": "YOUR_DOMAIN",
    "competitorSite": "COMPETITOR_DOMAIN"
  }'
```

### Using PowerShell:
```powershell
$body = @{
    email = "iammusharraf11@gmail.com"
    yourSite = "agenticforge.tech"
    competitorSite = "pes.edu"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3010/api/debug/clear-cache" -Method DELETE -Body $body -ContentType "application/json"
```

## Backend Logs to Watch

Start your backend with:
```bash
cd backend
npm run dev
```

Watch for these logs:

### Cache Hit:
```
🔍 [CompetitorCache] Checking cache: agenticforge.tech vs pes.edu
✅ [CompetitorCache] Cache hit! Age: 0 hours
✅ Returning cached competitor analysis
```

### Cache Miss:
```
🔍 [CompetitorCache] Checking cache: agenticforge.tech vs pes.edu
📭 [CompetitorCache] No cache found
📭 No cache found, running fresh competitor analysis...
```

## Expected Behavior

| Scenario | Response Time | Cache Status | What Happens |
|----------|--------------|--------------|--------------|
| First analysis | 10-30 sec | MISS | Full analysis, saves to cache |
| Same analysis again | < 2 sec | HIT | Returns from cache instantly |
| Different competitor | 10-30 sec | MISS | New analysis, new cache entry |
| After 7 days | 10-30 sec | EXPIRED | Cache expired, runs fresh |
| Page reload | Instant | localStorage | Shows previous results |

## Troubleshooting

### If cache is not working:

1. **Check SQL was run**:
   - Did you run `fix_competitor_cache_safe.sql` in Supabase?
   - Check for errors in Supabase SQL editor

2. **Check backend logs**:
   - Look for "[CompetitorCache]" prefix
   - Should see "Cache hit!" or "No cache found"

3. **Check database**:
   - Go to Supabase → Table Editor → competitor_cache
   - Should see entries after first analysis

4. **Check user ID**:
   - Backend logs show "Found user ID: ..."
   - Make sure it matches your users_table

5. **Check domains match**:
   - Cache key is: user_id + user_domain + competitor_domain
   - Domains are normalized (no https://, www., trailing slash)
   - Check backend logs for cleaned domains