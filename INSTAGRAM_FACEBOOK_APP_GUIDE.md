# Instagram & Facebook - Same App Configuration

## ✅ Important: Instagram Uses Facebook OAuth

Instagram doesn't have a separate OAuth system. It uses **Facebook's OAuth** with Instagram-specific permissions.

## 🔧 Configuration

### Use the SAME Facebook App for Both

```env
# Facebook OAuth
FACEBOOK_APP_ID=1146428707594901
FACEBOOK_APP_SECRET=e89f1c731dee52e2314d142838ab6629

# Instagram OAuth (SAME as Facebook)
INSTAGRAM_APP_ID=1146428707594901
INSTAGRAM_APP_SECRET=e89f1c731dee52e2314d142838ab6629
```

✅ **Both use the same App ID and Secret!**

## 📋 Facebook App Setup

### 1. Go to Your Facebook App
Visit: https://developers.facebook.com/apps/1146428707594901

### 2. Add Instagram Product
1. Click **"Add Product"** in left sidebar
2. Find **"Instagram"** and click **"Set Up"**
3. This adds Instagram Graph API to your app

### 3. Configure OAuth Redirect URIs
1. Go to **Facebook Login** → **Settings**
2. Add these **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3010/api/auth/facebook/callback
   http://localhost:3010/api/auth/instagram/callback
   ```
3. Click **Save Changes**

### 4. Request Instagram Permissions
1. Go to **App Review** → **Permissions and Features**
2. Find and request these permissions:

   **For Facebook:**
   - ✅ `pages_show_list`
   - ✅ `pages_read_engagement`
   - ✅ `pages_read_user_content`
   - ✅ `read_insights`

   **For Instagram:**
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_insights`

3. Click **"Request Advanced Access"** for each
4. Fill out the form explaining your use case
5. Wait for approval (usually 1-3 days)

### 5. App Mode
- **Development Mode:** Can test with your own accounts
- **Live Mode:** Available to all users (requires App Review)

For testing, Development Mode is fine!

## 🧪 Testing

### 1. Restart Backend
```bash
cd backend
npm start
```

### 2. Test Facebook Connection
1. Select "Facebook" from dropdown
2. Click "Connect Facebook"
3. Should work ✅

### 3. Test Instagram Connection
1. Select "Instagram" from dropdown
2. Click "Connect Instagram"
3. Should work ✅

Both use the same Facebook App!

## 🔍 How It Works

### Facebook OAuth Flow
```
User clicks "Connect Facebook"
  ↓
Redirects to: facebook.com/dialog/oauth
  ↓
Scopes: pages_show_list, pages_read_engagement, etc.
  ↓
Returns to: /api/auth/facebook/callback
  ↓
Stores token with provider='facebook'
```

### Instagram OAuth Flow
```
User clicks "Connect Instagram"
  ↓
Redirects to: facebook.com/dialog/oauth (SAME!)
  ↓
Scopes: instagram_basic, instagram_manage_insights, etc.
  ↓
Returns to: /api/auth/instagram/callback
  ↓
Stores token with provider='instagram'
```

**Key Point:** Both use Facebook OAuth, just with different scopes and callbacks!

## 📊 Token Storage

Tokens are stored separately in the database:

```sql
SELECT * FROM oauth_tokens;

-- Results:
user_email          | provider   | access_token
--------------------|------------|-------------
user@example.com    | facebook   | EAAQSq7...
user@example.com    | instagram  | EAAQSq7...
```

Same user, different providers, different tokens!

## ⚠️ Common Mistakes

### ❌ Wrong: Using Different App IDs
```env
FACEBOOK_APP_ID=1146428707594901
INSTAGRAM_APP_ID=2609716136046383  # ❌ Different app
```

### ✅ Correct: Using Same App ID
```env
FACEBOOK_APP_ID=1146428707594901
INSTAGRAM_APP_ID=1146428707594901  # ✅ Same app
```

## 🎯 Why Same App?

1. **Instagram uses Facebook OAuth** - No separate Instagram OAuth system
2. **Easier management** - One app to configure
3. **Shared permissions** - Request all permissions in one place
4. **Better for users** - Single login for both platforms

## 📞 Need Help?

### Check Your Facebook App
1. Go to: https://developers.facebook.com/apps/1146428707594901
2. Verify **Instagram** product is added
3. Check **OAuth Redirect URIs** are configured
4. Confirm **Permissions** are requested

### Test Endpoints
```bash
# Test Facebook OAuth
curl "http://localhost:3010/api/auth/facebook/debug"

# Test Instagram OAuth
curl "http://localhost:3010/api/auth/instagram/debug"
```

Both should return the same App ID!

---

**Status:** ✅ Configuration Updated  
**App ID:** 1146428707594901 (Same for both)  
**Next Step:** Restart backend and test OAuth flows
