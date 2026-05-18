# Google Sheets Setup Guide

This guide walks you through creating the Google Sheets data structure for the Review Intelligence System.

---

## Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ New"** → **"Spreadsheet"**
3. Name it: **`Product Reviews Database`**
4. Click **"Create"**

---

## Step 2: Rename the First Tab

1. Right-click on the **"Sheet1"** tab at the bottom
2. Select **"Rename"**
3. Type: **`positive`** (lowercase)
4. Press Enter

---

## Step 3: Create Column Headers (Positive Reviews Sheet)

In the **"Positive Reviews"** sheet, add these headers in row 1:

| Column | Header |
|--------|--------|
| A | Timestamp |
| B | Name |
| C | Email |
| D | Product |
| E | Rating |
| F | Comment |
| G | Source |
| H | SubmittedAt |

**How to add headers:**
1. Click cell **A1**
2. Type: `Timestamp`
3. Press Tab to move to B1
4. Type: `Name`
5. Continue for all 8 columns

---

## Step 4: Create the Negative Reviews Sheet

1. Click **"+"** button next to sheet tabs at the bottom
2. Choose **"New sheet"**
3. Name it: **`negative`** (lowercase)
4. Add the **same 8 column headers** (A-H)

---

## Step 5: Format the Sheets (Optional but Recommended)

### Header Row Styling

Select both sheets and apply formatting:

1. **Positive Reviews sheet:**
   - Select row 1 (A1:H1)
   - Make background **light green**
   - Make text **bold**

2. **Negative Reviews sheet:**
   - Select row 1 (A1:H1)
   - Make background **light red**
   - Make text **bold**

### How to apply formatting:
1. Select cells A1:H1
2. Right-click → **"Format cells"** OR use **Format menu**
3. Set background color and font weight

---

## Step 6: Share the Sheet with Zapier

1. Click **"Share"** (top right)
2. Set to **"Anyone with the link can edit"** OR restrict to your email
3. Copy the sheet URL (from address bar)
4. Save this URL - you'll need it for Zapier and Google Apps Script

---

## Step 7: Share with Google Apps Script

The Google Apps Script will read this sheet, so ensure:

1. Sheet is accessible (not private)
2. You have the **Sheet ID** (in the URL)
   ```
   Example URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```
3. Sheet name is **exactly**: `Positive Reviews` and `Negative Reviews` (case-sensitive)

---

## ✅ Verification Checklist

- [ ] Sheet named: **"Product Reviews Database"**
- [ ] Two tabs: **"positive"** and **"negative"** (lowercase, exact names)
- [ ] Both tabs have headers (A-H):
  - Timestamp
  - Name
  - Email
  - Product
  - Rating
  - Comment
  - Source
  - SubmittedAt
- [ ] Headers are formatted (bold, colored background)
- [ ] Sheet is accessible (can be opened via link)
- [ ] Sheet URL copied and saved

---

## Example Data Structure

### Positive Reviews Sheet (Ratings 4-5)
| Timestamp | Name | Email | Product | Rating | Comment | Source | SubmittedAt |
|-----------|------|-------|---------|--------|---------|--------|------------|
| 2024-01-15 10:30 | John Doe | john@example.com | Product A | 5 | Excellent product! | Web Form | 2024-01-15 10:30 |
| 2024-01-15 11:45 | Jane Smith | jane@example.com | Product B | 4 | Very satisfied | Web Form | 2024-01-15 11:45 |

### Negative Reviews Sheet (Ratings 1-3)
| Timestamp | Name | Email | Product | Rating | Comment | Source | SubmittedAt |
|-----------|------|-------|---------|--------|---------|--------|------------|
| 2024-01-15 12:00 | Bob Johnson | bob@example.com | Product C | 2 | Not what I expected | Web Form | 2024-01-15 12:00 |
| 2024-01-15 13:15 | Alice Brown | alice@example.com | Product A | 1 | Poor quality | Web Form | 2024-01-15 13:15 |

---

## How Zapier Routes Data

When a review is submitted:
1. **Zapier receives** the submission
2. **Zapier checks** the rating:
   - If Rating ≥ 4 → **Append to "positive" sheet**
   - If Rating < 4 → **Append to "negative" sheet**
3. **New row is added** with all 8 columns

This ensures the two sheets stay automatically separated by sentiment! ✅

---

## How Data Flows In

**Zapier → Google Sheets**

When a review is submitted via the form:

1. **Zapier receives** the submission
2. **Zapier checks** the rating:
   - If Rating ≥ 4 → **Append to "Positive Reviews"**
   - If Rating < 4 → **Append to "Negative Reviews"**
3. **New row is added** with all 8 columns

**See:** [Zapier Setup Guide](ZAPIER_SETUP.md)

---

## How Data Flows Out

**Google Sheets → Dashboard**

When user views the dashboard:

1. **Google Apps Script** runs
2. **Apps Script reads** both sheets
3. **Apps Script returns** JSON via API
4. **Dashboard receives** data and displays charts/insights

**See:** [Google Apps Script Setup Guide](GOOGLE_APPS_SCRIPT_SETUP.md)

---

## Troubleshooting

### "Sheet not found" error in Apps Script

**Solution:** Verify exact sheet names (case-sensitive):
- ✅ Correct: `positive` (lowercase)
- ✅ Correct: `negative` (lowercase)
- ❌ Wrong: `Positive` or `Positive Reviews`
- ❌ Wrong: `Negative` or `Negative Reviews`

Sheet names MUST be exactly `positive` and `negative` in lowercase!

### Data not appearing in sheets

**Solution:** Check Zapier:
1. Go to Zapier dashboard
2. Check zap history
3. Verify it's connected to this specific sheet
4. Test the zap with sample data

### Formulas not updating automatically

**Solution:** This is Google Sheets default behavior. To auto-refresh the dashboard:
- Dashboard auto-refreshes every 30 seconds
- OR click "Refresh" button manually

---

## Next Steps

1. ✅ Sheets created (you are here)
2. → [Set up Google Apps Script](GOOGLE_APPS_SCRIPT_SETUP.md)
3. → [Configure Zapier Integration](ZAPIER_SETUP.md)
4. → [Deploy Dashboard](DASHBOARD_SETUP.md)
5. → [Deploy to GitHub Pages](GITHUB_PAGES_DEPLOYMENT.md)

---

**Sheet ID Location:**
In your sheet URL, the Sheet ID is the long string between `/d/` and `/edit`:
```
https://docs.google.com/spreadsheets/d/1mGW8Y-o9jn5K7pL4wZ3xQ2bV6cF9tH8jR1sU4vN5aO6/edit#gid=0
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                      This is your Sheet ID
```

Make a note of this ID - you'll need it for Google Apps Script.
