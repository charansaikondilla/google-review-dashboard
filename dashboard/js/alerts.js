// ========================================
// ALERTS MODULE - Alert Logic
// ========================================

const AlertsModule = (() => {
    // ======== DOM ELEMENTS ========
    const alertsBanner = document.getElementById('alertsBanner');

    // ======== STATE ========
    let previousStats = null;

    // ======== MAIN RENDER FUNCTION ========
    function render(stats) {
        try {
            console.log('🚨 Checking for alerts...');
            
            const alert = detectAlert(stats);
            displayAlert(alert);
            
            // Store stats for trend detection
            previousStats = stats;
        } catch (error) {
            console.error('❌ Error rendering alert:', error);
        }
    }

    // ======== DETECT ALERT CONDITIONS ========
    function detectAlert(stats) {
        // RED ALERT: Very low positive percentage
        if (stats.positivePercent < 30 && stats.totalReviews >= 5) {
            return {
                level: 'red',
                message: `🚨 CRITICAL: Only ${stats.positivePercent}% positive reviews. Immediate action needed.`
            };
        }

        // RED ALERT: Too many negative reviews
        if (stats.negativeCount >= 10 && stats.positivePercent < 50) {
            return {
                level: 'red',
                message: `🚨 WARNING: High number of negative reviews (${stats.negativeCount}). Address customer concerns.`
            };
        }

        // YELLOW ALERT: Declining trend
        if (previousStats && stats.positivePercent < previousStats.positivePercent - 15) {
            return {
                level: 'yellow',
                message: `⚠️ ALERT: Sentiment declining rapidly. Investigate recent changes.`
            };
        }

        // YELLOW ALERT: Low positive percentage but manageable
        if (stats.positivePercent < 50 && stats.totalReviews >= 5) {
            return {
                level: 'yellow',
                message: `⚠️ NOTICE: Less than 50% positive reviews. Review recent feedback for improvements.`
            };
        }

        // YELLOW ALERT: Very few reviews
        if (stats.totalReviews < 3) {
            return {
                level: 'yellow',
                message: `ℹ️ INFO: Only ${stats.totalReviews} review${stats.totalReviews === 1 ? '' : 's'} collected so far.`
            };
        }

        // GREEN CHECK: All good
        return {
            level: 'green',
            message: `✅ Great! ${stats.positivePercent}% positive sentiment. Keep up the good work!`
        };
    }

    // ======== DISPLAY ALERT ========
    function displayAlert(alert) {
        // Clear existing alert
        alertsBanner.className = 'alerts-banner';
        alertsBanner.innerHTML = '';

        // Apply level styling and show
        alertsBanner.classList.add('show', `alert-${alert.level}`);
        alertsBanner.textContent = alert.message;

        console.log(`Alert level: ${alert.level}`, alert.message);
    }

    // ======== SHOW ERROR ALERT ========
    function showError(message) {
        alertsBanner.className = 'alerts-banner alert-red show';
        alertsBanner.innerHTML = `
            <strong>❌ Error:</strong> ${message}
            <small> | <a href="javascript:location.reload()" style="color: inherit; text-decoration: underline; cursor: pointer;">Reload page</a></small>
        `;
    }

    // ======== PUBLIC API ========
    return {
        render,
        showError
    };
})();
