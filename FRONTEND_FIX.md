# Frontend Fix - Port Configuration

## Problem
The frontend was calling `localhost:5000` but your backend is running on `localhost:3010`.

## Solution Applied

### 1. Added Environment Variable
Updated `frontend/.env`:
```env
# BACKEND API URL
NEXT_PUBLIC_API_URL=http://localhost:3010
```

### 2. Updated Component
Modified `frontend/components/SocialMediaMetricsCard.tsx` to use the environment variable:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
```

## How to Apply the Fix

### Step 1: Stop Frontend Server
Press `Ctrl+C` in the terminal where frontend is running

### Step 2: Restart Frontend
```bash
cd frontend
npm run dev
```

**IMPORTANT:** Next.js needs to be restarted to pick up the new environment variable!

### Step 3: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

OR just press: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Step 4: Test
1. Navigate to Social Media Performance page
2. Open browser console (F12)
3. Look for these logs:
   ```
   📡 Fetching social media data from: http://localhost:3010/api/instagram/metrics...
   📊 Received data: {dataAvailable: true, ...}
   ```

## Expected Behavior

### Before Fix:
- Console shows: `http://localhost:5000/api/instagram/metrics`
- Error: Connection refused or timeout
- Shows mock/hardcoded data

### After Fix:
- Console shows: `http://localhost:3010/api/instagram/metrics`
- Success: Real data loaded
- Shows dynamic engagement metrics
- Top posts display with captions and links

## Verification Checklist

- [ ] Frontend restarted
- [ ] Browser cache cleared
- [ ] Console shows correct port (3010)
- [ ] API call succeeds (check Network tab)
- [ ] Engagement metrics show real numbers
- [ ] Top posts show captions
- [ ] Captions are clickable links

## Troubleshooting

### Still seeing port 5000 in console?
→ Frontend not restarted. Stop and restart `npm run dev`

### Still seeing hardcoded data?
→ Clear browser cache with `Ctrl+Shift+R`

### API call fails with CORS error?
→ Check backend CORS settings in `backend/server.js` (should already include localhost:3002)

### Environment variable not working?
→ Make sure the variable starts with `NEXT_PUBLIC_` (Next.js requirement)

## Quick Test Command

After restarting frontend, run this in browser console:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should output: http://localhost:3010
```

If it shows `undefined`, the frontend wasn't restarted properly.
