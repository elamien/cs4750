# cs4750

This template should help get you started developing with Vue 3 in Vite.

## Prerequisites

Before you begin, ensure you have Node.js installed on your system. This project requires Node.js version 20.0.0 or higher (which includes npm 10.0.0 or higher).

- You can download Node.js from [nodejs.org](https://nodejs.org/).

You mainly need to do:
```sh
npm i
```
and
```sh
npm run dev
```
to get started!

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## MySQL Database Setup

This project uses MySQL for the database. You'll need:
1. MySQL installed (via Homebrew on macOS)
2. A configured login path for easy access

### Current Setup
We use MySQL login paths for secure credential management. The project expects a login path named `local`:

```sh
# Check your configured login paths
mysql_config_editor print --all

# Connect to MySQL using the login path
mysql --login-path=local
```

> 🔄 Coming Soon: Instructions for setting up your own `local` login path configuration!

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Test Users

The following test users are available in the database for development and testing purposes:

### Band Leader
- **Name:** Sarah Leader
- **Email:** bandleader@test.com
- **Role:** Band Leader
- **Instrument:** Guitar
- **Genre:** Rock

### Band Member
- **Name:** Mike Member
- **Email:** bandmember@test.com
- **Role:** Band Member
- **Instrument:** Piano
- **Genre:** Jazz

### General User
- **Name:** Gary General
- **Email:** general@test.com
- **Role:** General User
- **Instrument:** Vocals
- **Genre:** Pop

### WXTJ Executive
- **Name:** Wesley Executive
- **Email:** wxtj.exec@virginia.edu
- **Role:** WXTJ Executive
- **Instrument:** Production
- **Genre:** Alternative

### User Permissions
Each user type has specific permissions as defined in the database schema:

- **Band Leader:** Can create/delete band, transfer leadership, manage band members, handle event requests
- **Band Member:** Can leave band, view band events, mark availability
- **General User:** Can create one band OR request to join one band
- **WXTJ Executive:** Can manage all users, bands, and events (full admin privileges)

For development purposes, you can impersonate any of these users to test different role-based functionalities.

