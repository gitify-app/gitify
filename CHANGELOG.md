# Changelog

## [7.2.0](https://github.com/gitify-app/gitify/compare/v7.1.1...v7.2.0) (2026-07-29)


### 🚀 Features

* **macos:** launch as an agent app so no dock tile is ever created ([#3117](https://github.com/gitify-app/gitify/issues/3117)) ([b60df93](https://github.com/gitify-app/gitify/commit/b60df9345772d94d1e34acf730dae42a7c4851ae))


### 🐛 Bug Fixes

* **notifications:** drop subject type suffix from native notification body ([#3113](https://github.com/gitify-app/gitify/issues/3113)) ([585a2a9](https://github.com/gitify-app/gitify/commit/585a2a9e4781f12d2559726bb2020ca841922ae8))


### ⚡️ Performance

* **notifications:** refresh enriched details when window regains focus ([#3118](https://github.com/gitify-app/gitify/issues/3118)) ([ffc699c](https://github.com/gitify-app/gitify/commit/ffc699cc1ac8fffaa3e03182e6ce65ef008b7f1a))
* **notifications:** respect server-recommended poll interval ([#3116](https://github.com/gitify-app/gitify/issues/3116)) ([ea302a5](https://github.com/gitify-app/gitify/commit/ea302a5aa70d38b92317cb3005670ea27f26a976))
* **notifications:** skip re-enrichment of unchanged notifications ([#3102](https://github.com/gitify-app/gitify/issues/3102)) ([2ff02e1](https://github.com/gitify-app/gitify/commit/2ff02e148bc43960860271d4c4b9b54d767e7d01))


### 🧼 Code Refactoring

* vite config ([#3110](https://github.com/gitify-app/gitify/issues/3110)) ([d09ef0a](https://github.com/gitify-app/gitify/commit/d09ef0a05ac2260ee95f8f3d08e524dcb43a7723))


### 🤖 Continuous Integration

* add `core-deps` scope to surface within release-please generated changelog/release notes ([#3114](https://github.com/gitify-app/gitify/issues/3114)) ([672ce07](https://github.com/gitify-app/gitify/commit/672ce07a0a79573f7d244aaa4bfca8b50455d5d1))
* add release labeling ([#3112](https://github.com/gitify-app/gitify/issues/3112)) ([32aaf29](https://github.com/gitify-app/gitify/commit/32aaf29d1a89b3b7e684a5b12f84253f09a2ca0e))
* credit contributors in published release notes ([#3109](https://github.com/gitify-app/gitify/issues/3109)) ([968715f](https://github.com/gitify-app/gitify/commit/968715f7f6e35768c036cf97c14a3dd5682cc981))
* defer release-please PR creation while a draft release is pending ([#3108](https://github.com/gitify-app/gitify/issues/3108)) ([25d7f9b](https://github.com/gitify-app/gitify/commit/25d7f9bcb6c2a3aa3b43d11c9c3b3677034f81d7))

## [7.1.1](https://github.com/gitify-app/gitify/compare/v7.1.0...v7.1.1) (2026-07-29)


### 🐛 Bug Fixes

* re-hide macos dock icon after parentless dialogs ([#3100](https://github.com/gitify-app/gitify/issues/3100)) ([8f4b33a](https://github.com/gitify-app/gitify/commit/8f4b33a54ccdbfc9295ed4cdf35528cf3adfdd08))


### 🏗️ Build System

* update labeler for perf semantic commit type ([#3105](https://github.com/gitify-app/gitify/issues/3105)) ([9d29de4](https://github.com/gitify-app/gitify/commit/9d29de427cb9d9dcc91193b307ffd6558905200c))


### 🤖 Continuous Integration

* publish draft release by id to avoid HTTP 422 on tag lookup ([#3098](https://github.com/gitify-app/gitify/issues/3098)) ([c83528d](https://github.com/gitify-app/gitify/commit/c83528dd93b0239aa26e9650547628ef4dc7c024))
* update perf emoji ([b6c9c6e](https://github.com/gitify-app/gitify/commit/b6c9c6ef8683749fa816eefc30ecf55d8b997938))

## [7.1.0](https://github.com/gitify-app/gitify/compare/v7.0.1...v7.1.0) (2026-07-27)


### 🚀 Features

* **notifications:** include repository name and subject type in native Windows OS notifications ([#3058](https://github.com/gitify-app/gitify/issues/3058)) ([ec0701c](https://github.com/gitify-app/gitify/commit/ec0701c00a6c7359f2425ef48691fb7a71e2bb17))


### 🐛 Bug Fixes

* drop cached forge clients on app reset ([#3071](https://github.com/gitify-app/gitify/issues/3071)) ([316ab00](https://github.com/gitify-app/gitify/commit/316ab003329a8fcc04578d795006514df8a3b454))


### 🧼 Code Refactoring

* retire fetch type notification setting ([#3070](https://github.com/gitify-app/gitify/issues/3070)) ([94f37e2](https://github.com/gitify-app/gitify/commit/94f37e2f09b52384fbb0edc02c9153615387c6f6))


### 🤖 Continuous Integration

* add emoji prefixes to release-please changelog sections ([#3095](https://github.com/gitify-app/gitify/issues/3095)) ([47ec087](https://github.com/gitify-app/gitify/commit/47ec08709845e38e2a7c7285b48a4dec7ce3446b))
