# Changelog

## [7.4.0](https://github.com/gitify-app/gitify/compare/v7.3.3...v7.4.0) (2026-08-16)


### 🚀 Features

* **github:** format and render Bot account names ([#3183](https://github.com/gitify-app/gitify/issues/3183)) ([12efd18](https://github.com/gitify-app/gitify/commit/12efd18d1ac4437c90c855fe07fddf9bfa0445ca))
* **github:** update actor display names (managed and unmanaged) ([#3182](https://github.com/gitify-app/gitify/issues/3182)) ([5353e92](https://github.com/gitify-app/gitify/commit/5353e9231ba40df87e4b8a56e696f5b7c030c6be))
* **metrics:** improve pr review metric pill ([#3184](https://github.com/gitify-app/gitify/issues/3184)) ([9db47c8](https://github.com/gitify-app/gitify/commit/9db47c879a9967765fb7a84fb8e20363c16d5ec8))


### 🐛 Bug Fixes

* **forge/github:** sanitize gql query docs based on gated feature compatibility ([#3178](https://github.com/gitify-app/gitify/issues/3178)) ([6ae87ca](https://github.com/gitify-app/gitify/commit/6ae87cad593e762edc7a54aa0bc3cba1cb34cc78))

## [7.3.3](https://github.com/gitify-app/gitify/compare/v7.3.2...v7.3.3) (2026-08-12)


### 🐛 Bug Fixes

* **metrics:** fetch stacked pr metrics only for GitHub Cloud ([#3175](https://github.com/gitify-app/gitify/issues/3175)) ([bfd2672](https://github.com/gitify-app/gitify/commit/bfd267267960d9b5254594de7d98f39e38deff9f))

## [7.3.2](https://github.com/gitify-app/gitify/compare/v7.3.1...v7.3.2) (2026-08-09)


### 🐛 Bug Fixes

* keep the scroll fade ramping in packaged builds ([#3170](https://github.com/gitify-app/gitify/issues/3170)) ([ef2aec0](https://github.com/gitify-app/gitify/commit/ef2aec062f27de8b54b01394696c492825b90fa9))

## [7.3.1](https://github.com/gitify-app/gitify/compare/v7.3.0...v7.3.1) (2026-08-08)


### 🐛 Bug Fixes

* restart to install update, and three update-flow bugs ([#3167](https://github.com/gitify-app/gitify/issues/3167)) ([01fed23](https://github.com/gitify-app/gitify/commit/01fed233f579a802ae2c03150095485714e777c8))

## [7.3.0](https://github.com/gitify-app/gitify/compare/v7.2.0...v7.3.0) (2026-08-08)


### 🚀 Features

* **metrics:** add pills for issue and stacked ([#3159](https://github.com/gitify-app/gitify/issues/3159)) ([c0b8718](https://github.com/gitify-app/gitify/commit/c0b8718e23f66faaf89212207201e2b38d27b2ea))
* **theme:** add a Glass option to show status icon colors ([19fa9fd](https://github.com/gitify-app/gitify/commit/19fa9fddf9222f028ebfaa6ce1d1390980058871))
* **theme:** add a Glass option to show status icon colors ([#3158](https://github.com/gitify-app/gitify/issues/3158)) ([a17ca8a](https://github.com/gitify-app/gitify/commit/a17ca8ac708ab6daa0286b966c50d4737956573c))
* **theme:** add design-language chrome token layer via [@theme](https://github.com/theme) inline ([f21a27a](https://github.com/gitify-app/gitify/commit/f21a27a63f3c782ee3115c9b494e71c30fe0b9d5))
* **theme:** add design-language settings axis with Classic/Glass selector ([21e4c9a](https://github.com/gitify-app/gitify/commit/21e4c9ac34e351f4c5e2a590d99168235597c98d))
* **theme:** add Glass design language ([#3130](https://github.com/gitify-app/gitify/issues/3130)) ([3505bbe](https://github.com/gitify-app/gitify/commit/3505bbec526cfc0125bfa31e8318f78918aa7eea))
* **theme:** add Glass shell surfaces with per-platform material branch ([b4c1e5e](https://github.com/gitify-app/gitify/commit/b4c1e5e25a22468b011428b3e9ad05cbb9d4564d))
* **theme:** add useAppearance hook with design-language root attributes ([83126c1](https://github.com/gitify-app/gitify/commit/83126c1c8d977c4f4b515735dd1de3a9ed891b07))
* **theme:** apply Glass to controls, list rows, and overlays ([fe3afab](https://github.com/gitify-app/gitify/commit/fe3afab181d362e778495e161c725417f9ae5ace))
* **theme:** bare the Glass account-profile button inside account cards ([22ab3d0](https://github.com/gitify-app/gitify/commit/22ab3d0a86c54e0330608a9f6fd675cd9b1203d0))
* **theme:** degrade Glass to solid under reduced transparency / contrast ([e5859d6](https://github.com/gitify-app/gitify/commit/e5859d61e8bc7344e539892216fdf32017389a0c))
* **theme:** desaturate Glass status palette toward a native tone ([627957e](https://github.com/gitify-app/gitify/commit/627957e87ee7b53b34f0d5e7275262a187db84c2))
* **theme:** dissolve sidebar into unified Glass and mute the primary CTA ([d9065bd](https://github.com/gitify-app/gitify/commit/d9065bdb00bbf66aa9cef43db41f23970911b85f))
* **theme:** float the Glass account header directly on the glass ([3aa607a](https://github.com/gitify-app/gitify/commit/3aa607a51ecaf8c3114197db8adcc1c9119b3593))
* **theme:** lighten Glass tints, soften blur, and use a translucent nav selection ([fb7fae2](https://github.com/gitify-app/gitify/commit/fb7fae21c6cba44353d21319c28b981c27a32d7b))
* **theme:** make Glass translucency always-on and add a visible sidebar divider ([86dcbf9](https://github.com/gitify-app/gitify/commit/86dcbf9c98d057443ccf489b3ecb0da373e278af))
* **theme:** make the sidebar logo follow the icon colour under Glass ([80b6298](https://github.com/gitify-app/gitify/commit/80b6298347b809ed390c0eeb5af06aa6753d94d6))
* **theme:** re-add high contrast for Classic, driven by the setting and the OS ([1446862](https://github.com/gitify-app/gitify/commit/1446862f5ed199dabe021c8b6ee94d97c7c195c9))
* **theme:** refine Glass surfaces ([26a88db](https://github.com/gitify-app/gitify/commit/26a88db642f0049fbc6397ca3d5eba205a941534))
* **theme:** soften notification grouping bands and count pills under Glass ([10db05d](https://github.com/gitify-app/gitify/commit/10db05d5e60aded26ff7832b55ef524d4dd9b113))
* **theme:** wire macOS window vibrancy via IPC for Glass ([8ecbe70](https://github.com/gitify-app/gitify/commit/8ecbe701746e90027c7d5d964b7ed50db2a2f2b3))
* **ui:** fade scrollable content at the top and bottom edges ([#3124](https://github.com/gitify-app/gitify/issues/3124)) ([cd6a1ad](https://github.com/gitify-app/gitify/commit/cd6a1ad8435f261318c21ddef87706204e1b7ec3))


### 🐛 Bug Fixes

* **bitbucket:** fallback for missing notification URLs ([#3131](https://github.com/gitify-app/gitify/issues/3131)) ([0fbe08f](https://github.com/gitify-app/gitify/commit/0fbe08f732dfdf2eaf0125b838fca801d8d4ed0a))
* correct online state on startup instead of waiting for a network event ([#3147](https://github.com/gitify-app/gitify/issues/3147)) ([1110bde](https://github.com/gitify-app/gitify/commit/1110bdea52018e0a31b3a7614f36c6aa1bda193e))
* online state ([3d45a5d](https://github.com/gitify-app/gitify/commit/3d45a5d77f775e6cf3b1a3ef3f9c824fd4df2cb1))
* rollback failed notification interaction with visual warning ([#3145](https://github.com/gitify-app/gitify/issues/3145)) ([cfa12a2](https://github.com/gitify-app/gitify/commit/cfa12a24ef2b93ff8d4edf8eaaccea24cd808130))
* seed online status from the online manager on first render ([b5f72e2](https://github.com/gitify-app/gitify/commit/b5f72e276f761df7bf6a3f24c4be345f045e1d5b))
* sonarqube issues ([046bb8e](https://github.com/gitify-app/gitify/commit/046bb8ecf6b5a5073b97b6b7aa3e91ada8befe22))
* **theme:** construct a transparent vibrant window on macOS so Glass material shows ([9cc01ea](https://github.com/gitify-app/gitify/commit/9cc01ea3df7aaced3287949c056b5635e902cbfd))
* **theme:** harden the native-theme sync ([9b3df25](https://github.com/gitify-app/gitify/commit/9b3df2524148c75cff5c8423c139d1a55a29ab00))
* **theme:** keep Glass status icons monochrome ([39744c0](https://github.com/gitify-app/gitify/commit/39744c01e0a704844687dd940bf1e8cf343005c0))
* **theme:** keep Glass translucent after a runtime Classic to Glass switch ([f926d56](https://github.com/gitify-app/gitify/commit/f926d56c02eebe594cb7ed40807c2be0cd5d172e))
* **theme:** make Glass vibrancy show the real desktop on macOS ([11433a1](https://github.com/gitify-app/gitify/commit/11433a131de2146fed642444eca0a996d3fc0ddc))
* **theme:** resolve Glass tokens under the System theme ([5242380](https://github.com/gitify-app/gitify/commit/5242380e59e1a830a4c4458d8517008eb9f49ab4))
* **theme:** resolve the base colour tokens under the System theme ([3d77d37](https://github.com/gitify-app/gitify/commit/3d77d37d28907f468e524edc60bf923336470c58))
* **theme:** restore the notification status icon colours ([850f7c0](https://github.com/gitify-app/gitify/commit/850f7c00787a5ba95ea49cb40767ad212625530f))


### 🧼 Code Refactoring

* **api:** configure gc and stale time ([#3146](https://github.com/gitify-app/gitify/issues/3146)) ([a9c0021](https://github.com/gitify-app/gitify/commit/a9c0021db9653412841457e5ca87152a9195a265))
* **bitbucket:** simplify repo url transform ([#3133](https://github.com/gitify-app/gitify/issues/3133)) ([c15b323](https://github.com/gitify-app/gitify/commit/c15b3230a9139f501ccd07f9a1aa17a6549993aa))
* **components:** import Primer directly instead of the ui barrel ([da34ca4](https://github.com/gitify-app/gitify/commit/da34ca49b7cf2faf50fed5aba95ac864e70d672f))
* correct online state before any query can run ([223992f](https://github.com/gitify-app/gitify/commit/223992f8560f6cf78de1496bdc2fb616fd4f724a))
* **settings:** drop the redundant "value display" comments ([a421629](https://github.com/gitify-app/gitify/commit/a421629e8256303446c210b4e02ec43773575460))
* simplify bitbucket repo url ([c15b323](https://github.com/gitify-app/gitify/commit/c15b3230a9139f501ccd07f9a1aa17a6549993aa))
* **theme:** drop the redundant light-dark scoping comment ([6c03cf7](https://github.com/gitify-app/gitify/commit/6c03cf7c5429d3d587f8429fa96164589f6c6591))
* **theme:** route renderer through app-owned ui/ layer with import boundary ([ab9fc5b](https://github.com/gitify-app/gitify/commit/ab9fc5b586ee41879afc02f6325c290c692b7d9f))
* **theme:** source the base colour tokens from Primer ([#3148](https://github.com/gitify-app/gitify/issues/3148)) ([28a3566](https://github.com/gitify-app/gitify/commit/28a3566af0ed4e6d68287d28f26807ac1361b637))
* **theme:** trim non-essential comments ([90dc3f3](https://github.com/gitify-app/gitify/commit/90dc3f3cff31a490e0fb84fca592db56df82ad81))


### 🤖 Continuous Integration

* deploy website after the release pipeline publishes ([#3123](https://github.com/gitify-app/gitify/issues/3123)) ([da807d2](https://github.com/gitify-app/gitify/commit/da807d2b8f9e5a4889a358ae495850657b24aeb2))
* format contributors section as unordered list ([#3126](https://github.com/gitify-app/gitify/issues/3126)) ([a9726d3](https://github.com/gitify-app/gitify/commit/a9726d30ae244e49fa7051d845fb4366407b4ecd))
* skip release PR generation when a release was just created ([#3120](https://github.com/gitify-app/gitify/issues/3120)) ([4fc6f83](https://github.com/gitify-app/gitify/commit/4fc6f8316e76fe7e33e887b735c768d689bd4574))

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
