import { apiService } from '../services/api';

/**
 * Automatically selects all campaigns for all selected ad accounts/customers
 * when subscription is Premium Plan.
 * Skips a platform entirely when that platform's has_selected is true (subscription
 * / meta_ad_account_status / google_customer_status), so we never call bulk-select
 * with "all" when the user has already selected.
 *
 * @param {string} planType - Current plan type ('free', 'premium', 'enterprise')
 * @param {object} [subscription] - Current subscription (from Redux) for has_selected checks
 * @returns {Promise<{success: boolean, message: string, details?: object}>}
 */
export const autoSelectAllCampaignsForPremium = async (planType, subscription = null) => {
  // Only proceed if plan is Premium
  if (planType !== 'premium') {
    return {
      success: false,
      message: `Auto-select only applies to Premium Plan. Current plan: ${planType}`
    };
  }

  const googleHasSelected = subscription?.google_customer_status?.has_selected === true;
  const metaHasSelected = subscription?.meta_ad_account_status?.has_selected === true;

  try {
    const results = {
      google: { success: false, campaignsSelected: 0, error: null },
      meta: { success: false, campaignsSelected: 0, error: null }
    };

    // Fetch platform connections data (contains both Google and Meta data)
    try {
      const connectionsResponse = await apiService.marketing.platformConnections();
      
      if (connectionsResponse.data.error === false && connectionsResponse.data.result) {
        const result = connectionsResponse.data.result;

        // Process Google accounts and campaigns only if not already selected
        // Only process the first Google account (index [0])
        // Note: platformConnections only has selected_campaigns, so we need to fetch all campaigns
        // using getCustomers() API which returns all campaigns for selected customers
        if (googleHasSelected) {
          console.log('Premium auto-select: Skipping Google — has_selected is true');
        }
        try {
          if (!googleHasSelected) {
            // Get the first Google account to identify which customers belong to it
            const firstGoogleAccount = result.google_accounts && result.google_accounts.length > 0 
              ? result.google_accounts[0] 
              : null;
          
            if (!firstGoogleAccount) {
              console.log('Premium auto-select: No Google account found');
            } else {
              const googleResponse = await apiService.marketing.getCustomers();
            
              if (googleResponse.data.error === false && googleResponse.data.result) {
                const customers = googleResponse.data.result.customers || [];
              
                // Get customer IDs from the first Google account's selected customers
                const firstAccountCustomerIds = firstGoogleAccount.selected_customers
                  ? firstGoogleAccount.selected_customers
                      .filter(c => c.is_selected === true)
                      .map(c => c.customer_id)
                  : [];
              
                console.log('Premium auto-select: First Google account selected customer IDs:', firstAccountCustomerIds);
              
                // Filter only selected customers that belong to the first Google account
                const selectedCustomers = customers.filter(customer => 
                  customer.is_selected === true && 
                  firstAccountCustomerIds.includes(customer.customer_id)
                );
              
                console.log('Premium auto-select: Selected customers from getCustomers API:', selectedCustomers.length);
              
                if (selectedCustomers.length > 0) {
                  // Collect ALL campaigns from selected customers (not just selected ones)
                  const allGoogleCampaignIds = [];
                
                  selectedCustomers.forEach(customer => {
                    // Get all campaigns from this customer
                    if (customer.campaigns && Array.isArray(customer.campaigns)) {
                      console.log(`Premium auto-select: Customer ${customer.customer_id} has ${customer.campaigns.length} campaigns`);
                      customer.campaigns.forEach(campaign => {
                        if (campaign.campaign_id && !allGoogleCampaignIds.includes(campaign.campaign_id)) {
                          allGoogleCampaignIds.push(campaign.campaign_id);
                        }
                      });
                    }
                  });
                
                  console.log('Premium auto-select: Total Google campaigns to select:', allGoogleCampaignIds.length, allGoogleCampaignIds);

                  if (allGoogleCampaignIds.length > 0) {
                    // Send bulk select request for Google campaigns
                    const googleBulkData = {
                      campaign_ids: allGoogleCampaignIds
                    };

                    try {
                      await apiService.marketing.bulkSelectGoogleEntities(googleBulkData);
                      results.google.success = true;
                      results.google.campaignsSelected = allGoogleCampaignIds.length;
                      console.log(`Premium auto-select: Selected ${allGoogleCampaignIds.length} Google campaigns`);
                    } catch (error) {
                      results.google.error = error.response?.data?.message || error.message;
                      console.error('Failed to bulk select Google campaigns:', error);
                    }
                  } else {
                    console.log('Premium auto-select: No Google campaigns found to select');
                  }
                } else {
                  console.log('Premium auto-select: No selected Google customers found for first account');
                }
              } else {
                console.log('Premium auto-select: Failed to fetch Google customers data');
              }
            }
          }
        } catch (error) {
          results.google.error = error.response?.data?.message || error.message;
          console.error('Failed to fetch Google customers:', error);
        }

        // Process Meta connections and campaigns only if not already selected
        // Only process the first Meta connection (index [0])
        if (metaHasSelected) {
          console.log('Premium auto-select: Skipping Meta — has_selected is true');
        }
        if (!metaHasSelected && result.meta_connections && Array.isArray(result.meta_connections) && result.meta_connections.length > 0) {
          try {
            // Collect all campaigns from all selected ad accounts from the first Meta connection only
            const allMetaCampaignIds = [];
            
            // Only process the first Meta connection
            const metaConnection = result.meta_connections[0];
            
            if (metaConnection.selected_ad_accounts && Array.isArray(metaConnection.selected_ad_accounts)) {
              // Filter only selected ad accounts
              const selectedAdAccounts = metaConnection.selected_ad_accounts.filter(
                account => account.is_selected === true
              );
              
              console.log('Premium auto-select: Selected Meta ad accounts:', selectedAdAccounts.length);
              
              selectedAdAccounts.forEach(account => {
                // Get all campaigns from this ad account (both selected and unselected)
                // For Premium, we want to select ALL campaigns, not just selected ones
                if (account.campaigns && Array.isArray(account.campaigns)) {
                  console.log(`Premium auto-select: Ad account ${account.ad_account_id} has ${account.campaigns.length} campaigns`);
                  account.campaigns.forEach(campaign => {
                    const campaignId = campaign.campaign_id || campaign.id;
                    if (campaignId && !allMetaCampaignIds.includes(campaignId)) {
                      allMetaCampaignIds.push(campaignId);
                    }
                  });
                }
              });
            }
            
            console.log('Premium auto-select: Total Meta campaigns to select:', allMetaCampaignIds.length, allMetaCampaignIds);

            if (allMetaCampaignIds.length > 0) {
              // Send bulk select request for Meta campaigns
              const metaBulkData = {
                campaign_ids: allMetaCampaignIds
              };

              try {
                await apiService.marketing.bulkSelectMetaEntities(metaBulkData);
                results.meta.success = true;
                results.meta.campaignsSelected = allMetaCampaignIds.length;
                console.log(`Premium auto-select: Selected ${allMetaCampaignIds.length} Meta campaigns`);
              } catch (error) {
                results.meta.error = error.response?.data?.message || error.message;
                console.error('Failed to bulk select Meta campaigns:', error);
              }
            } else {
              console.log('Premium auto-select: No Meta campaigns found to select');
            }
          } catch (error) {
            results.meta.error = error.response?.data?.message || error.message;
            console.error('Failed to process Meta connections:', error);
          }
        }
      } else {
        console.error('Platform connections API returned error:', connectionsResponse.data);
        return {
          success: false,
          message: 'Failed to fetch platform connections data',
          details: { error: 'Invalid API response' }
        };
      }
    } catch (error) {
      console.error('Failed to fetch platform connections:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch platform connections',
        details: { error: error.message }
      };
    }

    const totalCampaigns = results.google.campaignsSelected + results.meta.campaignsSelected;
    const hasErrors = results.google.error || results.meta.error;
    const allSuccess = results.google.success || results.meta.success;

    return {
      success: allSuccess && !hasErrors,
      message: totalCampaigns > 0 
        ? `Successfully auto-selected ${totalCampaigns} campaign(s) for Premium Plan`
        : 'No campaigns found to select',
      details: results
    };
  } catch (error) {
    console.error('Error in auto-select campaigns for Premium:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to auto-select campaigns',
      details: { error: error.message }
    };
  }
};
