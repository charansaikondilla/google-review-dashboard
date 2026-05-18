# Zapier Integration Setup Guide

This guide walks you through setting up Zapier to route reviews to the correct Google Sheets tab based on rating.

---

## Prerequisites

- Zapier account (free tier works)
- Google Forms OR custom HTML form (form.html)
- Google Sheets named "Product Reviews Database" with tabs (exact names):
  - **"positive"** (for ratings 4-5) ← lowercase
  - **"negative"** (for ratings 1-3) ← lowercase

**See:** [Google Sheets Setup](GOOGLE_SHEETS_SETUP.md)

---

## Option A: Using Google Forms as Review Source

### Step 1: Create Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Click **"+"** to create new form
3. Name: `Customer Review Form`
4. Add questions:
   - **Text:** "Your Name" (Required)
   - **Text:** "Email address" (Required)
   - **Dropdown:** "Which product?" with options
   - **Linear scale:** "Rate your experience" (1-5 stars, Required)
   - **Paragraph:** "Your feedback" (Required)

### Step 2: Enable Google Sheets Response Collection

1. In Google Form, click **"Responses"** tab
2. Click **Sheets icon** (⬚)
3. **"Create a new spreadsheet"**
4. Name: `Form Responses`
5. Responses will auto-populate here

---

## Option B: Using HTML Form Webhook

If using the provided `form.html`, configure webhook:

1. In `form.html`, find line with:
   ```javascript
   const zapierUrl = 'YOUR_ZAPIER_WEBHOOK_URL_HERE';
   ```
2. You'll add the Zapier webhook URL here after creating the zap

---

## Step 3: Create Zapier Zap (Both Options)

### A. Start a New Zap

1. Go to [Zapier](https://zapier.com)
2. Click **"Make a Zap"**
3. Search for trigger:
   - **Option A (Google Forms):** `Google Forms` → trigger: `New Form Response`
   - **Option B (Webhook):** `Webhooks by Zapier` → trigger: `Catch Raw Hook`

### B. Configure Trigger

**For Google Forms:**
1. Click **"Sign in with Google"**
2. Select **"Form Responses"** sheet
3. Select **"Customer Review Form"**
4. Click **"Continue"**

**For Webhooks:**
1. Zapier will generate a webhook URL
2. Copy it
3. Update `form.html` line ~180:
   ```javascript
   const zapierUrl = 'PASTE_WEBHOOK_URL_HERE';
   ```

---

## Step 4: Add Conditional Routing

### A. Add Paths Based on Rating

1. Click **"+ Add Step"**
2. Search: **"Paths by Zapier"**
3. Choose: **"Paths"** (conditional routing)
4. Click **"Continue"**

### B. Set Up Path Conditions

**Path 1: Positive Reviews (Rating ≥ 4)**

1. Click **"Path 1"**
2. Click **"Condition"** dropdown
3. Select field: **"Rate your experience"** (or your rating field)
4. Select operator: **"Is greater than or equal to"**
5. Enter value: **`4`**
6. Click **"Continue"**

**Path 2: Negative Reviews (Rating < 4)**

1. Click **"+ Add Path"**
2. Click **"Condition"** dropdown
3. Select field: **"Rate your experience"**
4. Select operator: **"Is less than"**
5. Enter value: **`4`**
6. Click **"Continue"**

---

## Step 5: Set Up Path 1 Action (Positive Reviews)

1. Click **"Path 1"** heading
2. Click **"+ Add action"**
3. Search: **"Google Sheets"**
4. Action: **"Create Spreadsheet Row"**
5. Click **"Continue"**

### Configure Path 1 Action

1. **Sign in with Google** (if needed)
2. **Drive:** Select your Drive (usually "My Drive")
3. **Spreadsheet:** Select **"Product Reviews Database"**
4. **Worksheet:** Select **"positive"** (lowercase) ← For ratings ≥ 4
5. Click **"Continue"**

### Map Fields to Columns

Map the form fields to sheet columns (A-H):

| Column | Field |
|--------|-------|
| Timestamp | (leave empty - will use current timestamp) |
| Name | Your Name |
| Email | Email address |
| Product | Which product? |
| Rating | Rate your experience |
| Comment | Your feedback |
| Source | Web Form (static) |
| SubmittedAt | (leave empty - will use current timestamp) |

**How to map:**
1. Click field **"Timestamp"**
2. Select **"Insert Fields"** → choose a timestamp field OR leave for now
3. Click field **"Name"**
4. Select **"Your Name"** from form
5. Continue for all 8 columns

---

## Step 6: Set Up Path 2 Action (Negative Reviews)

1. Click **"Path 2"** heading
2. Click **"+ Add action"**
3. Search: **"Google Sheets"**
4. Action: **"Create Spreadsheet Row"**
5. Click **"Continue"**

### Configure Path 2 Action

**Exact same as Path 1, EXCEPT:**
- **Worksheet:** Select **"negative"** (lowercase, not "positive")
- **Map fields** identically

---

## Step 7: Test the Zap

1. Click **"Test"** button
2. **For Google Forms:** Submit a test response via the form with rating ≥ 4
3. **For Webhook:** The test will use sample data
4. Click **"Pull in sample data"**
5. Verify data appears correctly

### Check Results

1. Go to Google Sheets → "Product Reviews Database"
2. Check **"positive"** tab - should have a new row (if rating ≥ 4)
3. Check **"negative"** tab - should NOT have the test row if it was positive (correct!)

---

## Step 8: Enable the Zap

1. Click **"Turn on Zap"** button
2. Zap is now LIVE
3. Every form submission will:
   - Route to **"positive"** sheet if rating ≥ 4
   - Route to **"negative"** sheet if rating < 4

---

## ✅ Verification Checklist

- [ ] Zap is **ON** (not paused)
- [ ] Test submission successfully routed to correct sheet
- [ ] Positive rating (4-5) went to **"Positive Reviews"**
- [ ] Negative rating (1-3) went to **"Negative Reviews"**
- [ ] All 8 columns populated correctly
- [ ] Timestamp auto-filled
- [ ] Form submission shows in Zap history

---

## Troubleshooting

### Zap not triggering

**Problem:** Form submissions aren't appearing in Zapier.

**Solutions:**
1. Verify zap is **ON** (not paused)
2. Check **Zap History** → see if triggers are receiving data
3. For Google Forms: Ensure form is connected
4. For Webhook: Verify webhook URL in form.html is correct
5. Restart zap (toggle OFF then ON)

### Data going to wrong sheet

**Problem:** Positive reviews going to negative sheet or vice versa.

**Solutions:**
1. Check path conditions - verify >= 4 vs < 4
2. Check field mapping - ensure rating field is correct
3. Test manually with rating = 3 vs rating = 4
4. Edit zap and verify both paths are configured

### Missing columns or data

**Problem:** Some columns blank or fields not mapping.

**Solutions:**
1. Verify all 8 columns exist in both sheets (A-H)
2. Check field names match exactly (case-sensitive)
3. In zap, ensure every column is mapped (use "Insert Fields")
4. For empty columns (Timestamp/SubmittedAt), use Zapier functions for current time

---

## Advanced: Zapier Timestamp Functions

To auto-fill timestamp columns, use Zapier functions:

1. In field mapping, click **icon** next to field name
2. Select **"Functions"**
3. Search: **"Now"** or **"Current"**
4. Select timestamp format

Example:
- **Timestamp:** `Now()` function → auto-fills with current time
- **SubmittedAt:** Same `Now()` function

---

## Next Steps

1. ✅ Google Sheets created
2. ✅ Zapier zap configured (you are here)
3. → [Set up Google Apps Script](GOOGLE_APPS_SCRIPT_SETUP.md)
4. → [Deploy Dashboard](DASHBOARD_SETUP.md)
5. → [Deploy to GitHub Pages](GITHUB_PAGES_DEPLOYMENT.md)

---

## Form Submissions Won't Appear?

**Common reasons & fixes:**

1. **Zap is paused** → Toggle ON in Zapier dashboard
2. **Webhook URL not updated** → Copy webhook URL from Zapier into form.html
3. **Wrong sheet name** → Verify "Positive Reviews" and "Negative Reviews" exactly
4. **Wrong column count** → Need exactly 8 columns (A-H)
5. **Path conditions wrong** → Test with extreme values (Rating = 1 vs Rating = 5)

**Debug steps:**
1. Go to Zapier → Your Zap → View Zap History
2. Check if data is being received
3. Check if paths are triggering correctly
4. Look for error messages in task history
5. If no data, check form webhook was updated

---

**Tip:** Save Zapier webhook URL in a note file for reference:
```
Zapier Webhook URL: https://hooks.zapier.com/hooks/catch/YOUR_ID/YOUR_KEY/
```

This URL goes in `form.html` line ~180.
