# Instagram OAuth - Troubleshooting Guide

## 🔍 Common Errors & Solutions

### 1. "Invalid OAuth Redirect URI"

**Error Message:**
```
Can't Load URL: The domain of this URL isn't included in the app's domains
```

**Solution:**
1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Select your app
3. Go to **Facebook Login** → **Settings**
4. Add to **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3010/api/auth/instagram/callback
   ```
5. Save changes
6. Try connecting again

---

### 2. "No Instagram Business Account found"

**Error Message:**
```
No Instagram Business Account connected to this Facebook Page
```

**Solution:**

#### Step 1: Convert to Business Account
1. Open Instagram app
2. Go to **Settings** → **Account**
3. Tap **Switch to Professional Account**
4. Choose **Business** or **Creator**

#### Step 2: Connect to Facebook Page
1. In Instagram app
2. Go to **Settings** → **Account**
3. Tap **Linked Accounts** → **Facebook**
4. Log in and select your Facebook Page
5. Confirm connection

#### Step 3: Verify Connection
1. Go to Facebook Page settings
2. Check **Instagram** section
3. Should show your Instagram account

---

### 3. "Instagram permissions not granted"

**Error Message:**
```
Insufficient permissions or Instagram Business Account not found
```

**Solution:**

#### Check Permissions in Facebook App
1. Go to [Facebook App Dashboard](https://developers.facebook.com/apps/)
2. Go to **App Review** → **Permissions and Features**
3. Verify these are approved:
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_insights`
   - ✅ `pages_show_list`
   - ✅ `pages_read_engagement`

#### Request Advanced Access
If permissions show "Standard Access":
1. Click **Request Advanced Access**
2. Fill out the form
3. Explain your use case
4. Wait for Facebook approval (1-3 days)

#### Temporary Solution (Development)
While waiting for approval, you can test with:
- Your own Instagram account
- Test users added to your Facebook App
- Accounts with admin access to your Facebook Page

---

### 4. "Access token expired"

**Error Message:**
```
Error validating access token: Session has expired
```

**Solution:**
1. User needs to reconnect Instagram
2. Click **Disconnect Instagram**
3. Click **Connect Instagram** again
4. Complete OAuth flow

**Prevention:**
- Tokens expire after 60 days
- Implement token refresh (optional enhancement)
- Notify users before expiry

---

### 5. "Email parameter is required"

**Error Message:**
```
Email parameter is required
```

**Solution:**
This means the frontend isn't passing the email parameter.

**Check:**
```javascript
// Frontend should pass email
const response = await fetch(
  `http://localhost:3010/api/instagram/metrics?email=${encodeURIComponent(userEmail)}&period=month`
)
```

**Verify:**
- `userEmail` prop is passed to component
- Email is not empty or undefined
- URL encoding is correct

---

### 6. "OAuth state expired or invalid"

**Error Message:**
```
OAuth state expired or invalid. Please try again.
```

**Solution:**
- OAuth state expires after 15 minutes
- User took too long to complete OAuth
- Simply try connecting again

**If persists:**
1. Clear browser cookies
2. Try in incognito mode
3. Check backend logs for state storage issues

---

### 7. "Failed to store Instagram tokens"

**Error Message:**
```
Failed to store Instagram tokens
```

**Solution:**

#### Check Database Connection
```javascript
// Verify Supabase connection
console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING')
```

#### Verify Table Exists
```sql
-- Check if oauth_tokens table exists
SELECT * FROM oauth_tokens LIMIT 1;
```

#### Create Table if Missing
```sql
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT,
  scope TEXT,
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  user_email_from_provider VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_email, provider)
);
```

---

### 8. "Cannot read property 'access_token' of null"

**Error Message:**
```
Cannot read property 'access_token' of null
```

**Solution:**
User hasn't connected Instagram yet.

**Check:**
```javascript
// Frontend should check connection first
const checkInstagramConnection = async () => {
  const response = await fetch(
    `http://localhost:3010/api/auth/instagram/status?email=${userEmail}`
  )
  const data = await response.json()
  setInstagramConnected(data.connected)
}
```

**Fix:**
- Show "Connect Instagram" button if not connected
- Don't try to fetch metrics without connection

---

### 9. "CORS Error"

**Error Message:**
```
Access to fetch at 'http://localhost:3010/api/auth/instagram' has been blocked by CORS policy
```

**Solution:**

#### Check Backend CORS Configuration
```javascript
// backend/server.js
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));
```

#### Add Your Frontend URL
If using different port:
```javascript
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000', 'http://localhost:YOUR_PORT'],
  credentials: true
}));
```

---

### 10. "Rate limit exceeded"

**Error Message:**
```
(#4) Application request limit reached
```

**Solution:**
- Instagram API has rate limits
- Wait 1 hour for limit to reset
- Implement caching (already done in frontend)

**Check Cache:**
```javascript
// Should cache for 30 minutes
const cachedData = getCachedData('instagram')
if (cachedData) {
  // Use cached data
}
```

---

## 🧪 Testing Checklist

### Before Testing
- [ ] Facebook App configured
- [ ] Instagram permissions requested
- [ ] OAuth redirect URI added
- [ ] Instagram is Business account
- [ ] Instagram connected to Facebook Page
- [ ] Database table exists
- [ ] Environment variables set

### Test OAuth Flow
- [ ] Click "Connect Instagram"
- [ ] Redirects to Facebook
- [ ] Can log in successfully
- [ ] Permissions screen shows
- [ ] Can grant permissions
- [ ] Redirects back to dashboard
- [ ] Shows success message
- [ ] Metrics load correctly

### Test Metrics
- [ ] Engagement score displays
- [ ] Follower growth chart shows
- [ ] Top posts load
- [ ] Reputation benchmark calculates
- [ ] No console errors

### Test Disconnect
- [ ] Click "Disconnect Instagram"
- [ ] Connection status updates
- [ ] Metrics clear
- [ ] Can reconnect successfully

---

## 📞 Getting Help

### Check Logs

#### Backend Logs
```bash
cd backend
npm start
# Watch for errors in console
```

#### Frontend Logs
```javascript
// Open browser console (F12)
// Look for errors or warnings
```

#### Database Logs
```sql
-- Check stored tokens
SELECT user_email, provider, created_at, expires_at 
FROM oauth_tokens 
WHERE provider = 'instagram';
```

### Debug Mode

#### Enable Verbose Logging
```javascript
// backend/routes/instagramAuthRoutes.js
console.log('🔍 Debug:', {
  state,
  code,
  email,
  tokens
});
```

### Test Endpoints Manually

#### Check Connection
```bash
curl "http://localhost:3010/api/auth/instagram/status?email=test@example.com"
```

#### Test Metrics
```bash
curl "http://localhost:3010/api/instagram/metrics?email=test@example.com&period=month"
```

---

## 🆘 Still Having Issues?

1. **Check Documentation:**
   - `INSTAGRAM_OAUTH_SETUP.md` - Setup guide
   - `INSTAGRAM_OAUTH_SUMMARY.md` - Implementation summary
   - `INSTAGRAM_ARCHITECTURE.md` - Technical details

2. **Verify Configuration:**
   - Facebook App settings
   - Environment variables
   - Database connection
   - Instagram account type

3. **Test Step by Step:**
   - Test OAuth initiation
   - Test OAuth callback
   - Test token storage
   - Test metrics fetch

4. **Common Mistakes:**
   - Forgot to add redirect URI
   - Instagram not Business account
   - Instagram not connected to Page
   - Permissions not approved
   - Wrong environment variables

---

**Last Updated:** October 23, 2025  
**Version:** 2.0.0 (OAuth)
