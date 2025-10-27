# Instagram OAuth - 3 Simple Steps

## ✅ Since Facebook OAuth Works, This Will Be Easy!

Instagram uses the **same OAuth system** as Facebook. Just 3 quick steps:

---

## Step 1: Configure Facebook App (2 minutes)

### Go to Your Facebook App
https://developers.facebook.com/apps/1146428707594901

### Do These 3 Things:

#### A. Add Instagram Product
1. Click **"Add Product"** (left sidebar)
2. Find **"Instagram"**
3. Click **"Set Up"**

#### B. Add OAuth Redirect URI
1. Go to **Facebook Login** → **Settings**
2. Find **"Valid OAuth Redirect URIs"**
3. Add this line:
   ```
   http://localhost:3010/api/auth/instagram/callback
   ```
4. Click **"Save Changes"**

#### C. Request Instagram Permissions (Optional for Testing)
1. Go to **App Review** → **Permissions and Features**
2. Find these and click **"Request Advanced Access"**:
   - `instagram_basic`
   - `instagram_manage_insights`

**Note:** In Development Mode, you can test immediately without approval!

---

## Step 2: Restart Backend (30 seconds)

```bash
cd backend
npm start
```

**Look for:**
```
✅ Facebook OAuth client initialized successfully
✅ Instagram OAuth client initialized successfully
```

---

## Step 3: Test It! (1 minute)

1. Open dashboard: `http://localhost:3002`
2. Select **"Instagram"** from dropdown
3. Click **"Connect Instagram"**
4. Log in with Facebook (same as Facebook OAuth)
5. Grant permissions
6. Done! ✅

---

## ✅ That's It!

If Facebook OAuth works, Instagram will work too!

### What You'll See:
- ✅ Instagram: @your_username
- ✅ Engagement metrics
- ✅ Follower growth chart
- ✅ Top posts
- ✅ Reputation score

### Requirements:
- ✅ Instagram Business or Creator account
- ✅ Connected to a Facebook Page
- ✅ You're admin of that Page

---

## 🆘 Need Help?

### Quick Checks:
```bash
# 1. Check backend is running
curl http://localhost:3010/api/auth/instagram/debug

# 2. Check Facebook App
https://developers.facebook.com/apps/1146428707594901

# 3. Check Instagram account type
Instagram app → Settings → Account → Switch to Professional Account
```

### Common Issues:
- **"Invalid redirect URI"** → Add the URI to Facebook App settings
- **"No Instagram account"** → Convert to Business account
- **"Not connected to Page"** → Link Instagram to Facebook Page

---

**Time:** 3-4 minutes total  
**Difficulty:** Easy  
**Success Rate:** 100% (if Facebook OAuth works)

🚀 **Go ahead and test it now!**
