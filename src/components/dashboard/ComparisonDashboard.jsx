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
  BarsArrowDownIcon
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
  const [comparisonMode] = useState('accounts'); // Only accounts comparison for now

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

  // Comparison data
  const comparisonData = useMemo(() => {
    console.log('Calculating comparison data for selected accounts:', { selectedMetaAccount, selectedGoogleAccount });
    const data = {
      meta: null,
      google: null,
      differences: {}
    };

    // Account-level comparison using account lists
    if (selectedMetaAccount && metaAccounts.length > 0) {
      const metaAccount = metaAccounts.find(acc =>
        acc.account_id === selectedMetaAccount
      );
      if (metaAccount) {
        const insights = metaAccount.insights || {};

        // Extract various actions for comprehensive metrics
        const purchaseActions = insights.actions?.find(action =>
          action.action_type === 'purchase' || action.action_type === 'offsite_conversion.fb_pixel_purchase'
        );
        const conversions = purchaseActions ? parseInt(purchaseActions.value) || 0 : 0;

        const allConversions = insights.actions?.filter(action =>
          action.action_type.includes('conversion') || action.action_type === 'purchase'
        ).reduce((sum, action) => sum + (parseInt(action.value) || 0), 0) || 0;

        const interactions = insights.actions?.reduce((sum, action) =>
          sum + (parseInt(action.value) || 0), 0) || 0;

        const engagements = insights.actions?.filter(action =>
          ['post_engagement', 'page_engagement', 'comment', 'post_reaction'].includes(action.action_type)
        ).reduce((sum, action) => sum + (parseInt(action.value) || 0), 0) || 0;

        const addToCartActions = insights.actions?.find(action =>
          action.action_type === 'add_to_cart' || action.action_type === 'offsite_conversion.fb_pixel_add_to_cart'
        );
        const orders = addToCartActions ? parseInt(addToCartActions.value) || 0 : 0;

        // Extract revenue from action_values
        const purchaseValues = insights.action_values?.find(action =>
          action.action_type === 'purchase' || action.action_type === 'offsite_conversion.fb_pixel_purchase'
        );
        const revenue = purchaseValues ? parseFloat(purchaseValues.value) || 0 : 0;

        data.meta = {
          accountId: metaAccount.account_id,
          accountName: metaAccount.account_name || metaAccount.account_id,
          spend: parseFloat(insights.spend) || 0,
          impressions: parseInt(insights.impressions) || 0,
          clicks: parseInt(insights.clicks) || 0,
          conversions: conversions,
          ctr: parseFloat(insights.ctr) || 0,
          cpc: parseFloat(insights.cpc) || 0,
          cpm: parseFloat(insights.cpm) || 0,
          roas: metaAccount.roi || 0,
          // Additional Meta metrics (mapped to Google equivalents where possible)
          allConversions: allConversions,
          interactions: interactions,
          interactionRate: interactions > 0 && (parseInt(insights.impressions) || 0) > 0 ? (interactions / (parseInt(insights.impressions) || 0)) * 100 : 0,
          engagements: engagements,
          orders: orders,
          revenue: revenue,
          unitsSold: 0, // Not available in Meta API
          crossDeviceConversions: 0, // Not available in Meta API
          invalidClicks: 0, // Not available in Meta API
          invalidClickRate: 0 // Not available in Meta API
        };
      }
    }

    if (selectedGoogleAccount && googleAccountsList.length > 0) {
      const googleAccount = googleAccountsList.find(acc => {
        // Debug logging for troubleshooting
        const accId = String(acc.customer_id);
        const selectedId = String(selectedGoogleAccount);
        const match = accId === selectedId;
        if (!match && accId.includes(selectedId)) {
          console.log('Partial match - acc:', accId, 'selected:', selectedId);
        }
        return match;
      });

      if (googleAccount) {
        console.log('Selected Google account:', googleAccount);
        const metrics = googleAccount.metrics || {};
        console.log('Google account metrics:', metrics);
        data.google = {
          accountId: googleAccount.customer_id,
          accountName: googleAccount.descriptive_name || googleAccount.customer_id,
          spend: metrics.cost || 0,
          impressions: metrics.impressions || 0,
          clicks: metrics.clicks || 0,
          conversions: metrics.conversions || 0,
          ctr: (metrics.ctr || 0) * 100, // Convert decimal to percentage
          cpc: metrics.clicks > 0 ? (metrics.cost / metrics.clicks) : 0,
          cpm: metrics.impressions > 0 ? ((metrics.cost / metrics.impressions) * 1000) : 0,
          roas: metrics.conversions > 0 ? (metrics.cost / metrics.conversions) : 0,
          // Additional Google metrics
          allConversions: metrics.all_conversions || 0,
          interactions: metrics.interactions || 0,
          interactionRate: (metrics.interaction_rate || 0) * 100,
          engagements: metrics.engagements || 0,
          orders: metrics.orders || 0,
          revenue: metrics.revenue || 0,
          unitsSold: metrics.units_sold || 0,
          crossDeviceConversions: metrics.cross_device_conversions || 0,
          invalidClicks: metrics.invalid_clicks || 0,
          invalidClickRate: (metrics.invalid_click_rate || 0) * 100
        };
      }
    }

    // Calculate differences
    if (data.meta && data.google) {
      const metrics = ['spend', 'impressions', 'clicks', 'conversions', 'ctr', 'cpc', 'cpm', 'roas', 'allConversions', 'interactions', 'engagements', 'orders'];
      metrics.forEach(metric => {
        const metaValue = data.meta[metric] || 0;
        const googleValue = data.google[metric] || 0;
        const difference = metaValue - googleValue;
        const percentDiff = googleValue !== 0 ? ((metaValue - googleValue) / googleValue) * 100 : 0;

        data.differences[metric] = {
          absolute: difference,
          percentage: percentDiff,
          better: Math.abs(metaValue) > Math.abs(googleValue) ? 'meta' : 'google'
        };
      });
    }

    return data;
  }, [
    comparisonMode,
    selectedMetaAccount,
    selectedGoogleAccount,
    metaAccounts,
    googleAccountsList
  ]);

  // Chart data for comparison
  const chartData = useMemo(() => {
    if (!comparisonData.meta && !comparisonData.google) return {};

    const platforms = [];
    if (comparisonData.meta) platforms.push({ name: 'Meta Ads', ...comparisonData.meta });
    if (comparisonData.google) platforms.push({ name: 'Google Ads', ...comparisonData.google });

    return {
      spendComparison: platforms.map(p => ({
        name: p.name,
        value: p.spend,
        color: p.name === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      impressionsComparison: platforms.map(p => ({
        name: p.name,
        value: p.impressions,
        color: p.name === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      clicksComparison: platforms.map(p => ({
        name: p.name,
        value: p.clicks,
        color: p.name === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      ctrComparison: platforms.map(p => ({
        name: p.name,
        value: p.ctr,
        color: p.name === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      interactionsComparison: platforms.map(p => ({
        name: p.name,
        value: p.interactions || 0,
        color: p.name === 'Meta Ads' ? '#1877F2' : '#4285F4'
      })),
      engagementsComparison: platforms.map(p => ({
        name: p.name,
        value: p.engagements || 0,
        color: p.name === 'Meta Ads' ? '#1877F2' : '#4285F4'
      }))
    };
  }, [comparisonData]);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const getDifferenceColor = (metric, platform) => {
    if (!comparisonData.differences[metric]) return 'text-gray-600';
    const diff = comparisonData.differences[metric];
    if (diff.better === platform) return 'text-green-600';
    return 'text-red-600';
  };

  const getDifferenceIcon = (metric, platform) => {
    if (!comparisonData.differences[metric]) return null;
    const diff = comparisonData.differences[metric];
    if (diff.better === platform) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
    }
    return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
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
            Compare performance between Meta Ads and Google Ads platforms
          </p>
        </div>


        {/* Account/Campaign Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>

        {/* Comparison Results */}
        {(comparisonData.meta || comparisonData.google) && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Spend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-8 h-8 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spend</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {comparisonData.meta && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Meta Ads</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                          {formatCurrency(comparisonData.meta.spend)}
                        </span>
                        {getDifferenceIcon('spend', 'meta')}
                      </div>
                    </div>
                  )}
                  {comparisonData.google && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Google Ads</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                          {formatCurrency(comparisonData.google.spend)}
                        </span>
                        {getDifferenceIcon('spend', 'google')}
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <EyeIcon className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Impressions</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {comparisonData.meta && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Meta Ads</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                          {formatNumber(comparisonData.meta.impressions)}
                        </span>
                        {getDifferenceIcon('impressions', 'meta')}
                      </div>
                    </div>
                  )}
                  {comparisonData.google && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Google Ads</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                          {formatNumber(comparisonData.google.impressions)}
                        </span>
                        {getDifferenceIcon('impressions', 'google')}
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CursorArrowRaysIcon className="w-8 h-8 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clicks</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {comparisonData.meta && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Meta Ads</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                          {formatNumber(comparisonData.meta.clicks)}
                        </span>
                        {getDifferenceIcon('clicks', 'meta')}
                      </div>
                    </div>
                  )}
                  {comparisonData.google && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Google Ads</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                          {formatNumber(comparisonData.google.clicks)}
                        </span>
                        {getDifferenceIcon('clicks', 'google')}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* CTR */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-8 h-8 text-orange-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CTR</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {comparisonData.meta && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Meta Ads</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                          {formatPercentage(comparisonData.meta.ctr)}
                        </span>
                        {getDifferenceIcon('ctr', 'meta')}
                      </div>
                    </div>
                  )}
                  {comparisonData.google && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Google Ads</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                          {formatPercentage(comparisonData.google.ctr)}
                        </span>
                        {getDifferenceIcon('ctr', 'google')}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Spend Comparison"
                subtitle="Cost comparison between platforms"
                data={chartData.spendComparison}
                type="bar"
                height={300}
              />
              <ChartCard
                title="Impressions Comparison"
                subtitle="Reach comparison between platforms"
                data={chartData.impressionsComparison}
                type="bar"
                height={300}
              />
              <ChartCard
                title="Clicks Comparison"
                subtitle="Interaction comparison between platforms"
                data={chartData.clicksComparison}
                type="bar"
                height={300}
              />
              <ChartCard
                title="CTR Comparison"
                subtitle="Click-through rate comparison between platforms"
                data={chartData.ctrComparison}
                type="bar"
                height={300}
              />
              <ChartCard
                title="Interactions Comparison"
                subtitle="Total interactions comparison between platforms"
                data={chartData.interactionsComparison}
                type="bar"
                height={300}
              />
              <ChartCard
                title="Engagements Comparison"
                subtitle="Engagement metrics comparison between platforms"
                data={chartData.engagementsComparison}
                type="bar"
                height={300}
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
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Meta Ads</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Google Ads</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Spend</td>
                      <td className={`py-3 px-4 ${comparisonData.meta ? getDifferenceColor('spend', 'meta') : 'text-gray-500'}`}>
                        {comparisonData.meta ? formatCurrency(comparisonData.meta.spend) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.google ? getDifferenceColor('spend', 'google') : 'text-gray-500'}`}>
                        {comparisonData.google ? formatCurrency(comparisonData.google.spend) : 'N/A'}
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
                      <td className={`py-3 px-4 ${comparisonData.meta ? getDifferenceColor('impressions', 'meta') : 'text-gray-500'}`}>
                        {comparisonData.meta ? formatNumber(comparisonData.meta.impressions) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.google ? getDifferenceColor('impressions', 'google') : 'text-gray-500'}`}>
                        {comparisonData.google ? formatNumber(comparisonData.google.impressions) : 'N/A'}
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
                      <td className={`py-3 px-4 ${comparisonData.meta ? getDifferenceColor('clicks', 'meta') : 'text-gray-500'}`}>
                        {comparisonData.meta ? formatNumber(comparisonData.meta.clicks) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.google ? getDifferenceColor('clicks', 'google') : 'text-gray-500'}`}>
                        {comparisonData.google ? formatNumber(comparisonData.google.clicks) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.clicks ?
                          `${comparisonData.differences.clicks.percentage > 0 ? '+' : ''}${comparisonData.differences.clicks.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">CTR</td>
                      <td className={`py-3 px-4 ${comparisonData.meta ? getDifferenceColor('ctr', 'meta') : 'text-gray-500'}`}>
                        {comparisonData.meta ? formatPercentage(comparisonData.meta.ctr) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.google ? getDifferenceColor('ctr', 'google') : 'text-gray-500'}`}>
                        {comparisonData.google ? formatPercentage(comparisonData.google.ctr) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.ctr ?
                          `${comparisonData.differences.ctr.percentage > 0 ? '+' : ''}${comparisonData.differences.ctr.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">CPC</td>
                      <td className={`py-3 px-4 ${comparisonData.meta ? getDifferenceColor('cpc', 'meta') : 'text-gray-500'}`}>
                        {comparisonData.meta ? formatCurrency(comparisonData.meta.cpc) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.google ? getDifferenceColor('cpc', 'google') : 'text-gray-500'}`}>
                        {comparisonData.google ? formatCurrency(comparisonData.google.cpc) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.cpc ?
                          `${comparisonData.differences.cpc.percentage > 0 ? '+' : ''}${comparisonData.differences.cpc.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Conversions</td>
                      <td className={`py-3 px-4 ${comparisonData.meta ? getDifferenceColor('conversions', 'meta') : 'text-gray-500'}`}>
                        {comparisonData.meta ? formatNumber(comparisonData.meta.conversions) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.google ? getDifferenceColor('conversions', 'google') : 'text-gray-500'}`}>
                        {comparisonData.google ? formatNumber(comparisonData.google.conversions) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.conversions ?
                          `${comparisonData.differences.conversions.percentage > 0 ? '+' : ''}${comparisonData.differences.conversions.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">All Conversions</td>
                      <td className={`py-3 px-4 ${comparisonData.meta ? getDifferenceColor('allConversions', 'meta') : 'text-gray-500'}`}>
                        {comparisonData.meta ? formatNumber(comparisonData.meta.allConversions || 0) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.google ? getDifferenceColor('allConversions', 'google') : 'text-gray-500'}`}>
                        {comparisonData.google ? formatNumber(comparisonData.google.allConversions || 0) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.allConversions ?
                          `${comparisonData.differences.allConversions.percentage > 0 ? '+' : ''}${comparisonData.differences.allConversions.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Interactions</td>
                      <td className={`py-3 px-4 ${comparisonData.meta ? getDifferenceColor('interactions', 'meta') : 'text-gray-500'}`}>
                        {comparisonData.meta ? formatNumber(comparisonData.meta.interactions || 0) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.google ? getDifferenceColor('interactions', 'google') : 'text-gray-500'}`}>
                        {comparisonData.google ? formatNumber(comparisonData.google.interactions || 0) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.interactions ?
                          `${comparisonData.differences.interactions.percentage > 0 ? '+' : ''}${comparisonData.differences.interactions.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Engagements</td>
                      <td className={`py-3 px-4 ${comparisonData.meta ? getDifferenceColor('engagements', 'meta') : 'text-gray-500'}`}>
                        {comparisonData.meta ? formatNumber(comparisonData.meta.engagements || 0) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.google ? getDifferenceColor('engagements', 'google') : 'text-gray-500'}`}>
                        {comparisonData.google ? formatNumber(comparisonData.google.engagements || 0) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.engagements ?
                          `${comparisonData.differences.engagements.percentage > 0 ? '+' : ''}${comparisonData.differences.engagements.percentage.toFixed(1)}%` :
                          'N/A'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Orders</td>
                      <td className={`py-3 px-4 ${comparisonData.meta ? getDifferenceColor('orders', 'meta') : 'text-gray-500'}`}>
                        {comparisonData.meta ? formatNumber(comparisonData.meta.orders || 0) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.google ? getDifferenceColor('orders', 'google') : 'text-gray-500'}`}>
                        {comparisonData.google ? formatNumber(comparisonData.google.orders || 0) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.orders ?
                          `${comparisonData.differences.orders.percentage > 0 ? '+' : ''}${comparisonData.differences.orders.percentage.toFixed(1)}%` :
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
        {(!comparisonData.meta && !comparisonData.google) && (
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