# Testing ChangeDetection.io Integration

## Quick Test Guide

### 1. Backend API Test

Test the ChangeDetection.io service directly:

```bash
cd backend
node test-change.js
```

**Expected Output**:
```
Testing ChangeDetection.io Integration...
==========================================

1. Creating watches...
✅ Created watch for https://pes.edu
   UUID: 80d83b10-6c4f-4dac-b59e-38c01df67d8b

2. Listing all watches...
✅ Found 4 watches

3. Getting watch details...
✅ Watch details:
   Title: PES University
   Last checked: 2025-01-18 (3 hours ago)
   Triggers: price, pricing, new, feature, launch

4. Getting watch history...
✅ History count: 1
```

### 2. Full Competitor Analysis Test

Test the complete analysis flow with ChangeDetection data:

```bash
cd backend
node test-api-content.js
```

This will:
1. Start a temporary server on port 5001
2. Make a POST request to `/api/competitor-analysis`
3. Show the full response including both:
   - `contentChanges` (ChangeDetection.io data)
   - `contentUpdates` (RSS/sitemap fallback data)

**Check for**:
- `yourSite.contentChanges.success: true`
- `competitorSite.contentChanges.success: true`
- `comparison.contentChanges.winner: "yours" or "competitor"`

### 3. Frontend Integration Test

Start both servers and test the UI:

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

**Test Steps**:
1. Navigate to `http://localhost:3000/competitor-intelligence`
2. Enter your domain: `pes.edu`
3. Enter competitor: `bits-pilani.ac.in`
4. Click "Analyze Competitor"
5. Wait for analysis to complete (~30-60 seconds)

**Expected UI Elements**:
- ✅ **Content Changes Monitoring** card appears (if ChangeDetection data available)
  - Shows activity level (very active/active/moderate/low/inactive)
  - Displays last checked and last changed timestamps
  - Shows change count and check count
  - Lists trigger keywords as badges
  - Shows days since last change
  
- ✅ **Content Publishing Activity** card appears (RSS/sitemap fallback)
  - Shows content velocity
  - Displays publishing frequency
  - Shows recent posts count

### 4. Console Debug Test

Open browser DevTools Console and look for debug logs:

```javascript
🔍 CompetitorResults Debug:
   yourSite.contentChanges: EXISTS ✅
   competitorSite.contentChanges: EXISTS ✅
   comparison.contentChanges: EXISTS ✅
   showContentChangesCard: true
```

### 5. API Response Test

Check the network tab for the API response structure:

**Endpoint**: `POST /api/competitor-analysis`

**Expected Response Structure**:
```json
{
  "yourSite": {
    "domain": "pes.edu",
    "contentChanges": {
      "success": true,
      "uuid": "80d83b10-6c4f-4dac-b59e-38c01df67d8b",
      "monitoring": {
        "lastChecked": 1760853690,
        "lastChanged": 1760853690,
        "checkCount": 15,
        "changeCount": 3
      },
      "activity": {
        "isActive": true,
        "daysSinceLastChange": 2,
        "changeFrequency": "every 5 days",
        "activityLevel": "active"
      },
      "triggers": ["price", "pricing", "new", "feature", "launch"],
      "history": []
    },
    "contentUpdates": {
      "rss": { "found": true, "totalPosts": 50 },
      "sitemap": { "found": true, "urlCount": 1234 }
    }
  },
  "competitorSite": {
    "domain": "bits-pilani.ac.in",
    "contentChanges": { /* same structure */ },
    "contentUpdates": { /* same structure */ }
  },
  "comparison": {
    "contentChanges": {
      "your": {
        "isMonitored": true,
        "activityLevel": "active",
        "changeCount": 3,
        "checkCount": 15
      },
      "competitor": {
        "isMonitored": true,
        "activityLevel": "moderate",
        "changeCount": 1,
        "checkCount": 10
      },
      "winner": "yours"
    }
  }
}
```

## Troubleshooting

### Issue: No contentChanges field in response

**Solution**:
1. Check backend logs for ChangeDetection API errors
2. Verify environment variables:
   ```bash
   echo $CHANGEDETECTION_API_URL
   echo $CHANGEDETECTION_API_KEY
   ```
3. Test ChangeDetection API directly:
   ```bash
   curl -H "x-api-key: YOUR_KEY" \
     https://changedetection-competitor.onrender.com/api/v1/watch
   ```

### Issue: Frontend card not showing

**Checklist**:
- [ ] `contentChanges` field exists in API response
- [ ] `showContentChangesCard` is true in console debug
- [ ] No React errors in console
- [ ] Component properly imported: `import { Badge } from "@/components/ui/badge"`

### Issue: "No changes detected yet"

**Explanation**: New watches take time to accumulate change history.
- First check creates baseline snapshot
- Subsequent checks detect changes
- Wait 24-48 hours for meaningful data

**Workaround**: Use test domains with frequent updates:
- `blog.google` (very active)
- `techcrunch.com` (very active)
- `github.blog` (active)

### Issue: Activity level shows "inactive"

**Causes**:
1. Site hasn't changed recently
2. Watch was just created (no history)
3. Trigger keywords don't match site content

**Solutions**:
- Wait for more checks to accumulate
- Verify trigger keywords are relevant
- Check watch history manually via API

## Manual API Testing

### Get All Watches
```bash
curl -X GET \
  -H "x-api-key: 7e9ca5c13eb31b2716fdb8b2c767fe15" \
  https://changedetection-competitor.onrender.com/api/v1/watch
```

### Get Watch Details
```bash
curl -X GET \
  -H "x-api-key: 7e9ca5c13eb31b2716fdb8b2c767fe15" \
  https://changedetection-competitor.onrender.com/api/v1/watch/80d83b10-6c4f-4dac-b59e-38c01df67d8b
```

### Create New Watch
```bash
curl -X POST \
  -H "x-api-key: 7e9ca5c13eb31b2716fdb8b2c767fe15" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "trigger_text": ["price", "new", "feature"]
  }' \
  https://changedetection-competitor.onrender.com/api/v1/watch
```

### Delete Watch
```bash
curl -X DELETE \
  -H "x-api-key: 7e9ca5c13eb31b2716fdb8b2c767fe15" \
  https://changedetection-competitor.onrender.com/api/v1/watch/UUID_HERE
```

## Performance Testing

### Load Test
```bash
# Test analysis of 5 competitors
time node backend/test-api-content.js
```

**Expected Timing**:
- Single domain analysis: ~2-3 seconds
- With ChangeDetection API: +500-1000ms
- Total analysis: ~30-60 seconds (includes traffic, social, ads)

### Memory Usage
```bash
# Monitor memory while running
node --trace-gc backend/server.js
```

**Expected Memory**:
- Idle: ~50-100MB
- During analysis: ~150-300MB
- Peak: <500MB

## Success Criteria

✅ **Backend Tests Pass**
- `node test-change.js` shows successful watch operations
- `node test-api-content.js` returns contentChanges data

✅ **API Response Correct**
- Both yourSite and competitorSite have contentChanges field
- comparison.contentChanges exists with winner determination
- contentUpdates still present as fallback

✅ **Frontend Display Working**
- Content Changes Monitoring card renders
- Activity level badge displays correctly
- Timestamps format properly (not Unix timestamps)
- Trigger keywords show as badges
- Comparison insight appears

✅ **Data Accuracy**
- Activity level matches actual site update frequency
- Change counts are reasonable
- Winner determination makes sense
- Timestamps are recent (not ancient)

## Next Steps After Testing

1. **Monitor for 24-48 hours** to accumulate change history
2. **Test with various domain types**:
   - Active blogs (high frequency)
   - Corporate sites (low frequency)
   - E-commerce sites (moderate frequency)
3. **Validate comparison logic** with real competitor data
4. **Fine-tune trigger keywords** based on industry
5. **Implement watch management UI** for manual control

---

**Status**: Ready for testing
**Last Updated**: January 2025
