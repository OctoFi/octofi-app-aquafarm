
  
<div align="center">
<p>
<img src="https://imgur.com/4deqE4J.png" width="250"/>
</p>

<p>
<a href="">
  <img alt="first release" src="https://img.shields.io/badge/beta-v1.0-brightgreen.svg" />
</a>

<a href="https://www.npmjs.com/package/npm">
  <img alt="npm version" src="https://img.shields.io/badge/react-16.13.1-blue.svg" />
</a>
<a href="https://www.npmjs.com/package/npm">
  <img alt="npm version" src="https://img.shields.io/badge/web3-1.3.0-blue.svg" />
</a>
</p>

<p>✨ <strong>Aquafarm</strong> is a dashboard for tracking your DeFi portfolio, finding new investment opportunities, buy / sell directly and wrap your tentacles around a sea of gains. We build this interface with our mission in mind, creating something simple to use and adding our salt & pepper to the DeFi revolution ✨</p>

<p><a href="https://app.octo.fi" class="btn btn-primary btn-md">Launch Aquafarm dApp</a></p>
</div>

## Features [Beta 1.0]
* 🔩 <strong>Simple: </strong> Even a shrimp understands

* 📊 <strong>Overview: </strong> We help you to get a better, real-time overview of your investments

* 💪 <strong>Powerful: </strong> Invest in over 6300+ DeFi opportunities

* 📱 <strong>Responsive: </strong> Made mobile responsive 

* 🎉 <strong>Live: </strong> Deployed to [Github Pages](https://pages.github.com/) and secured with [Cloudflare](https://www.cloudflare.com/)

## Roadmap (OctoFest)
- Adding Lending (Compound, Cream, Aave, Maker)
- Adding TokenSet
- Adding PoolTogether
- Top Gainers & Losers
- Adding DAO from OctoFi
- Adding Octo Interest (Check Balance / Withdraw)
- Adding liquidity to Uniswap with OCTO incentives
- More...

Dr. Octavius is working in Octobrrrr on Octomask as well 🤫


## Install
In the project directory, you can run:
### `yarn start`
Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload if you make edits.<br />
You will also see any lint errors in the console.
### `yarn test`
Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
### `yarn build`
Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!
See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `deploy`
Open your terminal and enter below command:
1. git clone -b master https://github.com/octofi/octofi-app-aquafarm.git
2. Open package.json file and change the following part:
3. "homepage": "http://{Github-username}.github.io/{Github-repo-name}",
4. Open /src/index.js and find the following line then change according to the Github repo name:
5. HashRouter basename={‘/{Github-repo-name}’}
then back to your terminal and enter the following commands:
6. yarn install (yarn cache clean --all)
7. yarn add defi-sdk
8. yarn add gh-pages
9. git init
10. git remote add origin your-github-repository-url.git
11. npm run deploy
