// ========================================
// INSIGHTS MODULE - Smart Analysis
// ========================================

const InsightsModule = (() => {
    // ======== STOP WORDS (Common words to ignore) ========
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'as',
        'is', 'was', 'are', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'can',
        'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
        'they', 'me', 'him', 'her', 'us', 'it', 'my', 'your', 'his', 'her',
        'its', 'our', 'their', 'what', 'which', 'who', 'whom', 'why', 'how'
    ]);

    // ======== DOM ELEMENTS ========
    const elements = {
        insightsContent: document.getElementById('insightsContent'),
        positiveKeywords: document.getElementById('positiveKeywords'),
        negativeKeywords: document.getElementById('negativeKeywords')
    };

    // ======== MAIN RENDER FUNCTION ========
    function render(positive, negative, stats) {
        try {
            console.log('💡 Generating insights...');
            
            generateInsights(positive, negative, stats);
            extractKeywords(positive, negative);
            
            console.log('✓ Insights generated');
        } catch (error) {
            console.error('❌ Error generating insights:', error);
        }
    }

    // ======== GENERATE INSIGHTS ========
    function generateInsights(positive, negative, stats) {
        const insights = [];

        // Insight 1: Overall sentiment
        if (stats.positivePercent >= 80) {
            insights.push({
                text: `🌟 Excellent! ${stats.positivePercent}% of reviews are positive. Your customers are very satisfied.`,
                type: 'positive'
            });
        } else if (stats.positivePercent >= 60) {
            insights.push({
                text: `👍 Good sentiment! ${stats.positivePercent}% positive reviews indicates customer satisfaction.`,
                type: 'positive'
            });
        } else if (stats.positivePercent >= 40) {
            insights.push({
                text: `⚠️ Mixed feedback detected. ${stats.positivePercent}% positive, ${stats.negativePercent}% negative. Review issues.`,
                type: 'alert'
            });
        } else {
            insights.push({
                text: `🚨 Alert: Only ${stats.positivePercent}% positive reviews. Immediate action recommended.`,
                type: 'negative'
            });
        }

        // Insight 2: Review count
        if (stats.totalReviews < 5) {
            insights.push({
                text: `📈 You have ${stats.totalReviews} reviews. Encourage more customers to share feedback.`,
                type: 'positive'
            });
        } else if (stats.totalReviews < 10) {
            insights.push({
                text: `📊 Building feedback momentum with ${stats.totalReviews} reviews collected.`,
                type: 'positive'
            });
        } else {
            insights.push({
                text: `🎯 ${stats.totalReviews} reviews analyzed. Good volume of customer feedback.`,
                type: 'positive'
            });
        }

        // Insight 3: Average ratings
        if (stats.avgPositiveRating >= 4.7) {
            insights.push({
                text: `⭐ Positive reviews average ${stats.avgPositiveRating}/5 stars. Excellent satisfaction!`,
                type: 'positive'
            });
        }

        if (stats.avgNegativeRating <= 2.0) {
            insights.push({
                text: `⚠️ Negative reviews average ${stats.avgNegativeRating}/5 stars. Identify patterns and improve.`,
                type: 'negative'
            });
        }

        // Insight 4: Recent trends
        const recentPositive = positive.slice(-5).length;
        const recentNegative = negative.slice(-5).length;
        if (recentPositive > recentNegative) {
            insights.push({
                text: `📈 Recent trend: More positive reviews lately. Momentum is building!`,
                type: 'positive'
            });
        } else if (recentNegative > recentPositive) {
            insights.push({
                text: `📉 Recent trend: More negative reviews. Investigate and address issues.`,
                type: 'alert'
            });
        }

        // Render insights
        renderInsightsToDOM(insights);
    }

    // ======== RENDER INSIGHTS TO DOM ========
    function renderInsightsToDOM(insights) {
        elements.insightsContent.innerHTML = insights
            .map(insight => `
                <div class="insight-item ${insight.type}">
                    <p class="insight-text">${insight.text}</p>
                </div>
            `)
            .join('');
    }

    // ======== EXTRACT KEYWORDS ========
    function extractKeywords(positive, negative) {
        // Extract from positive reviews
        const positiveKeywordFreq = extractFromReviews(positive);
        renderKeywords(elements.positiveKeywords, positiveKeywordFreq, 'positive');

        // Extract from negative reviews
        const negativeKeywordFreq = extractFromReviews(negative);
        renderKeywords(elements.negativeKeywords, negativeKeywordFreq, 'negative');
    }

    // ======== EXTRACT KEYWORDS FROM REVIEWS ========
    function extractFromReviews(reviews) {
        const wordFreq = {};

        reviews.forEach(review => {
            const comment = review.comment.toLowerCase();
            
            // Split into words
            const words = comment.match(/\b\w+\b/g) || [];
            
            words.forEach(word => {
                // Skip if it's a stop word or too short
                if (word.length < 4 || stopWords.has(word)) {
                    return;
                }

                // Count frequency
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            });
        });

        // Sort and get top 10
        return Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    // ======== RENDER KEYWORDS TO DOM ========
    function renderKeywords(container, keywords, type) {
        if (keywords.length === 0) {
            container.innerHTML = '<span class="keyword-placeholder">No keywords yet</span>';
            return;
        }

        container.innerHTML = keywords
            .map(item => `
                <span class="keyword-tag ${type}" title="${item.word}: mentioned ${item.count} times">
                    ${item.word}
                    <span class="keyword-count">(${item.count})</span>
                </span>
            `)
            .join('');
    }

    // ======== PUBLIC API ========
    return {
        render
    };
})();
