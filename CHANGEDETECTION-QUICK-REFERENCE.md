# ChangeDetection.io Integration - Quick Reference

## 🎯 Overview
Real-time website content monitoring using ChangeDetection.io API, integrated into competitor analysis workflow.

## 📁 Key Files

### Backend
```
backend/
├── services/
│   ├── changeDetectionService.js    ⭐ NEW - API wrapper (420+ lines)
│   ├── competitorService.js         ✏️ MODIFIED - Added ChangeDetection calls
│   └── contentUpdatesService.js     ✏️ MODIFIED - Now fallback
├── routes/
│   └── competitorRoutes.js          ✏️ MODIFIED - Integration & comparison
├── test-change.js                   ⭐ NEW - Test harness
└── CHANGEDETECTION-INTEGRATION-COMPLETE.md  📚 Full documentation
```

### Frontend
```
frontend/
└── components/
    └── CompetitorResults.tsx        ✏️ MODIFIED - New monitoring card
```

## 🔑 Environment Variables
```bash
CHANGEDETECTION_API_URL=https://changedetection-competitor.onrender.com
CHANGEDETECTION_API_KEY=7e9ca5c13eb31b2716fdb8b2c767fe15
```

## 🚀 Quick Start

### Test ChangeDetection API
```bash
cd backend
node test-change.js
```

### Start Application
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### Access UI
```
http://localhost:3000/competitor-intelligence
```

## 📊 Data Structure

### Request
```javascript
POST /api/competitor-analysis
{
  "yourDomain": "pes.edu",
  "competitorDomain": "bits-pilani.ac.in"
}
```

### Response (Key Fields)
```javascript
{
  yourSite: {
    contentChanges: {              // ⭐ NEW
      success: true,
      uuid: "80d83b10-...",
      monitoring: {
        lastChecked: 1760853690,   // Unix timestamp
        lastChanged: 1760853690,
        checkCount: 15,
        changeCount: 3
      },
      activity: {
        isActive: true,
        daysSinceLastChange: 2,
        changeFrequency: "every 5 days",
        activityLevel: "active"    // very active|active|moderate|low|inactive
      },
      triggers: ["price", "new", "feature"],
      history: [/* snapshots */]
    },
    contentUpdates: {              // Fallback
      rss: { found: true },
      sitemap: { found: true }
    }
  },
  comparison: {
    contentChanges: {              // ⭐ NEW
      your: { activityLevel, changeCount, isActive },
      competitor: { activityLevel, changeCount, isActive },
      winner: "yours" | "competitor" | "tie"
    }
  }
}
```

## 🎨 Frontend Components

### Content Changes Monitoring Card
**Location**: `CompetitorResults.tsx` lines 1254-1480

**Displays**:
- 🎯 Activity level badge (very active → inactive)
- 📊 Check count & change count
- 🕒 Last checked & last changed timestamps
- 📈 Change frequency
- 🏷️ Trigger keywords (badges)
- 💡 Comparison insights

### Content Publishing Activity Card
**Location**: `CompetitorResults.tsx` lines 1482+

**Displays** (RSS/Sitemap fallback):
- 📝 Content velocity
- 📅 Publishing frequency
- 📰 Recent posts count

## 🔧 Key Functions

### changeDetectionService.js
```javascript
// Main analysis method
analyzeContentChanges(domain)
  → Returns: { success, uuid, monitoring, activity, triggers, history }

// Helper methods
addWatch(url, options)          // Create watch
getWatchDetails(uuid)           // Get watch info
getWatchHistory(uuid)           // Get changes
findWatchByUrl(url)             // Find existing watch
```

### Activity Levels
```javascript
Very Active: < 7 days since last change
Active:      7-30 days
Moderate:    30-90 days
Low:         > 90 days
Inactive:    No changes detected
```

### Comparison Logic
```javascript
// Priority scoring
const activityPriority = {
  'very active': 5,
  'active': 4,
  'moderate': 3,
  'low': 2,
  'inactive': 1,
  'unknown': 0
};

// Winner determination
1. Compare activity level scores
2. If tied, compare change counts
3. Result: winner field set to "yours", "competitor", or "tie"
```

## 🐛 Debugging

### Backend Logs
```bash
# Check logs for:
✅ Got ChangeDetection monitoring data (15 checks, 3 changes)
✅ Content Changes (ChangeDetection): ✅
✅ Content Updates (RSS/Sitemap): ✅
```

### Browser Console
```javascript
🔍 CompetitorResults Debug:
   yourSite.contentChanges: EXISTS
   competitorSite.contentChanges: EXISTS
   comparison.contentChanges: EXISTS
   showContentChangesCard: true
```

### API Test
```bash
# Test ChangeDetection API directly
curl -H "x-api-key: 7e9ca5c13eb31b2716fdb8b2c767fe15" \
  https://changedetection-competitor.onrender.com/api/v1/watch
```

## 📈 Activity Level Examples

| Site Type | Activity Level | Change Frequency | Days Since Change |
|-----------|----------------|------------------|-------------------|
| Tech blog | Very Active | every 2 days | 1 |
| News site | Very Active | every day | 0 |
| Product site | Active | every 15 days | 10 |
| Corporate site | Moderate | every 60 days | 45 |
| Static site | Low | every 180 days | 150 |
| Abandoned | Inactive | never | N/A |

## 🎯 Success Indicators

✅ **Backend Working**
- `test-change.js` passes
- Server logs show ChangeDetection API calls
- Response includes contentChanges field

✅ **Frontend Working**
- Content Changes Monitoring card renders
- Activity level badge shows
- Timestamps display correctly (not Unix)
- Trigger keywords appear as badges

✅ **Comparison Working**
- Winner determined correctly
- Activity insight displays
- Summary includes content change mentions

## 🚨 Common Issues

### Issue: contentChanges not in response
**Fix**: Check API key in `.env`, verify ChangeDetection service is up

### Issue: "No changes detected yet"
**Cause**: New watch needs time to accumulate history (24-48 hours)
**Action**: Use test domains with high activity (blog.google, techcrunch.com)

### Issue: Activity level shows "inactive"
**Check**: Watch history count, trigger keywords relevance, site update frequency

### Issue: Timestamps show Unix numbers
**Fix**: Frontend formats timestamps using `new Date(timestamp * 1000)`

## 📊 Performance

| Metric | Value |
|--------|-------|
| API Call Time | 500-1000ms |
| Analysis Time | 2-5s per domain |
| Memory Usage | ~150-300MB during analysis |
| Rate Limit | Per ChangeDetection.io terms |

## 🔄 Data Flow

```
User Request
    ↓
competitorRoutes.js
    ↓
STEP 5: Try ChangeDetection → Fallback to RSS/Sitemap
    ↓
Store both contentChanges & contentUpdates
    ↓
Comparison Logic (activity level scoring)
    ↓
Frontend Display (2 cards)
```

## 📚 Documentation

- **Full Docs**: `backend/CHANGEDETECTION-INTEGRATION-COMPLETE.md`
- **Testing Guide**: `backend/TESTING-CHANGEDETECTION.md`
- **API Docs**: https://changedetection-competitor.onrender.com/docs

## 🎓 Usage Tips

1. **First Analysis**: May show "No changes yet" - normal for new watches
2. **Wait 24-48h**: For meaningful change history
3. **Check Triggers**: Customize keywords for your industry
4. **Monitor Regularly**: Weekly analysis to track competitor activity
5. **Compare Activity**: Look for content velocity differences

## 🔮 Future Enhancements

- [ ] Watch management UI (add/remove/edit)
- [ ] Email notifications on competitor changes
- [ ] Change diff viewer
- [ ] Historical trend charts
- [ ] Custom check intervals
- [ ] Bulk competitor monitoring

---

**Status**: ✅ Fully Implemented
**Version**: 1.0
**Last Updated**: January 2025
**Contact**: See main README for support
