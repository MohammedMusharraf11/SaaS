# Testing Social Media Integration

## 🧪 How to Test

### 1. Start Both Servers
```bash
# In one terminal - Backend
cd backend
npm start

# In another terminal - Frontend
cd frontend
npm run dev
```

### 2. Navigate to Competitor Analysis
- Open browser: http://localhost:3000/dashboard/competitor
- Login if needed

### 3. Fill in the Form

#### Required Fields:
- **Your Website**: Should auto-detect (e.g., yourdomain.com)
- **Competitor Website**: Enter competitor domain (e.g., competitor.com)

#### Social Media Fields (Optional but needed to see cards):
- **Your Instagram**: Instagram username without @ (e.g., `therock`)
- **Competitor Instagram**: Competitor's Instagram username
- **Your Facebook**: Facebook page name from URL (e.g., `EngenSA`)
- **Competitor Facebook**: Competitor's Facebook page name

### 4. Example Test Data

#### Option 1: Test with Real Pages
```
Your Instagram: your_instagram_username
Competitor Instagram: therock
Your Facebook: YourPageName
Competitor Facebook: EngenSA
```

#### Option 2: Test with Both Same (for testing)
```
Your Instagram: therock
Competitor Instagram: nike
Your Facebook: EngenSA
Competitor Facebook: cocacola
```

### 5. Check Console Logs

#### Frontend Console (Browser DevTools):
Look for:
```
🔍 Sending request to /api/competitor/analyze:
   Request Body: {...}
✅ Received response from /api/competitor/analyze:
   Has instagram data: true/false
   Has facebook data: true/false
🔍 CompetitorResults Debug:
   yourSite.instagram: EXISTS/MISSING
   comparison.instagram: EXISTS/MISSING
   showInstagramCard: true/false
```

#### Backend Console (Terminal):
Look for:
```
📊 Competitor Analysis Request:
   Your Instagram: therock
   Competitor Instagram: nike
   Your Facebook: EngenSA
   Competitor Facebook: cocacola

📸 Fetching Instagram engagement for: therock
✅ Got Instagram engagement data (397000000 followers)

📘 Fetching Facebook engagement for: EngenSA
✅ Got Facebook engagement data (114236 followers)
```

## 🐛 Troubleshooting

### Cards Not Showing?

1. **Check if you entered social media usernames**
   - Cards only show if at least one social media field is filled
   - Check console for "showInstagramCard: false"

2. **Check API errors in console**
   - Instagram API might be rate limited
   - Facebook API might fail for some pages
   - Look for error messages in backend console

3. **Check data structure**
   - Open browser DevTools → Console
   - Look for the full response object
   - Check if `data.comparison.instagram` exists
   - Check if `data.comparison.facebook` exists

4. **Restart servers if needed**
   - Backend might need restart to load new services
   - Frontend hot reload should work

### Common Issues:

**❌ "No logs about Instagram/Facebook"**
- Make sure you filled in the social media username fields
- Check if fields are being sent (see frontend console log)
- Verify backend is receiving the parameters

**❌ Cards show but say "N/A"**
- API might have failed but comparison object was created
- Check backend console for error messages
- Verify usernames are correct (case-sensitive)

**❌ Facebook shows 0 followers**
- Some pages require exact page name from URL
- Try different page names
- Use pages you know exist (like "EngenSA", "CocaCola")

**❌ Instagram shows 0 followers**
- Username might be incorrect
- API might be rate limited
- Try well-known accounts (like "therock", "nike")

## 📊 Expected Result

When working correctly, you should see:

1. **Instagram Engagement Card**
   - Followers count for both accounts
   - Engagement rate percentage
   - Average interactions
   - Best posting times (days and hours)
   - Winner badge on the account with better engagement

2. **Facebook Engagement Card**
   - Followers and page likes for both
   - "Talking about this" count
   - Engagement rate
   - Page rating and reviews
   - Activity level (High/Moderate/Low)
   - Winner badge on the account with better engagement

3. **Insights Section**
   - Comparison summary
   - Strategy recommendations
   - Percentage differences

## 🔧 Quick Fix Commands

If something isn't working:

```bash
# Restart backend
cd backend
# Press Ctrl+C to stop
npm start

# Clear browser cache
# In browser: Ctrl+Shift+R (hard refresh)
# Or: DevTools → Application → Clear storage

# Check if services exist
cd backend/services
ls *Engagement*
# Should show:
# instagramEngagementService.js
# facebookEngagementService.js
```

## 📝 Debug Checklist

- [ ] Both servers running
- [ ] Filled in at least one social media field
- [ ] Backend console shows Instagram/Facebook fetch logs
- [ ] Frontend console shows data in response
- [ ] No errors in either console
- [ ] Cards are visible on page

## 🎯 Success Indicators

✅ Backend logs show: "📸 Fetching Instagram..." or "📘 Fetching Facebook..."
✅ Backend logs show: "✅ Got Instagram engagement data"
✅ Frontend console shows: "showInstagramCard: true"
✅ Cards are visible with real data
✅ Winner badges are showing correctly
