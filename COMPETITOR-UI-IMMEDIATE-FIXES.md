# IMMEDIATE UI FIXES FOR COMPETITOR RESULTS

## Problem
- Facebook/Instagram cards not visible or in wrong position
- Layout not compact enough
- Cards taking full width

## SOLUTION 1: Quick Fix - Add Grid Wrapper for Social Media

### Step 1: Find Instagram Card (around line 1404)
Look for: `{/* Instagram Engagement Comparison */}`

### Step 2: Add wrapper BEFORE Instagram card
Add this:
```tsx
{/* Social Media Engagement Section */}
{(showInstagramCard || showFacebookCard) && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold flex items-center gap-2">
      📱 Social Media Engagement
    </h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
```

### Step 3: After BOTH Instagram and Facebook cards, close the wrapper:
```tsx
    </div>
  </div>
)}
```

## SOLUTION 2: Make All Cards More Compact

### Find and Replace:
1. `gap-6` → `gap-4` (reduce spacing)
2. `space-y-6` → `space-y-4`
3. `p-4` in metric boxes → `p-3`
4. Large text sizes → smaller (text-2xl → text-xl, text-xl → text-lg)

## SOLUTION 3: Ensure Cards Are Showing

### Check Console Logs
In browser console, you should see:
```
showInstagramCard: true/false
showFacebookCard: true/false
```

If FALSE, check:
1. Are Instagram/Facebook usernames provided?
2. Is backend returning the data?
3. Check: `yourSite?.instagram`, `competitorSite?.instagram`

## SOLUTION 4: Reorder Facebook Card

### Current: Facebook card is at line ~267 (TOP of component)
### Should be: After Paid Ads section, before Instagram

### To Move:
1. CUT lines ~267 to ~563 (entire Facebook card)
2. PASTE before Instagram card (line ~1404)

## Testing

### 1. Check Data Flow
```
Backend logs → Shows Instagram/Facebook data fetched
Frontend console → Shows data received
Card condition → showInstagramCard/showFacebookCard = true
Card renders → Visible on page
```

### 2. If Cards Still Not Showing
- Check if usernames are being passed: `yourInstagram`, `competitorInstagram`
- Check backend response has instagram/facebook fields
- Check CompetitorIntelligence is passing usernames to API

## Quick Test Script

Add this at line 115 (after showMetaAdsCard):
```tsx
console.log('🔍 SOCIAL MEDIA DEBUG:')
console.log('  yourInstagram:', yourSite?.instagram ? 'HAS DATA' : 'NO DATA')
console.log('  competitorInstagram:', competitorSite?.instagram ? 'HAS DATA' : 'NO DATA')
console.log('  yourFacebook:', yourSite?.facebook ? 'HAS DATA' : 'NO DATA')
console.log('  competitorFacebook:', competitorSite?.facebook ? 'HAS DATA' : 'NO DATA')
console.log('  showInstagramCard:', showInstagramCard)
console.log('  showFacebookCard:', showFacebookCard)
```

## Expected Result

After fixes:
```
┌──────────────────────────────────────────────┐
│  Competition Results Header                   │
└──────────────────────────────────────────────┘

┌──────────────────────┐ ┌──────────────────────┐
│  Your Site           │ │  Competitor Site     │
└──────────────────────┘ └──────────────────────┘

... other cards ...

┌──────────────────────────────────────────────┐
│  📱 Social Media Engagement                  │
├──────────────────────┬──────────────────────┤
│  📸 Instagram        │ │  📘 Facebook         │
│  Engagement          │ │  Engagement          │
└──────────────────────┘ └──────────────────────┘
```

Would you like me to:
A) Make these changes directly in the file
B) Create a new optimized version of CompetitorResults
C) Continue with current approach and add debug logs

Please let me know!
