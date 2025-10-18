# 🔍 DEBUGGING GUIDE - Social Media Not Showing

## Step-by-Step Debugging

### **STEP 1: Check Browser Console Logs**

1. Open your page: `http://localhost:3002/dashboard/competitor`
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Fill in these test values:
   ```
   Your Instagram: therock
   Competitor Instagram: nike
   Your Facebook: EngenSA
   Competitor Facebook: CocaCola
   ```
5. Click **"Analyze Competition"**

**What to look for:**
```
🔍 Sending request to /api/competitor/analyze:
   Request Body: {
     "yourInstagram": "therock",
     "competitorInstagram": "nike",
     "yourFacebook": "EngenSA",
     "competitorFacebook": "CocaCola"
   }
   Instagram fields filled?: { yourInstagram: true, competitorInstagram: true }
   Facebook fields filled?: { yourFacebook: true, competitorFacebook: true }
```

**❓ Question 1: Do you see this log?**
- [ ] Yes - Go to STEP 2
- [ ] No - The form isn't capturing the values. Check if input fields are working.

---

### **STEP 2: Check Frontend Terminal**

Look at the terminal where you ran `npm run dev`.

**What to look for:**
```
Calling backend API for competitor analysis...
Email: your@email.com
Your Site: yourdomain.com
Competitor: competitor.com
Your Instagram: therock
Competitor Instagram: nike
Your Facebook: EngenSA
Competitor Facebook: CocaCola
```

**❓ Question 2: Do you see these logs?**
- [ ] Yes - Go to STEP 3
- [ ] No - The Next.js API route isn't logging. Check if the API route file was updated.

---

### **STEP 3: Check Backend Terminal**

Look at the terminal where you ran `npm start` (backend).

**What to look for:**
```
📊 Competitor Analysis Request:
   Your Site: yourdomain.com
   Competitor: competitor.com
   Email: your@email.com
   Force Refresh: false
   Your Instagram: therock
   Competitor Instagram: nike
   Your Facebook: EngenSA
   Competitor Facebook: CocaCola

📸 Fetching Instagram engagement for: therock
```

**❓ Question 3: Do you see these logs?**
- [ ] Yes - Great! Backend is receiving data. Go to STEP 4
- [ ] No - Backend isn't receiving the parameters. See FIX A below.

---

### **STEP 4: Check for API Errors**

Still in backend terminal, look for error messages:

**Common errors:**
```
❌ Error fetching Instagram data: [error message]
❌ Error fetching Facebook data: [error message]
```

**❓ Question 4: Do you see any errors?**
- [ ] Yes - Write down the error message
- [ ] No - Go to STEP 5

---

### **STEP 5: Check Response Data**

Go back to Browser Console (F12) and look for:
```
✅ Received response from /api/competitor/analyze:
   Has instagram data: true
   Has facebook data: true
```

**❓ Question 5: What do you see?**
- [ ] Has instagram data: true - Great!
- [ ] Has instagram data: false - API failed, check backend errors
- [ ] No log at all - Response isn't being logged

---

## 🔧 FIXES

### **FIX A: Backend Not Receiving Parameters**

The Next.js API route might not be updated. Let me verify:

1. Open file: `frontend/app/api/competitor/analyze/route.ts`
2. Look for this line around line 7-8:
   ```typescript
   const { 
     yourSite, 
     competitorSite, 
     email, 
     forceRefresh,
     yourInstagram,        // <- Must have this
     competitorInstagram,  // <- Must have this
     yourFacebook,         // <- Must have this
     competitorFacebook    // <- Must have this
   } = body
   ```

3. If those 4 lines are missing, the file wasn't updated properly.

**Solution:**
- Close and re-open VS Code
- Make sure you saved the file
- Restart frontend: `npm run dev`

---

### **FIX B: API Errors (Rate Limiting)**

If you see errors like:
```
❌ Error: Rate limit exceeded
❌ Error: API quota exceeded
```

**Solution:**
- Wait 1 minute and try again
- Try different usernames
- Check if RapidAPI key is valid

---

### **FIX C: Cards Not Displaying**

If backend logs show data fetched successfully but cards don't display:

1. Open Browser Console
2. Look for:
   ```
   showInstagramCard: false
   showFacebookCard: false
   ```

3. Check the comparison object:
   ```javascript
   // In console, after getting response:
   console.log(data.comparison.instagram)
   console.log(data.comparison.facebook)
   ```

**Solution:**
- Check if comparison object exists
- Verify data structure matches expected format

---

## 🧪 SIMPLE TEST

Let me create a simple test command. In your **browser console**, paste this after submitting the form:

```javascript
// Wait for response, then run this:
setTimeout(() => {
  const results = document.querySelector('[data-results]');
  if (results) {
    console.log('Results component rendered');
  } else {
    console.log('Results component NOT rendered');
  }
}, 3000);
```

---

## 📋 CHECKLIST - What We Know So Far

Based on what you told me:
- [x] Frontend shows input fields for Instagram/Facebook
- [ ] Frontend console logs show fields filled
- [ ] Frontend terminal shows parameters being sent
- [ ] Backend terminal shows Instagram/Facebook fetch logs
- [ ] Backend terminal shows any errors
- [ ] Cards appear on page

---

## 🎯 NEXT STEPS

Please tell me:

1. **What do you see in Browser Console (F12)?**
   - Copy/paste the logs after clicking "Analyze Competition"

2. **What do you see in Frontend Terminal?**
   - Copy/paste any logs related to the API call

3. **What do you see in Backend Terminal?**
   - Do you see "📸 Fetching Instagram..." or "📘 Fetching Facebook..."?

4. **Did you fill in the Instagram/Facebook fields?**
   - What values did you enter?

This will help me identify exactly where the flow is breaking! 🔍
