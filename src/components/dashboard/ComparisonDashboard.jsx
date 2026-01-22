import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  BarsArrowUpIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import ChartCard from './ChartCard';
import { selectMetaAdAccounts, selectMetaAdAccountsLoading, fetchMetaAdAccounts } from '../../store/slices/metaSlice';
import { selectGoogleCustomers, selectGoogleFetching, fetchGoogleCustomers } from '../../store/slices/googleSlice';
import { apiService } from '../../services/api';

const DEFAULT_DATE_RANGE = { date_from: '2023-01-01', date_to: new Date().toISOString().split('T')[0] };

const ComparisonDashboard = () => {
  const dispatch = useDispatch();

  // Redux state
  const metaAdAccounts = useSelector(selectMetaAdAccounts);
  const googleCustomers = useSelector(selectGoogleCustomers);
  const metaAccountsLoading = useSelector(selectMetaAdAccountsLoading);
  const googleCustomersLoading = useSelector(selectGoogleFetching);

  // Tab: 'accounts' | 'campaigns'
  const [activeTab, setActiveTab] = useState('accounts');

  // Ads Account comparison: unified Meta+Google, cannot select same in both
  const [selectedAccount1, setSelectedAccount1] = useState(null); // unifiedId e.g. 'meta-123' or 'google-456'
  const [selectedAccount2, setSelectedAccount2] = useState(null);

  // Campaigns comparison state
  const [comparisonCampaigns, setComparisonCampaigns] = useState([]); // [{ campaignId, campaignName, accountId, accountName, platform }]
  const [campaignMetricsMap, setCampaignMetricsMap] = useState({});
  const [campaignsDataLoading, setCampaignsDataLoading] = useState(false);

  const accountsLoading = metaAccountsLoading || googleCustomersLoading;

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchMetaAdAccounts());
    dispatch(fetchGoogleCustomers());
  }, [dispatch]);

  // Available accounts
  const metaAccounts = useMemo(() => {
    // Extract ad_accounts from the API response structure
    return metaAdAccounts?.result?.ad_accounts || [];
  }, [metaAdAccounts]);

  const googleAccountsList = useMemo(() => {
    return googleCustomers?.result?.customers || [];
  }, [googleCustomers]);

  // Google customers with campaigns for Campaigns tab (GET /marketing/customers-with-campaigns/)
  const [customersWithCampaigns, setCustomersWithCampaigns] = useState(null);
  const [customersWithCampaignsLoading, setCustomersWithCampaignsLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'campaigns') return;
    let cancelled = false;
    setCustomersWithCampaignsLoading(true);
    apiService.marketing
      .getCustomers()
      .then((res) => {
        if (cancelled) return;
        if (res?.data?.error === false && res?.data?.result) {
          setCustomersWithCampaigns(res.data.result);
        } else {
          setCustomersWithCampaigns({ customers: [] });
        }
      })
      .catch(() => {
        if (!cancelled) setCustomersWithCampaigns({ customers: [] });
      })
      .finally(() => {
        if (!cancelled) setCustomersWithCampaignsLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab]);

  const googleCustomersForCampaigns = useMemo(() => {
    return customersWithCampaigns?.customers || [];
  }, [customersWithCampaigns]);

  // Unified list: all Meta + Google ads accounts for Ads Account tab
  const allAccounts = useMemo(() => {
    const list = [];
    (metaAccounts || []).forEach((a) => {
      list.push({
        unifiedId: `meta-${a.account_id}`,
        platform: 'meta',
        label: a.account_name || a.account_id,
        raw: a
      });
    });
    (googleAccountsList || []).forEach((c) => {
      const id = String(c.customer_id ?? c.id ?? '');
      list.push({
        unifiedId: `google-${id}`,
        platform: 'google',
        label: c.descriptive_name || c.customer_id || id,
        raw: c
      });
    });
    return list;
  }, [metaAccounts, googleAccountsList]);

  // All campaigns from Meta + Google for Campaigns tab (Google from customers-with-campaigns API)
  const allCampaigns = useMemo(() => {
    const list = [];
    (metaAccounts || []).forEach((acc) => {
      const campaigns = acc.campaigns || [];
      campaigns.forEach((c) => {
        const id = c.campaign_id || c.id;
        const name = c.campaign_name || c.name || id;
        list.push({
          campaignId: id,
          campaignName: name,
          accountId: acc.account_id,
          accountName: acc.account_name || acc.account_id,
          platform: 'meta'
        });
      });
    });
    (googleCustomersForCampaigns || []).forEach((cust) => {
      const campaigns = cust.campaigns || [];
      const cid = String(cust.customer_id ?? cust.id ?? '');
      campaigns.forEach((c) => {
        const id = c.campaign_id || c.id;
        const name = c.campaign_name || c.name || id;
        list.push({
          campaignId: id,
          campaignName: name,
          accountId: cid,
          accountName: cust.descriptive_name || cust.customer_id || cid,
          platform: 'google'
        });
      });
    });
    return list;
  }, [metaAccounts, googleCustomersForCampaigns]);

  // Helper: extract Meta campaign metrics from campaign-details API response
  const extractMetaCampaignDataFromApi = useCallback((raw, campaignId, campaignName, accountId, accountName) => {
    const data = raw?.result || raw;
    const insights = data?.insights_data || data?.insights || {};
    const spend = parseFloat(insights.spend || 0) || 0;
    const impressions = parseInt(insights.impressions || 0) || 0;
    const clicks = parseInt(insights.clicks || 0) || 0;
    let conversions = 0;
    if (insights.results?.[0]?.values?.[0]?.value != null) {
      conversions = parseInt(insights.results[0].values[0].value, 10) || 0;
    }
    const allConversions = insights.actions?.filter(a =>
      (a.action_type || '').includes('conversion') || (a.action_type || '') === 'purchase'
    ).reduce((s, a) => s + (parseInt(a.value || 0, 10) || 0), 0) || 0;
    const engagements = insights.actions?.filter(a =>
      ['post_engagement', 'page_engagement', 'comment', 'post_reaction'].includes(a.action_type || '')
    ).reduce((s, a) => s + (parseInt(a.value || 0, 10) || 0), 0) || 0;
    const interactions = insights.actions?.reduce((s, a) => s + (parseInt(a.value || 0, 10) || 0), 0) || 0;
    const ctr = parseFloat(insights.ctr || 0) || 0;
    const cpl = conversions > 0 ? spend / conversions : 0;
    const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const engagementRate = impressions > 0 ? (engagements / impressions) * 100 : 0;
    const cpe = engagements > 0 ? spend / engagements : 0;
    return {
      accountId: accountId || campaignId,
      accountName: campaignName || campaignId,
      platform: 'Meta Ads',
      spend, impressions, clicks,
      leads: conversions,
      ctr, roi: null,
      cpl, cvr, cpc, cpm, engagementRate, cpe,
      engagements, interactions, allConversions,
      confidence: { spend: 'high', impressions: 'high', clicks: 'high', leads: 'high', ctr: 'high', roi: null, cpl: 'high', cvr: 'high', cpc: 'high', cpm: 'high', engagementRate: 'high', cpe: 'high' }
    };
  }, []);

  // Fetch campaign metrics when comparison campaigns change (Meta only; Google metrics N/A)
  useEffect(() => {
    if (activeTab !== 'campaigns' || comparisonCampaigns.length === 0) {
      setCampaignMetricsMap({});
      return;
    }
    let cancelled = false;
    setCampaignsDataLoading(true);
    const fetchAll = async () => {
      const next = {};
      for (const c of comparisonCampaigns) {
        if (cancelled) return;
        if (c.platform !== 'meta') continue; // only Meta campaign API available
        try {
          const res = await apiService.marketing.metaCampaignData(c.campaignId, DEFAULT_DATE_RANGE);
          const data = extractMetaCampaignDataFromApi(
            res?.data,
            c.campaignId,
            c.campaignName,
            c.accountId,
            c.accountName
          );
          if (!cancelled) next[c.campaignId] = data;
        } catch (e) {
          if (!cancelled) next[c.campaignId] = null;
        }
      }
      if (!cancelled) {
        setCampaignMetricsMap(next);
        setCampaignsDataLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; setCampaignsDataLoading(false); };
  }, [activeTab, comparisonCampaigns, extractMetaCampaignDataFromApi]);

  const addCampaignToComparison = useCallback((c) => {
    setComparisonCampaigns(prev => {
      if (prev.some(x => x.campaignId === c.campaignId)) return prev;
      return [...prev, c];
    });
  }, []);

  const removeCampaignFromComparison = useCallback((campaignId) => {
    setComparisonCampaigns(prev => prev.filter(x => x.campaignId !== campaignId));
    setCampaignMetricsMap(prev => {
      const next = { ...prev };
      delete next[campaignId];
      return next;
    });
  }, []);

  const clearCampaignsComparison = useCallback(() => {
    setComparisonCampaigns([]);
    setCampaignMetricsMap({});
  }, []);

  // Helper function to extract Meta account data
  const extractMetaAccountData = (account) => {
    if (!account) return null;

    const insights = account.insights || {};
    const conversionTotals = account.conversion_totals || {};
    const conversions = conversionTotals?.conversions ?? 0;

    const allConversions = insights.actions?.filter(action =>
      action.action_type?.includes('conversion') || action.action_type === 'purchase'
    ).reduce((sum, action) => sum + (parseInt(action.value || 0) || 0), 0) || 0;

    const interactions = insights.actions?.reduce((sum, action) =>
      sum + (parseInt(action.value || 0) || 0), 0) || 0;

    const engagements = insights.actions?.filter(action =>
      ['post_engagement', 'page_engagement', 'comment', 'post_reaction'].includes(action.action_type || '')
    ).reduce((sum, action) => sum + (parseInt(action.value || 0) || 0), 0) || 0;

    const spend = parseFloat(insights.spend || 0) || 0;
    const impressions = parseInt(insights.impressions || 0) || 0;
    const clicks = parseInt(insights.clicks || 0) || 0;
    const hasConversionData = account.roi != null && account.roi !== undefined;
    const roi = hasConversionData ? parseFloat(account.roi) || 0 : null;
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
      spend, impressions, clicks,
      leads: conversions,
      ctr: parseFloat(insights.ctr || 0) || 0,
      roi,
      cpl, cvr, cpc, cpm, engagementRate, cpe,
      engagements, interactions, allConversions,
      confidence: {
        spend: 'high', impressions: 'high', clicks: 'high', leads: 'high', ctr: 'high',
        roi: hasConversionData ? 'high' : null, cpl: 'high', cvr: 'high', cpc: 'high', cpm: 'high',
        engagementRate: 'high', cpe: 'high'
      }
    };
  };

  // Helper function to extract Google account data
  const extractGoogleAccountData = (account) => {
    if (!account) return null;

    const metrics = account.metrics || {};
    const spend = parseFloat(metrics.cost || 0) || 0;
    const impressions = parseInt(metrics.impressions || 0) || 0;
    const clicks = parseInt(metrics.clicks || 0) || 0;
    const conversions = parseInt(metrics.conversions || 0) || 0;

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

  // Comparison data (accounts or campaigns)
  const comparisonData = useMemo(() => {
    const data = { account1: null, account2: null, entities: [], differences: {} };

    if (activeTab === 'campaigns') {
      const entities = comparisonCampaigns
        .map(c => campaignMetricsMap[c.campaignId])
        .filter(Boolean);
      data.entities = entities;
      data.account1 = entities[0] || null;
      data.account2 = entities[1] || null;
    } else {
      const a1 = allAccounts.find((a) => a.unifiedId === selectedAccount1);
      const a2 = allAccounts.find((a) => a.unifiedId === selectedAccount2);
      if (a1) {
        data.account1 = a1.platform === 'meta'
          ? extractMetaAccountData(a1.raw)
          : extractGoogleAccountData(a1.raw);
        if (data.account1) data.account1.accountName = (data.account1.accountName || '') + (a1.platform === 'meta' ? ' (Meta)' : ' (Google)');
      }
      if (a2) {
        data.account2 = a2.platform === 'meta'
          ? extractMetaAccountData(a2.raw)
          : extractGoogleAccountData(a2.raw);
        if (data.account2) data.account2.accountName = (data.account2.accountName || '') + (a2.platform === 'meta' ? ' (Meta)' : ' (Google)');
      }
      data.entities = [data.account1, data.account2].filter(Boolean);
    }

    if (data.account1 && data.account2) {
      const metrics = ['spend', 'impressions', 'clicks', 'leads', 'ctr', 'roi', 'cpl', 'cvr', 'cpc', 'cpm', 'engagementRate', 'cpe', 'engagements', 'interactions', 'allConversions'];
      metrics.forEach(metric => {
        const value1 = data.account1[metric];
        const value2 = data.account2[metric];
        if ((value1 == null) && (value2 == null)) return;
        const val1 = value1 != null ? value1 : 0;
        const val2 = value2 != null ? value2 : 0;
        const percentDiff = val2 !== 0 ? ((val1 - val2) / val2) * 100 : 0;
        data.differences[metric] = {
          absolute: val1 - val2,
          percentage: percentDiff,
          better: Math.abs(val1) > Math.abs(val2) ? 'account1' : 'account2'
        };
      });
    }

    return data;
  }, [
    activeTab,
    selectedAccount1,
    selectedAccount2,
    allAccounts,
    comparisonCampaigns,
    campaignMetricsMap
  ]);

  // Chart data for comparison
  const chartData = useMemo(() => {
    const entities = comparisonData.entities?.length
      ? comparisonData.entities
      : [comparisonData.account1, comparisonData.account2].filter(Boolean);
    if (!entities.length) return {};

    const accounts = entities.map(e => ({ name: e.accountName, ...e }));

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

        {/* Loader when fetching accounts */}
        {accountsLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6 flex flex-col items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading Meta &amp; Google accounts…</p>
          </div>
        )}

        {/* Tabs + Selection */}
        {!accountsLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab('accounts')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                activeTab === 'accounts'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              Ads Account Comparison
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('campaigns')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                activeTab === 'campaigns'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-b-2 border-violet-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              Campaigns Comparison
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'accounts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account 1</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Meta &amp; Google ads accounts. Cannot select the same in both.</p>
                  <select
                    value={selectedAccount1 || ''}
                    onChange={(e) => {
                      const v = e.target.value || null;
                      setSelectedAccount1(v);
                      if (v && v === selectedAccount2) setSelectedAccount2(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select account</option>
                    {allAccounts.map((a) => (
                      <option key={a.unifiedId} value={a.unifiedId} disabled={a.unifiedId === selectedAccount2}>
                        {a.platform === 'meta' ? '[Meta] ' : '[Google] '}{a.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account 2</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Choose a different account from Account 1.</p>
                  <select
                    value={selectedAccount2 || ''}
                    onChange={(e) => {
                      const v = e.target.value || null;
                      setSelectedAccount2(v);
                      if (v && v === selectedAccount1) setSelectedAccount1(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select account</option>
                    {allAccounts.map((a) => (
                      <option key={a.unifiedId} value={a.unifiedId} disabled={a.unifiedId === selectedAccount1}>
                        {a.platform === 'meta' ? '[Meta] ' : '[Google] '}{a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Add campaign to comparison</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All Meta &amp; Google campaigns (Google via customers-with-campaigns). Pick up to 2. Metrics for Meta only.</p>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                  {customersWithCampaignsLoading && (
                    <div className="flex items-center gap-2 py-2 text-sm text-violet-600 dark:text-violet-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-600 border-t-transparent" />
                      Loading Google campaigns (customers-with-campaigns)…
                    </div>
                  )}
                  {!customersWithCampaignsLoading && allCampaigns.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No campaigns from Meta or Google accounts.</p>
                  ) : (
                    allCampaigns.map((c) => {
                      const added = comparisonCampaigns.some(x => x.campaignId === c.campaignId);
                      const atLimit = comparisonCampaigns.length >= 2;
                      const canAdd = !added && !atLimit && c.platform === 'meta';
                      return (
                        <div
                          key={`${c.platform}-${c.campaignId}`}
                          className={`flex items-center justify-between gap-2 py-2 px-3 rounded-lg border ${
                            added ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700' : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <span className="text-sm text-gray-900 dark:text-white truncate flex-1" title={c.campaignName}>
                            {c.platform === 'meta' ? '[Meta] ' : '[Google] '}{c.campaignName}
                          </span>
                          <button
                            type="button"
                            onClick={() => canAdd && addCampaignToComparison({ ...c })}
                            disabled={!canAdd}
                            className={`flex items-center gap-1 shrink-0 px-2 py-1 rounded text-xs font-medium transition ${
                              canAdd
                                ? 'bg-violet-600 text-white hover:bg-violet-700'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }`}
                            title={c.platform === 'google' ? 'Metrics available for Meta campaigns only' : undefined}
                          >
                            <PlusCircleIcon className="w-4 h-4" />
                            {added ? 'Added' : 'Add'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {comparisonCampaigns.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campaigns in comparison</h3>
                      <button
                        type="button"
                        onClick={clearCampaignsComparison}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {comparisonCampaigns.map((c) => (
                        <span
                          key={`${c.platform}-${c.campaignId}`}
                          className="inline-flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-gray-900 dark:text-white text-sm"
                        >
                          <span className="truncate max-w-[200px]" title={c.campaignName}>{c.platform === 'meta' ? '[Meta] ' : '[Google] '}{c.campaignName}</span>
                          <button
                            type="button"
                            onClick={() => removeCampaignFromComparison(c.campaignId)}
                            className="p-1 rounded hover:bg-violet-200 dark:hover:bg-violet-800/50 transition"
                            title="Remove from comparison"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    {campaignsDataLoading && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-600 border-t-transparent" />
                        Loading campaign metrics…
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        )}

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
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">All conversions</td>
                      <td className={`py-3 px-4 ${comparisonData.account1 ? getDifferenceColor('allConversions', 'account1') : 'text-gray-500'}`}>
                        {comparisonData.account1 ? formatNumber(comparisonData.account1.allConversions) : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${comparisonData.account2 ? getDifferenceColor('allConversions', 'account2') : 'text-gray-500'}`}>
                        {comparisonData.account2 ? formatNumber(comparisonData.account2.allConversions) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {comparisonData.differences.allConversions ?
                          `${comparisonData.differences.allConversions.percentage > 0 ? '+' : ''}${comparisonData.differences.allConversions.percentage.toFixed(1)}%` :
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
        {(!comparisonData.account1 && !comparisonData.account2) && !(activeTab === 'campaigns' && campaignsDataLoading) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {activeTab === 'campaigns' ? 'Add Campaigns to Compare' : 'Select Accounts to Compare'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'campaigns'
                ? 'Add up to 2 Meta campaigns from the list above to compare their performance. Google campaigns are listed but metrics are available for Meta only.'
                : 'Choose two different accounts (Meta or Google) above to see a detailed comparison of their performance metrics.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonDashboard;