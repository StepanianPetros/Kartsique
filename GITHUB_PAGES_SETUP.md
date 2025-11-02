# GitHub Pages Setup Guide

## ✅ What I've Done

1. ✅ Created GitHub Actions workflow for auto-deployment
2. ✅ Configured Vite base path for GitHub Pages
3. ✅ Pushed deployment files to GitHub

## 📝 Next Steps (Manual Setup)

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/StepanianPetros/Kartsique
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
   - Click **Save**

### Step 2: Enable GitHub Actions (if needed)

1. In **Settings**, go to **Actions** → **General**
2. Under **Workflow permissions**, select:
   - **Read and write permissions**
   - ✅ Allow GitHub Actions to create and approve pull requests
3. Click **Save**

### Step 3: Trigger Deployment

The workflow will auto-run, OR you can:
1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages**
3. Click **Run workflow** → **Run workflow**

### Step 4: View Your Site

After deployment (takes 2-3 minutes), your site will be at:
```
https://StepanianPetros.github.io/Kartsique/
```

## ⚙️ Environment Variables

For the site to work fully, you'll need to set up:
1. **Backend API** (deploy separately to Railway/Render)
2. **Signaling Server** (deploy separately to Railway/Render)

Then update GitHub Secrets:
- Go to **Settings** → **Secrets and variables** → **Actions**
- Add:
  - `VITE_API_URL` = your backend URL
  - `VITE_SIGNALING_SERVER` = your signaling server URL

## 🔄 After Deployment

Your website will automatically update every time you push to `main` branch!

---

**Note**: The site might take 2-5 minutes to build and deploy after enabling Pages.

