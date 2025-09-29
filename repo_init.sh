npm pkg set homepage="https://russellgillespie.github.io/vue-sandbox"
npm install --save-dev gh-pages
npm pkg set scripts.predeploy="npm run build"
npm pkg set scripts.deploy="gh-pages -d build"