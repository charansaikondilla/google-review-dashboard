// ========================================
// SEARCH & FILTER MODULE - Review Explorer
// ========================================

const SearchFilterModule = (() => {
    // ======== STATE ========
    let allPositiveReviews = [];
    let allNegativeReviews = [];
    let filteredPositive = [];
    let filteredNegative = [];
    let currentSearchTerm = '';
    let currentSortOption = 'date-desc';

    // ======== DOM ELEMENTS ========
    const elements = {
        positiveContainer: document.getElementById('positiveReviews'),
        negativeContainer: document.getElementById('negativeReviews'),
        searchInput: document.getElementById('searchInput'),
        sortSelect: document.getElementById('sortSelect')
    };

    // ======== SET DATA ========
    function setData(positive, negative) {
        console.log('📝 Setting review data...');
        allPositiveReviews = [...positive];
        allNegativeReviews = [...negative];
        filteredPositive = [...positive];
        filteredNegative = [...negative];
        
        applySort();
        render();
    }

    // ======== SEARCH FUNCTION ========
    function search(term) {
        console.log('🔍 Searching for:', term);
        currentSearchTerm = term.toLowerCase();
        applyFilters();
    }

    // ======== SORT FUNCTION ========
    function sort(option) {
        console.log('↕️ Sorting by:', option);
        currentSortOption = option;
        applySort();
    }

    // ======== APPLY FILTERS ========
    function applyFilters() {
        if (!currentSearchTerm) {
            filteredPositive = [...allPositiveReviews];
            filteredNegative = [...allNegativeReviews];
        } else {
            filteredPositive = allPositiveReviews.filter(review =>
                review.name.toLowerCase().includes(currentSearchTerm) ||
                review.comment.toLowerCase().includes(currentSearchTerm) ||
                review.product.toLowerCase().includes(currentSearchTerm)
            );
            filteredNegative = allNegativeReviews.filter(review =>
                review.name.toLowerCase().includes(currentSearchTerm) ||
                review.comment.toLowerCase().includes(currentSearchTerm) ||
                review.product.toLowerCase().includes(currentSearchTerm)
            );
        }
        
        applySort();
        render();
    }

    // ======== APPLY SORT ========
    function applySort() {
        filteredPositive = sortReviews([...filteredPositive], currentSortOption);
        filteredNegative = sortReviews([...filteredNegative], currentSortOption);
    }

    // ======== SORT REVIEWS LOGIC ========
    function sortReviews(reviews, option) {
        const sorted = [...reviews];

        switch (option) {
            case 'date-desc': // Newest first
                return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            case 'date-asc': // Oldest first
                return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            case 'rating-desc': // Highest rating first
                return sorted.sort((a, b) => b.rating - a.rating);
            
            case 'rating-asc': // Lowest rating first
                return sorted.sort((a, b) => a.rating - b.rating);
            
            default:
                return sorted;
        }
    }

    // ======== RENDER REVIEWS ========
    function render() {
        renderColumn(elements.positiveContainer, filteredPositive, 'positive');
        renderColumn(elements.negativeContainer, filteredNegative, 'negative');
    }

    // ======== RENDER SINGLE COLUMN ========
    function renderColumn(container, reviews, type) {
        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="review-placeholder">
                    ${currentSearchTerm ? 'No reviews match your search' : 'No reviews yet'}
                </div>
            `;
            return;
        }

        container.innerHTML = reviews
            .map(review => renderReviewCard(review, type))
            .join('');
    }

    // ======== RENDER SINGLE REVIEW CARD ========
    function renderReviewCard(review, type) {
        const date = formatDate(review.timestamp);
        const ratingClass = type === 'positive' ? 'positive' : 'negative';
        const stars = '⭐'.repeat(review.rating);
        
        return `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-name">${escapeHtml(review.name)}</span>
                    <span class="review-rating ${ratingClass}">${stars} ${review.rating}</span>
                </div>
                <div class="review-date">${date}</div>
                <div class="review-product">📦 ${escapeHtml(review.product)}</div>
                <div class="review-comment">${escapeHtml(review.comment)}</div>
            </div>
        `;
    }

    // ======== UTILITY: FORMAT DATE ========
    function formatDate(isoString) {
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Unknown date';
        }
    }

    // ======== UTILITY: ESCAPE HTML ========
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ======== PUBLIC API ========
    return {
        setData,
        search,
        sort,
        render
    };
})();
