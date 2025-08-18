import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  InformationCircleIcon,
  CodeBracketIcon,
  EyeIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import PlatformConnectionsCard from './PlatformConnectionsCard';

const PlatformConnectionsDemo = () => {
  const [showRawData, setShowRawData] = useState(false);

  // Sample API response data (matching your actual response structure)
  const sampleApiResponse = {
    "error": false,
    "result": {
      "google_accounts": [],
      "tiktok_connections": [],
      "meta_connections": [
        {
          "id": 3,
          "user": 4,
          "meta_user": {
            "id": 1,
            "meta_user_id": "4102158436769297",
            "name": "Yasir Ismail",
            "email": "meaningfulsilent@gmail.com",
            "profile_picture_url": "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=4102158436769297&height=200&width=200&ext=1756284983&hash=AT-_NSoz15Dt9MgvS_uCN8ML",
            "is_verified": false,
            "username": "",
            "bio": "",
            "followers_count": 0,
            "following_count": 0,
            "posts_count": 0,
            "is_business_account": false,
            "account_type": "",
            "created_at": "2025-07-20T08:38:00.337125Z",
            "updated_at": "2025-07-28T08:56:27.933070Z"
          },
          "token_type": "bearer",
          "expires_in": 5184000,
          "scope": "",
          "is_active": true,
          "pages": [
            {
              "id": 14,
              "page_id": "1571960479754174",
              "page_name": "Yasir Ismail",
              "page_username": "Yasirismailoffical",
              "page_picture_url": "https://scontent.fisb9-1.fna.fbcdn.net/v/t39.30808-1/307289399_478566134286463_4899959131372521343_n.jpg?stp=dst-jpg_p200x200_tt6&_nc_cat=104&ccb=1-7&_nc_sid=f907e8&_nc_eui2=AeFplC_TNzW8pWuFL3Ogr-eRRIOqTsjyPX9Eg6pOyPI9f6eYoEbaRyd3s63rOYYzV12MBk2a1BSgQ3J4WuHiQdQU&_nc_ohc=UJIcUiZpu-oQ7kNvwEVZY4q&_nc_oc=AdkkQmhG7BSUXgiBQPGBlZXKGuzNSpfieIU9jNMLEuiu0uswJzFXjSmKnRS7s98VsEI&_nc_zt=24&_nc_ht=scontent.fisb9-1.fna&edm=AGaHXAAEAAAA&_nc_gid=p-QbgJQAUsxJu-vEWyIU8w&oh=00_AfT3VcoBWCqLOhvmWR3x8wnRvbCWDtbt4HUfBU5XQA02Jw&oe=688D1FEB",
              "page_category": "Designer",
              "page_verification_status": "not_verified",
              "followers_count": 311,
              "is_published": true,
              "is_active": true,
              "created_at": "2025-07-25T15:41:48.552082Z"
            },
            {
              "id": 13,
              "page_id": "157631308069079",
              "page_name": "Jewella",
              "page_username": "Jewellaaccessories.pk",
              "page_picture_url": "https://scontent.fisb9-1.fna.fbcdn.net/v/t39.30808-1/240673252_250128933789173_1336439714544958047_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=110&ccb=1-7&_nc_sid=f907e8&_nc_eui2=AeFiWA08G5CTW8iXJB_8k7Pd7YBgGcNsoZjtgGAZw2yhmJfILNAmmr4GcHMAGA3XHv63xXX7jnxgDBlA88OG4nzN&_nc_ohc=2rqxS8ccW7cQ7kNvwGUSnjs&_nc_oc=AdnbG7XSQ92-HX2LqzdNfylA3Nd9o0yNJmqjTZPfCCkb7-KBQM3TRZmOB16soUeJSig&_nc_zt=24&_nc_ht=scontent.fisb9-1.fna&edm=AGaHXAAEAAAA&_nc_gid=p-QbgJQAUsxJu-vEWyIU8w&oh=00_AfTA3YJRk1A80s1b87-GYBhpd85jxBr3DKs8aUhF0DtIOg&oe=688D0725",
              "page_category": "Jewellery wholesaler",
              "page_verification_status": "not_verified",
              "followers_count": 762,
              "is_published": true,
              "is_active": true,
              "created_at": "2025-07-25T15:41:48.545416Z"
            }
          ],
          "created_at": "2025-07-25T15:41:48.387394Z",
          "updated_at": "2025-07-28T08:56:27.947406Z"
        }
      ],
      "total_google_accounts": 0,
      "total_tiktok_connections": 0,
      "total_meta_connections": 1,
      "total_connections": 1
    },
    "message": "Platform connections retrieved successfully",
    "code": 0
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleApiResponse, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Platform Connections Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Demonstrating how platform connections API response data is displayed
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {showRawData ? (
                <>
                  <EyeIcon className="w-4 h-4" />
                  <span>Hide Raw Data</span>
                </>
              ) : (
                <>
                  <CodeBracketIcon className="w-4 h-4" />
                  <span>Show Raw Data</span>
                </>
              )}
            </button>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              <span>Copy JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              API Response Structure
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              This demo shows how the platform connections API response is processed and displayed. 
              The data includes Meta connections with associated Facebook pages, user information, 
              and connection status details.
            </p>
          </div>
        </div>
      </div>

      {/* Raw Data Display */}
      {showRawData && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-900 rounded-lg p-4 overflow-auto"
        >
          <pre className="text-green-400 text-sm whitespace-pre-wrap">
            {JSON.stringify(sampleApiResponse, null, 2)}
          </pre>
        </motion.div>
      )}

      {/* Platform Connections Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Rendered Platform Connections
        </h2>
        <PlatformConnectionsCard connectionsData={sampleApiResponse} />
      </div>

      {/* Data Structure Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            API Response Fields
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Meta Connections</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Contains user profile, token info, and associated Facebook pages
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Pages</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Facebook pages with followers, categories, and verification status
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">User Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Profile information, verification status, and account details
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Connection Status</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Token expiry, active status, and connection health
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Key Features
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Real-time connection status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Page follower counts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Token expiry tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Verification status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Published/Draft status</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformConnectionsDemo; 