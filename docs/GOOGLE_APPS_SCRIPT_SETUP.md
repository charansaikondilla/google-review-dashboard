# Google Apps Script Setup - Complete Guide

This guide will help you create the backend API (Google Apps Script) that connects your Google Sheets to the dashboard frontend.

---

## Step 1: Open Google Apps Script Editor

1. Open your **Product Reviews Database** Google Sheet
2. Click **Tools** → **Script editor**
3. A new tab opens with the Apps Script editor (you should see an empty `Code.gs` file)

---

## Step 2: Copy the Apps Script Code

In the editor, **delete all existing content** and paste code from [APPS_SCRIPT_CODE.gs](../APPS_SCRIPT_CODE.gs).

Important: Use the file above as the source of truth. It includes duplicate removal, partial-failure handling, and `action=meta` support for faster frontend refresh checks.

Legacy reference code is shown below for context:

```javascript
// ============================================
// GOOGLE APPS SCRIPT - REVIEW ANALYTICS API
// ============================================

// FUNCTION 1: Get all positive reviews
function getPositiveReviews() {
  try {
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("Positive Reviews");
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const reviews = [];
    for (let i = 1; i < values.length; i++) {
      reviews.push({
        timestamp: values[i][0],
        name: values[i][1],
        email: values[i][2],
        product: values[i][3],
        rating: parseInt(values[i][4]),
        comment: values[i][5],
        source: values[i][6],
        submittedAt: values[i][7],
        type: "positive"
      });
    }
    
    return reviews;
  } catch (error) {
    Logger.log("Error in getPositiveReviews: " + error);
    return [];
  }
}

// FUNCTION 2: Get all negative reviews
function getNegativeReviews() {
  try {
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("Negative Reviews");
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const reviews = [];
    for (let i = 1; i < values.length; i++) {
      reviews.push({
        timestamp: values[i][0],
        name: values[i][1],
        email: values[i][2],
        product: values[i][3],
        rating: parseInt(values[i][4]),
        comment: values[i][5],
        source: values[i][6],
        submittedAt: values[i][7],
        type: "negative"
      });
    }
    
    return reviews;
  } catch (error) {
    Logger.log("Error in getNegativeReviews: " + error);
    return [];
  }
}

// FUNCTION 3: Get combined analytics
function getCombinedAnalytics() {
  try {
    const positive = getPositiveReviews();
    const negative = getNegativeReviews();
    
    const total = positive.length + negative.length;
    const positivePercent = total > 0 
      ? Math.round((positive.length / total) * 100) 
      : 0;
    
    const positiveAvg = positive.length > 0
      ? (positive.reduce((sum, r) => sum + r.rating, 0) / positive.length)
      : 0;
    
    const negativeAvg = negative.length > 0
      ? (negative.reduce((sum, r) => sum + r.rating, 0) / negative.length)
      : 0;
    
    return {
      timestamp: new Date().toISOString(),
      stats: {
        totalReviews: total,
        positiveCount: positive.length,
        negativeCount: negative.length,
        positivePercent: positivePercent,
        negativePercent: 100 - positivePercent,
        avgPositiveRating: Math.round(positiveAvg * 10) / 10,
        avgNegativeRating: Math.round(negativeAvg * 10) / 10
      },
      positive: positive,
      negative: negative,
      combined: [...positive, ...negative]
    };
  } catch (error) {
    Logger.log("Error in getCombinedAnalytics: " + error);
    return { error: error.toString() };
  }
}

// FUNCTION 4: Main request router
function doGet(e) {
  const action = e.parameter.action || "all";
  
  try {
    let data;
    
    if (action === "positive") {
      data = getPositiveReviews();
    } else if (action === "negative") {
      data = getNegativeReviews();
    } else {
      data = getCombinedAnalytics();
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## Step 3: Save the Script

1. Click **File** → **Save**
2. Name the project: `Review Analytics API`
3. Click **Save**

---

## Step 4: Deploy as Web App

1. Click **Deploy** at the top right
2. Select **New deployment** (if this is your first deployment)
3. Click the **⚙ gear icon** → Select **Web app**
4. Fill in:
   - **Execute as:** Your email/account
   - **Who has access:** Anyone
5. Click **Deploy**
6. A dialog appears: **"Authorization required"**
7. Click **"Authorize access"**
8. Select your Google account
9. Click **"Allow"**

---

## Step 5: Copy Your Deployment URL

After deployment, you'll see:
```
New deployment created successfully
Deployment ID: [DEPLOYMENT_ID]
Latest URL: https://script.google.com/macros/d/[SCRIPT_ID]/useweb?v=1
```

**Copy the URL** - You'll need this next step.

---

## Step 6: Test the API

1. Copy your URL from Step 5
2. Paste in a new browser tab
3. You should see **JSON output** like:

```json
{
  "timestamp": "2026-03-24T10:30:00.000Z",
  "stats": {
    "totalReviews": 10,
    "positiveCount": 8,
    "negativeCount": 2,
    "positivePercent": 80,
    "negativePercent": 20,
    "avgPositiveRating": 4.6,
    "avgNegativeRating": 2.5
  },
  "positive": [...reviews...],
  "negative": [...reviews...],
  "combined": [...all reviews...]
}
```

If you see this ✓, your API is working!

---

## Step 7: Test Different Endpoints

Try these URLs in your browser:

1. **All data (default):**
   ```
   https://script.google.com/macros/d/[SCRIPT_ID]/useweb?v=1&action=all
   ```

2. **Only positive reviews:**
   ```
   https://script.google.com/macros/d/[SCRIPT_ID]/useweb?v=1&action=positive
   ```

3. **Only negative reviews:**
   ```
   https://script.google.com/macros/d/[SCRIPT_ID]/useweb?v=1&action=negative
   ```

4. **Fast metadata check (for background refresh):**
  ```
  https://script.google.com/macros/d/[SCRIPT_ID]/useweb?v=1&action=meta
  ```

All should return JSON data.

---

## Step 8: Update Dashboard Configuration

Now that you have your API URL:

1. Go to: [dashboard/js/api-client.js](../dashboard/js/api-client.js)
2. Find line 3:
   ```javascript
   const API_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/useweb?v=1';
   ```
3. Replace with **your actual URL** from Step 5
4. Save the file
5. Push to GitHub

---

## Troubleshooting

### Problem: "Authorization required" errors

**Solution:**
1. Make sure you're logged into Google
2. Try deploying again
3. If still failing, create a new deployment (delete old one)

### Problem: No data appears (empty JSON)

**Solution:**
1. Check sheet names - must be EXACTLY: "Positive Reviews" and "Negative Reviews"
2. Make sure sheets have data (at least 1 review in each)
3. Check columns are in correct order (A-H)
4. Go back to script editor (Tools → Script editor)
5. Run the script manually to debug (Run button)

### Problem: "Sheet not found" error

**Solution:**
1. Your sheet names don't match exactly
2. Go to your Google Sheet tabs
3. Right-click sheet tab → Rename
4. Change names to exactly:
   - `Positive Reviews`
   - `Negative Reviews`
5. Re-deploy the script

### Problem: API returns 404 or "Not found"

**Solution:**
1. Your deployment was deleted
2. Deploy again following Step 4
3. Copy the new URL

### Problem: CORS errors in browser console

**Solution:**
- You shouldn't get CORS errors!
- Google Apps Script handles all CORS headers
- If you do see CORS errors, you might be calling wrong URL
- Check URL matches exactly in api-client.js

---

## Next Steps

1. ✓ Apps Script deployed and tested
2. ✓ API URL copied to dashboard
3. Next: Deploy dashboard to GitHub Pages
4. Then: Access live dashboard at `yourusername.github.io/google-review-system/dashboard.html`

---

## API Reference

### Response Format

All endpoints return JSON in this format:

```json
{
  "timestamp": "ISO timestamp",
  "stats": {
    "totalReviews": number,
    "positiveCount": number,
    "negativeCount": number,
    "positivePercent": percentage,
    "negativePercent": percentage,
    "avgPositiveRating": average rating (positive),
    "avgNegativeRating": average rating (negative)
  },
  "positive": [
    {
      "timestamp": "...",
      "name": "...",
      "email": "...",
      "product": "...",
      "rating": 4-5,
      "comment": "...",
      "source": "GitHub Pages Form",
      "submittedAt": "...",
      "type": "positive"
    }
  ],
  "negative": [
    {
      "timestamp": "...",
      "name": "...",
      "email": "...",
      "product": "...",
      "rating": 1-3,
      "comment": "...",
      "source": "GitHub Pages Form",
      "submittedAt": "...",
      "type": "negative"
    }
  ],
  "combined": [...]  // Both arrays merged
}
```

### Query Parameters

| Parameter | Values | Default | Purpose |
|-----------|--------|---------|---------|
| `action` | `all`, `positive`, `negative` | `all` | Which data to fetch |

### Rate Limiting

Google Apps Script allows:
- **30,000+ calls per day** (free tier)
- **6 concurrent requests**
- Plenty for a dashboard with auto-refresh

---

## Security Notes

✅ **Safe:** Public endpoint only reads data (no writes)
✅ **Safe:** Sheet can be shared with specific users, API remains public
✅ **Safe:** No sensitive credentials exposed
✅ **Safe:** Google handles all encryption

---

## Success Checklist

- [ ] Apps Script created from APPS_SCRIPT_CODE.gs
- [ ] Script deployed as public web app
- [ ] API URL works in browser (shows JSON)
- [ ] Positive endpoint works: `?action=positive`
- [ ] Negative endpoint works: `?action=negative`
- [ ] Meta endpoint works: `?action=meta`
- [ ] All endpoints return your actual review data
- [ ] API URL copied to api-client.js
- [ ] Ready for dashboard deployment

