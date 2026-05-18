// ========================================
// DASHBOARD MAIN - Orchestrator
// ========================================

const Dashboard = (() => {
    // ======== STATE ========
    let currentData = null;
    let autoRefreshInterval = null;
    const REFRESH_INTERVAL = 60000; // 60 seconds

    // ======== DOM ELEMENTS ========
    const elements = {
        refreshBtn: document.getElementById('refreshBtn'),
        refreshSpinner: document.getElementById('refreshSpinner'),
        lastUpdate: document.getElementById('lastUpdate'),
        
        // Stats
        statTotal: document.getElementById('statTotal'),
        statPositive: document.getElementById('statPositive'),
        statPositivePercent: document.getElementById('statPositivePercent'),
        statNegative: document.getElementById('statNegative'),
        statNegativePercent: document.getElementById('statNegativePercent'),
        statAvgRating: document.getElementById('statAvgRating'),
        statUnique: document.getElementById('statUnique'),
        statDuplicates: document.getElementById('statDuplicates'),
        statHealth: document.getElementById('statHealth'),
        
        // Content areas
        alertsBanner: document.getElementById('alertsBanner'),
        searchInput: document.getElementById('searchInput'),
        sortSelect: document.getElementById('sortSelect')
    };

    // ======== INITIALIZATION ========
    function init() {
        console.log('🚀 Initializing Dashboard...');
        
        // Setup event listeners
        elements.refreshBtn.addEventListener('click', manualRefresh);
        elements.searchInput.addEventListener('input', () => {
            SearchFilterModule.search(elements.searchInput.value);
        });
        elements.sortSelect.addEventListener('change', (e) => {
            SearchFilterModule.sort(e.target.value);
        });

        // Initial load
        loadData({ forceRefresh: true, showLoading: true });

        // Setup auto-refresh
        autoRefreshInterval = setInterval(() => {
            console.log('🔄 Background refresh check triggered');
            loadData({ backgroundCheck: true, showLoading: false });
        }, REFRESH_INTERVAL);

        console.log('✓ Dashboard initialized');
    }

    // ======== DATA LOADING ========
    async function loadData(options = {}) {
        const {
            forceRefresh = false,
            showLoading = true,
            backgroundCheck = false
        } = options;

        try {
            // Show loading state
            if (showLoading) {
                elements.refreshBtn.disabled = true;
                elements.refreshSpinner.classList.add('active');
            }

            console.log('📊 Loading analytics data...');
            let data = null;

            if (backgroundCheck) {
                const result = await APIClient.getAnalyticsIfChanged();
                if (!result.changed) {
                    console.log('ℹ No sheet changes detected; skipping re-render');
                    updateTimestamp(true);
                    return;
                }
                data = result.data;
            } else {
                data = await APIClient.getAnalytics(forceRefresh);
            }

            if (data.error) {
                throw new Error(data.error);
            }

            currentData = data;

            // Update all sections
            updateStats(data.stats, data.meta || {}, data.status || 'ok');
            ChartsModule.render(data.positive, data.negative, data.stats);
            InsightsModule.render(data.positive, data.negative, data.stats);
            AlertsModule.render(data.stats);
            SearchFilterModule.setData(data.positive, data.negative);
            
            // Update timestamp
            updateTimestamp(false);

            console.log('✓ Dashboard updated successfully');

        } catch (error) {
            console.error('❌ Error loading data:', error);
            AlertsModule.showError(error.message);
        } finally {
            // Hide loading state
            if (showLoading) {
                elements.refreshBtn.disabled = false;
                elements.refreshSpinner.classList.remove('active');
            }
        }
    }

    // ======== REFRESH LOGIC ========
    function manualRefresh() {
        console.log('🔄 Manual refresh triggered');
        APIClient.clearCache();
        loadData({ forceRefresh: true, showLoading: true });
    }

    // ======== UPDATE FUNCTIONS ========
    function updateStats(stats, meta, status) {
        elements.statTotal.textContent = stats.totalReviews.toLocaleString();
        elements.statPositive.textContent = stats.positiveCount.toLocaleString();
        elements.statPositivePercent.textContent = `(${stats.positivePercent}%)`;
        elements.statNegative.textContent = stats.negativeCount.toLocaleString();
        elements.statNegativePercent.textContent = `(${stats.negativePercent}%)`;

        // Calculate overall average rating
        let overallAvg = 0;
        if (stats.totalReviews > 0) {
            const allRatingsSum = (stats.avgPositiveRating * stats.positiveCount) + 
                                  (stats.avgNegativeRating * stats.negativeCount);
            overallAvg = allRatingsSum / stats.totalReviews;
        }
        elements.statAvgRating.textContent = overallAvg.toFixed(1);

        if (elements.statUnique) {
            elements.statUnique.textContent = stats.totalReviews.toLocaleString();
        }

        if (elements.statDuplicates) {
            const dupCount = Number(meta.duplicateCount || 0);
            elements.statDuplicates.textContent = dupCount.toLocaleString();
        }

        if (elements.statHealth) {
            const normalized = String(status || '').toLowerCase();
            elements.statHealth.textContent = normalized === 'partial'
                ? 'PARTIAL'
                : normalized === 'error'
                    ? 'ERROR'
                    : 'HEALTHY';
            elements.statHealth.style.color = normalized === 'partial'
                ? '#b45309'
                : normalized === 'error'
                    ? '#b91c1c'
                    : '#166534';
        }
    }

    function updateTimestamp(isNoDataChange) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        elements.lastUpdate.textContent = isNoDataChange
            ? `${timeString} (checked)`
            : timeString;
    }

    // ======== CLEANUP ========
    function destroy() {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
        console.log('🛑 Dashboard destroyed');
    }

    // ======== PUBLIC API ========
    return {
        init,
        destroy,
        getData: () => currentData,
        refresh: manualRefresh
    };
})();

// ======== PAGE LIFECYCLE ========
// Initialize when page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Dashboard.init);
} else {
    Dashboard.init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', Dashboard.destroy);
