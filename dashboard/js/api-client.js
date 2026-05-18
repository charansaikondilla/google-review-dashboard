// ========================================
// API CLIENT - Google Apps Script Communication
// ========================================

const APIClient = (() => {
    // ======== CONFIGURATION ========
    // IMPORTANT: Update this with your Google Apps Script Deployment URL
    // Format: https://script.googleapis.com/macros/d/[DEPLOYMENT_ID]/usercallback
    // Get this URL from: Google Apps Script → Deploy → New deployment → Copy URL
    const API_URL = 'https://script.google.com/macros/s/AKfycbwdYmoicMWeLvmfzEL2yGHbGgWhu3rNWkYqObRKf1eTmU3ZDVJZG_l24NiUm2TP89pC/exec';

    // Cache configuration
    const CACHE_TTL = 55000; // 55 seconds (works well with 60s polling)
    let cachedData = null;
    let lastFetchTime = null;
    let lastFingerprint = null;

    async function fetchJson(action, forceRefresh) {
        const forceParam = forceRefresh ? '&forceRefresh=true' : '';
        const response = await fetch(`${API_URL}?action=${action}${forceParam}`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
    }

    // ======== PUBLIC API ========
    return {
        /**
         * Get combined analytics data
         * Returns: { positive[], negative[], stats{} }
         */
        getAnalytics: async function(forceRefresh = false) {
            try {
                // Check cache first (if still valid)
                if (!forceRefresh && this._isValidCache()) {
                    console.log('📦 Using cached data');
                    return cachedData;
                }

                console.log('📡 Fetching fresh data from API...');
                const data = await fetchJson('all', forceRefresh);

                // Check for API errors
                if (data.error) {
                    throw new Error(`API Error: ${data.error}`);
                }

                // Validate data structure
                if (!data.positive || !data.negative || !data.stats) {
                    throw new Error('Invalid API response structure');
                }

                // Cache the data
                cachedData = data;
                lastFetchTime = Date.now();
                if (data.meta && data.meta.fingerprint) {
                    lastFingerprint = data.meta.fingerprint;
                }

                console.log('✓ Data fetched successfully:', {
                    positive: data.positive.length,
                    negative: data.negative.length,
                    total: data.stats.totalReviews
                });

                return data;
            } catch (error) {
                console.error('❌ API Error:', error);
                
                // Return cached data if available (as fallback)
                if (cachedData) {
                    console.warn('⚠ Returning cached data due to error');
                    return cachedData;
                }

                // Return empty structure on first failure
                return {
                    error: error.message,
                    positive: [],
                    negative: [],
                    meta: {
                        fingerprint: null,
                        duplicateCount: 0
                    },
                    stats: {
                        totalReviews: 0,
                        positiveCount: 0,
                        negativeCount: 0,
                        positivePercent: 0,
                        negativePercent: 0,
                        avgPositiveRating: 0,
                        avgNegativeRating: 0
                    }
                };
            }
        },

        /**
         * Lightweight endpoint to check whether sheet data changed.
         */
        getMeta: async function(forceRefresh = false) {
            try {
                const meta = await fetchJson('meta', forceRefresh);
                if (meta.error) {
                    throw new Error(meta.error);
                }
                return meta;
            } catch (error) {
                console.error('❌ Error fetching metadata:', error);
                return {
                    status: 'error',
                    fingerprint: null,
                    totalReviews: cachedData?.stats?.totalReviews || 0,
                    duplicateCount: 0,
                    warnings: [error.message]
                };
            }
        },

        /**
         * Fetch full analytics only when fingerprint changed.
         */
        getAnalyticsIfChanged: async function() {
            if (!cachedData) {
                const firstLoad = await this.getAnalytics(true);
                return { changed: true, data: firstLoad };
            }

            const meta = await this.getMeta(false);
            if (!meta.fingerprint) {
                const fallback = await this.getAnalytics(false);
                return { changed: true, data: fallback };
            }

            if (lastFingerprint && meta.fingerprint === lastFingerprint) {
                return { changed: false, data: cachedData, meta };
            }

            const updated = await this.getAnalytics(true);
            return { changed: true, data: updated, meta };
        },

        /**
         * Get only positive reviews
         */
        getPositiveReviews: async function() {
            try {
                const response = await fetch(API_URL + '?action=positive');
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                return data;
            } catch (error) {
                console.error('❌ Error fetching positive reviews:', error);
                return [];
            }
        },

        /**
         * Get only negative reviews
         */
        getNegativeReviews: async function() {
            try {
                const response = await fetch(API_URL + '?action=negative');
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                return data;
            } catch (error) {
                console.error('❌ Error fetching negative reviews:', error);
                return [];
            }
        },

        /**
         * Clear cache (force refresh)
         */
        clearCache: function() {
            cachedData = null;
            lastFetchTime = null;
            lastFingerprint = null;
            console.log('🗑 Cache cleared');
        },

        /**
         * Get cache status
         */
        getCacheStatus: function() {
            return {
                hasCachedData: cachedData !== null,
                isExpired: !this._isValidCache(),
                timestamp: lastFetchTime,
                fingerprint: lastFingerprint,
                data: cachedData
            };
        },

        /**
         * Format timestamp for display
         */
        formatTime: function(isoString) {
            try {
                const date = new Date(isoString);
                return date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                return 'Invalid date';
            }
        },

        // ======== PRIVATE METHODS ========
        /**
         * Check if cache is still valid
         */
        _isValidCache: function() {
            if (!cachedData || !lastFetchTime) return false;
            const elapsed = Date.now() - lastFetchTime;
            return elapsed < CACHE_TTL;
        }
    };
})();

// ======== INITIALIZATION CHECK ========
console.log('%c Review Intelligence Dashboard', 'font-size: 14px; font-weight: bold; color: #2563eb;');
console.log('API Client initialized');

// Warn if API URL not configured
if (APIClient.getAnalytics && APIClient.getAnalytics.toString().includes('YOUR_SCRIPT_ID')) {
    console.warn('%c⚠️ WARNING: Google Apps Script URL not configured!', 'color: #ef4444; font-weight: bold;');
    console.warn('Update the API_URL in dashboard/js/api-client.js with your actual deployment URL');
}
