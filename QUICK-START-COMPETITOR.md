# Quick Start Guide - Redesigned Competitor Intelligence

## 🚀 Getting Started

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Access the Page
Open: `http://localhost:3000/competitor-intelligence`

---

## 📖 User Guide

### Step 1: Add Your First Competitor

1. Look at the **left sidebar** - you'll see "Competitors (0)"
2. Click the **"+ Add"** button
3. Fill in the form:
   - **Domain*** (required): `competitor.com`
   - **Instagram** (optional): `their_username`
   - **Facebook** (optional): `their_page`
4. Click **"Add"**

### Step 2: Analyze a Competitor

1. Find the competitor card in the sidebar
2. Click the **"Analyze"** button
3. Wait 10-30 seconds while data is collected
4. Results will appear on the right side

### Step 3: Use the Filters (After Analysis)

Once results load, you'll see a filter bar at the top:

```
┌──────────────────────────────────────────────────────┐
│ [Competitor A ▼] [Last 30 days ▼] [SEO ▼] [Download] │
└──────────────────────────────────────────────────────┘
```

**Competitor Selector:**
- Switch between different competitors
- Click dropdown to see all added competitors
- Selecting one instantly re-analyzes

**Time Period:**
- Last 7 days
- Last 30 days ← Default
- Last 90 days
- Last year

**Analysis Type:**
- SEO ← Default (shows organic traffic, search visibility)
- Ads (shows paid ads monitoring)
- Content (shows content updates)
- Social Media (shows Instagram/Facebook)

**Download:**
- Export current report
- *(Coming soon - Phase 2)*

---

## 📊 Understanding the Dashboard

### Section 1: Website Traffic (Top Left)
```
┌─────────────────────────┐
│ Website Traffic         │
│ (Referral/Organic)      │
│                         │
│   Line chart shows:     │
│   - Your traffic (🟢)   │
│   - Competitor (🔵)     │
└─────────────────────────┘
```

### Section 2: Content Updates (Top Right)
```
┌─────────────────────────┐
│ Content Updates         │
│                         │
│   Bar chart compares:   │
│   - Your updates (🟢)   │
│   - Their updates (🔵) │
└─────────────────────────┘
```

### Section 3: Market Share (Bottom Left)
```
┌─────────────────────────┐
│ Market Share            │
│                         │
│      ╭───────╮          │
│      │  61%  │ ← You   │
│      │vs 1   │          │
│      ╰───────╯          │
│                         │
│ Your share:      61% ↑  │
│ Competitor:      29%    │
│                         │
│ [View Full Report →]    │
└─────────────────────────┘
```
- **Green segment** = Your market share
- **Orange segment** = Competitor's share
- Higher percentage = Better visibility

### Section 4: Paid Ads Monitoring (Bottom Right)
```
┌─────────────────────────┐
│ Paid Ads Monitoring     │
│                         │
│        You    Them      │
│ Visibility  97%   43%   │
│ Active Ads   25    19   │
│ Spend    High  Medium   │
│                         │
│ [View Full Report →]    │
└─────────────────────────┘
```

### Section 5: Performance Scores
```
┌──────────────┬──────────────┐
│  Your Site   │  Competitor  │
│              │              │
│  ⚡ 85       │  ⚡ 72       │
│  🛡️ 90       │  🛡️ 65       │
│  ✓ 88        │  ✓ 75        │
│  🔍 92       │  🔍 80       │
└──────────────┴──────────────┘
```

**Score Meanings:**
- 🟢 80-100: Excellent
- 🟡 50-79: Needs Improvement
- 🔴 0-49: Poor

### Section 6: Social Media (If Connected)
Shows Instagram and Facebook metrics side-by-side

### Section 7: AI Recommendations
Click **"Get AI Insights"** for personalized recommendations:
- High/Medium/Low Impact
- High/Medium/Low Effort
- Step-by-step action items

---

## 💡 Pro Tips

### Adding Multiple Competitors
```
✅ Best Practice:
- Add 2-3 main competitors
- Compare one at a time
- Switch between them using the dropdown

❌ Avoid:
- Adding too many (>5) at once
- Analyzing all simultaneously
```

### Using Social Media Integration
```
✅ Connect Your Accounts:
1. Click "Add Social Media" on your site card
2. Enter Instagram username (no @)
3. Enter Facebook page name
4. Data updates on next analysis

✅ For Competitors:
- Add when creating competitor
- Or edit later (coming soon)
```

### Understanding Cached Data
```
⏰ If you see "Cached Results" alert:
- Data is from a recent analysis
- Saves time and API costs
- Auto-refreshes every 24 hours
- Force refresh coming in Phase 2
```

---

## 🎯 Common Use Cases

### Use Case 1: Weekly Competitor Check
```
1. Monday morning
2. Select Competitor A
3. Check time period: "Last 7 days"
4. Review changes in traffic
5. Switch to "Ads" view
6. Check new ad campaigns
7. Get AI recommendations
```

### Use Case 2: Monthly Deep Dive
```
1. End of month
2. Set time period: "Last 30 days"
3. For each competitor:
   - Analyze SEO performance
   - Check content updates
   - Review social growth
   - Export report
4. Create action plan from AI insights
```

### Use Case 3: Competitive Ads Research
```
1. Select "Ads" from filter
2. Check Paid Ads Monitoring:
   - How many ads are they running?
   - What's their spend level?
   - Visibility index comparison
3. Click "View Full Report" for details
4. Adjust your ad strategy
```

---

## 🐛 Troubleshooting

### No Data Showing?
```
✓ Check your domain is connected (Search Console)
✓ Ensure competitor domain is valid
✓ Wait for analysis to complete (30s)
✓ Check browser console for errors
```

### Analysis Takes Too Long?
```
✓ Normal: 10-30 seconds
✓ If >60 seconds, check:
  - Backend server running?
  - API keys configured?
  - Internet connection?
```

### Filter Bar Not Showing?
```
✓ Filter bar only appears AFTER analysis
✓ Complete at least one analysis first
✓ Refresh page if stuck
```

### Charts Not Rendering?
```
✓ Clear browser cache
✓ Check Chart.js is installed
✓ Open developer console for errors
```

---

## 🎨 Customization

### Change Color Scheme
Edit `CompetitorResults.tsx`:
```typescript
// Your site color
backgroundColor: 'rgba(34, 197, 94, 0.6)',  // Green

// Competitor color
backgroundColor: 'rgba(59, 130, 246, 0.6)',  // Blue

// CTA buttons
className="bg-orange-500 hover:bg-orange-600"
```

### Adjust Grid Layout
Edit `CompetitorIntelligence.tsx`:
```typescript
// Current: 1 column sidebar, 3 columns content
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <div className="lg:col-span-1">Sidebar</div>
  <div className="lg:col-span-3">Content</div>
</div>

// Change to 2-2 split:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

---

## 📚 Additional Resources

- **Full Documentation**: `COMPETITOR-INTELLIGENCE-REDESIGN.md`
- **Design Comparison**: `DESIGN-COMPARISON.md`
- **Backend API**: Check `backend/routes/` for endpoints
- **Original Files**: `*_Backup.tsx` files for reference

---

## 🆘 Need Help?

1. Check the documentation files
2. Review browser console errors
3. Check backend logs: `backend/logs.txt`
4. Test with sample data first
5. Start with one competitor, then add more

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Competitor cards appear in sidebar
- ✅ Analysis completes in <30 seconds
- ✅ Filter bar shows after results load
- ✅ Charts render with data
- ✅ Scores show green/yellow/red colors
- ✅ Market share donut displays percentages
- ✅ Social media data appears (if connected)
- ✅ AI recommendations generate on click

**Enjoy your redesigned Competitor Intelligence dashboard! 🚀**
