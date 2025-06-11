// Comprehensive functionality test for Commission Guard platform
const baseUrl = 'http://localhost:5000';

// Test AI Contract Analysis
async function testAIContractAnalysis() {
  console.log('Testing AI Contract Analysis...');
  
  const contractText = `
    BUYER REPRESENTATION AGREEMENT
    
    This agreement is entered into between John Smith (Buyer) and ABC Realty (Agent) 
    for the purpose of representing the buyer in the purchase of real estate property 
    located at 123 Main Street, Austin, TX 78701.
    
    Commission: 3% of purchase price to be paid by seller at closing.
    Term: 90 days from execution date.
    Exclusive representation with protected commission rights.
  `;
  
  try {
    const response = await fetch(`${baseUrl}/api/ai/contract-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        contractText,
        contractType: 'buyer_representation'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✓ AI Contract Analysis working');
      return true;
    } else {
      console.log('✗ AI Contract Analysis failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('✗ AI Contract Analysis error:', error.message);
    return false;
  }
}

// Test Property Research
async function testPropertyResearch() {
  console.log('Testing Property Research...');
  
  try {
    const response = await fetch(`${baseUrl}/api/property/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        address: '1600 Amphitheatre Parkway, Mountain View, CA'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✓ Property Research working');
      return true;
    } else {
      console.log('✗ Property Research failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('✗ Property Research error:', error.message);
    return false;
  }
}

// Test Enhanced Property Analytics
async function testPropertyAnalytics() {
  console.log('Testing Enhanced Property Analytics...');
  
  try {
    const response = await fetch(`${baseUrl}/api/properties/valuation-trends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        address: '123 Main Street, Austin, TX'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✓ Enhanced Property Analytics working');
      return true;
    } else {
      console.log('✗ Enhanced Property Analytics failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('✗ Enhanced Property Analytics error:', error.message);
    return false;
  }
}

// Test Market Analysis
async function testMarketAnalysis() {
  console.log('Testing AI Market Analysis...');
  
  try {
    const response = await fetch(`${baseUrl}/api/ai/market-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        address: '123 Main Street, Austin, TX',
        propertyType: 'single_family',
        price: 450000
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✓ AI Market Analysis working');
      return true;
    } else {
      console.log('✗ AI Market Analysis failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('✗ AI Market Analysis error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting Commission Guard Platform Test Suite...\n');
  
  const results = await Promise.all([
    testAIContractAnalysis(),
    testPropertyResearch(),
    testPropertyAnalytics(),
    testMarketAnalysis()
  ]);
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\nTest Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('✓ All critical features are working properly!');
  } else {
    console.log('⚠ Some features may need attention');
  }
}

// Export for Node.js execution
if (typeof module !== 'undefined') {
  module.exports = { runAllTests };
} else {
  // Run immediately if in browser
  runAllTests();
}