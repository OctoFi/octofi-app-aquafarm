# OctoFi dApp

<p>
  <a href="">
    <img alt="release" src="https://img.shields.io/badge/Release-v4.1-brightgreen.svg" />
  </a>
  <a href="https://www.npmjs.com/package/npm">
    <img alt="npm version" src="https://img.shields.io/badge/react-17.0.1-blue.svg" />
  </a>
  <a href="https://www.npmjs.com/package/npm">
    <img alt="npm version" src="https://img.shields.io/badge/web3-1.3.4-blue.svg" />
  </a>
</p>

<p>✨ <strong>OctoFi dApp</strong> is a dashboard for tracking your DeFi portfolio, finding new investment opportunities, buy / sell directly and wrap your tentacles around a sea of gains. We built this interface with our mission in mind, creating something simple to use and adding our salt & pepper to the DeFi revolution ✨</p>

[Launch OctoFi dApp][dapp]

## Features
* 🔩 <strong>Simple: </strong> Even a shrimp understands

* 📊 <strong>Overview: </strong> We help you to get a better, real-time overview of your investments

* 💪 <strong>Powerful: </strong> Invest in over 6300 DeFi opportunities

* 📱 <strong>Responsive: </strong> Made mobile responsive 

* 🎉 <strong>Live: </strong> Deployed to [Github Pages][github-pages] and secured with [Cloudflare][cloudflare]

## Community & Feedback

[OctoFi Community][den]

## Changelog

[Changelog][changelog]

## Roadmap

[Roadmap Post][roadmap]

[Development Overview][overview]

[Development Priorities][priority]

[Upcoming Releases][milestones]

## Contributing

Please read the [CONTRIBUTING.md][CONTRIBUTING] file for details on how you
can get involved in the project as well as the process for submitting bugs
and pull requests.

## Getting Started

These instructions will get your copy of the project up and running on your
local machine for development and testing purposes.

### Installing

Create a fork of this repository, clone it, and install the dependencies.

```
git clone https://github.com/{your-username}/octofi-app-aquafarm.git
cd octofi-app-aquafarm
yarn
```

### `yarn start`
Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload if you make edits.<br />
You will also see the lint errors in the console.

### `yarn test`
Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`
Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!
See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn deploy`
Builds the app for production using the `yarn build` command.<br />
Then it commits the output to the `gh-pages` branch so it can be deployed with GitHub Pages.

### `yarn eject`
**Note: this is a one-way operation. Once you `eject`, you can’t go back!**
If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.
Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.
You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### Use as a template

If you'd like to use this project as a template to create your own dApp, this should give you what you need to start.

1. Open your terminal and enter below command:
```
 git clone -b main https://github.com/octofi/octofi-app-aquafarm.git
 ```
2. Open package.json file and change the following part:
```
 "homepage": "https://{Github-username}.github.io/{Github-repo-name}",
 ```
3. Open /public directory and delete CNAME.
4. Use edit.env.production as a starter file for your own environment variables to be put in a local `.env.local` file.
5. Then go back to your terminal and enter the following commands:<br/>
 rm -rf ./.git <br/>
 yarn cache clean --all <br/>
 yarn install --ignore-engines --ignore-scripts --network-timeout 600000<br/>
 (yarn add node-sass@4.14.0) <br/>
 (npm rebuild node-sass@4.14.0) <br/>
 npx browserslist@latest --update-db <br/>
 rm -rf ./.git <br/>
 (yarn start or build) <br/>
 git init <br/>
 git remote add origin your-github-repository-url.git <br/>
 yarn deploy <br/>

## Built With

- Github Pages
- React

## Versioning

We use [Semantic Versioning][semver] for software versions of this project.
For a list of all the versions available, see the [tags][tags] and
[releases][releases] on this repository.

## Authors

See the list of [contributors][contribs] who have participated in this
project.


[//]: # (Make sure to update these URL links)

[organization]: https://github.com/OctoFi
[overview]: https://github.com/orgs/OctoFi/projects/1
[priority]: https://github.com/orgs/OctoFi/projects/2
[tags]: https://github.com/OctoFi/octofi-app-aquafarm/tags
[releases]: https://github.com/OctoFi/octofi-app-aquafarm/releases
[contribs]: https://github.com/OctoFi/octofi-app-aquafarm/contributors
[milestones]: https://github.com/OctoFi/octofi-app-aquafarm/milestones
[CONTRIBUTING]: CONTRIBUTING.md
[dapp]: https://app.octo.fi
[den]: https://den.octo.fi/t/feedback
[homepage]: https://octo.fi/
[changelog]: https://log.octo.fi/
[roadmap]: https://todo.octo.fi/
[semver]: http://semver.org
[github-pages]: https://pages.github.com/
[cloudflare]: https://www.cloudflare.com/
