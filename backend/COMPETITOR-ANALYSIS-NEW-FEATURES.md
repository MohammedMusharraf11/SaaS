# Competitor Analysis - New Features

## Overview
The competitor analysis feature has been enhanced with two new metrics:
1. **Website Traffic Trends**
2. **Content Updates Tracking**

## 1. Website Traffic Trends

### User Site Traffic (Your Website)
For the user's own site, we pull traffic data from:
- **Google Analytics (GA)** - Primary source
- **Google Search Console (GSC)** - Secondary source
- **SimilarWeb API (via RapidAPI)** - Fallback if GA/GSC unavailable

### Competitor Traffic
For competitor websites, we use:
- **SimilarWeb Traffic API via RapidAPI**

### Configuration
Add your RapidAPI key to the `.env` file:
```env
RAPIDAPI_KEY=your_rapidapi_key_here
```

Default key is included in the code for testing (you can replace it with your own).

### Traffic Metrics Collected
- Monthly visits
- Average visit duration
- Pages per visit
- Bounce rate
- Traffic sources breakdown (direct, search, social, referral, mail, paid)
- Global rank, country rank, category rank
- 6-month traffic trends

### API Endpoint
The traffic data is automatically included when you call:
```
POST /api/competitor/analyze
Body: {
  "yourSite": "example.com",
  "competitorSite": "competitor.com",
  "email": "user@example.com"
}
```

### Response Structure
```json
{
  "yourSite": {
    "traffic": {
      "success": true,
      "source": "google_analytics",
      "metrics": {
        "monthlyVisits": 50000,
        "avgVisitDuration": 180,
        "pagesPerVisit": 3.2,
        "bounceRate": 45.5,
        "trafficSources": {...}
      },
      "trends": [...]
    }
  },
  "competitorSite": {
    "traffic": {
      "success": true,
      "source": "similarweb_rapidapi",
      "metrics": {...}
    }
  },
  "comparison": {
    "traffic": {
      "your": {...},
      "competitor": {...},
      "winner": "yours",
      "difference": 10000
    }
  }
}
```

## 2. Content Updates Tracking

### How It Works
The system analyzes content update activity by:
1. **RSS Feed Detection** - Checks common RSS/Atom feed paths
2. **Sitemap Analysis** - Parses sitemap.xml for recent modifications
3. **Activity Analysis** - Calculates update frequency and content velocity

### RSS Feed Paths Checked
- `/feed`
- `/rss`
- `/feed.xml`
- `/rss.xml`
- `/atom.xml`
- `/blog/feed`
- `/blog/rss`
- `/feeds/posts/default`

### Sitemap Paths Checked
- `/sitemap.xml`
- `/sitemap_index.xml`
- `/sitemap-index.xml`
- `/sitemap1.xml`
- Also checks `robots.txt` for sitemap location

### Metrics Collected
- RSS feed availability
- Recent posts (last 10)
- Total posts in feed
- Last updated date
- Sitemap availability
- Recently modified URLs (last 30 days)
- Update frequency (weekly, monthly, quarterly, inactive)
- Average posts per month
- Content velocity (high, medium, low, minimal)
- Activity status (active/inactive)

### API Endpoint
Content updates are automatically included in the competitor analysis:
```
POST /api/competitor/analyze
```

### Response Structure
```json
{
  "yourSite": {
    "contentUpdates": {
      "rss": {
        "found": true,
        "url": "https://example.com/feed",
        "recentPosts": [...],
        "totalPosts": 50,
        "lastUpdated": "2025-10-15T10:30:00Z"
      },
      "sitemap": {
        "found": true,
        "url": "https://example.com/sitemap.xml",
        "totalUrls": 200,
        "recentlyModified": [...],
        "lastModified": "2025-10-17T08:20:00Z"
      },
      "contentActivity": {
        "updateFrequency": "weekly",
        "lastContentDate": "2025-10-17T08:20:00Z",
        "averagePostsPerMonth": 8,
        "isActive": true,
        "contentVelocity": "high"
      }
    }
  },
  "comparison": {
    "contentUpdates": {
      "your": {...},
      "competitor": {...},
      "winner": "yours"
    }
  }
}
```

## Services Created

### 1. similarWebTrafficService.js
- Fetches traffic data from SimilarWeb via RapidAPI
- Transforms API response to standardized format
- Generates traffic trends
- Compares traffic between sites
- Calculates traffic quality scores

Key Methods:
- `getCompetitorTraffic(domain)` - Get traffic for a domain
- `compareTraffic(userDomain, competitorDomain, userGAData)` - Compare two sites
- `generateTrendData(monthlyVisits)` - Create trend estimates
- `calculateTrafficQuality(metrics)` - Score traffic quality

### 2. contentUpdatesService.js
- Detects and parses RSS/Atom feeds
- Analyzes sitemap.xml files
- Tracks content update activity
- Compares content publishing frequency

Key Methods:
- `getContentUpdates(domain)` - Analyze content updates for a domain
- `findAndParseRSS(baseUrl)` - Detect and parse RSS feeds
- `findAndParseSitemap(baseUrl)` - Detect and parse sitemaps
- `analyzeContentActivity(rssData, sitemapData)` - Calculate content metrics
- `compareContentUpdates(userDomain, competitorDomain)` - Compare two sites

## Integration with Existing Code

### competitorService.js
Updated `analyzeSingleSite()` method to:
- Accept `email` parameter for GA/GSC access
- Accept `isUserSite` flag to determine data source
- Call `similarWebTrafficService` for traffic data
- Call `contentUpdatesService` for content updates
- Include new metrics in analysis results

### competitorRoutes.js
Updated to:
- Pass email to `competitorService.analyzeSingleSite()`
- Include traffic and content updates in comparison
- Add traffic and content metrics to cache
- Update `generateComparison()` to handle new metrics

## Comparison Insights

### Traffic Comparison
- Traffic winner determination (based on monthly visits)
- Engagement winner (based on bounce rate, pages per visit)
- Traffic gap calculation
- Recommendations for improvement

### Content Updates Comparison
- More active site determination
- Content gap calculation (posts per month difference)
- Content velocity comparison
- Update frequency analysis
- Recommendations for content strategy

## Error Handling

Both services include robust error handling:
- Graceful fallback when APIs fail
- "N/A" or estimated data when unavailable
- Clear error messages in logs
- Non-blocking errors (analysis continues even if one metric fails)

## Caching

All new metrics are included in the existing cache system:
- Cached for 7 days with competitor analysis
- Force refresh bypasses cache
- Cache includes traffic and content update data

## Environment Variables

Add to your `.env` file:
```env
# RapidAPI Key for SimilarWeb Traffic API
RAPIDAPI_KEY=your_rapidapi_key_here
```

## Testing

### Test Traffic API
```javascript
import similarWebTrafficService from './services/similarWebTrafficService.js';

const result = await similarWebTrafficService.getCompetitorTraffic('pes.edu');
console.log(result);
```

### Test Content Updates
```javascript
import contentUpdatesService from './services/contentUpdatesService.js';

const result = await contentUpdatesService.getContentUpdates('techcrunch.com');
console.log(result);
```

### Test Full Comparison
```bash
curl -X POST http://localhost:5000/api/competitor/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "yourSite": "example.com",
    "competitorSite": "competitor.com",
    "email": "user@example.com"
  }'
```

## Dependencies

All required dependencies are already installed:
- `axios` - HTTP requests
- `jsdom` - XML/HTML parsing

No new packages needed!

## Notes

1. **SimilarWeb API Limitations**: 
   - Free tier has rate limits
   - Not all domains have data (especially small sites)
   - Data is estimated for some metrics

2. **RSS Feed Detection**:
   - Works best with standard WordPress, Ghost, Medium blogs
   - Some sites may use non-standard RSS paths

3. **Sitemap Parsing**:
   - Supports standard XML sitemaps
   - Handles sitemap indexes
   - Parses first sitemap from index files

4. **Performance**:
   - Traffic API call adds ~2-3 seconds
   - Content updates analysis adds ~1-2 seconds per site
   - Total analysis time: ~15-20 seconds per comparison

## Future Enhancements

Potential improvements:
1. Add more traffic data sources (Alexa, Moz, Ahrefs)
2. Deeper RSS feed analysis (categories, tags, authors)
3. Content freshness scoring
4. Historical trend tracking
5. Social media activity integration
6. Content topic analysis using AI
