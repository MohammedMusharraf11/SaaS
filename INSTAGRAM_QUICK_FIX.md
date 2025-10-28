# Instagram OAuth - Quick Fix Applied ✅

## 🔧 Problem Fixed

**Error:** "Invalid app ID: The provided app ID does not look like a valid app ID."

**Cause:** Instagram was using a different App ID than Facebook

**Solution:** Instagram and Facebook must use the **SAME App ID**

## ✅ What Was Changed

### Before (Wrong)
```env
FACEBOOK_APP_ID=1146428707594901
INSTAGRAM_APP_ID=2609716136046383  # ❌ Different app
```

### After (Correct)
```env
FACEBOOK_APP_ID=1146428707594901
INSTAGRAM_APP_ID=1146428707594901  # ✅ Same app
```

## 🚀 Next Steps

### 1. Restart Backend
```bash
cd backend
npm start
```

### 2. Configure Facebook App
Go to: https://developers.facebook.com/apps/1146428707594901

#### Add Instagram Product
1. Click **"Add Product"**
2. Find **"Instagram"** → Click **"Set Up"**

#### Add OAuth Redirect URI
1. Go to **Facebook Login** → **Settings**
2. Add to **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3010/api/auth/instagram/callback
   ```
3. Click **Save Changes**

#### Request Instagram Permissions
1. Go to **App Review** → **Permissions and Features**
2. Request these permissions:
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_insights`
   - ✅ `pages_show_list`
   - ✅ `pages_read_engagement`

### 3. Test Instagram OAuth
1. Open your dashboard
2. Select "Instagram" from dropdown
3. Click "Connect Instagram"
4. Should redirect to Facebook login ✅
5. Grant permissions
6. Should redirect back with success ✅

## 📋 Verification Checklist

- [x] `.env` file updated with correct App ID
- [ ] Backend restarted
- [ ] Facebook App has Instagram product added
- [ ] OAuth redirect URI configured
- [ ] Instagram permissions requested
- [ ] Tested OAuth flow

## 🔍 Why This Works

Instagram doesn't have its own OAuth system. It uses **Facebook OAuth** with Instagram-specific permissions.

```
Instagram OAuth = Facebook OAuth + Instagram Permissions
```

That's why both must use the same Facebook App ID!

## 📞 Still Having Issues?

### Check Facebook App
```bash
# Visit your app
https://developers.facebook.com/apps/1146428707594901

# Verify:
1. Instagram product is added
2. OAuth redirect URI is configured
3. App is in Development or Live mode
```

### Check Backend Logs
```bash
cd backend
npm start

# Look for:
✅ Instagram OAuth client initialized successfully
   Redirect URI: http://localhost:3010/api/auth/instagram/callback
```

### Test Debug Endpoint
```bash
curl http://localhost:3010/api/auth/instagram/debug
```

Should return:
```json
{
  "appId": "11464287...",
  "appSecret": "SET",
  "redirectUri": "http://localhost:3010/api/auth/instagram/callback",
  "frontendUrl": "http://localhost:3002",
  "activeStates": 0
}
```

## 📚 More Help

- **Setup Guide:** `INSTAGRAM_FACEBOOK_APP_GUIDE.md`
- **Troubleshooting:** `INSTAGRAM_TROUBLESHOOTING.md`
- **OAuth Setup:** `INSTAGRAM_OAUTH_SETUP.md`

---

**Status:** ✅ Configuration Fixed  
**Next:** Restart backend and configure Facebook App  
**Time:** 5 minutes to complete setup
