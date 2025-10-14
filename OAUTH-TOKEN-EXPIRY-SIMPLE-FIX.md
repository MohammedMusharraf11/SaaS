# OAuth Token Expiry - Simple Fix

## Problem
User connected GA/GSC yesterday at 10 PM. Today when logging in, data doesn't display and gets `invalid_grant` error. The UI should:
1. Show cached data if available, OR
2. Show "Connect Google" modal with blurred background

## Root Cause
The Search Console routes were using **old file-based token system** instead of the new **oauthTokenService** with auto-refresh capability.

## Solution (Simplified Approach)

### Backend Changes

#### 1. Updated `searchConsoleRoutes.js`
**Changed from:**
- Using `getTokensFromFile()` and `saveTokensToFile()`
- Manual token refresh logic
- No `needsReconnect` flag

**Changed to:**
- Import `oauthTokenService`
- Use `oauthTokenService.getOAuthClient(email)` (handles auto-refresh)
- Return `needsReconnect: true` when tokens expire
- Consistent error handling across all endpoints

**Endpoints Updated:**
- `/search-console/data`
- `/search-console/sites`  
- `/search-console/backlinks`

**Key Changes:**
```javascript
// ❌ OLD
const tokens = await getTokensFromFile(email);
const oauth2Client = new google.auth.OAuth2(...);
oauth2Client.setCredentials(tokens);

// ✅ NEW
const oauth2Client = await oauthTokenService.getOAuthClient(email);
if (!oauth2Client) {
  return res.json({
    dataAvailable: false,
    needsReconnect: true,
    connected: false
  });
}
```

### Frontend Changes

#### 2. Updated `SEOPerformanceNew.tsx`

**Simplified Logic:**
When `needsReconnect: true` is detected:
1. Set `isConnected = false`
2. Show `showConnectModal = true`
3. User sees familiar "Connect Google" modal
4. Background content naturally hidden by modal overlay

**Changes in `fetchSearchConsoleData()`:**
```typescript
// Check if reconnection is needed - treat as disconnected
if (searchConsoleJson.needsReconnect) {
  console.log('🔒 OAuth token expired, showing connect modal')
  setIsConnected(false)
  setShowConnectModal(true)
  setLoadingData(false)
  setLoadingPageSpeed(false)
  return
}
```

**Changes in `fetchAnalyticsData()`:**
```typescript
// Check if reconnection is needed - treat as disconnected
if (data.needsReconnect) {
  console.log('🔒 OAuth token expired, showing connect modal')
  setIsConnected(false)
  setShowConnectModal(true)
  setLoadingAnalytics(false)
  return
}
```

**Updated Connection Modal:**
- Shows different message if `needsReconnect` is detected
- Button text changes from "Connect" to "Reconnect"

```typescript
<DialogDescription>
  {searchConsoleData?.needsReconnect || analyticsData?.needsReconnect 
    ? 'Your session has expired. Please reconnect your Google account to continue.'
    : 'Connect your Google account to access Analytics and Search Console data'
  }
</DialogDescription>

<Button>
  {searchConsoleData?.needsReconnect || analyticsData?.needsReconnect 
    ? 'Reconnect with Google'
    : 'Connect with Google Analytics 4'
  }
</Button>
```

## User Experience Flow

### Scenario 1: Token Expired (Your Case)
1. User logs in after 24 hours
2. Backend detects `invalid_grant` error
3. Backend returns `{ needsReconnect: true }`
4. Frontend sets `isConnected = false`
5. Modal automatically pops up: "Your session has expired"
6. User clicks "Reconnect with Google"
7. OAuth flow starts, user grants permission again
8. Data loads fresh

### Scenario 2: Fresh User
1. User visits page first time
2. No connection status detected
3. Modal shows: "Connect your Google account"
4. User clicks "Connect with Google Analytics 4"
5. OAuth flow completes
6. Data loads

### Scenario 3: Valid Token (Happy Path)
1. User logs in within token validity period
2. `oauthTokenService.getOAuthClient()` checks expiry
3. If expired but refresh_token valid → auto-refreshes
4. Returns ready OAuth client
5. Data loads seamlessly (user sees nothing)

## Why This Approach is Better

✅ **Simple**: Just show the connect modal again  
✅ **Familiar UX**: Same modal user saw before  
✅ **No New UI**: Reuses existing connection flow  
✅ **Clear Message**: "Session expired, reconnect"  
✅ **Natural Blur**: Modal overlay provides background dimming  
✅ **Consistent**: Same behavior as initial connection  

## Files Modified

### Backend
- `backend/routes/searchConsoleRoutes.js`
  - Removed file-based token functions
  - Added `oauthTokenService` import
  - Updated all 3 endpoints to use `getOAuthClient()`
  - Added `needsReconnect` flag in error responses

### Frontend
- `frontend/components/SEOPerformanceNew.tsx`
  - Updated `fetchSearchConsoleData()` to check `needsReconnect`
  - Updated `fetchAnalyticsData()` to check `needsReconnect`
  - Modified connection modal message and button text
  - Simplified: just set `isConnected = false` on token expiry

## Testing Steps

1. **Test Token Expiry:**
   ```sql
   -- In Supabase, set token expiry to past
   UPDATE oauth_tokens 
   SET expiry_date = NOW() - INTERVAL '1 hour'
   WHERE email = 'mush4rr4f@gmail.com';
   ```

2. **Expected Behavior:**
   - Refresh page
   - See "Connect Google" modal pop up
   - Message: "Your session has expired. Please reconnect..."
   - Click "Reconnect with Google"
   - OAuth flow starts
   - After reconnection, data loads

3. **Check Backend Logs:**
   ```
   📊 Fetching Search Console data for: mush4rr4f@gmail.com
   📡 Fetching fresh data from Google Search Console...
   ❌ User not authenticated or token refresh failed
   ```

4. **Check Frontend Console:**
   ```
   🔒 OAuth token expired, showing connect modal
   ```

## Next Steps

- ✅ Backend uses `oauthTokenService` everywhere
- ✅ Frontend handles `needsReconnect` gracefully
- ✅ User sees familiar reconnection UI
- ⏳ Test with expired tokens
- ⏳ Deploy to production

## Technical Notes

### Auto-Refresh Still Works
The `oauthTokenService.getOAuthClient()` method:
1. Checks if `expiry_date` < now
2. If yes, calls `refreshTokens(email)`
3. Uses `refresh_token` to get new `access_token`
4. Updates database with new tokens
5. Returns ready OAuth2Client

### When Refresh Fails
If `refresh_token` is invalid (expired, revoked):
- `getOAuthClient()` returns `null`
- Route returns `needsReconnect: true`
- Frontend shows modal
- User must re-authorize

### Database Schema
```sql
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL,
  scope TEXT,
  token_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Status
✅ **Backend Complete** - All routes use `oauthTokenService`  
✅ **Frontend Complete** - Handles token expiry gracefully  
⏳ **Testing Needed** - Test with expired tokens  
⏳ **Production Deploy** - Ready to deploy
