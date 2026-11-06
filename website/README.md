# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ npm install
```

### Local Development

```
$ npm start
```

This command starts a local development server. Most changes are reflected live without having to restart the server. The site is served at `http://localhost:3000/snowflake-promise/`.

### Build

```
$ npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service. The build fails if the site contains broken links.

To preview the production build locally:

```
$ npm run serve
```

### Deployment

The `Docs` GitHub Actions workflow builds the site and publishes it to GitHub Pages. It runs when a `v*` version tag is pushed. To publish without a new tag, run the workflow manually from the Actions tab (`workflow_dispatch`).
