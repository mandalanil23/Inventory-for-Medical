# MP-IMS Setup Guide
## MANOJ PARIHAR MEDICAL — Inventory Management System

---

## ⚡ Quick Start

> **Just want to try it?** Open `index.html` in Chrome. Login with `admin / admin123`. Done.

---

## STEP 1 — Test Locally with Dummy Data

1. Download `index.html` to your computer
2. Double-click it or open in **Google Chrome** / Microsoft Edge
3. Login screen appears → use `admin / admin123`
4. Explore all 16 sections — they all work with built-in demo data
5. No internet connection required for this step

**Default Users:**
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| manager | mgr456 | Manager |
| operator | opr789 | Operator |
| viewer | view000 | Viewer |

---

## STEP 2 — Create Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a **New Spreadsheet**
2. Rename it: `MP-IMS Database`
3. The Apps Script will auto-create all tabs when you run Setup — **no manual tab creation needed**

> **Tip:** Keep this spreadsheet in your Google Drive, not in a shared drive.

---

## STEP 3 — Deploy Google Apps Script (Code.gs)

1. In your Google Sheet, click **Extensions → Apps Script**
2. A new Apps Script editor opens in a new tab
3. **Delete** the existing `function myFunction() {}` placeholder
4. **Copy** the entire content of `Code.gs` and **paste** it into the editor
5. Click 💾 **Save** (Ctrl+S) — name the project `MP-IMS Backend`
6. In the editor, select function `setupSheets` from the dropdown, then click ▶️ **Run**
   - Grant permissions when prompted (click "Advanced" → "Go to MP-IMS Backend (unsafe)")
   - This creates all sheet tabs and a default admin user
7. Now click **Deploy → New Deployment**
8. Settings:
   - Type: **Web App**
   - Description: `MP-IMS v1.0`
   - Execute as: **Me**
   - Who has access: **Anyone** (or "Anyone with Google account" for more security)
9. Click **Deploy**
10. **Copy the Web App URL** — it looks like:
    ```
    https://script.google.com/macros/s/AKfycb.../exec
    ```

> ⚠️ **Important:** Every time you edit `Code.gs`, you must create a **New Deployment** — editing existing deployment doesn't update the live URL.

---

## STEP 4 — Connect Frontend to Google Sheets

1. Open `index.html` in a text editor (Notepad++, VS Code, etc.)
2. Find this line near the top of the `<script>` section:
   ```javascript
   const CONFIG = {
     SHEET_URL: localStorage.getItem('SHEET_URL') || '',
   ```
3. **Option A (Hardcode):** Replace `''` with your URL:
   ```javascript
   SHEET_URL: localStorage.getItem('SHEET_URL') || 'https://script.google.com/macros/s/YOUR_ID/exec',
   ```
4. **Option B (In-App):** Open the app → Admin Panel → paste URL → click "Save URL"

---

## STEP 5 — Test Google Sheets Connection

1. Open `index.html` in Chrome
2. Login → go to **Admin Panel** (last sidebar item)
3. Under "Google Sheets Connection", paste your Script URL
4. Click **🔌 Test Connection**
5. You should see "Connection successful!" toast

**Test data sync:**
- Add a new item in Item Master
- Check your Google Sheet → Items tab → new row should appear

---

## STEP 6 — Host on GitHub Pages (Free)

### 6a. Create GitHub Account
If you don't have one: [github.com/signup](https://github.com/signup)

### 6b. Create Repository
```bash
# Install Git if not already: https://git-scm.com/downloads
git init mp-ims
cd mp-ims
git add index.html
git commit -m "Initial: MP-IMS v1.0"
```

### 6c. Push to GitHub
```bash
# Create a new repo on github.com first (name it: mp-ims)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/mp-ims.git
git branch -M main
git push -u origin main
```

### 6d. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings → Pages**
3. Under "Source": select **Deploy from a branch**
4. Branch: `main`, Folder: `/ (root)`
5. Click **Save**
6. Your app will be live at:
   ```
   https://YOUR_USERNAME.github.io/mp-ims/
   ```
   (Takes ~2 minutes to deploy)

### 6e. Update for future changes
```bash
# After editing index.html:
git add index.html
git commit -m "Update: description of changes"
git push
```

---

## STEP 7 — Customize Company Details

Open `index.html` in a text editor and find/replace:

| Find | Replace with |
|------|--------------|
| `MANOJ PARIHAR MEDICAL` | Your company name |
| `MP-IMS` | Your system abbreviation |
| `09AAACM1234H1ZK` | Your GST number |
| `123 Medical Lane, Sector 14, Gurugram` | Your address |
| `info@manojpariharmedical.com` | Your email |

Also in Admin Panel (in the app):
- Update company name, address, GST, email
- Upload/link your logo (add `<img>` tag in the header section)

---

## STEP 8 — Create Real Admin, Remove Dummy Users

1. Login with `admin / admin123`
2. Go to **User Management**
3. Click **+ Add User** → create your real admin account
4. **Logout** → login with new credentials
5. Delete dummy users (manager, operator, viewer)
6. Create real user accounts for your staff

> ⚠️ **Security Note:** Never share `admin123` credentials with staff. Create role-appropriate accounts.

---

## STEP 9 — Enter Real Inventory Data

**Recommended order:**

1. **Vendor Master** → Add your actual suppliers
2. **Item Master** → Add your medicines/products
   - Use "Bulk Import via CSV" for large catalogs
   - Set correct Reorder Levels
3. **Party Master** → Add your customers/hospitals/pharmacies
4. **Inventory → Stock In** → Enter opening stock
   - For each item, record one Stock In entry with your current stock
5. Start using **Stock In / Stock Out** for daily operations

---

## TROUBLESHOOTING

### ❌ CORS Error when calling Google Script
**Symptom:** Browser console shows "CORS policy" error

**Fix:**
1. In Apps Script editor → Deploy → Manage Deployments
2. Click edit (pencil icon) on current deployment
3. Change "Who has access" to **Anyone**
4. Save → **Create new version** → Deploy
5. Copy the **new** URL (it changes with each deployment)

---

### ❌ "Script not deployed" / 404 error
**Fix:** Make sure you clicked "Deploy → New Deployment" not just Save. Copy the URL from the deployment page, not the script URL.

---

### ❌ Google Sheet shows "Request denied"
**Fix:**
1. Open Apps Script editor
2. Run `setupSheets` function manually
3. Accept all permission prompts
4. Redeploy

---

### ❌ Charts not showing
**Fix:** Chart.js requires internet. If opening `index.html` offline, charts won't load. Host on GitHub Pages or ensure internet connectivity.

---

### ❌ Changes not saving to Google Sheet
**Fix:** After editing `Code.gs`:
1. Save the file
2. Deploy → New Deployment (not "Manage Deployments" → edit existing)
3. Use the new URL

---

### ❌ Login fails even with admin/admin123
**Fix:** Check if `Users` sheet has data. Run `setupSheets` in Apps Script to recreate the default admin.

---

## 📋 Sheet Structure Reference

| Sheet | Columns |
|-------|---------|
| Items | id, code, name, generic, category, unit, hsn, gst, mrp, purchaseRate, stock, reorder, rack, desc, createdAt |
| Parties | id, code, name, type, gst, address, city, state, phone, email, credit, outstanding, createdAt |
| Vendors | id, code, name, contact, gst, address, phone, email, categories, payment, rating, createdAt |
| StockIn | id, date, item, vendor, qty, rate, total, invoice, batch, createdAt |
| StockOut | id, date, item, party, qty, rate, discount, total, invoice, createdAt |
| Orders | id, no, vendor, item, qty, expected, status, createdAt |
| TransitOrders | id, orderId, vendor, item, shippedQty, transitStart, expectedArrival, courier, status, createdAt |
| Users | id, name, username, password, role, status, email, lastLogin, createdAt |
| AuditLog | id, action, user, time |

---

## 🔒 Security Recommendations

1. **Change default password** immediately after first login
2. **Use "Anyone with Google account"** (not "Anyone") in Apps Script deploy for internal use
3. **Regularly export** data as backup (Admin Panel → Export JSON)
4. **Don't commit** `index.html` with hardcoded passwords to public GitHub
5. Consider using **GitHub private repositories** for sensitive business data

---

## 📞 Support

This system was built for **MANOJ PARIHAR MEDICAL**.  
For customizations, additional features, or support, refer to the documentation in `index.html` source code comments.

---

*MP-IMS v1.0 | Built with HTML5, CSS3, Vanilla JS & Google Apps Script*
