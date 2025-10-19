# ChangeDetection.io Troubleshooting Guide

## Problem: No ChangeDetection logs or frontend cards displaying

### Quick Diagnostic Steps

#### 1. Test the ChangeDetection Service Directly
```bash
cd backend
node test-changedetection-simple.js
```

**Expected Output:**
```
✅ SUCCESS!
   Domain: pes.edu
   UUID: 80d83b10-6c4f-4dac-b59e-38c01df67d8b
   Last Checked: 1/18/2025, 3:00:00 PM
   Activity Level: active
```

**If this fails:** ChangeDetection API is not working
- Check internet connection
- Verify API is accessible: `curl https://changedetection-competitor.onrender.com/api/v1/watch`
- Check API key is valid

#### 2. Check Backend Logs During Competitor Analysis

**Start backend with verbose logging:**
```bash
cd backend
npm start
```

**Trigger a comparison** from frontend, then look for these log lines:

```
📝 Fetching content changes monitoring for user site...
🔧 ChangeDetection service loaded successfully
📊 ChangeDetection response: { success: true, ... }
✅ Got ChangeDetection monitoring data (15 checks, 3 changes)
📌 Activity Level: active
```

**If you see:**
- `❌ Failed to fetch content changes:` → Service is throwing an error
- `⚠️ ChangeDetection failed: ... falling back` → API returned success: false
- Nothing at all → Code might not be executing

#### 3. Check API Response Structure

**In backend logs, look for:**
```
📊 FINAL RESULT STRUCTURE:
   yourSite.contentChanges: EXISTS ✅
   competitorSite.contentChanges: EXISTS ✅
   comparison.contentChanges: EXISTS ✅
```

**If MISSING:** 
- Check if comparison is being generated correctly
- Verify generateComparison function includes contentChanges

#### 4. Check Frontend Console

**Open browser DevTools (F12), look for:**
```
🔍 CompetitorResults Debug:
   yourSite.contentChanges: EXISTS
   competitorSite.contentChanges: EXISTS
   comparison.contentChanges: EXISTS
   showContentChangesCard: true
```

**If MISSING:**
- Data not being returned from backend
- Check Network tab for /api/competitor/analyze response

### Common Issues & Fixes

#### Issue 1: ChangeDetection service not loaded
**Symptom:** No logs about ChangeDetection at all

**Fix:**
1. Check if file exists: `backend/services/changeDetectionService.js`
2. Verify export: Should have `export default new ChangeDetectionService();` at end
3. Check import in routes: `const changeDetectionService = (await import('../services/changeDetectionService.js')).default;`

#### Issue 2: API timeout or network error
**Symptom:** `❌ Failed to fetch content changes: timeout of 15000ms exceeded`

**Fix:**
1. Check internet connection
2. Verify ChangeDetection.io API is up: https://changedetection-competitor.onrender.com
3. Increase timeout in changeDetectionService.js (line 45): `timeout: 30000`

#### Issue 3: API returns success: false
**Symptom:** `⚠️ ChangeDetection failed: Watch not found`

**Fix:**
1. First run creates watch, may take time
2. Check if watch was created: `node backend/test-change.js`
3. Domain might be inaccessible (check if site is online)

#### Issue 4: contentChanges not in comparison
**Symptom:** Frontend card doesn't show, but logs show data exists

**Fix:**
1. Check `generateComparison` function in `competitorRoutes.js` line ~712
2. Ensure comparison object includes: `contentChanges: null`
3. Ensure comparison logic (lines 963-1070) is executing
4. Check return statement includes contentChanges

#### Issue 5: Frontend card not rendering
**Symptom:** contentChanges exists in data, but card doesn't show

**Fix:**
1. Check condition in `CompetitorResults.tsx` line ~1260:
   ```tsx
   {(yourSite?.contentChanges || competitorSite?.contentChanges || comparison?.contentChanges) && (
   ```
2. Verify `showContentChangesCard` is true (check console logs)
3. Look for TypeScript errors in browser console

### Debugging Commands

#### Test ChangeDetection API directly
```bash
# List all watches
curl -H "x-api-key: 7e9ca5c13eb31b2716fdb8b2c767fe15" \
  https://changedetection-competitor.onrender.com/api/v1/watch

# Add a watch
curl -X POST \
  -H "x-api-key: 7e9ca5c13eb31b2716fdb8b2c767fe15" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://pes.edu","tag":"test"}' \
  https://changedetection-competitor.onrender.com/api/v1/watch
```

#### Test full competitor analysis
```bash
cd backend
node test-api-content.js
```

#### Check what's in the response
```javascript
// Add this to competitorRoutes.js after line 322
console.log('🔍 YOUR SITE contentChanges:', JSON.stringify(yourSiteData.contentChanges, null, 2));
console.log('🔍 COMPETITOR contentChanges:', JSON.stringify(competitorData.contentChanges, null, 2));
console.log('🔍 COMPARISON contentChanges:', JSON.stringify(result.comparison.contentChanges, null, 2));
```

### Environment Variables

**Create `.env` file in backend/ if not exists:**
```bash
CHANGEDETECTION_URL=https://changedetection-competitor.onrender.com
CHANGEDETECTION_API_KEY=7e9ca5c13eb31b2716fdb8b2c767fe15
```

**Note:** These are the defaults in the code, but explicit .env is cleaner

### Verification Checklist

✅ **Backend Service**
- [ ] `changeDetectionService.js` exists
- [ ] File has correct export: `export default new ChangeDetectionService();`
- [ ] `analyzeContentChanges` method exists
- [ ] Returns object with `success`, `monitoring`, `activity` fields

✅ **Routes Integration**
- [ ] `competitorRoutes.js` imports changeDetectionService (line ~606)
- [ ] getCachedUserSiteData calls analyzeContentChanges (line ~608)
- [ ] siteData.contentChanges is assigned (line ~611)
- [ ] generateComparison includes contentChanges in object (line ~715)
- [ ] Comparison logic for contentChanges exists (line ~963-1070)
- [ ] Final logging includes contentChanges (line ~351-352)

✅ **Competitor Service**
- [ ] `competitorService.js` calls changeDetectionService (line ~156)
- [ ] Return object includes contentChanges field (line ~202)

✅ **Frontend Display**
- [ ] `CompetitorResults.tsx` checks for contentChanges (line ~1260)
- [ ] Card renders with activity level, check count, triggers
- [ ] Timestamps formatted correctly (not Unix)
- [ ] showContentChangesCard variable exists (line ~99)

### Step-by-Step Testing

1. **Stop backend server** (Ctrl+C)

2. **Test ChangeDetection service:**
   ```bash
   cd backend
   node test-changedetection-simple.js
   ```
   Should print success with UUID and activity data

3. **Start backend with logging:**
   ```bash
   npm start
   ```

4. **Trigger comparison from frontend:**
   - Enter your domain and competitor domain
   - Click "Analyze Competition"

5. **Watch backend terminal for:**
   ```
   📝 Fetching content changes monitoring for user site...
   🔧 ChangeDetection service loaded successfully
   📊 ChangeDetection response: ...
   ✅ Got ChangeDetection monitoring data ...
   ```

6. **Check frontend console (F12):**
   ```
   🔍 CompetitorResults Debug:
   yourSite.contentChanges: EXISTS
   showContentChangesCard: true
   ```

7. **Look for card titled "Content Changes Monitoring"**
   - Should appear between Traffic and Content Publishing cards
   - Shows activity level badge, check counts, timestamps

### If Still Not Working

**Add extreme debugging:**

In `competitorRoutes.js` after line 610:
```javascript
console.log('🚨 DEBUG - siteData keys:', Object.keys(siteData));
console.log('🚨 DEBUG - siteData.contentChanges:', siteData.contentChanges);
console.log('🚨 DEBUG - Type:', typeof siteData.contentChanges);
```

In `CompetitorResults.tsx` at line ~1262:
```tsx
console.log('🚨 FRONTEND DEBUG');
console.log('yourSite:', yourSite);
console.log('yourSite.contentChanges:', yourSite?.contentChanges);
console.log('competitorSite.contentChanges:', competitorSite?.contentChanges);
console.log('comparison.contentChanges:', comparison?.contentChanges);
console.log('showContentChangesCard:', showContentChangesCard);
```

**Restart everything:**
```bash
# Kill all processes
# Backend
cd backend
npm start

# Frontend (new terminal)
cd frontend  
npm run dev
```

### Contact/Support

If issue persists after all troubleshooting:

1. **Share backend logs** (full output from comparison request)
2. **Share frontend console** (full output from browser DevTools)
3. **Share Network tab response** (from /api/competitor/analyze)
4. **Run diagnostic:** `node backend/test-changedetection-simple.js` and share output

---
**Last Updated:** January 2025
**Version:** 1.0
