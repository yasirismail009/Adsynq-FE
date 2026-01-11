# Dashboard KPI & Metrics Calculation Guide

This document explains how all KPIs, metrics, and calculations are performed in the Dashboard component.

## Table of Contents
1. [Marketing KPIs](#marketing-kpis)
2. [Efficiency Metrics](#efficiency-metrics)
3. [Performance Metrics](#performance-metrics)
4. [Conversion Funnel Metrics](#conversion-funnel-metrics)
5. [Data Sources](#data-sources)
6. [Combined vs Platform-Specific Metrics](#combined-vs-platform-specific-metrics)

---

## Marketing KPIs

### 1. ROAS (Return on Ad Spend)
**Formula:** `ROAS = Total Revenue / Total Spend`

**Description:** Measures revenue generated for every dollar spent on advertising.

**Example:** 
- Revenue: $10,000
- Spend: $2,000
- ROAS: $10,000 / $2,000 = 5.0x

**Display:** Shows as multiplier (e.g., "5.0x")

**Data Sources:**
- Revenue: `metaOverallStats.result.conversion_totals.total_purchase_value` (from all accounts)
- Spend: `combinedTotals.totalSpend` (Google + Meta combined)

---

### 2. ROI Percentage (Return on Investment)
**Formula:** `ROI % = ((Total Revenue - Total Spend) / Total Spend) × 100`

**Description:** Percentage return on investment, showing profit margin.

**Example:**
- Revenue: $10,000
- Spend: $2,000
- ROI: (($10,000 - $2,000) / $2,000) × 100 = 400%

**Display:** Shows as percentage with color coding (green for positive, red for negative)

**Data Sources:**
- Same as ROAS

---

### 3. Average Order Value (AOV)
**Formula:** `AOV = Total Revenue / Total Conversions`

**Description:** Average value of each purchase/conversion.

**Example:**
- Revenue: $10,000
- Conversions: 50
- AOV: $10,000 / 50 = $200

**Data Sources:**
- Revenue: `metaOverallStats.result.conversion_totals.total_purchase_value`
- Conversions: `combinedTotals.totalConversions`

---

### 4. Total Revenue
**Formula:** `Total Revenue = Sum of all purchase values from all accounts`

**Description:** Total revenue generated from advertising campaigns.

**Data Sources:**
- `metaOverallStats.result.conversion_totals.total_purchase_value`
- `account.conversion_totals.purchase_value` (per account)

---

### 5. Revenue Per Click (RPC)
**Formula:** `RPC = Total Revenue / Total Clicks`

**Description:** Average revenue generated per click.

**Example:**
- Revenue: $10,000
- Clicks: 1,000
- RPC: $10,000 / 1,000 = $10.00

**Data Sources:**
- Revenue: `marketingKPIs.totalRevenue`
- Clicks: `combinedTotals.totalClicks`

---

### 6. Revenue Per Impression
**Formula:** `Revenue Per Impression = Total Revenue / Total Impressions`

**Description:** Average revenue generated per impression.

**Data Sources:**
- Revenue: `marketingKPIs.totalRevenue`
- Impressions: `combinedTotals.totalImpressions`

---

### 7. Reach Metrics

#### Total Reach
**Formula:** `Total Reach = Sum of reach from all Meta ad accounts`

**Description:** Total unique users reached across all campaigns.

**Data Sources:**
- `account.insights.reach` (Meta accounts only - Google doesn't provide reach in overall stats)

#### Average Frequency
**Formula:** `Average Frequency = Sum of frequency values / Number of accounts with frequency data`

**Description:** Average number of times each user saw an ad.

**Data Sources:**
- `account.insights.frequency` (per Meta account)

#### Cost Per Reach (CPR)
**Formula:** `CPR = Total Spend / Total Reach`

**Description:** Cost to reach one unique user.

**Example:**
- Spend: $2,000
- Reach: 100,000
- CPR: $2,000 / 100,000 = $0.02

**Data Sources:**
- Spend: `combinedTotals.totalSpend`
- Reach: `marketingKPIs.totalReach`

#### Reach Rate
**Formula:** `Reach Rate = (Total Reach / Total Impressions) × 100`

**Description:** Percentage of impressions that reached unique users.

**Data Sources:**
- Reach: `marketingKPIs.totalReach`
- Impressions: `combinedTotals.totalImpressions`

---

### 8. Engagement Metrics

#### Total Engagements
**Formula:** `Total Engagements = Sum of all page_engagement and post_engagement actions`

**Description:** Total number of engagement actions (likes, comments, shares, etc.).

**Data Sources:**
- `account.insights.actions[]` where `action_type` is:
  - `page_engagement`
  - `post_engagement`

#### Engagement Rate
**Formula:** `Engagement Rate = (Total Engagements / Total Impressions) × 100`

**Description:** Percentage of impressions that resulted in engagement.

**Example:**
- Engagements: 5,000
- Impressions: 100,000
- Engagement Rate: (5,000 / 100,000) × 100 = 5%

**Data Sources:**
- Engagements: `marketingKPIs.totalEngagements`
- Impressions: `combinedTotals.totalImpressions`

#### Engagements Per Dollar
**Formula:** `Engagements Per Dollar = Total Engagements / Total Spend`

**Description:** Number of engagement actions generated per dollar spent.

---

### 9. Video Metrics

#### Total Video Views
**Formula:** `Total Video Views = Sum of all video_view actions`

**Data Sources:**
- `account.insights.actions[]` where `action_type` is `video_view`

#### Video View Rate
**Formula:** `Video View Rate = (Total Video Views / Total Impressions) × 100`

**Description:** Percentage of impressions that resulted in video views.

#### Video Views Per Dollar
**Formula:** `Video Views Per Dollar = Total Video Views / Total Spend`

---

## Efficiency Metrics

### 1. Cost Per Conversion (CPA)
**Formula:** `CPA = Total Spend / Total Conversions`

**Description:** Average cost to acquire one conversion.

**Example:**
- Spend: $2,000
- Conversions: 50
- CPA: $2,000 / 50 = $40.00

**Data Sources:**
- Spend: `totals.totalSpend`
- Conversions: `totals.totalConversions`

---

### 2. Conversion Efficiency Rate
**Formula:** `Conversion Efficiency Rate = (Total Conversions / Total Clicks) × 100`

**Description:** Percentage of clicks that resulted in conversions.

**Example:**
- Conversions: 50
- Clicks: 1,000
- Conversion Efficiency: (50 / 1,000) × 100 = 5%

**Data Sources:**
- Conversions: `totals.totalConversions`
- Clicks: `totals.totalClicks`

---

### 3. Impressions Per Dollar
**Formula:** `Impressions Per Dollar = Total Impressions / Total Spend`

**Description:** Number of impressions generated per dollar spent.

**Example:**
- Impressions: 100,000
- Spend: $2,000
- Impressions Per Dollar: 100,000 / 2,000 = 50

---

### 4. Clicks Per Dollar
**Formula:** `Clicks Per Dollar = Total Clicks / Total Spend`

**Description:** Number of clicks generated per dollar spent.

**Example:**
- Clicks: 1,000
- Spend: $2,000
- Clicks Per Dollar: 1,000 / 2,000 = 0.5

---

### 5. Efficiency Score (Composite Metric)
**Formula:** 
```
Efficiency Score = CTR Score + Conversion Score + Cost Efficiency Score
where:
- CTR Score = min((CTR × 10), 100)
- Conversion Score = min((Conversion Efficiency Rate × 5), 50)
- Cost Efficiency Score = min((Clicks Per Dollar / 10) × 50, 50)
```

**Description:** Composite score (0-100) combining multiple efficiency factors.

**Example Calculation:**
- CTR: 2% → CTR Score: min(2 × 10, 100) = 20
- Conversion Efficiency: 5% → Conversion Score: min(5 × 5, 50) = 25
- Clicks Per Dollar: 0.5 → Cost Efficiency Score: min((0.5 / 10) × 50, 50) = 2.5
- **Total Efficiency Score:** 20 + 25 + 2.5 = 47.5

**Data Sources:**
- CTR: Calculated from `totals.totalClicks / totals.totalImpressions`
- Conversion Efficiency: As defined above
- Clicks Per Dollar: As defined above

---

## Performance Metrics

### 1. CTR (Click-Through Rate)
**Formula:** `CTR = (Total Clicks / Total Impressions) × 100`

**Description:** Percentage of impressions that resulted in clicks.

**Example:**
- Clicks: 1,000
- Impressions: 100,000
- CTR: (1,000 / 100,000) × 100 = 1%

**Data Sources:**
- Clicks: `combinedTotals.totalClicks`
- Impressions: `combinedTotals.totalImpressions`

---

### 2. Conversion Rate
**Formula:** `Conversion Rate = (Total Conversions / Total Clicks) × 100`

**Description:** Percentage of clicks that resulted in conversions.

**Note:** This is the same as Conversion Efficiency Rate mentioned above.

---

### 3. CPA (Cost Per Acquisition)
**Formula:** `CPA = Total Spend / Total Conversions`

**Description:** Average cost per conversion.

**Note:** This is the same as Cost Per Conversion mentioned above.

---

### 4. CPC (Cost Per Click)
**Formula:** `CPC = Total Spend / Total Clicks`

**Description:** Average cost per click.

**Data Sources:**
- Can be derived from `combinedTotals` or from platform-specific data:
  - Meta: `account.insights.cpc` or calculated
  - Google: `summary.average_cpc`

---

### 5. CPM (Cost Per Mille - 1000 Impressions)
**Formula:** `CPM = (Total Spend / Total Impressions) × 1000`

**Description:** Cost to reach 1,000 impressions.

**Example:**
- Spend: $2,000
- Impressions: 100,000
- CPM: ($2,000 / 100,000) × 1000 = $20

**Data Sources:**
- Can be derived from `combinedTotals` or from platform-specific data:
  - Meta: `account.insights.cpm` or calculated
  - Google: Calculated from cost and impressions

---

## Conversion Funnel Metrics

### 1. Cart to View Rate
**Formula:** `Cart to View Rate = (Total Add to Cart Actions / Total Clicks) × 100`

**Description:** Percentage of clicks that resulted in "Add to Cart" actions.

**Data Sources:**
- Carts: `account.insights.actions[]` where `action_type` is:
  - `add_to_cart`
  - `omni_add_to_cart`
- Clicks: `combinedTotals.totalClicks`

---

### 2. Checkout to Cart Rate
**Formula:** `Checkout to Cart Rate = (Total Checkout Initiations / Total Carts) × 100`

**Description:** Percentage of "Add to Cart" actions that resulted in checkout initiation.

**Data Sources:**
- Checkouts: `account.insights.actions[]` where `action_type` is:
  - `initiate_checkout`
  - `omni_initiated_checkout`
- Carts: `marketingKPIs.totalCarts`

---

### 3. Purchase to Checkout Rate
**Formula:** `Purchase to Checkout Rate = (Total Conversions / Total Checkouts) × 100`

**Description:** Percentage of checkout initiations that resulted in purchases.

**Data Sources:**
- Conversions: `combinedTotals.totalConversions`
- Checkouts: `marketingKPIs.totalCheckouts`

---

## Data Sources

### Meta Data Sources
The dashboard extracts data from `metaOverallStats.result.ad_accounts[]`:

```javascript
{
  account_id: "act_123",
  account_name: "Account Name",
  currency: "USD",
  balance: "1000.00",
  campaigns_count: 5,
  roi: 5000.00,
  
  insights: {
    impressions: "100000",
    clicks: "1000",
    spend: "2000.00",
    reach: "80000",
    frequency: "1.25",
    cpc: "2.00",
    cpm: "20.00",
    ctr: "1.0",
    actions: [
      { action_type: "page_engagement", value: "500" },
      { action_type: "video_view", value: "200" },
      { action_type: "add_to_cart", value: "50" },
      { action_type: "initiate_checkout", value: "30" }
    ]
  },
  
  conversion_totals: {
    conversions: 25,
    purchase_value: 5000.00,
    cart_value: 1500.00,
    checkout_value: 3000.00,
    payment_value: 400.00
  }
}
```

### Google Data Sources
The dashboard extracts data from `googleOverallStats.result.summary`:

```javascript
{
  total_accounts: 2,
  valid_accounts: 2,
  total_impressions: 50000,
  total_clicks: 800,
  total_cost: 1500.00,
  total_conversions: 40,
  average_ctr: 1.6,
  average_cpc: 1.88,
  total_cost_currency: "USD",
  primary_currency: "USD"
}
```

---

## Combined vs Platform-Specific Metrics

### Combined Metrics
Combined metrics aggregate data from both Google and Meta platforms:

```javascript
combinedTotals = {
  totalSpend: googleCost + metaSpend,
  totalImpressions: googleImpressions + metaImpressions,
  totalClicks: googleClicks + metaClicks,
  totalConversions: googleConversions + metaConversions,
  currency: // Prefers Google's currency, falls back to Meta's or USD
}
```

### Platform-Specific Metrics
Platform-specific metrics are calculated separately:

- **Meta Metrics:** Extracted from `metaOverallStats` using `getMetaStats()`
- **Google Metrics:** Extracted from `googleOverallStats.result.summary`

### Conditional Inclusion
Metrics only include platform data if:
1. Platform connections exist (checked via `platformConnections.result`)
2. Platform stats data is available and valid

---

## Calculation Flow

1. **Data Fetching:**
   - `fetchMetaOverallStats()` - Fetches Meta data
   - `fetchGoogleOverallStats()` - Fetches Google data
   - `fetchPlatformConnections()` - Fetches connection status

2. **Data Extraction:**
   - `getMetaStats()` - Extracts and aggregates Meta account data
   - `getCombinedTotals()` - Combines Google + Meta totals

3. **Metric Calculation:**
   - `calculateEfficiencyMetrics()` - Calculates efficiency KPIs
   - `calculateMarketingKPIs()` - Calculates marketing KPIs
   - Performance metrics (CTR, Conversion Rate, CPA) calculated inline

4. **Display:**
   - Metrics displayed conditionally based on data availability
   - Empty states shown when no data is available
   - Currency formatting applied based on platform data

---

## Notes

- **Currency Handling:** The dashboard uses the currency from Google if available, otherwise Meta's currency, with USD as fallback.
- **Zero Division:** All calculations include checks to prevent division by zero.
- **Data Validation:** All values are parsed and validated (using `parseInt()`, `parseFloat()`, with fallbacks to 0).
- **Reach Data:** Currently only Meta provides reach data. Google reach metrics are not available in overall stats.
- **Video Metrics:** Only available from Meta data sources.
- **Revenue Data:** Currently only available from Meta `conversion_totals`. Google revenue would need to be added separately if available.

---

## Example Calculations

### Complete Example
Given:
- **Meta:** 
  - Spend: $2,000
  - Impressions: 100,000
  - Clicks: 1,000
  - Conversions: 25
  - Revenue: $5,000
  - Reach: 80,000
  
- **Google:**
  - Cost: $1,500
  - Impressions: 50,000
  - Clicks: 800
  - Conversions: 40

**Combined Totals:**
- Total Spend: $2,000 + $1,500 = $3,500
- Total Impressions: 100,000 + 50,000 = 150,000
- Total Clicks: 1,000 + 800 = 1,800
- Total Conversions: 25 + 40 = 65

**Calculated Metrics:**
- CTR: (1,800 / 150,000) × 100 = 1.2%
- Conversion Rate: (65 / 1,800) × 100 = 3.61%
- CPA: $3,500 / 65 = $53.85
- ROAS: $5,000 / $3,500 = 1.43x
- ROI: (($5,000 - $3,500) / $3,500) × 100 = 42.86%
- AOV: $5,000 / 65 = $76.92
- RPC: $5,000 / 1,800 = $2.78
