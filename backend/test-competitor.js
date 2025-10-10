// Test script for Competitor Analysis API
// Run with: node test-competitor.js

import axios from 'axios';

const API_URL = 'http://localhost:3001/api/competitor';

// Test data
const testData = {
  yourSite: 'example.com',
  competitorSite: 'example.org'
};

console.log('🧪 Testing Competitor Analysis API\n');
console.log('=' .repeat(60));

// Test 1: Health Check
async function testHealth() {
  console.log('\n📍 Test 1: Health Check');
  console.log('-'.repeat(60));
  
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Test 2: Single Site Analysis
async function testSingleSite() {
  console.log('\n📍 Test 2: Single Site Analysis');
  console.log('-'.repeat(60));
  
  try {
    console.log(`Analyzing: ${testData.yourSite}...`);
    console.log('⏳ This may take 30-60 seconds...\n');
    
    const response = await axios.post(
      `${API_URL}/analyze-single`,
      { domain: testData.yourSite },
      { timeout: 120000 } // 2 minutes timeout
    );
    
    console.log('✅ Single site analysis completed');
    console.log('\n📊 Results Summary:');
    console.log(`   Domain: ${response.data.domain}`);
    console.log(`   Success: ${response.data.success}`);
    
    if (response.data.data) {
      const data = response.data.data;
      
      // Puppeteer results
      if (data.puppeteer?.success) {
        console.log('\n   🔍 Puppeteer Analysis:');
        console.log(`      - HTTPS: ${data.puppeteer.security?.isHTTPS}`);
        console.log(`      - CDN: ${data.puppeteer.security?.cdn || 'None'}`);
        console.log(`      - Word Count: ${data.puppeteer.content?.wordCount}`);
        console.log(`      - Images: ${data.puppeteer.content?.images?.total}`);
        console.log(`      - CMS: ${data.puppeteer.technology?.cms || 'Unknown'}`);
      }
      
      // Lighthouse results
      if (data.lighthouse?.dataAvailable) {
        console.log('\n   🔦 Lighthouse Scores:');
        console.log(`      - Performance: ${data.lighthouse.categories?.performance?.score * 100}%`);
        console.log(`      - SEO: ${data.lighthouse.categories?.seo?.score * 100}%`);
        console.log(`      - Accessibility: ${data.lighthouse.categories?.accessibility?.score * 100}%`);
      }
      
      // PageSpeed results
      if (data.pagespeed?.dataAvailable) {
        console.log('\n   📱 PageSpeed Scores:');
        console.log(`      - Desktop: ${data.pagespeed.desktop?.performanceScore}%`);
        console.log(`      - Mobile: ${data.pagespeed.mobile?.performanceScore}%`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Single site analysis failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Test 3: Competitor Comparison
async function testComparison() {
  console.log('\n📍 Test 3: Competitor Comparison');
  console.log('-'.repeat(60));
  
  try {
    console.log(`Comparing:`);
    console.log(`   Your Site: ${testData.yourSite}`);
    console.log(`   Competitor: ${testData.competitorSite}`);
    console.log('⏳ This may take 60-120 seconds...\n');
    
    const response = await axios.post(
      `${API_URL}/analyze`,
      testData,
      { timeout: 180000 } // 3 minutes timeout
    );
    
    console.log('✅ Competitor comparison completed');
    console.log('\n📊 Comparison Results:');
    
    if (response.data.comparison) {
      const comp = response.data.comparison;
      
      // Performance
      if (comp.performance) {
        console.log('\n   ⚡ Performance:');
        console.log(`      Winner: ${comp.performance.winner}`);
        console.log(`      Gap: ${comp.performance.gap}%`);
      }
      
      // SEO
      if (comp.seo) {
        console.log('\n   🔍 SEO:');
        console.log(`      Winner: ${comp.seo.winner}`);
        console.log(`      Your Score: ${comp.seo.scores?.your}`);
        console.log(`      Competitor Score: ${comp.seo.scores?.competitor}`);
      }
      
      // Content
      if (comp.content) {
        console.log('\n   📝 Content:');
        console.log(`      Winner: ${comp.content.winner}`);
        console.log(`      Your Word Count: ${comp.content.your?.wordCount}`);
        console.log(`      Competitor Word Count: ${comp.content.competitor?.wordCount}`);
      }
      
      // Summary
      if (comp.summary) {
        console.log('\n   💡 Summary:');
        if (comp.summary.strengths?.length > 0) {
          console.log('      Strengths:');
          comp.summary.strengths.forEach(s => console.log(`         - ${s}`));
        }
        if (comp.summary.weaknesses?.length > 0) {
          console.log('      Weaknesses:');
          comp.summary.weaknesses.forEach(w => console.log(`         - ${w}`));
        }
        if (comp.summary.recommendations?.length > 0) {
          console.log('      Recommendations:');
          comp.summary.recommendations.forEach(r => console.log(`         - ${r}`));
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Competitor comparison failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🚀 Starting Competitor Analysis Tests\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Health Check
  if (await testHealth()) {
    passed++;
  } else {
    failed++;
    console.log('\n⚠️ Backend may not be running. Start it with: npm start');
    return;
  }
  
  // Test 2: Single Site Analysis
  if (await testSingleSite()) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 3: Competitor Comparison
  if (await testComparison()) {
    passed++;
  } else {
    failed++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
