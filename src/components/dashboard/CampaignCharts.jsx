import React from 'react';
import ChartCard from './ChartCard';
import ChartCategorySummary from './ChartCategorySummary';
import ChartCategory from './ChartCategory';

const CampaignCharts = ({ chartData, hasValidData }) => {
  // Debug: Log incoming chartData to identify problematic data
  console.log('CampaignCharts - chartData received:', chartData);
  console.log('CampaignCharts - hasValidData:', hasValidData);

  // Validate chartData structure
  if (!chartData || typeof chartData !== 'object') {
    console.error('CampaignCharts - Invalid chartData:', chartData);
    return null;
  }

  // Helper function to validate chart data array
  const isValidChartDataArray = (data, name) => {
    if (!Array.isArray(data)) {
      console.warn(`CampaignCharts - ${name} is not an array:`, data);
      return false;
    }
    
    // Check if array contains valid objects
    const validItems = data.filter(item => {
      if (!item || typeof item !== 'object') {
        console.warn(`CampaignCharts - Invalid item in ${name}:`, item);
        return false;
      }
      if (!item?.name || typeof item.name !== 'string') {
        console.warn(`CampaignCharts - Item in ${name} missing name:`, item);
        return false;
      }
      if (typeof item?.value !== 'number') {
        console.warn(`CampaignCharts - Item in ${name} missing value:`, item);
        return false;
      }
      return true;
    });

    if (validItems.length !== data.length) {
      console.warn(`CampaignCharts - ${name} has ${data.length - validItems.length} invalid items`);
    }

    return validItems.length > 0;
  };

  // Helper function to safely create chart component
  const createChartComponent = (id, title, subtitle, data, type = 'bar', height = 300) => {
    if (!isValidChartDataArray(data, id)) {
      console.warn(`CampaignCharts - Skipping chart ${id} due to invalid data`);
      return null;
    }

    return {
      id,
      component: (
        <ChartCard
          key={id}
          title={title}
          subtitle={subtitle}
          data={data}
          type={type}
          height={height}
        />
      )
    };
  };

  // Organize charts into categories
  const chartCategories = {
    overview: {
      title: "Campaign Overview",
      description: "Key performance metrics and campaign health",
      charts: []
    },
    performance: {
      title: "Performance Metrics", 
      description: "Core campaign performance indicators",
      charts: []
    },
    engagement: {
      title: "Engagement & Actions",
      description: "User engagement and action tracking",
      charts: []
    },
    video: {
      title: "Video Performance",
      description: "Video engagement and completion metrics",
      charts: []
    },
    // geographic: {
    //   title: "Geographic Performance",
    //   description: "Performance by geographic regions",
    //   charts: []
    // },
    device: {
      title: "Device Performance", 
      description: "Performance across different device platforms",
      charts: []
    },
    platform: {
      title: "Publisher Platform",
      description: "Performance across publisher platforms",
      charts: []
    },
    // temporal: {
    //   title: "Temporal Analysis",
    //   description: "Performance over time and hourly patterns",
    //   charts: []
    // },
    // demographic: {
    //   title: "Demographic Breakdown",
    //   description: "Performance by age, gender, and combinations",
    //   charts: []
    // }
  };

  // Performance Metrics Chart (always show if hasValidData)
  const performanceData = Array.isArray(chartData?.performanceData) ? chartData.performanceData : [];
  const performanceChart = createChartComponent(
    'performance',
    'Performance Metrics',
    'Core campaign performance indicators',
    performanceData,
    'bar',
    300
  );
  if (performanceChart) {
    chartCategories.performance.charts.push(performanceChart);
  }

  // Video Engagement Chart
  if (chartData?.videoData && Array.isArray(chartData.videoData)) {
    const videoChart = createChartComponent(
      'video',
      'Video Engagement',
      'Video performance metrics',
      chartData.videoData,
      'bar',
      300
    );
    if (videoChart) {
      chartCategories.video.charts.push(videoChart);
    }
  }
  
  // Actions Chart
  if (chartData?.actionsData && Array.isArray(chartData.actionsData)) {
    const actionsChart = createChartComponent(
      'actions',
      'Top Actions',
      'Most performed actions',
      chartData.actionsData,
      'bar',
      300
    );
    if (actionsChart) {
      chartCategories.engagement.charts.push(actionsChart);
    }
  }
  
  // Action Values Chart
  if (chartData?.actionValuesData && Array.isArray(chartData.actionValuesData)) {
    const actionValuesChart = createChartComponent(
      'actionValues',
      'Action Values',
      'Revenue from actions',
      chartData.actionValuesData,
      'bar',
      300
    );
    if (actionValuesChart) {
      chartCategories.engagement.charts.push(actionValuesChart);
    }
  }
  
  // Campaign Health Chart
  if (chartData?.campaignHealthData && Array.isArray(chartData.campaignHealthData) && 
      chartData.campaignHealthData.some(item => item?.value > 0)) {
    const healthChart = createChartComponent(
      'health',
      'Campaign Health Overview',
      'Activity rates across campaign',
      chartData.campaignHealthData,
      'pie',
      300
    );
    if (healthChart) {
      chartCategories.overview.charts.push(healthChart);
    }
  }
  
  // ROI Metrics Chart
  if (chartData?.roiData && Array.isArray(chartData.roiData) && 
      chartData.roiData.some(item => item?.value > 0)) {
    const roiChart = createChartComponent(
      'roi',
      'ROI Metrics',
      'Return on investment indicators',
      chartData.roiData,
      'bar',
      300
    );
    if (roiChart) {
      chartCategories.performance.charts.push(roiChart);
    }
  }
  
  // Engagement Metrics Chart
  if (chartData?.engagementData && Array.isArray(chartData.engagementData) && 
      chartData.engagementData.some(item => item?.value > 0)) {
    const engagementChart = createChartComponent(
      'engagement',
      'Engagement Metrics',
      'User engagement and interaction metrics',
      chartData.engagementData,
      'bar',
      300
    );
    if (engagementChart) {
      chartCategories.engagement.charts.push(engagementChart);
    }
  }

  // Regional Performance Charts - COMMENTED OUT
  /*
  if (chartData?.regionalImpressionsData && Array.isArray(chartData.regionalImpressionsData)) {
    const regionalImpressionsChart = createChartComponent(
      'regionalImpressions',
      'Regional - Impressions',
      'Impressions by geographic region',
      chartData.regionalImpressionsData,
      'bar',
      300
    );
    if (regionalImpressionsChart) {
      chartCategories.geographic.charts.push(regionalImpressionsChart);
    }
  }

  if (chartData?.regionalClicksData && Array.isArray(chartData.regionalClicksData)) {
    const regionalClicksChart = createChartComponent(
      'regionalClicks',
      'Regional - Clicks',
      'Clicks by geographic region',
      chartData.regionalClicksData,
      'bar',
      300
    );
    if (regionalClicksChart) {
      chartCategories.geographic.charts.push(regionalClicksChart);
    }
  }

  if (chartData?.regionalSpendData && Array.isArray(chartData.regionalSpendData)) {
    const regionalSpendChart = createChartComponent(
      'regionalSpend',
      'Regional - Spend',
      'Spend by geographic region',
      chartData.regionalSpendData,
      'bar',
      300
    );
    if (regionalSpendChart) {
      chartCategories.geographic.charts.push(regionalSpendChart);
    }
  }

  if (chartData?.regionalCTRData && Array.isArray(chartData.regionalCTRData)) {
    const regionalCTRChart = createChartComponent(
      'regionalCTR',
      'Regional - CTR',
      'Click-through rate by geographic region',
      chartData.regionalCTRData,
      'bar',
      300
    );
    if (regionalCTRChart) {
      chartCategories.geographic.charts.push(regionalCTRChart);
    }
  }

  if (chartData?.regionalCPCData && Array.isArray(chartData.regionalCPCData)) {
    const regionalCPCChart = createChartComponent(
      'regionalCPC',
      'Regional - CPC',
      'Cost per click by geographic region',
      chartData.regionalCPCData,
      'bar',
      300
    );
    if (regionalCPCChart) {
      chartCategories.geographic.charts.push(regionalCPCChart);
    }
  }

  if (chartData?.regionalCPMData && Array.isArray(chartData.regionalCPMData)) {
    const regionalCPMChart = createChartComponent(
      'regionalCPM',
      'Regional - CPM',
      'Cost per mille by geographic region',
      chartData.regionalCPMData,
      'bar',
      300
    );
    if (regionalCPMChart) {
      chartCategories.geographic.charts.push(regionalCPMChart);
    }
  }
  */

  // Device Performance Charts
  if (chartData?.deviceImpressionsData && Array.isArray(chartData.deviceImpressionsData)) {
    const deviceImpressionsChart = createChartComponent(
      'deviceImpressions',
      'Device - Impressions',
      'Impressions by device platform',
      chartData.deviceImpressionsData,
      'bar',
      300
    );
    if (deviceImpressionsChart) {
      chartCategories.device.charts.push(deviceImpressionsChart);
    }
  }

  if (chartData?.deviceClicksData && Array.isArray(chartData.deviceClicksData)) {
    const deviceClicksChart = createChartComponent(
      'deviceClicks',
      'Device - Clicks',
      'Clicks by device platform',
      chartData.deviceClicksData,
      'bar',
      300
    );
    if (deviceClicksChart) {
      chartCategories.device.charts.push(deviceClicksChart);
    }
  }

  if (chartData?.deviceSpendData && Array.isArray(chartData.deviceSpendData)) {
    const deviceSpendChart = createChartComponent(
      'deviceSpend',
      'Device - Spend',
      'Spend by device platform',
      chartData.deviceSpendData,
      'bar',
      300
    );
    if (deviceSpendChart) {
      chartCategories.device.charts.push(deviceSpendChart);
    }
  }

  if (chartData?.deviceCTRData && Array.isArray(chartData.deviceCTRData)) {
    const deviceCTRChart = createChartComponent(
      'deviceCTR',
      'Device - CTR',
      'Click-through rate by device platform',
      chartData.deviceCTRData,
      'bar',
      300
    );
    if (deviceCTRChart) {
      chartCategories.device.charts.push(deviceCTRChart);
    }
  }

  if (chartData?.deviceCPCData && Array.isArray(chartData.deviceCPCData)) {
    const deviceCPCChart = createChartComponent(
      'deviceCPC',
      'Device - CPC',
      'Cost per click by device platform',
      chartData.deviceCPCData,
      'bar',
      300
    );
    if (deviceCPCChart) {
      chartCategories.device.charts.push(deviceCPCChart);
    }
  }

  if (chartData?.deviceCPMData && Array.isArray(chartData.deviceCPMData)) {
    const deviceCPMChart = createChartComponent(
      'deviceCPM',
      'Device - CPM',
      'Cost per mille by device platform',
      chartData.deviceCPMData,
      'bar',
      300
    );
    if (deviceCPMChart) {
      chartCategories.device.charts.push(deviceCPMChart);
    }
  }

  if (chartData?.deviceVideo30SecData && Array.isArray(chartData.deviceVideo30SecData)) {
    const deviceVideo30SecChart = createChartComponent(
      'deviceVideo30Sec',
      'Device - Video 30s Watched',
      '30-second video views by device platform',
      chartData.deviceVideo30SecData,
      'bar',
      300
    );
    if (deviceVideo30SecChart) {
      chartCategories.device.charts.push(deviceVideo30SecChart);
    }
  }

  if (chartData?.deviceVideo100PercentData && Array.isArray(chartData.deviceVideo100PercentData)) {
    const deviceVideo100PercentChart = createChartComponent(
      'deviceVideo100Percent',
      'Device - Video 100% Watched',
      '100% video completion by device platform',
      chartData.deviceVideo100PercentData,
      'bar',
      300
    );
    if (deviceVideo100PercentChart) {
      chartCategories.device.charts.push(deviceVideo100PercentChart);
    }
  }

  // Publisher Platform Performance Charts
  if (chartData?.publisherPlatformImpressionsData && Array.isArray(chartData.publisherPlatformImpressionsData)) {
    const platformImpressionsChart = createChartComponent(
      'publisherPlatformImpressions',
      'Publisher Platform - Impressions',
      'Impressions by publisher platform',
      chartData.publisherPlatformImpressionsData,
      'bar',
      300
    );
    if (platformImpressionsChart) {
      chartCategories.platform.charts.push(platformImpressionsChart);
    }
  }

  if (chartData?.publisherPlatformClicksData && Array.isArray(chartData.publisherPlatformClicksData)) {
    const platformClicksChart = createChartComponent(
      'publisherPlatformClicks',
      'Publisher Platform - Clicks',
      'Clicks by publisher platform',
      chartData.publisherPlatformClicksData,
      'bar',
      300
    );
    if (platformClicksChart) {
      chartCategories.platform.charts.push(platformClicksChart);
    }
  }

  if (chartData?.publisherPlatformSpendData && Array.isArray(chartData.publisherPlatformSpendData)) {
    const platformSpendChart = createChartComponent(
      'publisherPlatformSpend',
      'Publisher Platform - Spend',
      'Spend by publisher platform',
      chartData.publisherPlatformSpendData,
      'bar',
      300
    );
    if (platformSpendChart) {
      chartCategories.platform.charts.push(platformSpendChart);
    }
  }

  if (chartData?.publisherPlatformCTRData && Array.isArray(chartData.publisherPlatformCTRData)) {
    const platformCTRChart = createChartComponent(
      'publisherPlatformCTR',
      'Publisher Platform - CTR',
      'Click-through rate by publisher platform',
      chartData.publisherPlatformCTRData,
      'bar',
      300
    );
    if (platformCTRChart) {
      chartCategories.platform.charts.push(platformCTRChart);
    }
  }

  if (chartData?.publisherPlatformCPCData && Array.isArray(chartData.publisherPlatformCPCData)) {
    const platformCPCChart = createChartComponent(
      'publisherPlatformCPC',
      'Publisher Platform - CPC',
      'Cost per click by publisher platform',
      chartData.publisherPlatformCPCData,
      'bar',
      300
    );
    if (platformCPCChart) {
      chartCategories.platform.charts.push(platformCPCChart);
    }
  }

  if (chartData?.publisherPlatformCPMData && Array.isArray(chartData.publisherPlatformCPMData)) {
    const platformCPMChart = createChartComponent(
      'publisherPlatformCPM',
      'Publisher Platform - CPM',
      'Cost per mille by publisher platform',
      chartData.publisherPlatformCPMData,
      'bar',
      300
    );
    if (platformCPMChart) {
      chartCategories.platform.charts.push(platformCPMChart);
    }
  }

  if (chartData?.publisherPlatformVideo30SecData && Array.isArray(chartData.publisherPlatformVideo30SecData)) {
    const platformVideo30SecChart = createChartComponent(
      'publisherPlatformVideo30Sec',
      'Publisher Platform - Video 30s Watched',
      '30-second video views by publisher platform',
      chartData.publisherPlatformVideo30SecData,
      'bar',
      300
    );
    if (platformVideo30SecChart) {
      chartCategories.platform.charts.push(platformVideo30SecChart);
    }
  }

  if (chartData?.publisherPlatformVideo100PercentData && Array.isArray(chartData.publisherPlatformVideo100PercentData)) {
    const platformVideo100PercentChart = createChartComponent(
      'publisherPlatformVideo100Percent',
      'Publisher Platform - Video 100% Watched',
      '100% video completion by publisher platform',
      chartData.publisherPlatformVideo100PercentData,
      'bar',
      300
    );
    if (platformVideo100PercentChart) {
      chartCategories.platform.charts.push(platformVideo100PercentChart);
    }
  }

  // Hourly Performance Charts - COMMENTED OUT
  /*
  if (chartData?.hourlyImpressionsData && Array.isArray(chartData.hourlyImpressionsData)) {
    const hourlyImpressionsChart = createChartComponent(
      'hourlyImpressions',
      'Hourly - Impressions',
      'Impressions by hour of day',
      chartData.hourlyImpressionsData,
      'line',
      300
    );
    if (hourlyImpressionsChart) {
      chartCategories.temporal.charts.push(hourlyImpressionsChart);
    }
  }

  if (chartData?.hourlyClicksData && Array.isArray(chartData.hourlyClicksData)) {
    const hourlyClicksChart = createChartComponent(
      'hourlyClicks',
      'Hourly - Clicks',
      'Clicks by hour of day',
      chartData.hourlyClicksData,
      'line',
      300
    );
    if (hourlyClicksChart) {
      chartCategories.temporal.charts.push(hourlyClicksChart);
    }
  }

  if (chartData?.hourlySpendData && Array.isArray(chartData.hourlySpendData)) {
    const hourlySpendChart = createChartComponent(
      'hourlySpend',
      'Hourly - Spend',
      'Spend by hour of day',
      chartData.hourlySpendData,
      'line',
      300
    );
    if (hourlySpendChart) {
      chartCategories.temporal.charts.push(hourlySpendChart);
    }
  }

  if (chartData?.hourlyCTRData && Array.isArray(chartData.hourlyCTRData)) {
    const hourlyCTRChart = createChartComponent(
      'hourlyCTR',
      'Hourly - CTR',
      'Click-through rate by hour of day',
      chartData.hourlyCTRData,
      'line',
      300
    );
    if (hourlyCTRChart) {
      chartCategories.temporal.charts.push(hourlyCTRChart);
    }
  }

  if (chartData?.hourlyCPCData && Array.isArray(chartData.hourlyCPCData)) {
    const hourlyCPCChart = createChartComponent(
      'hourlyCPC',
      'Hourly - CPC',
      'Cost per click by hour of day',
      chartData.hourlyCPCData,
      'line',
      300
    );
    if (hourlyCPCChart) {
      chartCategories.temporal.charts.push(hourlyCPCChart);
    }
  }

  if (chartData?.hourlyCPMData && Array.isArray(chartData.hourlyCPMData)) {
    const hourlyCPMChart = createChartComponent(
      'hourlyCPM',
      'Hourly - CPM',
      'Cost per mille by hour of day',
      chartData.hourlyCPMData,
      'line',
      300
    );
    if (hourlyCPMChart) {
      chartCategories.temporal.charts.push(hourlyCPMChart);
    }
  }
  */

  // Age Breakdown Charts - COMMENTED OUT
  /*
  if (chartData?.ageImpressionsData && Array.isArray(chartData.ageImpressionsData)) {
    const ageImpressionsChart = createChartComponent(
      'ageImpressions',
      'Age Group - Impressions',
      'Impressions by age group',
      chartData.ageImpressionsData,
      'bar',
      300
    );
    if (ageImpressionsChart) {
      chartCategories.demographic.charts.push(ageImpressionsChart);
    }
  }

  if (chartData?.ageClicksData && Array.isArray(chartData.ageClicksData)) {
    const ageClicksChart = createChartComponent(
      'ageClicks',
      'Age Group - Clicks',
      'Clicks by age group',
      chartData.ageClicksData,
      'bar',
      300
    );
    if (ageClicksChart) {
      chartCategories.demographic.charts.push(ageClicksChart);
    }
  }

  if (chartData?.ageSpendData && Array.isArray(chartData.ageSpendData)) {
    const ageSpendChart = createChartComponent(
      'ageSpend',
      'Age Group - Spend',
      'Spend by age group',
      chartData.ageSpendData,
      'bar',
      300
    );
    if (ageSpendChart) {
      chartCategories.demographic.charts.push(ageSpendChart);
    }
  }

  if (chartData?.ageCTRData && Array.isArray(chartData.ageCTRData)) {
    const ageCTRChart = createChartComponent(
      'ageCTR',
      'Age Group - CTR',
      'Click-through rate by age group',
      chartData.ageCTRData,
      'bar',
      300
    );
    if (ageCTRChart) {
      chartCategories.demographic.charts.push(ageCTRChart);
    }
  }

  // Gender Breakdown Charts
  if (chartData?.genderImpressionsData && Array.isArray(chartData.genderImpressionsData)) {
    const genderImpressionsChart = createChartComponent(
      'genderImpressions',
      'Gender - Impressions',
      'Impressions by gender',
      chartData.genderImpressionsData,
      'bar',
      300
    );
    if (genderImpressionsChart) {
      chartCategories.demographic.charts.push(genderImpressionsChart);
    }
  }

  if (chartData?.genderClicksData && Array.isArray(chartData.genderClicksData)) {
    const genderClicksChart = createChartComponent(
      'genderClicks',
      'Gender - Clicks',
      'Clicks by gender',
      chartData.genderClicksData,
      'bar',
      300
    );
    if (genderClicksChart) {
      chartCategories.demographic.charts.push(genderClicksChart);
    }
  }

  if (chartData?.genderSpendData && Array.isArray(chartData.genderSpendData)) {
    const genderSpendChart = createChartComponent(
      'genderSpend',
      'Gender - Spend',
      'Spend by gender',
      chartData.genderSpendData,
      'bar',
      300
    );
    if (genderSpendChart) {
      chartCategories.demographic.charts.push(genderSpendChart);
    }
  }

  if (chartData?.genderCTRData && Array.isArray(chartData.genderCTRData)) {
    const genderCTRChart = createChartComponent(
      'genderCTR',
      'Gender - CTR',
      'Click-through rate by gender',
      chartData.genderCTRData,
      'bar',
      300
    );
    if (genderCTRChart) {
      chartCategories.demographic.charts.push(genderCTRChart);
    }
  }

  // Age-Gender Combination Charts
  if (chartData?.ageGenderImpressionsData && Array.isArray(chartData.ageGenderImpressionsData)) {
    const ageGenderImpressionsChart = createChartComponent(
      'ageGenderImpressions',
      'Age & Gender - Impressions',
      'Impressions by age and gender combination',
      chartData.ageGenderImpressionsData,
      'bar',
      300
    );
    if (ageGenderImpressionsChart) {
      chartCategories.demographic.charts.push(ageGenderImpressionsChart);
    }
  }

  if (chartData?.ageGenderClicksData && Array.isArray(chartData.ageGenderClicksData)) {
    const ageGenderClicksChart = createChartComponent(
      'ageGenderClicks',
      'Age & Gender - Clicks',
      'Clicks by age and gender combination',
      chartData.ageGenderClicksData,
      'bar',
      300
    );
    if (ageGenderClicksChart) {
      chartCategories.demographic.charts.push(ageGenderClicksChart);
    }
  }
  */

  // Filter out categories with no charts
  const categoriesWithCharts = Object.entries(chartCategories).filter(([key, category]) => {
    const validCharts = category?.charts?.filter(chart => {
      if (!chart || !chart.component || typeof chart.component !== 'object') {
        console.error('CampaignCharts - Filtering out invalid chart:', chart);
        return false;
      }
      return true;
    }) || [];
    return validCharts.length > 0;
  });

  // If no categories have charts, don't render the section
  if (categoriesWithCharts.length === 0) {
    console.log('CampaignCharts - No valid charts to render');
    return null;
  }

  console.log('CampaignCharts - Categories with charts:', categoriesWithCharts.map(([key, category]) => ({
    key,
    title: category?.title,
    chartCount: category?.charts?.length || 0
  })));

  // Render categorized charts
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Campaign Analytics Dashboard</h2>
      
      {/* Show summary of available categories */}
      <ChartCategorySummary categoriesWithCharts={categoriesWithCharts} />

      {/* Render each category */}
      {categoriesWithCharts.map(([categoryKey, category]) => (
        <ChartCategory 
          key={categoryKey}
          categoryKey={categoryKey}
          category={category}
        />
      ))}
    </div>
  );
};

export default CampaignCharts;
