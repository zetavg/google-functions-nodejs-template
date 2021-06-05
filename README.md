# Google Cloud Function Node.js Template

A template for writing Google Cloud Function with Node.js, TypeScript, Babel, ESLint, and Prettier.

## Setup

```sh
npm install
```

You might want to setup `.env` for running the bot locally:

```sh
cp .env.sample .env
```

## Run Locally

```sh
npm start
```

## Deploy

### Deploy to Google Cloud Functions

Simply deploy the function from your local machine with the [`gcloud` command-line tool](https://cloud.google.com/functions/docs/quickstart) by running:

```sh
REGION=[SET_GCLOUD_REGION] FUNCTION_NAME=[NAME_YOUR_FUNCTION_ON_GCLOUD] npm run deploy-gcloud
```

Then, you'll need to setup some [environment variables](https://cloud.google.com/functions/docs/env-var) for your Cloud Function. See [`.env.sample`](./.env.sample) for all required and optional environment variables.

### Get a Uploadable ZIP File

```sh
npm run build-zip
```

### Build a Deployable Container

You will need to install [Docker](https://store.docker.com/search?type=edition&offering=community) and the [`pack` tool](https://buildpacks.io/docs/install-pack/), then run:

```sh
npm run build-container
```

After that, you'll be able to start the built container with:

```sh
docker run --rm -p 8080:8080 my-function
```
