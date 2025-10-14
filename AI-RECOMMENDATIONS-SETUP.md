# AI Recommendations Setup Guide

## Overview
The AI Recommendations feature uses Google Gemini AI to generate personalized, actionable recommendations for improving your website based on competitor analysis.

## Features
- 🤖 **Real AI-Powered Insights**: Uses Google Gemini Pro model to analyze your site vs competitor
- 🎯 **3 Targeted Recommendations**: Focuses on highest-impact improvements
- 📊 **Data-Driven Analysis**: Considers performance, SEO, content, backlinks, and technical metrics
- ✅ **Actionable Steps**: Each recommendation includes 3-4 specific implementation steps
- 🏷️ **Impact & Effort Ratings**: Helps prioritize which recommendations to implement first

## Setup Instructions

### 1. Install Dependencies

If not already installed, add the Google Generative AI package:

```bash
cd backend
npm install @google/generative-ai
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 3. Configure Environment Variable

Add your Gemini API key to the backend `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

**⚠️ IMPORTANT**: Never commit your API key to version control!

### 4. Restart Backend Server

After adding the environment variable, restart your backend server:

```bash
cd backend
npm start
```

Or if using the batch file:
```bash
start-both-servers.bat
```

## How It Works

### Backend Architecture

**Service: `backend/services/geminiService.js`**
- Initializes Google Generative AI with your API key
- Formats analysis data into structured prompts
- Calls Gemini Pro model for recommendations
- Parses AI responses into structured JSON
- Provides fallback recommendations if AI fails

**Route: `backend/routes/competitorRoutes.js`**
- POST endpoint: `/api/competitor/ai-recommendations`
- Accepts: yourSite, competitorSite, comparison data
- Returns: 3 AI-generated recommendations

### Frontend Implementation

**Component: `frontend/components/CompetitorResults.tsx`**
- "Generate AI Insights" button triggers API call
- Loading state with animated spinner
- Displays recommendations with impact/effort badges
- Error handling with retry option
- Shows AI-powered branding

### Data Flow

```
User clicks button
    ↓
Frontend sends POST request with:
  - yourSite (all metrics)
  - competitorSite (all metrics)
  - comparison (performance gaps)
    ↓
Backend prepares analysis data
    ↓
Gemini AI analyzes and generates recommendations
    ↓
Backend parses and validates response
    ↓
Frontend displays 3 recommendations
```

## API Request Format

**Endpoint**: `POST http://localhost:5000/api/competitor/ai-recommendations`

**Request Body**:
```json
{
  "yourSite": {
    "domain": "example.com",
    "lighthouse": { /* scores */ },
    "pagespeed": { /* scores */ },
    "puppeteer": { /* content & SEO data */ },
    "backlinks": { /* backlink data */ }
  },
  "competitorSite": {
    // Same structure as yourSite
  },
  "comparison": {
    "performance": { "winner": "yours", "gap": 5 },
    "seo": { /* SEO comparison */ },
    // ... other comparisons
  }
}
```

**Response**:
```json
{
  "success": true,
  "recommendations": [
    {
      "title": "Optimize Page Load Speed",
      "impact": "High",
      "effort": "Medium",
      "description": "Brief description of why this matters",
      "steps": [
        "Step 1: Specific action",
        "Step 2: Another action",
        "Step 3: Follow-up action",
        "Step 4: Final verification"
      ]
    },
    // ... 2 more recommendations
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Recommendation Structure

Each AI-generated recommendation includes:

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `title` | string | max 60 chars | Short, actionable title |
| `impact` | string | High/Medium/Low | Expected impact on performance |
| `effort` | string | High/Medium/Low | Implementation difficulty |
| `description` | string | max 150 chars | Why this recommendation matters |
| `steps` | array | 3-4 items | Specific action steps |

## AI Prompt Strategy

The AI receives:
1. **Your Site Metrics**: Performance, SEO, content, backlinks
2. **Competitor Metrics**: Same metrics for comparison
3. **Performance Gaps**: Calculated differences in key areas
4. **Context Instructions**: Focus on biggest gaps and actionable steps

The AI considers:
- Page speed optimization opportunities
- Content strategy improvements
- Backlink building needs
- Technical SEO enhancements
- Mobile optimization requirements
- Accessibility improvements

## Error Handling

### No API Key Configured
```json
{
  "success": false,
  "error": "AI service is not configured. Please contact support."
}
```

### API Rate Limit / Quota Exceeded
- Falls back to pre-defined recommendations
- Shows error message in UI
- Allows user to retry

### Invalid Response Format
- Gracefully handles parsing errors
- Returns fallback recommendations
- Logs error for debugging

## Fallback Recommendations

If AI fails, the service provides 3 default recommendations:
1. **Optimize Page Load Speed** - Performance improvements
2. **Build High-Quality Backlinks** - Authority building
3. **Enhance Content Depth** - Content strategy

## Cost Considerations

**Google Gemini API Pricing** (as of Jan 2024):
- Free tier: 60 requests per minute
- Gemini Pro is free for limited usage
- Check [Google AI pricing](https://ai.google.dev/pricing) for latest rates

**Estimated Usage**:
- 1 API call per competitor analysis
- ~500-1000 tokens per request
- Very cost-effective for production use

## Testing

### Test the API Endpoint

```bash
curl -X POST http://localhost:5000/api/competitor/ai-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "yourSite": { "domain": "example.com", "lighthouse": {}, "pagespeed": {} },
    "competitorSite": { "domain": "competitor.com", "lighthouse": {}, "pagespeed": {} },
    "comparison": { "performance": { "winner": "competitor", "gap": -10 } }
  }'
```

### Monitor Logs

Check backend console for:
```
🤖 AI Recommendations Request:
   Your Site: example.com
   Competitor: competitor.com
🤖 Calling Gemini AI service...
✅ Generated 3 AI recommendations
```

## Troubleshooting

### "AI service is not configured"
- Check that `GEMINI_API_KEY` is in `.env`
- Restart backend server after adding key
- Verify key is valid at Google AI Studio

### Recommendations are too generic
- Ensure complete data is sent in request
- Check that comparison object has all fields
- Review AI prompt in `geminiService.js`

### API Timeout
- Increase timeout in fetch call
- Check network connectivity
- Verify Gemini API status

## Future Enhancements

Potential improvements:
- [ ] Cache AI recommendations for 24 hours
- [ ] Allow users to rate recommendations (feedback loop)
- [ ] Generate industry-specific recommendations
- [ ] Add "Explain this recommendation" feature
- [ ] Track which recommendations users implement
- [ ] A/B test different prompt strategies

## Security Notes

- ✅ API key stored in environment variable
- ✅ Never exposed to frontend
- ✅ Request validation on backend
- ⚠️ Add rate limiting for production
- ⚠️ Consider user authentication

## Support

If you encounter issues:
1. Check backend logs for error messages
2. Verify API key is valid and has quota
3. Test with fallback recommendations
4. Review error response from API

---

**Created**: January 2024  
**Last Updated**: January 2024  
**Version**: 1.0.0
