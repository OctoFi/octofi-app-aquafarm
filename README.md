
<div align="center">
<p>
<img src="https://imgur.com/4deqE4J.png" width="250"/>
</p>

<p>
<a href="">
  <img alt="first release" src="https://img.shields.io/badge/beta-v1.97-brightgreen.svg" />
</a>

<a href="https://www.npmjs.com/package/npm">
  <img alt="npm version" src="https://img.shields.io/badge/react-16.13.1-blue.svg" />
</a>
<a href="https://www.npmjs.com/package/npm">
  <img alt="npm version" src="https://img.shields.io/badge/web3-1.3.0-blue.svg" />
</a>
</p>

<p>✨ <strong>Aquafarm</strong> is a dashboard for tracking your DeFi portfolio, finding new investment opportunities, buy / sell directly and wrap your tentacles around a sea of gains. We build this interface with our mission in mind, creating something simple to use and adding our salt & pepper to the DeFi revolution ✨</p>

<p><a href="https://app.octo.fi" class="btn btn-primary btn-md">Launch Aquafarm DApp</a></p>
</div>

## Features [Beta 1.97.0]
* 🔩 <strong>Simple: </strong> Even a shrimp understands

* 📊 <strong>Overview: </strong> We help you to get a better, real-time overview of your investments

* 💪 <strong>Powerful: </strong> Invest in over 6300 DeFi opportunities

* 📱 <strong>Responsive: </strong> Made mobile responsive 

* 🎉 <strong>Live: </strong> Deployed to [Github Pages](https://pages.github.com/) and secured with [Cloudflare](https://www.cloudflare.com/)

## Changelog

<a href="https://docs.octo.fi/docs/changelog/">OctoFi Changelog</a>

## Roadmap (#NoCexNovember & #DEXember)

<a href="https://octo.fi/blog/dev-roadmap">OctoFi Roadmap Post</a>


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
### `yarn eject`
**Note: this is a one-way operation. Once you `eject`, you can’t go back!**
If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.
Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.
You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### `deploy`

1. Open your terminal and enter below command:
```
 git clone -b master https://github.com/octofi/octofi-app-aquafarm.git
 ```
2. Open package.json file and change the following part:
```
 "homepage": "http://{Github-username}.github.io/{Github-repo-name}",
 ```
3. Open /src/index.js and find the following line then change according to the Github repo name:
```
 HashRouter basename={‘/{Github-repo-name}’}
 ```
4. Then back to your terminal and enter the following commands:<br/>
 yarn cache clean --all <br/>
 yarn install --ignore-engines --ignore-scripts --network-timeout 600000<br/>
 yarn add node-sass@4.14.0 <br/>
 npm rebuild node-sass@4.14.0 <br/>
 npx browserslist@latest --update-db <br/>
 rm -rf ./.git <br/>
 (yarn start or build) <br/>
 git init <br/>
 git remote add origin your-github-repository-url.git <br/>
 npm run deploy <br/>
