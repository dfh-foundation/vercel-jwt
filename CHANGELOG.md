# [2.0.0](https://github.com/dfh-foundation/vercel-jwt/compare/v1.1.2...v2.0.0) (2022-02-07)


### Bug Fixes

* bump prettier to 2.5.1 and format project ([0d20596](https://github.com/dfh-foundation/vercel-jwt/commit/0d205968190c58e2b0aae2196794e6f152ea0837))
* use callback secret provider to avoid decoding JWT twice ([7019510](https://github.com/dfh-foundation/vercel-jwt/commit/7019510b25d87a7cebbe070102d07344f9eb9edd))


### Features

* export getScopesFromJwtPayload ([c79d9e8](https://github.com/dfh-foundation/vercel-jwt/commit/c79d9e8b23678a962e82e2666781d669b5d480d1))
* replace Now branding with Vercel ([0ba75e2](https://github.com/dfh-foundation/vercel-jwt/commit/0ba75e26f9ad26ad3efaaf3d9e9611d036a6f539))
* support resolving user token from cookie ([50842af](https://github.com/dfh-foundation/vercel-jwt/commit/50842af0bdd345ae7e949897f4472a3909d96b1f))
* use updated jsonwebtoken types and return token and payload from handler ([8566583](https://github.com/dfh-foundation/vercel-jwt/commit/8566583f8c1a804081ecd0b6242d64ce8d4e774b))


### BREAKING CHANGES

* JWT handler now returns token and validated payload in object
* exported functions and types now begin with vercel/Vercel

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.1.2](https://github.com/designsforhealth/now-jwt/compare/v1.1.1...v1.1.2) (2021-04-23)

### [1.1.1](https://github.com/designsforhealth/now-jwt/compare/v1.1.0...v1.1.1) (2021-04-23)


### Bug Fixes

* [ch17826] - dependency adjustments ([ab9dbde](https://github.com/designsforhealth/now-jwt/commit/ab9dbdece329699ee870fb45bee9071ed3509f05))

## [1.1.0](https://github.com/designsforhealth/now-jwt/compare/v1.0.4...v1.1.0) (2021-04-22)


### Features

* [ch17826] - add github workflow to build and test ([c205cb6](https://github.com/designsforhealth/now-jwt/commit/c205cb6ff8b062229c6a40ca7f14716ee7625e14))
* [ch17826] - add release mgmt ([dca4842](https://github.com/designsforhealth/now-jwt/commit/dca4842bf07d8825ef334fc39e1c4af2c3885f8a))


### Bug Fixes

* [ch17826] update dependencies and move some to devDependencies ([d38155e](https://github.com/designsforhealth/now-jwt/commit/d38155ea997724d09638cad0b8842df47f384688))

### [1.0.5](https://github.com/designsforhealth/now-jwt/compare/v1.0.3...v1.0.5) (2020-09-10)

### [1.0.3](https://github.com/designsforhealth/now-jwt/compare/v1.0.1...v1.0.3) (2020-09-10)

### 1.0.1 (2020-07-10)
