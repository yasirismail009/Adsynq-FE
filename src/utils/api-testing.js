import { apiService } from '../services/api';

/**
 * Comprehensive API Testing Utility for Meta Account Overview Graph
 * 
 * This utility helps test and analyze the actual API response structure
 * to ensure proper data mapping in the AdAccountDetail component.
 */

export class MetaApiTester {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
  }

  /**
   * Test the Meta account overview graph API endpoint
   * @param {string} accountId - The Meta ad account ID
   * @param {Object} dateRange - Date range object with date_from and date_to
   * @returns {Object} Test results with detailed analysis
   */
  async testAccountOverviewGraph(accountId, dateRange = { date_from: '2023-01-01', date_to: '2025-08-13' }) {
    const testId = `test_${Date.now()}`;
    this.currentTest = {
      id: testId,
      accountId,
      dateRange,
      startTime: new Date(),
      status: 'running'
    };

    console.log(`🧪 Starting API Test ${testId}`);
    console.log(`📡 Endpoint: /meta/account-overview-graph/${accountId}/`);
    console.log(`📅 Date Range:`, dateRange);

    try {
      // Make the API call
      const response = await apiService.marketing.metaAccountOverviewGraph(accountId, dateRange);
      
      // Analyze the response
      const analysis = this.analyzeResponse(response);
      
      // Test data extraction
      const extractionTest = this.testDataExtraction(response.data);
      
      // Validate against expected structure
      const validation = this.validateResponseStructure(response.data);
      
      const result = {
        testId,
        accountId,
        dateRange,
        success: true,
        response: response.data,
        analysis,
        extractionTest,
        validation,
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.currentTest.startTime.getTime()
      };

      this.testResults.push(result);
      this.currentTest.status = 'completed';
      
      console.log(`✅ API Test ${testId} completed successfully`);
      console.log(`📊 Response Analysis:`, analysis);
      console.log(`🔍 Extraction Test:`, extractionTest);
      console.log(`✅ Validation:`, validation);
      
      return result;

    } catch (error) {
      const errorResult = {
        testId,
        accountId,
        dateRange,
        success: false,
        error: {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        },
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.currentTest.startTime.getTime()
      };

      this.testResults.push(errorResult);
      this.currentTest.status = 'failed';
      
      console.error(`❌ API Test ${testId} failed:`, error);
      console.error(`❌ Error Details:`, errorResult.error);
      
      return errorResult;
    }
  }

  /**
   * Analyze the API response structure
   * @param {Object} response - The axios response object
   * @returns {Object} Analysis results
   */
  analyzeResponse(response) {
    const { data, status, headers } = response;
    
    return {
      status,
      hasData: !!data,
      dataType: typeof data,
      dataKeys: data ? Object.keys(data) : [],
      hasResult: !!data?.result,
      resultType: typeof data?.result,
      resultKeys: data?.result ? Object.keys(data.result) : [],
      dataStructure: this.determineDataStructure(data),
      responseSize: JSON.stringify(data).length,
      contentType: headers['content-type'],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test data extraction logic
   * @param {Object} responseData - The response data
   * @returns {Object} Extraction test results
   */
  testDataExtraction(responseData) {
    const apiData = responseData?.result || responseData;
    
    const insights = apiData?.insights?.data?.[0] || apiData?.insights?.[0] || null;
    const summary = apiData?.summary || {};
    const statistics = apiData?.statistics || {};
    const campaigns = apiData?.campaigns?.data || apiData?.campaigns || [];
    const accountInfo = apiData?.account_info || apiData?.account || {};

    return {
      hasApiData: !!apiData,
      hasInsights: !!insights,
      hasSummary: !!summary,
      hasStatistics: !!statistics,
      hasCampaigns: campaigns.length > 0,
      hasAccountInfo: !!accountInfo,
      insightsKeys: insights ? Object.keys(insights) : [],
      summaryKeys: Object.keys(summary),
      statisticsKeys: Object.keys(statistics),
      campaignsCount: campaigns.length,
      accountInfoKeys: Object.keys(accountInfo),
      extractedData: {
        insights,
        summary,
        statistics,
        campaigns,
        accountInfo
      }
    };
  }

  /**
   * Validate response structure against expected format
   * @param {Object} responseData - The response data
   * @returns {Object} Validation results
   */
  validateResponseStructure(responseData) {
    const apiData = responseData?.result || responseData;
    
    const validation = {
      hasValidStructure: false,
      structureType: 'unknown',
      missingFields: [],
      unexpectedFields: [],
      fieldValidations: {}
    };

    // Check if it has the expected structure
    if (responseData?.result) {
      validation.structureType = 'wrapped';
      validation.hasValidStructure = true;
    } else if (responseData && typeof responseData === 'object') {
      validation.structureType = 'direct';
      validation.hasValidStructure = true;
    }

    // Check for expected fields
    const expectedFields = ['insights', 'summary', 'statistics', 'campaigns', 'account_info'];
    const actualFields = Object.keys(apiData || {});

    expectedFields.forEach(field => {
      if (!actualFields.includes(field)) {
        validation.missingFields.push(field);
      }
    });

    // Check for unexpected fields
    actualFields.forEach(field => {
      if (!expectedFields.includes(field)) {
        validation.unexpectedFields.push(field);
      }
    });

    // Validate individual fields
    validation.fieldValidations = {
      insights: this.validateInsights(apiData?.insights),
      summary: this.validateSummary(apiData?.summary),
      statistics: this.validateStatistics(apiData?.statistics),
      campaigns: this.validateCampaigns(apiData?.campaigns),
      accountInfo: this.validateAccountInfo(apiData?.account_info)
    };

    return validation;
  }

  /**
   * Validate insights data structure
   * @param {Object} insights - Insights data
   * @returns {Object} Validation result
   */
  validateInsights(insights) {
    if (!insights) return { valid: false, reason: 'Missing insights' };

    const data = insights.data?.[0] || insights[0] || insights;
    const expectedKeys = ['spend', 'impressions', 'clicks', 'ctr', 'reach', 'cpc', 'cpm'];
    const actualKeys = Object.keys(data || {});

    return {
      valid: expectedKeys.some(key => actualKeys.includes(key)),
      hasData: !!data,
      expectedKeys,
      actualKeys,
      missingKeys: expectedKeys.filter(key => !actualKeys.includes(key))
    };
  }

  /**
   * Validate summary data structure
   * @param {Object} summary - Summary data
   * @returns {Object} Validation result
   */
  validateSummary(summary) {
    if (!summary) return { valid: false, reason: 'Missing summary' };

    const expectedKeys = ['total_spend', 'total_impressions', 'total_clicks', 'average_ctr'];
    const actualKeys = Object.keys(summary);

    return {
      valid: expectedKeys.some(key => actualKeys.includes(key)),
      expectedKeys,
      actualKeys,
      missingKeys: expectedKeys.filter(key => !actualKeys.includes(key))
    };
  }

  /**
   * Validate statistics data structure
   * @param {Object} statistics - Statistics data
   * @returns {Object} Validation result
   */
  validateStatistics(statistics) {
    if (!statistics) return { valid: false, reason: 'Missing statistics' };

    const expectedSections = ['performance_metrics', 'account_health', 'roi_metrics'];
    const actualSections = Object.keys(statistics);

    return {
      valid: expectedSections.some(section => actualSections.includes(section)),
      expectedSections,
      actualSections,
      missingSections: expectedSections.filter(section => !actualSections.includes(section))
    };
  }

  /**
   * Validate campaigns data structure
   * @param {Object} campaigns - Campaigns data
   * @returns {Object} Validation result
   */
  validateCampaigns(campaigns) {
    if (!campaigns) return { valid: false, reason: 'Missing campaigns' };

    const data = campaigns.data || campaigns;
    const isArray = Array.isArray(data);

    return {
      valid: isArray,
      isArray,
      count: isArray ? data.length : 0,
      hasData: isArray && data.length > 0
    };
  }

  /**
   * Validate account info data structure
   * @param {Object} accountInfo - Account info data
   * @returns {Object} Validation result
   */
  validateAccountInfo(accountInfo) {
    if (!accountInfo) return { valid: false, reason: 'Missing account info' };

    const expectedKeys = ['name', 'id', 'currency', 'status'];
    const actualKeys = Object.keys(accountInfo);

    return {
      valid: expectedKeys.some(key => actualKeys.includes(key)),
      expectedKeys,
      actualKeys,
      missingKeys: expectedKeys.filter(key => !actualKeys.includes(key))
    };
  }

  /**
   * Determine the data structure type
   * @param {Object} data - Response data
   * @returns {string} Structure type
   */
  determineDataStructure(data) {
    if (!data) return 'no_data';
    if (data.result) return 'wrapped_with_result';
    if (typeof data === 'object') return 'direct_object';
    return 'unknown';
  }

  /**
   * Get all test results
   * @returns {Array} Array of test results
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * Get the latest test result
   * @returns {Object} Latest test result
   */
  getLatestTestResult() {
    return this.testResults[this.testResults.length - 1];
  }

  /**
   * Clear test results
   */
  clearTestResults() {
    this.testResults = [];
  }

  /**
   * Generate a comprehensive test report
   * @returns {Object} Test report
   */
  generateTestReport() {
    const successfulTests = this.testResults.filter(r => r.success);
    const failedTests = this.testResults.filter(r => !r.success);

    return {
      totalTests: this.testResults.length,
      successfulTests: successfulTests.length,
      failedTests: failedTests.length,
      successRate: this.testResults.length > 0 ? (successfulTests.length / this.testResults.length) * 100 : 0,
      averageDuration: this.testResults.length > 0 
        ? this.testResults.reduce((sum, r) => sum + r.duration, 0) / this.testResults.length 
        : 0,
      latestResult: this.getLatestTestResult(),
      commonIssues: this.analyzeCommonIssues(),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Analyze common issues across tests
   * @returns {Array} Common issues
   */
  analyzeCommonIssues() {
    const issues = [];
    
    this.testResults.forEach(result => {
      if (!result.success) {
        issues.push({
          type: 'api_error',
          message: result.error.message,
          status: result.error.status
        });
      } else if (result.validation) {
        if (result.validation.missingFields.length > 0) {
          issues.push({
            type: 'missing_fields',
            fields: result.validation.missingFields
          });
        }
        if (result.validation.unexpectedFields.length > 0) {
          issues.push({
            type: 'unexpected_fields',
            fields: result.validation.unexpectedFields
          });
        }
      }
    });

    return issues;
  }

  /**
   * Generate recommendations based on test results
   * @returns {Array} Recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const latestResult = this.getLatestTestResult();

    if (!latestResult) {
      recommendations.push('No tests have been run yet. Run a test to get recommendations.');
      return recommendations;
    }

    if (!latestResult.success) {
      recommendations.push('Check the API endpoint and ensure the backend service is running.');
      recommendations.push('Verify authentication and authorization for the Meta API.');
      recommendations.push('Check the account ID format and ensure it exists.');
    } else {
      if (latestResult.validation.missingFields.length > 0) {
        recommendations.push(`Add missing fields to API response: ${latestResult.validation.missingFields.join(', ')}`);
      }
      if (latestResult.validation.structureType === 'direct') {
        recommendations.push('Consider wrapping the response in a "result" object for consistency.');
      }
      if (latestResult.extractionTest.hasInsights === false) {
        recommendations.push('Ensure insights data is included in the API response.');
      }
    }

    return recommendations;
  }
}

// Export a singleton instance
export const metaApiTester = new MetaApiTester();

// Export utility functions
export const testMetaApi = (accountId, dateRange) => metaApiTester.testAccountOverviewGraph(accountId, dateRange);
export const getTestReport = () => metaApiTester.generateTestReport();
export const clearTests = () => metaApiTester.clearTestResults();
