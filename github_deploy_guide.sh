# Quick GitHub Pages Deployment Guide
# Run these commands in your project directory (vue-sandbox)

# 1. Initialize git and add files
git init
git add .
git commit -m "Initial commit: vue-sandbox"

# 2. Create GitHub repo (replace YOUR_USERNAME with your GitHub username)
# Go to https://github.com/new and create a repo named "vue-sandbox"
# Then connect your local repo:
git branch -M main
git remote add origin https://github.com/russellgillespie/vue-sandbox.git
git push -u origin main

# 3. Add homepage field to package.json
npm pkg set homepage="https://russellgillespie.github.io/vue-sandbox"

# 4. Install gh-pages for deployment
npm install --save-dev gh-pages

# 5. Add deploy scripts to package.json
npm pkg set scripts.predeploy="npm run build"
npm pkg set scripts.deploy="gh-pages -d build"

# 6. Deploy to GitHub Pages
npm run deploy

# 7. Enable GitHub Pages (one-time setup)
echo "🌐 Go to your repo settings: https://github.com/russellgillespie/vue-sandbox/settings/pages"
echo "📂 Set Source to 'Deploy from a branch'"
echo "🌿 Set Branch to 'gh-pages' and folder to '/ (root)'"
echo "💾 Save settings"

# 8. Your site will be live at:
echo "🚀 https://russellgillespie.github.io/vue-sandbox"

# Future updates: just run
# npm run deploy