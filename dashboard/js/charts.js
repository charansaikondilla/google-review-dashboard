// ========================================
// CHARTS MODULE - Visualizations
// ========================================

const ChartsModule = (() => {
    let charts = {};

    // ======== DEFAULT COLORS ========
    const colors = {
        positive: '#16a34a',
        negative: '#dc2626',
        neutral: '#64748b',
        primary: '#0f766e',
        accent: '#0891b2'
    };

    // ======== INITIALIZATION ========
    function init() {
        console.log('📊 Charts module initialized');
    }

    // ======== MAIN RENDER FUNCTION ========
    function render(positiveReviews, negativeReviews, stats) {
        try {
            console.log('Rendering charts...');
            const combined = [...positiveReviews, ...negativeReviews];
            
            renderSentimentChart(positiveReviews, negativeReviews, stats);
            renderRatingChart(positiveReviews, negativeReviews);
            renderTrendsChart(positiveReviews, negativeReviews);
            renderVolumeChart(combined);
            renderTopReviewersChart(combined);
            
            console.log('✓ Charts rendered successfully');
        } catch (error) {
            console.error('❌ Error rendering charts:', error);
        }
    }

    // ======== CHART 1: SENTIMENT PIE CHART ========
    function renderSentimentChart(positive, negative, stats) {
        const ctx = document.getElementById('sentimentChart').getContext('2d');

        // Destroy existing chart if it exists
        if (charts.sentiment) {
            charts.sentiment.destroy();
        }

        // Create new chart
        charts.sentiment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Negative'],
                datasets: [{
                    data: [stats.positiveCount, stats.negativeCount],
                    backgroundColor: [colors.positive, colors.negative],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 16,
                            font: { size: 13, weight: '600' },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = stats.totalReviews || 0;
                                const percent = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
                                return context.label + ': ' + context.parsed + ' (' + percent + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // ======== CHART 2: RATING DISTRIBUTION BAR CHART ========
    function renderRatingChart(positive, negative) {
        const ctx = document.getElementById('ratingChart').getContext('2d');

        const positiveCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const negativeCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        positive.forEach((r) => {
            if (positiveCounts.hasOwnProperty(r.rating)) {
                positiveCounts[r.rating]++;
            }
        });
        negative.forEach((r) => {
            if (negativeCounts.hasOwnProperty(r.rating)) {
                negativeCounts[r.rating]++;
            }
        });

        // Destroy existing chart if it exists
        if (charts.rating) {
            charts.rating.destroy();
        }

        // Create new chart
        charts.rating = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
                datasets: [
                    {
                        label: 'Positive',
                        data: [
                            positiveCounts[1],
                            positiveCounts[2],
                            positiveCounts[3],
                            positiveCounts[4],
                            positiveCounts[5]
                        ],
                        backgroundColor: 'rgba(22, 163, 74, 0.75)',
                        borderColor: colors.positive,
                        borderWidth: 2,
                        borderRadius: 6
                    },
                    {
                        label: 'Negative',
                        data: [
                            negativeCounts[1],
                            negativeCounts[2],
                            negativeCounts[3],
                            negativeCounts[4],
                            negativeCounts[5]
                        ],
                        backgroundColor: 'rgba(220, 38, 38, 0.75)',
                        borderColor: colors.negative,
                        borderWidth: 2,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                indexAxis: 'x',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            font: { size: 13, weight: '600' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' reviews';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        stacked: true
                    },
                    x: {
                        stacked: true
                    }
                }
            }
        });
    }

    // ======== CHART 3: TRENDS LINE CHART ========
    function renderTrendsChart(positive, negative) {
        const ctx = document.getElementById('trendsChart').getContext('2d');

        // Group by date
        const dateGroups = {};

        positive.forEach(r => {
            const date = dateLabel(r.timestamp);
            if (!date) return;
            if (!dateGroups[date]) {
                dateGroups[date] = { positive: 0, negative: 0, ts: parseTs(r.timestamp) };
            }
            dateGroups[date].positive++;
        });

        negative.forEach(r => {
            const date = dateLabel(r.timestamp);
            if (!date) return;
            if (!dateGroups[date]) {
                dateGroups[date] = { positive: 0, negative: 0, ts: parseTs(r.timestamp) };
            }
            dateGroups[date].negative++;
        });

        // Sort by date and prepare data
        const sortedDates = Object.keys(dateGroups).sort((a, b) => {
            return dateGroups[a].ts - dateGroups[b].ts;
        });

        const positiveData = sortedDates.map(date => dateGroups[date].positive);
        const negativeData = sortedDates.map(date => dateGroups[date].negative);

        // Limit to last 14 days for readability
        const displayLimit = 14;
        const labels = sortedDates.slice(-displayLimit);
        const positiveDisplay = positiveData.slice(-displayLimit);
        const negativeDisplay = negativeData.slice(-displayLimit);

        // Destroy existing chart if it exists
        if (charts.trends) {
            charts.trends.destroy();
        }

        // Create new chart
        charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Positive Reviews',
                        data: positiveDisplay,
                        borderColor: colors.positive,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: colors.positive,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Negative Reviews',
                        data: negativeDisplay,
                        borderColor: colors.negative,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: colors.negative,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 16,
                            font: { size: 13, weight: '600' },
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + ' reviews';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    function renderVolumeChart(combined) {
        const canvas = document.getElementById('volumeChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const daily = {};
        combined.forEach((review) => {
            const key = dateLabel(review.timestamp);
            if (!key) return;
            if (!daily[key]) {
                daily[key] = { count: 0, ts: parseTs(review.timestamp) };
            }
            daily[key].count += 1;
        });

        const labels = Object.keys(daily)
            .sort((a, b) => daily[a].ts - daily[b].ts)
            .slice(-21);

        const data = labels.map((l) => daily[l].count);

        if (charts.volume) charts.volume.destroy();

        charts.volume = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Reviews per day',
                    data,
                    backgroundColor: 'rgba(8, 145, 178, 0.65)',
                    borderColor: colors.accent,
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    }

    function renderTopReviewersChart(combined) {
        const canvas = document.getElementById('reviewersChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const counts = {};
        combined.forEach((review) => {
            const name = (review.name || 'Unknown').trim() || 'Unknown';
            counts[name] = (counts[name] || 0) + 1;
        });

        const top = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        const labels = top.map((item) => item[0]);
        const data = top.map((item) => item[1]);

        if (charts.reviewers) charts.reviewers.destroy();

        charts.reviewers = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Reviews',
                    data,
                    backgroundColor: 'rgba(15, 118, 110, 0.75)',
                    borderColor: colors.primary,
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    }

    function parseTs(value) {
        if (!value) return 0;
        const normalized = String(value).includes('T') ? String(value) : String(value).replace(' ', 'T');
        const ts = new Date(normalized).getTime();
        return Number.isNaN(ts) ? 0 : ts;
    }

    function dateLabel(value) {
        const ts = parseTs(value);
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // ======== PUBLIC API ========
    return {
        init,
        render,
        destroy: () => {
            Object.values(charts).forEach(chart => {
                if (chart) chart.destroy();
            });
            charts = {};
        }
    };
})();

// Initialize
ChartsModule.init();
