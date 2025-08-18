import { NextRequest, NextResponse } from 'next/server';

const TIKTOK_CLIENT_ID = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID;
const TIKTOK_CLIENT_SECRET = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    if (!TIKTOK_CLIENT_ID || !TIKTOK_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'TikTok credentials not configured' },
        { status: 500 }
      );
    }

    console.log('🔄 Server: Exchanging TikTok authorization code for access token...');
    console.log('Code:', code.substring(0, 20) + '...');

    // Exchange authorization code for access token using the new /oauth/token/ endpoint
    const tokenResponse = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: TIKTOK_CLIENT_ID,
        client_secret: TIKTOK_CLIENT_SECRET,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Server: TikTok token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to exchange authorization code',
          details: errorText,
          status: tokenResponse.status
        },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Server: TikTok token exchange response:', JSON.stringify(tokenData, null, 2));

    if (tokenData.code !== 0) {
      console.error('❌ Server: TikTok API error:', tokenData);
      return NextResponse.json(
        { 
          error: 'TikTok API error',
          code: tokenData.code,
          message: tokenData.message,
          request_id: tokenData.request_id
        },
        { status: 400 }
      );
    }

    // Check if access token exists
    if (!tokenData.access_token) {
      console.error('❌ Server: No access token received:', tokenData);
      return NextResponse.json(
        { 
          error: 'No access token received from TikTok',
          receivedData: tokenData
        },
        { status: 400 }
      );
    }

    console.log('✅ Server: TikTok token exchange successful:', { 
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      advertiserIds: tokenData.advertiser_ids,
      scope: tokenData.scope
    });

    // Get user information using the access token
    console.log('🔄 Server: Fetching TikTok user information...');
    let userData = null;
    let user = null;

    try {
      const userResponse = await fetch('https://business-api.tiktok.com/open_api/v1.3/user/info/', {
        method: 'GET',
        headers: {
          'Access-Token': tokenData.access_token,
          'Content-Type': 'application/json',
        },
      });

      if (userResponse.ok) {
        userData = await userResponse.json();
        console.log('✅ Server: TikTok user info response:', JSON.stringify(userData, null, 2));

        if (userData.code === 0 && userData.data) {
          user = userData.data;
          console.log('✅ Server: TikTok user info fetched successfully:', { 
            hasUserData: !!user,
            coreUserId: user.core_user_id,
            displayName: user.display_name,
            email: user.email
          });
        } else {
          console.warn('⚠️ Server: User info API returned error or invalid structure:', userData);
        }
      } else {
        const errorText = await userResponse.text();
        console.warn('⚠️ Server: Failed to fetch TikTok user info:', {
          status: userResponse.status,
          statusText: userResponse.statusText,
          error: errorText
        });
      }
    } catch (error) {
      console.warn('⚠️ Server: Error fetching user info:', error);
    }

    // Get business profile information using the access token
    console.log('🔄 Server: Fetching TikTok business profile...');
    let businessProfile = null;

    try {
      // Use the core_user_id as business_id for the business profile API
      const businessId = user?.core_user_id || tokenData.advertiser_ids?.[0];
      
      if (!businessId) {
        console.warn('⚠️ Server: No business_id available for business profile API, skipping business profile fetch');
      } else {
        const businessUrl = new URL('https://business-api.tiktok.com/open_api/v1.3/business/get/');
        businessUrl.searchParams.set('business_id', businessId);
        
        // Set date range for the last 7 days (maximum supported look-back period is 60 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        
        businessUrl.searchParams.set('start_date', startDate.toISOString().split('T')[0]); // YYYY-MM-DD format
        businessUrl.searchParams.set('end_date', endDate.toISOString().split('T')[0]); // YYYY-MM-DD format
        
        // Request maximum fields for comprehensive data
        const fields = [
          // Basic profile information
          'is_business_account',
          'profile_image',
          'username',
          'profile_deep_link',
          'display_name',
          'bio_description',
          'is_verified',
          'following_count',
          'followers_count',
          'total_likes',
          'videos_count',
          
          // Daily metrics (insights)
          'video_views',
          'unique_video_views',
          'profile_views',
          'likes',
          'comments',
          'shares',
          'phone_number_clicks',
          'lead_submissions',
          'app_download_clicks',
          'bio_link_clicks',
          'email_clicks',
          'address_clicks',
          'daily_total_followers',
          'daily_new_followers',
          'daily_lost_followers',
          'audience_activity',
          'engaged_audience',
          
          // Audience demographics
          'audience_ages',
          'audience_genders',
          'audience_countries',
          'audience_cities'
        ];
        
        businessUrl.searchParams.set('fields', JSON.stringify(fields));

        console.log('🔗 Server: TikTok Business Profile URL:', businessUrl.toString());

        const businessResponse = await fetch(businessUrl.toString(), {
          method: 'GET',
          headers: {
            'Access-Token': tokenData.access_token,
            'Content-Type': 'application/json',
          },
        });

        if (businessResponse.ok) {
          const businessData = await businessResponse.json();
          console.log('✅ Server: TikTok business profile response:', JSON.stringify(businessData, null, 2));

          if (businessData.code === 0 && businessData.data) {
            businessProfile = businessData.data;
            console.log('✅ Server: TikTok business profile fetched successfully:', {
              displayName: businessProfile.display_name,
              username: businessProfile.username,
              followersCount: businessProfile.followers_count,
              isBusinessAccount: businessProfile.is_business_account
            });
          } else {
            console.warn('⚠️ Server: Business profile API returned error:', businessData);
          }
        } else {
          const errorText = await businessResponse.text();
          console.warn('⚠️ Server: Failed to fetch TikTok business profile:', {
            status: businessResponse.status,
            statusText: businessResponse.statusText,
            error: errorText
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Server: Error fetching business profile:', error);
    }

    // Transform the response to match our expected format with comprehensive business profile data
    const responseData = {
      user_data: {
        id: user?.core_user_id || businessProfile?.username || 'unknown',
        display_name: businessProfile?.display_name || user?.display_name || 'TikTok User',
        email: user?.email || '',
        avatar_url: businessProfile?.profile_image || user?.avatar_url || '',
        profile_deep_link: businessProfile?.profile_deep_link || '',
        is_verified: businessProfile?.is_verified || false,
        follower_count: businessProfile?.followers_count || 0,
        following_count: businessProfile?.following_count || 0,
        likes_count: businessProfile?.total_likes || 0,
        created_at: new Date(user?.create_time ? user.create_time * 1000 : Date.now()).toISOString(),
        updated_at: new Date().toISOString(),
        // Additional business profile data
        username: businessProfile?.username || '',
        bio_description: businessProfile?.bio_description || '',
        videos_count: businessProfile?.videos_count || 0,
        is_business_account: businessProfile?.is_business_account || false,
        // Analytics data
        metrics: businessProfile?.metrics || [],
        audience_ages: businessProfile?.audience_ages || [],
        audience_genders: businessProfile?.audience_genders || [],
        audience_countries: businessProfile?.audience_countries || [],
        audience_cities: businessProfile?.audience_cities || [],
        audience_activity: businessProfile?.audience_activity || [],
      },
      token_data: {
        access_token: tokenData.access_token,
        refresh_token: '', // New API doesn't return refresh_token for long-term tokens
        token_type: tokenData.token_type || 'Bearer',
        expires_in: 0, // Long-term tokens don't expire
        scope: Array.isArray(tokenData.scope) ? tokenData.scope.join(',') : '',
        advertiser_ids: tokenData.advertiser_ids || [],
      },
      advertiser_data: tokenData.advertiser_ids?.map((id) => ({
        advertiser_id: id,
        advertiser_name: businessProfile?.display_name || 'TikTok Account',
        currency: 'USD',
        timezone: 'UTC',
        status: 'ACTIVE',
        industry_id: 0,
        industry_name: 'General'
      })) || [],
      // Store the complete business profile data for analytics
      business_profile: businessProfile || null,
    };

    console.log('✅ Server: TikTok OAuth profile data prepared:', {
      userId: responseData.user_data.id,
      displayName: responseData.user_data.display_name,
      hasAccessToken: !!responseData.token_data.access_token
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Server: Error in TikTok OAuth token exchange:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 