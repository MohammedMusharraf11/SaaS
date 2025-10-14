# AI Recommendations Troubleshooting Guide

## Quick Diagnostics

When you click "Generate AI Insights" and nothing happens, follow these steps:

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these messages when clicking the button:
   - `🤖 Fetching AI recommendations...`
   - `Request data: { yourSite: "...", competitorSite: "..." }`
   - `Response status: 200` (or error code)
   - `Response data: {...}`

**If you see network errors:**
- Check if backend is running on `http://localhost:5000`
- Check for CORS errors

**If you see no messages at all:**
- The button click might not be firing
- Check if React component re-rendered correctly

### Step 2: Test Backend Directly

Run the test script to verify Gemini service works:

```bash
cd backend
node test-gemini.js
```

**Expected output:**
```
🧪 Testing Gemini Service...
📊 Calling Gemini API...

✅ SUCCESS! Generated recommendations:

1. [Recommendation Title]
   Impact: High | Effort: Medium
   [Description]
   Steps:
      1. [Step 1]
      2. [Step 2]
      ...

🎉 Test completed successfully!
```

**If you see errors:**
- `Gemini API key not configured` → API key missing or invalid
- `Network error` → Check internet connection
- `Quota exceeded` → API rate limit reached

### Step 3: Check Backend Server

1. Look at backend terminal for these logs when clicking button:
   ```
   🤖 AI Recommendations Request:
      Your Site: example.com
      Competitor: competitor.com
   🤖 Calling Gemini AI service...
   ✅ Generated 3 AI recommendations
   ```

2. If you don't see these logs:
   - Request isn't reaching the backend
   - Check network tab in browser DevTools
   - Verify endpoint: `POST http://localhost:5000/api/competitor/ai-recommendations`

3. If you see error logs:
   - Note the error message
   - Check if it's an API key issue
   - Check if it's a data validation issue

### Step 4: Verify API Key

Check `.env` file has:
```env
GEMINI_API_KEY=AIzaSyCa-D6OtPzzH0ycs2Yvq69IowkZhAu6OVc
```

Test the API key is valid:
1. Go to https://makersuite.google.com/app/apikey
2. Verify the key exists and is enabled
3. Check quota status

### Step 5: Restart Backend Server

Sometimes changes require a restart:

1. Stop backend server (Ctrl+C)
2. Restart:
   ```bash
   cd backend
   npm start
   ```
   Or use:
   ```bash
   start-both-servers.bat
   ```

3. Wait for "Server running on port 5000" message

### Step 6: Check Network Tab

In browser DevTools → Network tab:

1. Click "Generate AI Insights"
2. Look for POST request to `/api/competitor/ai-recommendations`
3. Check:
   - **Status Code**: Should be 200
   - **Request Payload**: Should have yourSite, competitorSite, comparison
   - **Response**: Should have success: true and recommendations array

**Common issues:**
- **404 Not Found**: Route not registered properly
- **500 Internal Server Error**: Backend error (check backend logs)
- **CORS Error**: Backend CORS not configured for frontend origin
- **Network Error**: Backend not running or wrong port

## Common Issues & Fixes

### Issue 1: "Nothing happens" when clicking button

**Symptoms:**
- Button shows loading animation briefly
- Then returns to original state
- No error message shown

**Causes:**
- Network request failed silently
- Response format is unexpected
- State isn't updating correctly

**Fix:**
1. Open browser console and look for error messages
2. Check Network tab for failed requests
3. Verify backend is running and responding

### Issue 2: "AI service is not configured"

**Symptoms:**
- Error message shows in UI
- Backend logs: `Gemini API key not configured`

**Fix:**
1. Check `.env` file has `GEMINI_API_KEY=your_key_here`
2. Restart backend server
3. Verify API key is valid at Google AI Studio

### Issue 3: Request takes too long, then times out

**Symptoms:**
- Loading animation for 30+ seconds
- Eventually shows error

**Causes:**
- Gemini API is slow or rate limited
- Network connectivity issues
- Large data payload

**Fix:**
1. Check internet connection
2. Try again (might be temporary)
3. Reduce data size in request (future enhancement)

### Issue 4: "Invalid response format"

**Symptoms:**
- Error shown in UI
- Backend successfully calls Gemini but frontend rejects response

**Fix:**
1. Check backend logs for actual response
2. Verify response has `success: true` and `recommendations` array
3. Check if recommendations array has 3 items with correct structure

### Issue 5: Fallback recommendations shown instead of AI

**Symptoms:**
- Generic recommendations appear
- Not personalized to your site

**Causes:**
- Gemini API failed
- Response parsing failed
- Backend caught error and returned fallback

**Fix:**
1. Check backend logs for error message
2. Run `node test-gemini.js` to test service
3. Verify API key and quota

## Manual Testing Steps

### Test 1: Backend Health Check

```bash
curl http://localhost:5000/api/health
```

Expected: `{ "status": "ok" }`

### Test 2: AI Recommendations Endpoint

Create test file `test-ai-request.json`:
```json
{
  "yourSite": {
    "domain": "example.com",
    "lighthouse": { "categories": { "performance": { "displayValue": 75 } } },
    "pagespeed": { "desktop": { "performanceScore": 70 } },
    "puppeteer": { "content": { "wordCount": 1000 }, "seo": { "headings": { "h1Count": 1 } } },
    "backlinks": { "totalBacklinks": 100 }
  },
  "competitorSite": {
    "domain": "competitor.com",
    "lighthouse": { "categories": { "performance": { "displayValue": 85 } } },
    "pagespeed": { "desktop": { "performanceScore": 80 } },
    "puppeteer": { "content": { "wordCount": 1500 }, "seo": { "headings": { "h1Count": 1 } } },
    "backlinks": { "totalBacklinks": 200 }
  },
  "comparison": {
    "performance": { "winner": "competitor", "gap": -10 }
  }
}
```

Test with curl:
```bash
curl -X POST http://localhost:5000/api/competitor/ai-recommendations \
  -H "Content-Type: application/json" \
  -d @test-ai-request.json
```

Expected response:
```json
{
  "success": true,
  "recommendations": [
    {
      "title": "...",
      "impact": "High",
      "effort": "Medium",
      "description": "...",
      "steps": ["...", "...", "..."]
    }
    // ... 2 more recommendations
  ],
  "timestamp": "2024-01-15T..."
}
```

## Debug Checklist

- [ ] Backend server is running on port 5000
- [ ] Frontend can reach backend (check CORS)
- [ ] `@google/generative-ai` package is installed
- [ ] `GEMINI_API_KEY` is set in `.env`
- [ ] Backend server was restarted after adding API key
- [ ] API key is valid (test at Google AI Studio)
- [ ] Browser console shows request being sent
- [ ] Network tab shows 200 response
- [ ] Backend logs show "Calling Gemini AI service"
- [ ] No errors in backend console
- [ ] `test-gemini.js` script works successfully

## Getting Help

If none of these steps resolve the issue:

1. **Collect diagnostics:**
   - Screenshot of browser console errors
   - Screenshot of Network tab request/response
   - Copy of backend terminal logs
   - Result of running `node test-gemini.js`

2. **Check these details:**
   - What happens when you click the button?
   - Do you see loading animation?
   - Do you see any error message?
   - What's in browser console?
   - What's in backend logs?

3. **Share information:**
   - Exact error messages
   - Browser being used
   - Node.js version (`node --version`)
   - Any recent changes to code

## Quick Fixes to Try First

```bash
# 1. Verify package is installed
cd backend
npm list @google/generative-ai

# 2. Reinstall if needed
npm install @google/generative-ai

# 3. Test Gemini service
node test-gemini.js

# 4. Restart backend
# Press Ctrl+C to stop, then:
npm start

# 5. Clear browser cache and refresh
# In browser: Ctrl+Shift+R (hard refresh)
```

## Still Not Working?

Try the nuclear option:

```bash
# 1. Stop all servers
# Press Ctrl+C in all terminals

# 2. Reinstall dependencies
cd backend
del package-lock.json
del -r node_modules
npm install

# 3. Restart servers
cd ..
start-both-servers.bat
```

---

**Most Common Issue**: Backend server not restarted after adding API key to `.env`

**Solution**: Always restart backend server after changing `.env` file!
