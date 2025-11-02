# 🔧 How to Enable GitHub Pages (Step-by-Step)

You're seeing a 404 because GitHub Pages isn't enabled yet. Follow these steps:

## ✅ Step 1: Enable GitHub Pages

1. **Go to your repository**:
   - https://github.com/StepanianPetros/Kartsique

2. **Click "Settings"** (top menu bar)

3. **Click "Pages"** (left sidebar, under "Code and automation")

4. **Configure Source**:
   - **Source**: Select **"GitHub Actions"** (NOT "Deploy from a branch")
   - This will use the workflow I created

5. **Click "Save"**

## ✅ Step 2: Enable GitHub Actions Permissions

1. Still in **Settings**, click **"Actions"** → **"General"**

2. Scroll down to **"Workflow permissions"**:
   - Select: **"Read and write permissions"**
   - ✅ Check: **"Allow GitHub Actions to create and approve pull requests"**

3. Click **"Save"**

## ✅ Step 3: Trigger the Deployment

The workflow should run automatically, but you can manually trigger it:

1. Click **"Actions"** tab (top menu)
2. You should see **"Deploy to GitHub Pages"** workflow
3. Click on it
4. If it hasn't run, click **"Run workflow"** → **"Run workflow"**

## ⏱️ Step 4: Wait for Deployment

- **First deployment**: Takes 3-5 minutes
- You'll see a yellow dot → green checkmark when done

## 🌐 Step 5: Access Your Site

After deployment completes, visit:
```
https://StepanianPetros.github.io/Kartsique/
```

## 🐛 Troubleshooting

**Still seeing 404?**
1. Check **Actions** tab - is the workflow successful? (green checkmark)
2. Wait 2-3 more minutes and refresh
3. Check that repository is **Public** (Settings → scroll down → Change visibility)

**Workflow failed?**
- Click on the failed workflow
- Check the error logs
- Common issues: build errors, missing dependencies

---

**Your site URL will be**: https://StepanianPetros.github.io/Kartsique/

