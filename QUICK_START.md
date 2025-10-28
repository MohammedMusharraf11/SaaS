# Quick Start - Testing Social Media Metrics

## 🚀 Run the Test (3 steps)

### 1. Update Email
Open `backend/test-social-metrics.js` and change line 10:
```javascript
const TEST_EMAIL = 'your-actual-email@example.com'; // ← Change this!
```

### 2. Run Test
```bash
cd backend
node test-social-metrics.js
```

### 3. Check Output
Look for:
- ✅ Green checkmarks = Success
- ❌ Red X marks = Errors
- ⚠️ Yellow warnings = Missing data (but not critical)

---

## 📊 What You Should See

### If Connected Successfully:
```
✅ Instagram connected: @your_username
✅ Instagram API Response received
✅ Data is available

💬 Engagement Score:
   Likes: 1500
   Comments: 300
   Shares: 50
   Engagement Rate: 3.5%

📝 Top Posts (4 posts):
   Post 1:
      Caption: Check out our latest product...
      URL: https://www.instagram.com/p/ABC123/
```

### If Not Connected:
```
❌ Instagram API test failed
   Error: No Instagram access token found. Please connect your Instagram account.
```

**Fix:** Go to your app and connect Instagram/Facebook via OAuth

---

## 🎯 What Changed

### Before:
- Hardcoded numbers everywhere
- No post titles
- No clickable links

### After:
- ✅ Real data from Instagram/Facebook APIs
- ✅ Post captions with clickable links
- ✅ Dynamic engagement metrics
- ✅ Hover to see full caption

---

## 🔍 Frontend Changes

The top posts table now looks like this:

```
┌─────────────────────────────────────┬────────┬────────┐
│ Post                                │ Reach  │ Likes  │
├─────────────────────────────────────┼────────┼────────┤
│ Single Image                        │ 2.5K   │ 500    │
│ 🔗 Check out our latest product...  │        │        │  ← Clickable!
└─────────────────────────────────────┴────────┴────────┘
```

Click the caption → Opens post in new tab

---

## 🐛 Common Issues

### "ECONNREFUSED"
→ Backend not running. Run: `cd backend && npm start`

### "No access token found"
→ Connect your account at: `http://localhost:3000/dashboard`

### "Still seeing hardcoded values"
→ Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## 📁 Files Modified

1. `backend/services/instagramMetricsService.js` - Added fullCaption
2. `backend/services/facebookMetricsService.js` - Added fullCaption
3. `frontend/components/SocialMediaMetricsCard.tsx` - Display captions with links
4. `backend/test-social-metrics.js` - NEW test script

---

## ✅ Quick Checklist

- [ ] Updated TEST_EMAIL in test script
- [ ] Backend server is running
- [ ] Ran test script successfully
- [ ] Saw real data in test output
- [ ] Checked frontend shows dynamic data
- [ ] Verified post captions are clickable
- [ ] Tested hover tooltip on captions

---

## 💡 Pro Tips

1. **Test with real posts** - The more posts you have, the better the data
2. **Check different timeframes** - Try 7d, 30d, 90d in the dropdown
3. **Switch networks** - Test both Instagram and Facebook
4. **Monitor console** - Open browser DevTools to see API calls

---

## 📞 Need Help?

If the test shows errors:
1. Copy the full error message
2. Check if backend is running
3. Verify you're using the correct email
4. Make sure accounts are connected via OAuth

The test script shows exactly what data the API returns, so you can see if the problem is:
- Backend not running
- Account not connected
- API returning wrong data
- Frontend not displaying correctly
