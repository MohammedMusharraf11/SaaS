# Social Media Metrics - Dynamic Data Update

## Changes Made

### Problem
The engagement metrics (likes, comments, shares, and engagement rate) in the Social Media Performance page were hardcoded and not displaying real data from Facebook and Instagram APIs.

### Solution
Updated `frontend/components/SocialMediaMetricsCard.tsx` to fetch and display dynamic data from the backend APIs.

## Key Changes

### 1. Updated Interface Definitions
- Added `EngagementScore` interface to match backend data structure
- Added `TopPost` interface for top performing posts
- Extended `SocialData` interface to include Instagram/Facebook specific fields

### 2. Dynamic Data Fetching
- Modified `fetchSocialMetrics()` to call the appropriate API based on selected network:
  - Instagram: `http://localhost:5000/api/instagram/metrics`
  - Facebook: `http://localhost:5000/api/facebook/metrics`
- Added proper error handling and connection status management

### 3. Dynamic Engagement Metrics
- Updated `getNetworkStats()` to use real data from API:
  - Likes, comments, shares now come from `socialData.engagementScore`
  - Engagement rate is calculated from actual API data
  - Reach is displayed from real metrics
- Added number formatting to convert raw numbers to K format (e.g., 1500 → 1.5K)

### 4. Dynamic Engagement Score Calculation
- Updated `computeEngagementScore()` to calculate score based on real engagement rate
- Score scales from 20-100 based on engagement rate (5% = 100 score)

### 5. Dynamic Follower Growth Chart
- Modified `calculateFollowerGrowthData()` to use real follower growth data from API
- Falls back to mock data if API data is unavailable

### 6. Dynamic Top Posts
- Updated top posts table to display real data from `socialData.topPosts`
- Falls back to mock data if no real posts available

### 7. Dynamic Reputation Benchmark
- Reputation score now displays real data from `socialData.reputationBenchmark.score`
- Sentiment (Excellent/Good/Fair) is shown from API data

### 8. User Authentication
- Added Supabase integration to fetch logged-in user's email
- Component now automatically gets user email on mount
- Changed default network to 'instagram' for better initial experience

## API Endpoints Used

### Instagram
- `GET /api/instagram/metrics?email={email}&period={period}`
  - Returns: engagementScore, followerGrowth, topPosts, reputationBenchmark

### Facebook
- `GET /api/facebook/metrics?email={email}&period={period}`
  - Returns: engagementScore, followerGrowth, topPosts, reputationBenchmark

## Data Flow

1. Component mounts → Fetches user email from Supabase
2. User selects network (Instagram/Facebook) and timeframe
3. Component calls appropriate API endpoint
4. Backend fetches data from Instagram/Facebook Graph API
5. Frontend displays real metrics:
   - Engagement Score card: Real likes, comments, shares, engagement rate
   - Follower Growth chart: Real follower data over time
   - Top Posts table: Real post performance data
   - Reputation Benchmark: Real reputation score

## Testing

To test the changes:

1. Ensure backend server is running: `npm start` in backend folder
2. Ensure user has connected Instagram or Facebook account
3. Navigate to Social Media Performance page
4. Select Instagram or Facebook from network dropdown
5. Verify that real metrics are displayed:
   - Engagement Score shows actual likes/comments/shares
   - Engagement Rate is calculated from real data
   - Top Posts show actual post performance
   - Follower Growth chart displays real growth data

## Fallback Behavior

If API data is unavailable (user not connected or API error):
- Component displays mock data as fallback
- Shows "No social media data available" message
- Provides "Connect Platform" button

## Notes

- All hardcoded values have been replaced with dynamic data
- Component maintains backward compatibility with mock data
- Number formatting ensures consistent display (K format)
- Error handling prevents crashes if API fails
