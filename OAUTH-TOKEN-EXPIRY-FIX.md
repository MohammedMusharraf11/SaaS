# OAuth Token Expiry Fix

## Issue
User connected Google Analytics and Search Console last night (~10 PM). Today when logging in:
- No metrics displayed
- Should show cached data OR prompt to reconnect
- Backend logs show: `❌ Error fetching sites: invalid_grant`

## Root Cause
The `searchConsoleRoutes.js` was still using the **old file-based token system** instead of the **new persistent OAuth system** with auto-refresh.

### What Was Wrong:
1. **File-based tokens** → Manual token refresh logic
2. **No auto-refresh** → Tokens expired after 1 hour
3. **No reconnect prompt** → Frontend didn't handle `needsReconnect` flag
4. **Inconsistent** → userAnalyticsService used oauthTokenService, but searchConsoleRoutes didn't

## Solution

### Backend Changes

#### 1. Updated `searchConsoleRoutes.js`
**Before:**
```javascript
import fs from 'fs/promises';
import path from 'path';

const getTokensFromFile = async (email) => { ... }
const saveTokensToFile = async (email, tokens) => { ... }

// In route:
const tokens = await getTokensFromFile(email);
const oauth2Client = new google.auth.OAuth2(...);
oauth2Client.setCredentials(tokens);

// Manual token refresh
if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
  const { credentials } = await oauth2Client.refreshAccessToken();
  await saveTokensToFile(email, credentials);
}
```

**After:**
```javascript
import oauthTokenService from '../services/oauthTokenService.js';

// In route:
const oauth2Client = await oauthTokenService.getOAuthClient(email);

if (!oauth2Client) {
  return res.json({
    dataAvailable: false,
    reason: 'Authentication token expired. Please reconnect your Google account.',
    needsReconnect: true,
    connected: false
  });
}
```

#### 2. Added `needsReconnect` Flag
All error responses now include:
```javascript
{
  dataAvailable: false,
  reason: 'Authentication token expired. Please reconnect your Google account.',
  needsReconnect: true,
  connected: false
}
```

#### 3. Enhanced Error Handling
```javascript
catch (error) {
  console.error('❌ Error fetching sites:', error.message);
  
  // Check if it's an auth error
  if (error.message?.includes('invalid_grant') || error.message?.includes('expired')) {
    console.log('🔄 Token expired, attempting refresh...');
    const refreshed = await oauthTokenService.refreshTokens(email);
    if (!refreshed) {
      return res.json({
        dataAvailable: false,
        reason: 'Authentication token expired. Please reconnect your Google account.',
        needsReconnect: true,
        connected: false
      });
    }
    // Retry after refresh
    return res.redirect(`/api/search-console/data?email=${email}&forceRefresh=${forceRefresh}`);
  }
}
```

#### 4. Updated All Search Console Endpoints
- `/api/search-console/data` ✅
- `/api/search-console/sites` ✅
- `/api/search-console/backlinks` ✅

### Frontend Changes

#### 1. Added `needsReconnect` Detection
**In `fetchSearchConsoleData()`:**
```typescript
const searchConsoleJson = await searchConsoleResponse.json()

// Check if reconnection is needed
if (searchConsoleJson.needsReconnect) {
  console.log('🔒 OAuth token expired, user needs to reconnect')
  setSearchConsoleData({
    dataAvailable: false,
    reason: 'Authentication expired. Please reconnect your Google account.',
    needsReconnect: true
  })
  setLoadingData(false)
  setLoadingPageSpeed(false)
  return
}
```

**In `fetchAnalyticsData()`:**
```typescript
const data = await response.json()

// Check if reconnection is needed
if (data.needsReconnect) {
  console.log('🔒 OAuth token expired, user needs to reconnect')
  setAnalyticsData({
    dataAvailable: false,
    reason: 'Authentication expired. Please reconnect your Google account.',
    needsReconnect: true
  })
  setLoadingAnalytics(false)
  return
}
```

#### 2. Added "Reconnect" Buttons

**Google Analytics Card:**
```tsx
) : (
  <div className="text-center py-8 text-gray-500">
    <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
    <p className="text-xs font-medium text-gray-700">Data Unavailable</p>
    <p className="text-xs mt-1">{analyticsData?.reason || 'No data'}</p>
    {analyticsData?.needsReconnect && (
      <Button
        onClick={handleConnect}
        variant="outline"
        size="sm"
        className="mt-4"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Reconnect Google Account
      </Button>
    )}
  </div>
)}
```

**Search Console Section:**
```tsx
<Card>
  <CardContent className="py-12">
    <div className="flex flex-col items-center justify-center text-center">
      <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
      <p className="text-lg text-gray-600 font-medium">No Search Console Data Available</p>
      <p className="text-sm text-gray-500 mt-2">
        {searchConsoleData?.reason || 'Make sure your website is verified in Google Search Console'}
      </p>
      {searchConsoleData?.needsReconnect && (
        <Button
          onClick={handleConnect}
          variant="default"
          size="lg"
          className="mt-6"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reconnect Google Account
        </Button>
      )}
    </div>
  </CardContent>
</Card>
```

## How It Works Now

### Successful Flow (Token Valid):
1. User loads page
2. Backend checks token from database
3. Token valid → Returns cached data
4. Frontend displays metrics ✅

### Token Expired (Can Refresh):
1. User loads page
2. Backend detects token expired
3. Auto-refreshes using `refresh_token`
4. Returns data with new token ✅

### Token Expired (Cannot Refresh):
1. User loads page
2. Backend detects `invalid_grant` error
3. Attempts refresh → fails
4. Returns `needsReconnect: true`
5. Frontend shows:
   - Error message: "Authentication expired. Please reconnect your Google account."
   - **"Reconnect Google Account" button**
6. User clicks button → redirected to OAuth flow ✅

## Benefits

✅ **Auto-refresh**: Tokens refresh automatically when expired  
✅ **Clear feedback**: User sees exact reason for missing data  
✅ **One-click reconnect**: Button appears when reconnection needed  
✅ **Consistent**: All routes use same oauthTokenService  
✅ **Better UX**: No silent failures, clear action items  
✅ **Persistent**: Tokens stored in database, not file  

## Testing Checklist

### Backend Tests:
- [ ] Token valid → Data loads successfully
- [ ] Token expired (< 1 hour) → Auto-refreshes → Data loads
- [ ] Refresh token expired → Returns `needsReconnect: true`
- [ ] `invalid_grant` error → Returns reconnect prompt
- [ ] Database connection fails → Graceful fallback

### Frontend Tests:
- [ ] `needsReconnect: true` → Shows reconnect button
- [ ] Click reconnect button → Redirects to OAuth
- [ ] After reconnect → Data loads successfully
- [ ] Cached data shown when available
- [ ] Loading states work correctly

### Integration Tests:
- [ ] Connect GA/GSC → Wait 1 hour → Reload page → Data still loads (auto-refresh)
- [ ] Connect GA/GSC → Wait 7 days → Reload page → Shows reconnect prompt
- [ ] Reconnect → All data loads again
- [ ] Force refresh → Gets fresh data

## Files Modified

### Backend:
- `backend/routes/searchConsoleRoutes.js`
  - Removed file-based token system
  - Added oauthTokenService integration
  - Added needsReconnect flag to responses
  - Enhanced error handling for auth errors
  - Updated all 3 endpoints (/data, /sites, /backlinks)

### Frontend:
- `frontend/components/SEOPerformanceNew.tsx`
  - Added needsReconnect detection in fetchSearchConsoleData()
  - Added needsReconnect detection in fetchAnalyticsData()
  - Added reconnect button to Google Analytics card
  - Added reconnect button to Search Console section
  - Show reason message when data unavailable

## Deployment Notes

1. **Database Migration**: Ensure `oauth_tokens` table exists
2. **Environment Variables**: Verify `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
3. **Backend Restart**: Restart backend server to load new routes
4. **Frontend Build**: Rebuild frontend with updated components
5. **Test OAuth Flow**: Verify reconnect button works end-to-end

## Monitoring

### Backend Logs to Watch:
```bash
✅ OAuth client ready
🔄 Token expired, attempting refresh...
❌ Error fetching sites: invalid_grant
📊 Fetching Search Console data for: user@example.com
```

### Frontend Logs to Watch:
```bash
🔒 OAuth token expired, user needs to reconnect
✅ Search Console data loaded
✅ Analytics data loaded
```

## Next Steps

1. ✅ **Implemented**: Auto-refresh and reconnect system
2. ⏳ **Deploy**: Push to production
3. ⏳ **Monitor**: Watch for invalid_grant errors
4. ⏳ **Add**: Connection status indicator in header
5. ⏳ **Consider**: Email notification when token expires
6. ⏳ **Add**: "Last connected" timestamp in UI

## Status

✅ **Backend Updated**: All routes use oauthTokenService  
✅ **Frontend Updated**: Handles needsReconnect flag  
✅ **No Compilation Errors**  
⏳ **Ready for Testing**  
⏳ **Pending Deployment**
