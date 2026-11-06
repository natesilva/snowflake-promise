# Releasing

A release has two approvals: one in GitHub and one on npm. The workflow in `.github/workflows/publish.yml` does the rest.

The same tag also starts the `Docs` workflow (`.github/workflows/docs.yml`). It publishes the documentation site to GitHub Pages and needs no approval.

## Before you start

- Make sure `main` contains the changes you want to release.
- Make sure the `CI` workflow passes on `main`.

## Steps

1. Switch to an up-to-date `main`.
   ```sh
   git switch main
   git pull
   ```
2. Update the version. This command edits `package.json`, makes a commit, and creates the tag `vX.Y.Z`.
   ```sh
   npm version patch   # or minor, major, or an explicit version
   ```
3. Push the commit and the tag.
   ```sh
   git push --follow-tags
   ```
4. Open the new `Publish` run in the GitHub Actions tab. Click **Review deployments**, select `npm-publish`, and click **Approve and deploy**.
5. Wait for the run to finish. The run uploads the package to npm as a staged version. The package is not public yet.
6. Approve the staged version with 2FA. Use either method:
   - On npmjs.com, open the package and click **Approve** on the staged version.
   - In a terminal, run `npm stage list`, then `npm stage approve <stage-id>`.
7. Check that the new version appears on npmjs.com.
8. Check that the `Docs` run passed and that https://natesilva.github.io/snowflake-promise/ shows the new content.

## Publishing the docs without a release

1. In the GitHub Actions tab, open the `Docs` workflow.
2. Click **Run workflow**, select `main`, and click **Run workflow**.

## What the workflow checks

- The tag must match the `version` in `package.json`. If they differ, the run fails before it publishes.
- The workflow runs `npm run lint` and `npm test` before it stages the package.
- The `Docs` workflow fails if the site build finds a broken link.

## If something goes wrong

- To cancel a release, reject the staged version on npmjs.com. If the run is still waiting for GitHub approval, reject the deployment there.
- If the run fails with an authentication error, check the Trusted Publisher settings on npmjs.com. The values must be exactly: owner `natesilva`, repository `snowflake-promise`, workflow `publish.yml`, environment `npm-publish`. npm does not validate these values when you save them.
- If the `Docs` run fails, fix the cause on `main`, then run the `Docs` workflow manually. Do not move the tag.
- If the `Docs` run is rejected for the tag or branch, check the deployment rules of the `github-pages` environment.
- npm versions cannot be reused. If a bad version was published, release a new version.

## One-time setup

- GitHub environment `npm-publish` with you as the required reviewer. "Prevent self-review" is off. The deployment tag rule is `v*`.
- npm Trusted Publisher for GitHub Actions with the values above. "Allow npm publish" and "Allow npm dist-tag" are off.
- npm publishing access is set to "Require two-factor authentication and disallow bypass 2fa tokens".
- GitHub Pages source is set to "GitHub Actions". The `github-pages` environment allows deployments from `main` and the tag rule `v*`.
