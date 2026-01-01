import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import ChartCard from './ChartCard';
import { selectMetaAdAccounts, fetchMetaAdAccounts } from '../../store/slices/metaSlice';
import { selectGoogleCustomers, fetchGoogleCustomers } from '../../store/slices/googleSlice';

const ComparisonDashboard = () => {
  const dispatch = useDispatch();

  // Redux state
  const metaAdAccounts = useSelector(selectMetaAdAccounts);
  const googleCustomers = useSelector(selectGoogleCustomers);

  // Component state
  const [selectedMetaAccount, setSelectedMetaAccount] = useState(null);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);
  const [selectedMetaAccount2, setSelectedMetaAccount2] = useState(null);
  const [selectedGoogleAccount2, setSelectedGoogleAccount2] = useState(null);
  const [comparisonMode, setComparisonMode] = useState('meta-vs-google'); // meta-vs-google, meta-vs-meta, google-vs-google

  // Fetch data on component mount - only call the two required APIs
  useEffect(() => {
    dispatch(fetchMetaAdAccounts());
    dispatch(fetchGoogleCustomers());
  }, []); // Empty dependency array to ensure it runs only once on mount

  // Available accounts
  const metaAccounts = useMemo(() => {
    // Extract ad_accounts from the API response structure
    return metaAdAccounts?.result?.ad_accounts || [];
  }, [metaAdAccounts]);

  const googleAccountsList = useMemo(() => {
    // Extract customers from the API response structure
    return googleCustomers?.result?.customers || [];
  }, [googleCustomers]);

  // Campaign comparison disabled for now - only account comparison

  // Helper function to extract Meta account data
  const extractMetaAccountData = (account) => {
    if (!account) return null;

    const insights = account.insights || {};
    const conversionTotals = account.conversion_totals || {};

    console.log('Meta account conversion_totals:', conversionTotals);
    console.log('Meta account insights:', insights);

    // Use conversion_totals.conversions for leads, as it's the most reliable source
    let conversions =conversionTotals.conversions;


    console.log('Meta conversions from conversion_totals:', conversions);

    const allConversions = insights.actions?.filter(action =>
      action.action_type.includes('conversion') || action.action_type === 'purchase'
    ).reduce((sum, action) => sum + (parseInt(action.value || 0) || 0), 0) || 0;

    const interactions = insights.actions?.reduce((sum, action) =>
      sum + (parseInt(action.value || 0) || 0), 0) || 0;

    const engagements = insights.actions?.filter(action =>
      ['post_engagement', 'page_engagement', 'comment', 'post_reaction'].includes(action.action_type)
    ).reduce((sum, action) => sum + (parseInt(action.value || 0) || 0), 0) || 0;

    const spend = parseFloat(insights.spend || 0) || 0;
    const impressions = parseInt(insights.impressions || 0) || 0;
    const clicks = parseInt(insights.clicks || 0) || 0;

    // Check if ROI data is available (Meta accounts with conversion tracking)
    const hasConversionData = account.roi !== undefined && account.roi !== null;
    const roi = hasConversionData ? parseFloat(account.roi) || 0 : null;

    // Calculate safe lead-gen metrics
    const cpl = conversions > 0 ? spend / conversions : 0;
    const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const engagementRate = impressions > 0 ? (engagements / impressions) * 100 : 0;
    const cpe = engagements > 0 ? spend / engagements : 0;

    return {
      accountId: account.account_id,
      accountName: account.account_name || account.account_id,
      platform: 'Meta Ads',
      // Core metrics
      spend: spend,
      impressions: impressions,
      clicks: clicks,
      leads: conversions, // Renamed from conversions
      ctr: parseFloat(insights.ctr) || 0,
      // ROI (only for Meta accounts with conversion data)
      roi: roi,
      // Calculated metrics (HIGH confidence)
      cpl: cpl,
      cvr: cvr,
      cpc: cpc,
      cpm: cpm,
      engagementRate: engagementRate,
      cpe: cpe,
      // Additional metrics
      engagements: engagements,
      interactions: interactions,
      allConversions: allConversions,
      // Confidence flags
      confidence: {
        spend: 'high',
        impressions: 'high',
        clicks: 'high',
        leads: 'high',
        ctr: 'high',
        roi: hasConversionData ? 'high' : null, // Only high confidence if conversion data exists
        cpl: 'high',
        cvr: 'high',
        cpc: 'high',
        cpm: 'high',
        engagementRate: 'high',
        cpe: 'high'
      }
    };
  };

  // Helper function to extract Google account data
  const extractGoogleAccountData = (account) => {
    if (!account) return null;

    const metrics = account.metrics || {};

    console.log('Google account metrics:', metrics);
    console.log('Conversions value:', metrics.conversions, 'Type:', typeof metrics.conversions);

    const spend = parseFloat(metrics.cost || 0) || 0;
    const impressions = parseInt(metrics.impressions || 0) || 0;
    const clicks = parseInt(metrics.clicks || 0) || 0;
    const conversions = parseInt(metrics.conversions || 0) || 0;

    console.log('Final Google conversions value:', conversions);

    let conversionValue = 0;
    if (metrics.conversions_value !== undefined && metrics.conversions_value !== null) {
      const parsed = parseFloat(metrics.conversions_value);
      conversionValue = isNaN(parsed) ? 0 : parsed;
    }

    // Calculate ROI for Google Ads when conversion value exists
    const hasConversionValue = conversionValue > 0 && spend > 0;
    const roi = hasConversionValue ? ((conversionValue - spend) / spend) * 100 : null;

    // Calculate safe lead-gen metrics
    const cpl = conversions > 0 ? spend / conversions : 0;
    const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const engagementRate = impressions > 0 ? ((metrics.engagements || 0) / impressions) * 100 : 0;
    const cpe = (metrics.engagements || 0) > 0 ? spend / (metrics.engagements || 0) : 0;

    return {
      accountId: account.customer_id,
      accountName: account.descriptive_name || account.customer_id,
      platform: 'Google Ads',
      // Core metrics
      spend: spend,
      impressions: impressions,
      clicks: clicks,
      leads: conversions, // Renamed from conversions
      ctr: (metrics.ctr || 0) * 100, // Convert decimal to percentage
      // ROI (only for Google accounts with conversion value tracking)
      roi: roi,
      // Calculated metrics (HIGH confidence)
      cpl: cpl,
      cvr: cvr,
      cpc: cpc,
      cpm: cpm,
      engagementRate: engagementRate,
      cpe: cpe,
      // Additional metrics
      engagements: metrics.engagements || 0,
      interactions: metrics.interactions || 0,
      allConversions: metrics.all_conversions || 0,
      conversionValue: conversionValue,
      // Confidence flags
      confidence: {
        spend: 'high',
        impressions: 'high',
        clicks: 'high',
        leads: 'high',
        ctr: 'high',
        roi: hasConversionValue ? 'high' : null, // Only high confidence if conversion value exists
        cpl: 'high',
        cvr: 'high',
        cpc: 'high',
        cpm: 'high',
        engagementRate: 'high',
        cpe: 'high'
      }
    };
  };

  // Comparison data
  const comparisonData = useMemo(() => {
    console.log('Calculating comparison data for mode:', comparisonMode, {
      selectedMetaAccount, selectedGoogleAccount, selectedMetaAccount2, selectedGoogleAccount2
    });

    const data = {
      account1: null,
      account2: null,
      differences: {}
    };

    if (comparisonMode === 'meta-vs-google') {
      // Meta vs Google comparison
      if (selectedMetaAccount && metaAccounts.length > 0) {
        const metaAccount = metaAccounts.find(acc => acc.account_id === selectedMetaAccount);
        data.account1 = extractMetaAccountData(metaAccount);
      }

      if (selectedGoogleAccount && googleAccountsList.length > 0) {
        const googleAccount = googleAccountsList.find(acc => String(acc.customer_id) === String(selectedGoogleAccount));
        data.account2 = extractGoogleAccountData(googleAccount);
      }
    } else if (comparisonMode === 'meta-vs-meta') {
      // Meta vs Meta comparison
      if (selectedMetaAccount && metaAccounts.length > 0) {
        const metaAccount1 = metaAccounts.find(acc => acc.account_id === selectedMetaAccount);
        data.account1 = extractMetaAccountData(metaAccount1);
        if (data.account1) data.account1.accountName += ' (Account 1)';
      }

      if (selectedMetaAccount2 && metaAccounts.length > 0) {
        const metaAccount2 = metaAccounts.find(acc => acc.account_id === selectedMetaAccount2);
        data.account2 = extractMetaAccountData(metaAccount2);
        if (data.account2) data.account2.accountName += ' (Account 2)';
      }
    } else if (comparisonMode === 'google-vs-google') {
      // Google vs Google comparison
      if (selectedGoogleAccount && googleAccountsList.length > 0) {
        const googleAccount1 = googleAccountsList.find(acc => String(acc.customer_id) === String(selectedGoogleAccount));
        data.account1 = extractGoogleAccountData(googleAccount1);
        if (data.account1) data.account1.accountName += ' (Account 1)';
      }

      if (selectedGoogleAccount2 && googleAccountsList.length > 0) {
        const googleAccount2 = googleAccountsList.find(acc => String(acc.customer_id) === String(selectedGoogleAccount2));
        data.account2 = extractGoogleAccountData(googleAccount2);
        if (data.account2) data.account2.accountName += ' (Account 2)';
      }
    }

    // Calculate differences
    if (data.account1 && data.account2) {
      const metrics = ['spend', 'impressions', 'clicks', 'leads', 'ctr', 'roi', 'cpl', 'cvr', 'cpc', 'cpm', 'engagementRate', 'cpe', 'engagements', 'interactions'];

      metrics.forEach(metric => {
        const value1 = data.account1[metric];
        const value2 = data.account2[metric];

        // Skip metrics that are null/undefined for both accounts
        if ((value1 === null || value1 === undefined) && (value2 === null || value2 === undefined)) {
          return;
        }

        // Use 0 as default for null values when one account has data and the other doesn't
        const val1 = value1 !== null && value1 !== undefined ? value1 : 0;
        const val2 = value2 !== null && value2 !== undefined ? value2 : 0;

        const difference = val1 - val2;
        const percentDiff = val2 !== 0 ? ((val1 - val2) / val2) * 100 : 0;

        data.differences[metric] = {
          absolute: difference,
          percentage: percentDiff,
          better: Math.abs(val1) > Math.abs(val2) ? 'account1' : 'account2'
        };
      });
    }

    return data;
  }, [
    comparisonMode,
    selectedMetaAccount,
    selectedGoogleAccount,
    selectedMetaAccount2,
    selectedGoogleAccount2,
    metaAccounts,
    googleAccountsList
  ]);

  // Chart data for comparison
  const chartData = useMemo(() => {
    if (!comparisonData.account1 && !comparisonData.account2) return {};

    const accounts = [];
    if (comparisonData.account1) accounts.push({ name: comparisonData.account1.accountName, ...comparisonData.account1 });
    if (comparisonData.account2) accounts.push({ name: comparisonData.account2.accountName, ...comparisonData.account2 });

    return {
      spendComparison: accounts.map(p => ({
        name: p.accountName,
        value: p.spend,
        color: p.platform === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      impressionsComparison: accounts.map(p => ({
        name: p.accountName,
        value: p.impressions,
        color: p.platform === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      clicksComparison: accounts.map(p => ({
        name: p.accountName,
        value: p.clicks,
        color: p.platform === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      leadsComparison: accounts.map(p => ({
        name: p.accountName,
        value: p.leads,
        color: p.platform === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      cplComparison: accounts.map(p => ({
        name: p.accountName,
        value: p.cpl,
        color: p.platform === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      ctrComparison: accounts.map(p => ({
        name: p.accountName,
        value: p.ctr,
        color: p.platform === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      cvrComparison: accounts.map(p => ({
        name: p.accountName,
        value: p.cvr,
        color: p.platform === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      engagementRateComparison: accounts.map(p => ({
        name: p.accountName,
        value: p.engagementRate,
        color: p.platform === 'Meta Ads' ? '#1877F2' : '#4285F4'
      }))
    };
  }, [comparisonData]);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const getDifferenceColor = (metric, account) => {
    if (!comparisonData.differences[metric]) return 'text-gray-600';
    const diff = comparisonData.differences[metric];
    if (diff.better === account) return 'text-green-600';
    return 'text-red-600';
  };

  const getDifferenceIcon = (metric, account) => {
    if (!comparisonData.differences[metric]) return null;
    const diff = comparisonData.differences[metric];
    if (diff.better === account) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
    }
    return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'high': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'medium': return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'low': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Platform Comparison Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Compare performance between different platforms or same platform accounts
          </p>
        </div>

        {/* Comparison Mode Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comparison Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  comparisonMode === 'meta-vs-google'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => setComparisonMode('meta-vs-google')}
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">vs</span>
                  <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-gray-900 dark:text-white mt-2">
                  Meta vs Google
                </p>
              </div>
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  comparisonMode === 'meta-vs-meta'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => setComparisonMode('meta-vs-meta')}
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">vs</span>
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-gray-900 dark:text-white mt-2">
                  Meta vs Meta
                </p>
              </div>
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  comparisonMode === 'google-vs-google'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => setComparisonMode('google-vs-google')}
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">vs</span>
                  <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-gray-900 dark:text-white mt-2">
                  Google vs Google
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Account/Campaign Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className={`grid grid-cols-1 ${comparisonMode === 'meta-vs-google' ? 'md:grid-cols-2' : 'md:grid-cols-2'} gap-6`}>
            {comparisonMode === 'meta-vs-google' && (
              <>
                {/* Meta Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    Meta Ads Account
                  </h3>

                  <select
                    value={selectedMetaAccount || ''}
                    onChange={(e) => setSelectedMetaAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Meta Account</option>
                    {metaAccounts.map(account => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.account_name || account.account_id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Google Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">G</span>
                    </div>
                    Google Ads Account
                  </h3>

                  <select
                    value={selectedGoogleAccount || ''}
                    onChange={(e) => {
                      console.log('Google account selected:', e.target.value);
                      setSelectedGoogleAccount(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Google Account</option>
                    {googleAccountsList?.map(account => (
                      <option key={account.customer_id} value={account.customer_id}>
                        {account.descriptive_name || account.customer_id}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {comparisonMode === 'meta-vs-meta' && (
              <>
                {/* Meta Account 1 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">M1</span>
                    </div>
                    Meta Ads Account 1
                  </h3>

                  <select
                    value={selectedMetaAccount || ''}
                    onChange={(e) => setSelectedMetaAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Meta Account 1</option>
                    {metaAccounts.map(account => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.account_name || account.account_id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meta Account 2 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">M2</span>
                    </div>
                    Meta Ads Account 2
                  </h3>

                  <select
                    value={selectedMetaAccount2 || ''}
                    onChange={(e) => setSelectedMetaAccount2(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Meta Account 2</option>
                    {metaAccounts.map(account => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.account_name || account.account_id}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {comparisonMode === 'google-vs-google' && (
              <>
                {/* Google Account 1 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">G1</span>
                    </div>
                    Google Ads Account 1
                  </h3>

                  <select
                    value={selectedGoogleAccount || ''}
                    onChange={(e) => {
                      console.log('Google account 1 selected:', e.target.value);
                      setSelectedGoogleAccount(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Google Account 1</option>
                    {googleAccountsList?.map(account => (
                      <option key={account.customer_id} value={account.customer_id}>
                        {account.descriptive_name || account.customer_id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Google Account 2 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">G2</span>
                    </div>
                    Google Ads Account 2
                  </h3>

                  <select
                    value={selectedGoogleAccount2 || ''}
                    onChange={(e) => {
                      console.log('Google account 2 selected:', e.target.value);
                      setSelectedGoogleAccount2(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Google Account 2</option>
                    {googleAccountsList?.map(account => (
                      <option key={account.customer_id} value={account.customer_id}>
                        {account.descriptive_name || account.customer_id}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Comparison Results */}
        {(comparisonData.account1 || comparisonData.account2) && (
          <div className="space-y-6">
            {/* Section 1: Performance (What Happened) */}
            <div className="space-y-4">
              <div className="flex items-center">
                <ChartBarIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Overview</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Spend */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Spend</h4>
                    </div>
                    {comparisonData.account1 && getConfidenceIcon(comparisonData.account1.confidence.spend)}
                  </div>
                  <div className="space-y-2">
                    {comparisonData.account1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account1.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatCurrency(comparisonData.account1.spend)}
                          </span>
                          {getDifferenceIcon('spend', 'account1')}
                        </div>
                      </div>
                    )}
                    {comparisonData.account2 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account2.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatCurrency(comparisonData.account2.spend)}
                          </span>
                          {getDifferenceIcon('spend', 'account2')}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Impressions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <EyeIcon className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Impressions</h4>
                    </div>
                    {comparisonData.account1 && getConfidenceIcon(comparisonData.account1.confidence.impressions)}
                  </div>
                  <div className="space-y-2">
                    {comparisonData.account1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account1.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatNumber(comparisonData.account1.impressions)}
                          </span>
                          {getDifferenceIcon('impressions', 'account1')}
                        </div>
                      </div>
                    )}
                    {comparisonData.account2 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account2.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatNumber(comparisonData.account2.impressions)}
                          </span>
                          {getDifferenceIcon('impressions', 'account2')}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Clicks */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <CursorArrowRaysIcon className="w-5 h-5 text-purple-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Clicks</h4>
                    </div>
                    {comparisonData.account1 && getConfidenceIcon(comparisonData.account1.confidence.clicks)}
                  </div>
                  <div className="space-y-2">
                    {comparisonData.account1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account1.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatNumber(comparisonData.account1.clicks)}
                          </span>
                          {getDifferenceIcon('clicks', 'account1')}
                        </div>
                      </div>
                    )}
                    {comparisonData.account2 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account2.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatNumber(comparisonData.account2.clicks)}
                          </span>
                          {getDifferenceIcon('clicks', 'account2')}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Leads */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <UserPlusIcon className="w-5 h-5 text-indigo-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Leads</h4>
                    </div>
                    {comparisonData.account1 && getConfidenceIcon(comparisonData.account1.confidence.leads)}
                  </div>
                  <div className="space-y-2">
                    {comparisonData.account1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account1.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatNumber(comparisonData.account1.leads)}
                          </span>
                          {getDifferenceIcon('leads', 'account1')}
                        </div>
                      </div>
                    )}
                    {comparisonData.account2 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account2.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatNumber(comparisonData.account2.leads)}
                          </span>
                          {getDifferenceIcon('leads', 'account2')}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Cost Per Lead */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-5 h-5 text-emerald-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Cost per Lead</h4>
                    </div>
                    {comparisonData.account1 && getConfidenceIcon(comparisonData.account1.confidence.cpl)}
                  </div>
                  <div className="space-y-2">
                    {comparisonData.account1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account1.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatCurrency(comparisonData.account1.cpl)}
                          </span>
                          {getDifferenceIcon('cpl', 'account1')}
                        </div>
                      </div>
                    )}
                    {comparisonData.account2 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account2.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatCurrency(comparisonData.account2.cpl)}
                          </span>
                          {getDifferenceIcon('cpl', 'account2')}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Section 2: Funnel Health */}
            <div className="space-y-4">
              <div className="flex items-center">
                <FunnelIcon className="w-6 h-6 text-orange-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Funnel Health</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CTR */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <ChartBarIcon className="w-5 h-5 text-orange-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">CTR</h4>
                    </div>
                    {comparisonData.account1 && getConfidenceIcon(comparisonData.account1.confidence.ctr)}
                  </div>
                  <div className="space-y-2">
                    {comparisonData.account1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account1.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatPercentage(comparisonData.account1.ctr)}
                          </span>
                          {getDifferenceIcon('ctr', 'account1')}
                        </div>
                      </div>
                    )}
                    {comparisonData.account2 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account2.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatPercentage(comparisonData.account2.ctr)}
                          </span>
                          {getDifferenceIcon('ctr', 'account2')}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Conversion Rate */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <ArrowTrendingUpIcon className="w-5 h-5 text-teal-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Conversion Rate</h4>
                    </div>
                    {comparisonData.account1 && getConfidenceIcon(comparisonData.account1.confidence.cvr)}
                  </div>
                  <div className="space-y-2">
                    {comparisonData.account1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account1.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatPercentage(comparisonData.account1.cvr)}
                          </span>
                          {getDifferenceIcon('cvr', 'account1')}
                        </div>
                      </div>
                    )}
                    {comparisonData.account2 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account2.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatPercentage(comparisonData.account2.cvr)}
                          </span>
                          {getDifferenceIcon('cvr', 'account2')}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Engagement Rate */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <BarsArrowUpIcon className="w-5 h-5 text-pink-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Engagement Rate</h4>
                    </div>
                    {comparisonData.account1 && getConfidenceIcon(comparisonData.account1.confidence.engagementRate)}
                  </div>
                  <div className="space-y-2">
                    {comparisonData.account1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account1.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatPercentage(comparisonData.account1.engagementRate)}
                          </span>
                          {getDifferenceIcon('engagementRate', 'account1')}
                        </div>
                      </div>
                    )}
                    {comparisonData.account2 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account2.accountName}</span>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                            {formatPercentage(comparisonData.account2.engagementRate)}
                          </span>
                          {getDifferenceIcon('engagementRate', 'account2')}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Section 3: Business Impact (when ROI data is available) */}
            {((comparisonData.account1 && comparisonData.account1.roi !== null && comparisonData.account1.roi !== undefined) ||
              (comparisonData.account2 && comparisonData.account2.roi !== null && comparisonData.account2.roi !== undefined)) && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <ChartBarIcon className="w-6 h-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Business Impact</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {/* ROI */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">ROI</h4>
                      </div>
                      {comparisonData.account1 && comparisonData.account1.confidence.roi && getConfidenceIcon(comparisonData.account1.confidence.roi)}
                    </div>
                    <div className="space-y-2">
                      {comparisonData.account1 && comparisonData.account1.roi !== null && comparisonData.account1.roi !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account1.accountName}</span>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                              {formatCurrency(comparisonData.account1.roi)}
                            </span>
                            {getDifferenceIcon('roi', 'account1')}
                          </div>
                        </div>
                      )}
                      {comparisonData.account2 && comparisonData.account2.roi !== null && comparisonData.account2.roi !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">{comparisonData.account2.accountName}</span>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm mr-1">
                              {formatCurrency(comparisonData.account2.roi)}
                            </span>
                            {getDifferenceIcon('roi', 'account2')}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard
                title="Spend & Cost per Lead"
                subtitle="Budget efficiency comparison"
                data={chartData.spendComparison}
                type="bar"
                height={280}
              />
              <ChartCard
                title="Leads Generated"
                subtitle="Conversion results comparison"
                data={chartData.leadsComparison}
                type="bar"
                height={280}
              />
              <ChartCard
                title="Cost per Lead (CPL)"
                subtitle="Acquisition cost efficiency"
                data={chartData.cplComparison}
                type="bar"
                height={280}
              />
              <ChartCard
                title="Click Performance"
                subtitle="CTR comparison between accounts"
                data={chartData.ctrComparison}
                type="bar"
                height={280}
              />
              <ChartCard
                title="Conversion Rate"
                subtitle="Click → Lead efficiency"
                data={chartData.cvrComparison}
                type="bar"
                height={280}
              />
              <ChartCard
                title="Engagement Rate"
                subtitle="Creative performance comparison"
                data={chartData.engagementRateComparison}
                type="bar"
                height={280}
              />
            </div>

            {/* Detailed Comparison Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detailed Comparison
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Side-by-side metrics comparison
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Metric</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                        {comparisonData.account1 ? comparisonData.account1.accountName : 'Account 1'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                        {comparisonData.account2 ? comparisonData.account2.accountName : 'Account 2'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Performance Section */}
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td colSpan="4" className="py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Performance Overview
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Spend</td>
                      <td className={`py-3 px-4 ${comparisonData.account1 ? getDifferenceColor('spend', 'account1') : 'text-gray-500'}`}>
                        {comparisonData.account1 ? formatCurrency(comparisonData.account1.spend) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.account2 ? getDifferenceColor('spend', 'account2') : 'text-gray-500'}`}>
                        {comparisonData.account2 ? formatCurrency(comparisonData.account2.spend) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.spend ?
                          `${comparisonData.differences.spend.percentage > 0 ? '+' : ''}${comparisonData.differences.spend.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Impressions</td>
                      <td className={`py-3 px-4 ${comparisonData.account1 ? getDifferenceColor('impressions', 'account1') : 'text-gray-500'}`}>
                        {comparisonData.account1 ? formatNumber(comparisonData.account1.impressions) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.account2 ? getDifferenceColor('impressions', 'account2') : 'text-gray-500'}`}>
                        {comparisonData.account2 ? formatNumber(comparisonData.account2.impressions) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.impressions ?
                          `${comparisonData.differences.impressions.percentage > 0 ? '+' : ''}${comparisonData.differences.impressions.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Clicks</td>
                      <td className={`py-3 px-4 ${comparisonData.account1 ? getDifferenceColor('clicks', 'account1') : 'text-gray-500'}`}>
                        {comparisonData.account1 ? formatNumber(comparisonData.account1.clicks) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.account2 ? getDifferenceColor('clicks', 'account2') : 'text-gray-500'}`}>
                        {comparisonData.account2 ? formatNumber(comparisonData.account2.clicks) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.clicks ?
                          `${comparisonData.differences.clicks.percentage > 0 ? '+' : ''}${comparisonData.differences.clicks.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Leads (Tracked)</td>
                      <td className={`py-3 px-4 ${comparisonData.account1 ? getDifferenceColor('leads', 'account1') : 'text-gray-500'}`}>
                        {comparisonData.account1 ? formatNumber(comparisonData.account1.leads) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.account2 ? getDifferenceColor('leads', 'account2') : 'text-gray-500'}`}>
                        {comparisonData.account2 ? formatNumber(comparisonData.account2.leads) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.leads ?
                          `${comparisonData.differences.leads.percentage > 0 ? '+' : ''}${comparisonData.differences.leads.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Cost per Lead</td>
                      <td className={`py-3 px-4 ${comparisonData.account1 ? getDifferenceColor('cpl', 'account1') : 'text-gray-500'}`}>
                        {comparisonData.account1 ? formatCurrency(comparisonData.account1.cpl) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.account2 ? getDifferenceColor('cpl', 'account2') : 'text-gray-500'}`}>
                        {comparisonData.account2 ? formatCurrency(comparisonData.account2.cpl) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.cpl ?
                          `${comparisonData.differences.cpl.percentage > 0 ? '+' : ''}${comparisonData.differences.cpl.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>

                    {/* Funnel Health Section */}
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td colSpan="4" className="py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Funnel Health
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">CTR</td>
                      <td className={`py-3 px-4 ${comparisonData.account1 ? getDifferenceColor('ctr', 'account1') : 'text-gray-500'}`}>
                        {comparisonData.account1 ? formatPercentage(comparisonData.account1.ctr) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.account2 ? getDifferenceColor('ctr', 'account2') : 'text-gray-500'}`}>
                        {comparisonData.account2 ? formatPercentage(comparisonData.account2.ctr) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.ctr ?
                          `${comparisonData.differences.ctr.percentage > 0 ? '+' : ''}${comparisonData.differences.ctr.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Conversion Rate</td>
                      <td className={`py-3 px-4 ${comparisonData.account1 ? getDifferenceColor('cvr', 'account1') : 'text-gray-500'}`}>
                        {comparisonData.account1 ? formatPercentage(comparisonData.account1.cvr) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.account2 ? getDifferenceColor('cvr', 'account2') : 'text-gray-500'}`}>
                        {comparisonData.account2 ? formatPercentage(comparisonData.account2.cvr) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.cvr ?
                          `${comparisonData.differences.cvr.percentage > 0 ? '+' : ''}${comparisonData.differences.cvr.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Engagement Rate</td>
                      <td className={`py-3 px-4 ${comparisonData.account1 ? getDifferenceColor('engagementRate', 'account1') : 'text-gray-500'}`}>
                        {comparisonData.account1 ? formatPercentage(comparisonData.account1.engagementRate) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.account2 ? getDifferenceColor('engagementRate', 'account2') : 'text-gray-500'}`}>
                        {comparisonData.account2 ? formatPercentage(comparisonData.account2.engagementRate) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.engagementRate ?
                          `${comparisonData.differences.engagementRate.percentage > 0 ? '+' : ''}${comparisonData.differences.engagementRate.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>

                    {/* Business Impact Section (only show if ROI data exists) */}
                    {((comparisonData.account1 && comparisonData.account1.roi !== null && comparisonData.account1.roi !== undefined) ||
                      (comparisonData.account2 && comparisonData.account2.roi !== null && comparisonData.account2.roi !== undefined)) && (
                      <>
                        <tr className="bg-green-50 dark:bg-green-900/20">
                          <td colSpan="4" className="py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Business Impact
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">ROI</td>
                          <td className={`py-3 px-4 ${comparisonData.account1 && comparisonData.account1.roi !== null ? getDifferenceColor('roi', 'account1') : 'text-gray-500'}`}>
                            {comparisonData.account1 && comparisonData.account1.roi !== null ? formatCurrency(comparisonData.account1.roi) : 'N/A'}
                          </td>
                          <td className={`py-3 px-4 ${comparisonData.account2 && comparisonData.account2.roi !== null ? getDifferenceColor('roi', 'account2') : 'text-gray-500'}`}>
                            {comparisonData.account2 && comparisonData.account2.roi !== null ? formatCurrency(comparisonData.account2.roi) : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {comparisonData.differences.roi ?
                              `${comparisonData.differences.roi.percentage > 0 ? '+' : ''}${comparisonData.differences.roi.percentage.toFixed(1)}%` :
                              'N/A'
                            }
                          </td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Conversions</td>
                      <td className={`py-3 px-4 ${comparisonData.account1 ? getDifferenceColor('conversions', 'account1') : 'text-gray-500'}`}>
                        {comparisonData.account1 ? formatNumber(comparisonData.account1.conversions) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.account2 ? getDifferenceColor('conversions', 'account2') : 'text-gray-500'}`}>
                        {comparisonData.account2 ? formatNumber(comparisonData.account2.conversions) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.conversions ?
                          `${comparisonData.differences.conversions.percentage > 0 ? '+' : ''}${comparisonData.differences.conversions.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* No Selection Message */}
        {(!comparisonData.account1 && !comparisonData.account2) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Select Accounts to Compare
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose accounts from Meta Ads and Google Ads to see a detailed comparison of their performance metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonDashboard;