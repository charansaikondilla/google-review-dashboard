# Review Intelligence System

A complete, serverless review collection and analytics platform. Collect customer feedback, automatically route reviews by sentiment, and visualize insights in real-time.

**Live Demo Links:**
- **Form:** https://yourusername.github.io/google-review-system/
- **Dashboard:** https://yourusername.github.io/google-review-system/dashboard.html

---

## 🎯 Quick Start

### 1. **Review Form** → Submit Feedback
Users submit reviews with name, email, product, rating (1-5 stars), and comments:
```
Open: index.html
```

### 2. **Google Sheets** → Auto-Sorted Data
Zapier automatically routes reviews:
- **"Positive Reviews"** tab: Ratings ≥ 4
- **"Negative Reviews"** tab: Ratings < 4

### 3. **Dashboard** → View Analytics
Real-time insights with charts, keywords, and alerts:
```
Open: dashboard.html
```

---

## 📋 System Architecture

```
Form (index.html)
    ↓ (user submits)
Zapier Webhook
    ↓ (routes by rating)
Google Sheets (2 tabs)
    ↓ (via Apps Script API)
Dashboard (dashboard.html)
    ↓ (displays)
User Insights
```

**Key Design**: No backend server, no CORS issues, fully serverless using Google's trusted APIs.

---

## 🚀 Setup Guide

### Step 1: Create Google Sheets
1. Create a new Google Sheet named **"Product Reviews Database"**
2. Create two tabs with exact names (lowercase):
   - **"positive"** (for ratings 4-5)
   - **"negative"** (for ratings 1-3)
3. Add headers to both sheets:
   ```
   A: Timestamp
   B: Name
   C: Email
   D: Product
   E: Rating
   F: Comment
   G: Source
   H: SubmittedAt
   ```

**See:** [docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md)

### Step 2: Deploy Google Apps Script
1. Open [Google Apps Script](https://script.google.com)
2. Create a new project: `Review Intelligence API`
3. Copy the code from [docs/GOOGLE_APPS_SCRIPT_COMPLETE.md](docs/GOOGLE_APPS_SCRIPT_COMPLETE.md)
4. Paste into editor and save
5. Deploy as **Public Web App** (no authentication, Anyone access)
6. Copy the deployment URL

**See:** [docs/APPS_SCRIPT_QUICK_START.md](docs/APPS_SCRIPT_QUICK_START.md) (Quick reference)
**See:** [docs/GOOGLE_APPS_SCRIPT_COMPLETE.md](docs/GOOGLE_APPS_SCRIPT_COMPLETE.md) (Full guide)

### Step 3: Configure Dashboard API Endpoint
1. Open `dashboard/js/api-client.js`
2. Find line 8: `const API_URL = '...'`
3. Replace with your Apps Script URL:
   ```javascript
   const API_URL = 'https://script.googleapis.com/macros/d/YOUR_DEPLOYMENT_ID/usercallback';
   ```

### Step 4: Set Up Zapier Integration
1. In Zapier, create a **Google Forms → Google Sheets** Zap
2. Use conditional routing:
   - If Rating ≥ 4 → Append to **"positive"** sheet
   - If Rating < 4 → Append to **"negative"** sheet
3. Map form fields to sheet columns (A-H)

**See:** [docs/ZAPIER_SETUP.md](docs/ZAPIER_SETUP.md) (if needed)

### Step 5: Deploy to GitHub Pages
1. Create a GitHub repository: `google-review-system`
2. Push all files:
   ```bash
   git init
   git add .
   git commit -m "Add Review Intelligence System"
   git push -u origin main
   ```
3. Go to **Settings → Pages**
4. Branch: `main`, Folder: `/ (root)`
5. Wait 1-2 minutes for deployment

**See:** [docs/GITHUB_PAGES_DEPLOYMENT.md](docs/GITHUB_PAGES_DEPLOYMENT.md)

---

## 📁 File Structure

```
google-review-system/
├── index.html                          # Home page (you are here)
├── form.html                           # Review submission form
├── dashboard.html                      # Analytics dashboard
├── dashboard/
│   ├── css/
│   │   ├── dashboard.css              # Main styling
│   │   └── charts.css                 # Chart & keyword styling
│   ├── js/
│   │   ├── api-client.js              # API communication (CONFIGURE THIS)
│   │   ├── dashboard.js               # Main orchestrator
│   │   ├── charts.js                  # Chart.js visualizations
│   │   ├── insights.js                # Keyword extraction & insights
│   │   ├── alerts.js                  # Alert system
│   │   └── search-filter.js           # Review explorer
│   └── lib/
│       └── README.md                  # Chart.js library info
├── docs/
│   ├── GOOGLE_SHEETS_SETUP.md        # Sheet structure guide
│   ├── GOOGLE_APPS_SCRIPT_SETUP.md   # Apps Script code & deployment
│   ├── DASHBOARD_SETUP.md             # Dashboard configuration
│   ├── ZAPIER_SETUP.md                # Zapier integration guide
│   └── GITHUB_PAGES_DEPLOYMENT.md     # GitHub Pages setup
└── README.md                           # This file
```

---

## 📊 Dashboard Features

### Real-Time Statistics
- **Total Reviews**: All reviews submitted
- **Positive**: Reviews with rating 4-5
- **Negative**: Reviews with rating 1-3
- **Avg Rating**: Average across all reviews

### Visualizations
1. **Sentiment Pie Chart**: % Positive vs % Negative
2. **Rating Bar Chart**: Distribution of ratings (1-5 stars)
3. **Trends Line Chart**: Review volume over last 14 days

### Insights
- Automatic pattern detection
- Recommendation alerts (green/yellow/red status)
- Performance indicators

### Keywords
- **Positive Keywords**: Top words in 4-5 star reviews
- **Negative Keywords**: Top words in 1-3 star reviews
- Auto-filtered common words

### Review Explorer
- **Search**: By name, comment, or product
- **Sort**: By date or rating
- **Filter**: View all, positive only, or negative only
- **Display**: Dual-column layout with full review text

---

## ⚙️ Configuration

### Dashboard Colors
Edit `dashboard/css/dashboard.css` (CSS variables at top):
```css
--primary-color: #2563eb;        /* Main blue */
--success-color: #10b981;        /* Green for positive */
--danger-color: #ef4444;         /* Red for negative */
```

### Auto-Refresh Interval
Edit `dashboard/js/dashboard.js` (line ~65):
```javascript
setInterval(loadData, 30000);  // 30 seconds - change as needed
```

### API Cache Duration
Edit `dashboard/js/api-client.js` (line ~ 2):
```javascript
const CACHE_TTL = 30000;  // 30 seconds - increase to reduce API calls
```

---

## 🧪 Testing Checklist

- [ ] Submit test review via form
- [ ] Verify it appears in correct Google Sheet (positive or negative)
- [ ] Wait 30 seconds for dashboard auto-refresh
- [ ] Verify review appears in dashboard explorer
- [ ] Search for review by name/comment
- [ ] Check keyword extraction (5+ keywords per type)
- [ ] Verify charts render correctly
- [ ] Test on mobile (responsive design)
- [ ] Check dark mode (if browser prefers it)

---

## 🔧 Troubleshooting

### Dashboard Shows "No data loading"
1. Check console (F12) for errors
2. Verify API_URL is correct in `api-client.js` line 8
3. Test Apps Script API directly: Visit your API URL in browser
4. Verify Google Sheets have exact names: "Positive Reviews" and "Negative Reviews"

### Charts Not Rendering
1. Check browser console for errors
2. Verify Chart.js loaded (CDN link in dashboard.html line ~45)
3. Verify at least 3 reviews exist in sheets

### Reviews Not Appearing After Submit
1. Check Zapier zap is active
2. Verify form field names match Zapier mapping
3. Check Google Sheets for new rows (refresh browser)
4. Verify Apps Script deployed as "Anyone" access level

### CORS Errors
This architecture should NOT have CORS errors because:
- Frontend → Apps Script (Google service to Google service = trusted)
- Apps Script → Sheets (Internal Google APIs = trusted)

If you see CORS errors, verify:
1. Apps Script deployed as **Public Web App** (not private)
2. Form is submitting to Zapier (Zapier handles CORS)
3. Dashboard fetching from Apps Script (not direct Sheets API)

**See full troubleshooting:** [docs/DASHBOARD_SETUP.md](docs/DASHBOARD_SETUP.md)

---

## 📖 Documentation

| Guide | Purpose |
|-------|---------|
| [Google Sheets Setup](docs/GOOGLE_SHEETS_SETUP.md) | Create data structure |
| [Google Apps Script Setup](docs/GOOGLE_APPS_SCRIPT_SETUP.md) | Deploy backend API |
| [Dashboard Setup](docs/DASHBOARD_SETUP.md) | Configure & test dashboard |
| [Zapier Setup](docs/ZAPIER_SETUP.md) | Configure webhook routing |
| [GitHub Pages Deployment](docs/GITHUB_PAGES_DEPLOYMENT.md) | Publish live |

---

## 🎨 Customization Ideas

- **Logo**: Replace "📊" with your brand logo (edit index.html header)
- **Colors**: Update CSS variables in dashboard.css
- **Title**: Change "Review Intelligence System" throughout
- **URL**: Custom domain instead of GitHub Pages
- **Email Notifications**: Add Google Apps Script trigger to email alerts
- **Export**: Add CSV export button to dashboard
- **Mobile App**: Build React Native app consuming same API

---

## 🔒 Security & Privacy

- **No credentials stored**: All config via URLs
- **Read-only dashboard**: Display only, no data modification
- **Google Sheets**: Private to Google account - only Apps Script can read
- **Form data**: Stored in Google Sheets (your control)
- **HTTPS only**: GitHub Pages provides free SSL

---

## 📞 Support

**Common Issues:**
1. Verify exact sheet names (case-sensitive)
2. Check API_URL configuration
3. Test Apps Script endpoint directly (copy URL to browser)
4. Clear browser cache (Ctrl+Shift+Del)
5. Check browser console for errors (F12)

**Learn More:**
- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [GitHub Pages Docs](https://pages.github.com/)
- [Chart.js Docs](https://www.chartjs.org/)

---

## 📝 License

This project is provided as-is. Customize freely for your needs.

---

**Version:** 1.0  
**Last Updated:** 2024  
**Architecture:** Serverless (No backend server required)
