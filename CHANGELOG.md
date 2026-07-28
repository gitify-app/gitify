# Changelog

## [7.2.0](https://github.com/gitify-app/gitify/compare/v7.1.0...v7.2.0) (2026-07-28)


### 🚀 Features

* `[@graphql-codegen](https://github.com/graphql-codegen)` migration and custom scalar mapping ([#2829](https://github.com/gitify-app/gitify/issues/2829)) ([28e1e6c](https://github.com/gitify-app/gitify/commit/28e1e6c3bac76b389397d826a0d95d16bfa426f9))
* **accounts:** add action button to account errors ([#2675](https://github.com/gitify-app/gitify/issues/2675)) ([adb99fb](https://github.com/gitify-app/gitify/commit/adb99fb185db42616128f6085e65b55d949dbdf1))
* **actions:** add zizmor and actionlint[#636](https://github.com/gitify-app/gitify/issues/636) ([#2763](https://github.com/gitify-app/gitify/issues/2763)) ([04d922f](https://github.com/gitify-app/gitify/commit/04d922f5226367a4cbf90007469ef0f8f340e86d))
* add `RepositoryAdvisory` subject type handler ([#2651](https://github.com/gitify-app/gitify/issues/2651)) ([7c4777f](https://github.com/gitify-app/gitify/commit/7c4777fc6c7d58043b6a2ab0fb70fecca246fdb8))
* **auth:** account scopes and expired token workflows ([#2671](https://github.com/gitify-app/gitify/issues/2671)) ([dd7757d](https://github.com/gitify-app/gitify/commit/dd7757d931a5d401497b02e909ce9991804db7fc))
* **auth:** note about reauth flow ([#2739](https://github.com/gitify-app/gitify/issues/2739)) ([2798933](https://github.com/gitify-app/gitify/commit/2798933ee2464f91ed9b9996f4819278d4d58d3c))
* **auth:** provide user choice on scopes ([#2691](https://github.com/gitify-app/gitify/issues/2691)) ([a1fa469](https://github.com/gitify-app/gitify/commit/a1fa46963bee15c7dccf030a97726bf5bed24d39))
* **build:** automate release drafting ([#2618](https://github.com/gitify-app/gitify/issues/2618)) ([f79ecf9](https://github.com/gitify-app/gitify/commit/f79ecf92ba6de771055fd87696350b80810f012f))
* dev logs ([#2690](https://github.com/gitify-app/gitify/issues/2690)) ([70eafcf](https://github.com/gitify-app/gitify/commit/70eafcf079fee7e7e605626114720acccc679ec1))
* enable TypeScript strict mode ([#2761](https://github.com/gitify-app/gitify/issues/2761)) ([27b9554](https://github.com/gitify-app/gitify/commit/27b955429950cb7390b544bc483373ec6a7d6a0f))
* **events:** monitor power state ([#3060](https://github.com/gitify-app/gitify/issues/3060)) ([996bf10](https://github.com/gitify-app/gitify/commit/996bf10700c0230f09c18cd724172bc21eb34d5e))
* **filter:** review request type (user or team) ([#3023](https://github.com/gitify-app/gitify/issues/3023)) ([32edef8](https://github.com/gitify-app/gitify/commit/32edef80a00e297182cfe7f314febd3ff11b9d13))
* **filters:** account filtering ([#2858](https://github.com/gitify-app/gitify/issues/2858)) ([8bc1661](https://github.com/gitify-app/gitify/commit/8bc1661fe04c67ae65a1664be58726504ed9469b))
* **filters:** distinguish author and commenter in search filters ([#2959](https://github.com/gitify-app/gitify/issues/2959)) ([aea09bf](https://github.com/gitify-app/gitify/commit/aea09bfc373f329cef5b00f082792c2a0440759b))
* **forge:** add bitbucket cloud support ([#3059](https://github.com/gitify-app/gitify/issues/3059)) ([a40d9b5](https://github.com/gitify-app/gitify/commit/a40d9b5669dee2fed037e5011edbed093785b0b3))
* **login:** broaden gitea tagline to name forgejo and codeberg ([#2859](https://github.com/gitify-app/gitify/issues/2859)) ([4c6cb57](https://github.com/gitify-app/gitify/commit/4c6cb57fe16f126b1fda42734669b3bbe93debc9))
* **login:** redesign for multi-forge with segmented forge selector ([#2855](https://github.com/gitify-app/gitify/issues/2855)) ([64a5e36](https://github.com/gitify-app/gitify/commit/64a5e3613d873687a3ccaa3ff2c6312b013d9160))
* migrate from `webpack` to `vite` ([#2617](https://github.com/gitify-app/gitify/issues/2617)) ([8986d46](https://github.com/gitify-app/gitify/commit/8986d468543b5e49ff7f1161425319f8d64a60bd))
* multi-forge support — adapter pattern + Gitea ([#2842](https://github.com/gitify-app/gitify/issues/2842)) ([a46220e](https://github.com/gitify-app/gitify/commit/a46220e498076938db6e87440e872fb13790b31b))
* **notifications:** include repository name and subject type in native Windows OS notifications ([#3058](https://github.com/gitify-app/gitify/issues/3058)) ([ec0701c](https://github.com/gitify-app/gitify/commit/ec0701c00a6c7359f2425ef48691fb7a71e2bb17))
* prevent initial window state drift ([d34b0d5](https://github.com/gitify-app/gitify/commit/d34b0d5ff261f3b32edbdea0f595bda603a40d73))
* prevent initial window state drift ([#2731](https://github.com/gitify-app/gitify/issues/2731)) ([bd8349b](https://github.com/gitify-app/gitify/commit/bd8349b0fd40a1f5d517c2b2ccbb8ee9213a43b6))
* react devtools and twemoji plugin ([#2662](https://github.com/gitify-app/gitify/issues/2662)) ([c13f09a](https://github.com/gitify-app/gitify/commit/c13f09a95236213efe7391eda0f41335644adac1))
* **settings:** add "Close to tray" option ([#2845](https://github.com/gitify-app/gitify/issues/2845)) ([967ad6f](https://github.com/gitify-app/gitify/commit/967ad6fcd8f3c2ab4c750dcd293c65c7655ac1a8))
* **settings:** add "Keep window open when it loses focus" option ([#2875](https://github.com/gitify-app/gitify/issues/2875)) ([7085e9d](https://github.com/gitify-app/gitify/commit/7085e9dfb6d9cb101bd9ed8aec47248af3a53786))
* **settings:** customizable global keyboard shortcut ([#2721](https://github.com/gitify-app/gitify/issues/2721)) ([9b7539d](https://github.com/gitify-app/gitify/commit/9b7539d5475fd2fb409c92c1ec4a3378aeef2c05))
* **settings:** make close-to-tray the default and remove the option ([#2852](https://github.com/gitify-app/gitify/issues/2852)) ([4efc164](https://github.com/gitify-app/gitify/commit/4efc16499f7af4ecf99687ce4774fadf3e8c9efd))
* **storage:** persist re-encrypted token on keychain key rotation ([#2847](https://github.com/gitify-app/gitify/issues/2847)) ([d839397](https://github.com/gitify-app/gitify/commit/d83939773f7e0dbf2d872bc7ae4fc68cef45dd95))
* **test:** migrate from `jest` to `vitest` ([#2606](https://github.com/gitify-app/gitify/issues/2606)) ([e7a7716](https://github.com/gitify-app/gitify/commit/e7a7716f6ef324e1e17ff1f501aa18549b3193f8))
* update account scopes icon color ([4b9246f](https://github.com/gitify-app/gitify/commit/4b9246f5adfe72b39ffb99d660c1df806966833a))


### 🐛 Bug Fixes

* account error header ([#2672](https://github.com/gitify-app/gitify/issues/2672)) ([a1e4913](https://github.com/gitify-app/gitify/commit/a1e49134a5c1fe1d2a6f5116d37145018bd05e35))
* **accounts:** hide view-scopes affordance for forges without OAuth scopes ([#2854](https://github.com/gitify-app/gitify/issues/2854)) ([b7ba717](https://github.com/gitify-app/gitify/commit/b7ba7179f28eb035d291e5fa0068dc846a4a0509))
* animate exit on unsubscribe ([#2600](https://github.com/gitify-app/gitify/issues/2600)) ([1c97adc](https://github.com/gitify-app/gitify/commit/1c97adca22078338b68e30a400803b0c2b49f62e))
* **api:** no cache user responses ([#2677](https://github.com/gitify-app/gitify/issues/2677)) ([61163db](https://github.com/gitify-app/gitify/commit/61163dbb6ac80253fca2d6c994f737d2deaf6608))
* **ci:** skip @primer/primitives postinstall script ([#2868](https://github.com/gitify-app/gitify/issues/2868)) ([7f24d17](https://github.com/gitify-app/gitify/commit/7f24d1734eec1c8ecbead1fda26532f528a4dffa))
* compare account uuids ([#2674](https://github.com/gitify-app/gitify/issues/2674)) ([209aec6](https://github.com/gitify-app/gitify/commit/209aec61283395bb3f05864bf4e345930022422d))
* **deps:** update electron-updater to v6.8.2 ([#2601](https://github.com/gitify-app/gitify/issues/2601)) ([89940ae](https://github.com/gitify-app/gitify/commit/89940ae739a46ca2881dbb2f0eb87e863e19af6f))
* **deps:** update electron-updater to v6.8.3 ([#2610](https://github.com/gitify-app/gitify/issues/2610)) ([9265e98](https://github.com/gitify-app/gitify/commit/9265e98333d4f5e44f8cc79175b5813901024eec))
* **deps:** update react-router-dom to v7.13.1 ([#2658](https://github.com/gitify-app/gitify/issues/2658)) ([7e72cb6](https://github.com/gitify-app/gitify/commit/7e72cb6e7d88faf653b7d0cdef76e908921d5141))
* **deps:** update react-router-dom to v7.13.2 ([#2724](https://github.com/gitify-app/gitify/issues/2724)) ([02254e4](https://github.com/gitify-app/gitify/commit/02254e41fd484f65e72e28a8620e913a79951d71))
* drop cached forge clients on app reset ([#3071](https://github.com/gitify-app/gitify/issues/3071)) ([316ab00](https://github.com/gitify-app/gitify/commit/316ab003329a8fcc04578d795006514df8a3b454))
* **filters:** pin filter sort to a stable locale ([#2844](https://github.com/gitify-app/gitify/issues/2844)) ([6237d6e](https://github.com/gitify-app/gitify/commit/6237d6e700c3223587f311afa8524e982fd24e89))
* increase polling interval for GitHub device code flow ([#2899](https://github.com/gitify-app/gitify/issues/2899)) ([abeb0d7](https://github.com/gitify-app/gitify/commit/abeb0d7e174338e3251d8cda004b1637f049c28e))
* increment polling interval when GitHub device code flow returns slow_down ([abeb0d7](https://github.com/gitify-app/gitify/commit/abeb0d7e174338e3251d8cda004b1637f049c28e))
* linked issue description ([#2730](https://github.com/gitify-app/gitify/issues/2730)) ([15bf493](https://github.com/gitify-app/gitify/commit/15bf4930b9c57946c60560a33a14ca75cfba9314))
* lockfile regen ([4f69490](https://github.com/gitify-app/gitify/commit/4f69490e338137251277ce69149143d2756344a1))
* resolve react-is version mismatch and .gitattributes syntax error ([#2650](https://github.com/gitify-app/gitify/issues/2650)) ([817ad09](https://github.com/gitify-app/gitify/commit/817ad09a1f226bbc1892754c25fba7a580cd875a))
* set github app dev settings correctly ([#2673](https://github.com/gitify-app/gitify/issues/2673)) ([67785d6](https://github.com/gitify-app/gitify/commit/67785d6c44ab3dc0fd35d14e8c1d41f6a551e5ce))
* stop notification polling from multiplying API requests ([#3066](https://github.com/gitify-app/gitify/issues/3066)) ([a40bd76](https://github.com/gitify-app/gitify/commit/a40bd76a02a748f3f7b359c04d41d185ca6ff6a1))
* storage keys ([#2734](https://github.com/gitify-app/gitify/issues/2734)) ([7b6039e](https://github.com/gitify-app/gitify/commit/7b6039e6d34a2777602486d174ff8179965aa1c1))
* tailwind bg utility ([#2989](https://github.com/gitify-app/gitify/issues/2989)) ([256ff9b](https://github.com/gitify-app/gitify/commit/256ff9b9772bbc31eaaef99409bebbbac0916c4a))
* test act ([b515e5d](https://github.com/gitify-app/gitify/commit/b515e5d0056e2979c4856392a58a7cc3e887481f))
* test mock for client id ([57fc2f5](https://github.com/gitify-app/gitify/commit/57fc2f5860982e46d9c8862249698e6935ccc142))
* **test:** act ([#2754](https://github.com/gitify-app/gitify/issues/2754)) ([aee35cb](https://github.com/gitify-app/gitify/commit/aee35cb4a726c2bd3c60970ca64c77c1137b5ac7))
* **tray:** populate Linux right-click menu via setContextMenu ([#2856](https://github.com/gitify-app/gitify/issues/2856)) ([24ceb67](https://github.com/gitify-app/gitify/commit/24ceb67198a8d7f30db475240673e7fcde2e5484))
* **url:** github actions status query filter is now case sensitive ([#2817](https://github.com/gitify-app/gitify/issues/2817)) ([60fa3b8](https://github.com/gitify-app/gitify/commit/60fa3b82e833deb092128915991044bd0ea2b7b6))
* **url:** github actions status query filter is now case sensitive (lowercase) ([60fa3b8](https://github.com/gitify-app/gitify/commit/60fa3b82e833deb092128915991044bd0ea2b7b6))


### 🧼 Code Refactoring

* **accounts:** move account crud into the accounts store ([#3036](https://github.com/gitify-app/gitify/issues/3036)) ([8043b10](https://github.com/gitify-app/gitify/commit/8043b106324a5148e7a5ff82e11895f10677abd9))
* **api:** graphql codegen ([#2619](https://github.com/gitify-app/gitify/issues/2619)) ([fa72592](https://github.com/gitify-app/gitify/commit/fa7259200e995946dbb291f293b6a7b846f50463))
* **api:** key queries by account identity and consolidate type exports ([43deef1](https://github.com/gitify-app/gitify/commit/43deef1b56f465de4a1de8f46e0f53d5e9161416))
* **auth:** remove legacy plaintext token migration ([#3031](https://github.com/gitify-app/gitify/issues/3031)) ([a061eaa](https://github.com/gitify-app/gitify/commit/a061eaa112fa18885dd4de0cea6c0e51094cad0c))
* device code flow ux ([#3063](https://github.com/gitify-app/gitify/issues/3063)) ([421ee12](https://github.com/gitify-app/gitify/commit/421ee123485cc90262c5db68bddc3a198d5e224b))
* electron-builder npmrc no longer required ([#2733](https://github.com/gitify-app/gitify/issues/2733)) ([44e874a](https://github.com/gitify-app/gitify/commit/44e874a3c7179481f9fa0b8baeb838a72a83406d))
* **events:** add typed IPC contracts for compile-time safety ([#2843](https://github.com/gitify-app/gitify/issues/2843)) ([e94aaba](https://github.com/gitify-app/gitify/commit/e94aabadcd445bc8912dcaeb4a76f0af2184a195))
* **filters:** use zustand for filters store ([#2633](https://github.com/gitify-app/gitify/issues/2633)) ([d33954e](https://github.com/gitify-app/gitify/commit/d33954e9233d55e3e44c1e7f35358684a4d13bde))
* **forges/github:** move GITHUB_API_MERGE_BATCH_SIZE into forges/github ([#2881](https://github.com/gitify-app/gitify/issues/2881)) ([6964827](https://github.com/gitify-app/gitify/commit/69648274b95790b52597ba7deacaa437db79f80e))
* **forges:** bundle related ForgeAdapter members into capability objects ([#2887](https://github.com/gitify-app/gitify/issues/2887)) ([e9d8169](https://github.com/gitify-app/gitify/commit/e9d8169d330fbc386dbcfa9a9a6ba2d9ea0fee0c))
* **forges:** expose getAuthMethodIcon on the adapter ([#2883](https://github.com/gitify-app/gitify/issues/2883)) ([a3886f7](https://github.com/gitify-app/gitify/commit/a3886f772562384aae9aeb750aa01c1573b44723))
* **forges:** read settings store inside the forge layer ([#3035](https://github.com/gitify-app/gitify/issues/3035)) ([e183b59](https://github.com/gitify-app/gitify/commit/e183b598770977124d42f9ee2537178d9a67cca3))
* **forges:** tidy up the forge adapter interface ([c0ddcbf](https://github.com/gitify-app/gitify/commit/c0ddcbfaa6c623595017b71a21f47db65372c1ed)), closes [#2873](https://github.com/gitify-app/gitify/issues/2873)
* handler overrides ([#2720](https://github.com/gitify-app/gitify/issues/2720)) ([5c4101f](https://github.com/gitify-app/gitify/commit/5c4101f20cf5820eb70dae58f8d311912c13a3e3))
* **links:** rename openGitHub* host helpers to openHost* ([#2885](https://github.com/gitify-app/gitify/issues/2885)) ([d0009d3](https://github.com/gitify-app/gitify/commit/d0009d3bfdc98948b5b7a50c50b8023a397bfcd6))
* **login:** organize login routes and components by forge ([#3030](https://github.com/gitify-app/gitify/issues/3030)) ([5edabc1](https://github.com/gitify-app/gitify/commit/5edabc1c7d17c240db0e7082e55bbcb574682496))
* **main:** adopt `electron-menubar` v10 for window/tray/system handling ([#2880](https://github.com/gitify-app/gitify/issues/2880)) ([d003a61](https://github.com/gitify-app/gitify/commit/d003a6101879fe90f6dc7f70af1ca35d30c6ab31))
* **main:** organize main structure ([b57abc0](https://github.com/gitify-app/gitify/commit/b57abc02c272e8c163ade44fba8ac80ee142c0bb))
* **main:** organize main structure ([#2678](https://github.com/gitify-app/gitify/issues/2678)) ([b7d3d97](https://github.com/gitify-app/gitify/commit/b7d3d97488c8b3847441a24debe0ec2d0ced85a5))
* **notifications:** cache unfiltered notifications and filter in query select ([f30b5cf](https://github.com/gitify-app/gitify/commit/f30b5cf42d4ebf15decbd7dca826e42f30a6d0f0))
* **notifications:** generate notification URL via the adapter ([#2886](https://github.com/gitify-app/gitify/issues/2886)) ([ff6c826](https://github.com/gitify-app/gitify/commit/ff6c82689ca3cb485469f7bfe3a97c1d9b3b5105))
* preload consistency ([#2736](https://github.com/gitify-app/gitify/issues/2736)) ([88a0698](https://github.com/gitify-app/gitify/commit/88a0698d56a53ab8d3245720d5fb3efab275a175))
* proper case formatter ([98bd3dd](https://github.com/gitify-app/gitify/commit/98bd3dd5750dbbe8b31bdd8bdb1136435d1c4726))
* random emoji core util ([#2727](https://github.com/gitify-app/gitify/issues/2727)) ([af48f5c](https://github.com/gitify-app/gitify/commit/af48f5c8e7854929204d9738577703c4217a3f38))
* **renderer:** organize utils ([#2683](https://github.com/gitify-app/gitify/issues/2683)) ([c05c3d8](https://github.com/gitify-app/gitify/commit/c05c3d80253cb834aa6bcebd7ef5e4655ab81366))
* retire AppContext in favor of hooks and stores ([2536395](https://github.com/gitify-app/gitify/commit/2536395f85341513b9e01c17cea3782358f01047))
* retire fetch type notification setting ([#3070](https://github.com/gitify-app/gitify/issues/3070)) ([94f37e2](https://github.com/gitify-app/gitify/commit/94f37e2f09b52384fbb0edc02c9153615387c6f6))
* **storage:** remove legacy storage key after migration ([#3037](https://github.com/gitify-app/gitify/issues/3037)) ([5854376](https://github.com/gitify-app/gitify/commit/5854376cfb8ba5d2dffcf7a3de7f20efb6b27ffd))
* **stores:** filter jsdocs ([463f2c0](https://github.com/gitify-app/gitify/commit/463f2c070795144c725adb1ea45e9665012a6c72))
* tanstack-query for api state, zustand for accounts and settings state ([b270e74](https://github.com/gitify-app/gitify/commit/b270e740ff16dcbe435c61b11cf23875b7f7b060))
* tanstack-query for api state, zustand for accounts and settings state ([#2637](https://github.com/gitify-app/gitify/issues/2637)) ([1d7cfe8](https://github.com/gitify-app/gitify/commit/1d7cfe806b516e9099c4bd9b4ebf78413e51b8fb))
* test renderWithProviders for store initialization ([#2728](https://github.com/gitify-app/gitify/issues/2728)) ([3fa3eac](https://github.com/gitify-app/gitify/commit/3fa3eaca2a40291e9b8921b2f914d37a382e3e57))
* tidy up the forge adapter interface ([#2874](https://github.com/gitify-app/gitify/issues/2874)) ([c0ddcbf](https://github.com/gitify-app/gitify/commit/c0ddcbfaa6c623595017b71a21f47db65372c1ed))
* transform utils ([e513fbe](https://github.com/gitify-app/gitify/commit/e513fbe3370c89d55610dbed214ff804c7866e20))
* **utils/core:** jsdocs ([bd03314](https://github.com/gitify-app/gitify/commit/bd033147621565e94a3416b8089a04c10cd0c432))
* **utils/system:** alignment and jsdocs ([#2735](https://github.com/gitify-app/gitify/issues/2735)) ([c9cb77a](https://github.com/gitify-app/gitify/commit/c9cb77a6503c327fb3a74b3739a15c9e362fc815))
* vite-react plugin ([#2714](https://github.com/gitify-app/gitify/issues/2714)) ([f09f3e7](https://github.com/gitify-app/gitify/commit/f09f3e7ea2d456ef333fc4649089f9be52918841))


### 📚 Documentation

* git forges ([#2851](https://github.com/gitify-app/gitify/issues/2851)) ([2b41521](https://github.com/gitify-app/gitify/commit/2b415210baed90627717db7a6552600347c1d70c))
* git forges ([#2853](https://github.com/gitify-app/gitify/issues/2853)) ([43aead0](https://github.com/gitify-app/gitify/commit/43aead0844da1540b05e80aeeb0a9097d7f75ec9))
* update readme content ([c74b515](https://github.com/gitify-app/gitify/commit/c74b51531063011a99d3d958c291e27fa0be9acb))
* update readme content ([079976d](https://github.com/gitify-app/gitify/commit/079976df20a6593df9062f3e08daa8cf307cd646))
* update readme content ([#2620](https://github.com/gitify-app/gitify/issues/2620)) ([c7630cd](https://github.com/gitify-app/gitify/commit/c7630cd080a5f25cad064603b26301c9ba79a304))
* update README.md ([a1a0be8](https://github.com/gitify-app/gitify/commit/a1a0be849737394b3ecdd188b0c45268424026cd))
* Update README.md ([c97edd2](https://github.com/gitify-app/gitify/commit/c97edd28e4b6755f4d778d4632c254bac39cfe61))


### 🏗️ Build System

* automate release drafting ([f79ecf9](https://github.com/gitify-app/gitify/commit/f79ecf92ba6de771055fd87696350b80810f012f))
* copy static resources for dev mode ([#2725](https://github.com/gitify-app/gitify/issues/2725)) ([c4f9e71](https://github.com/gitify-app/gitify/commit/c4f9e711cc2904c640c2de512f72da2576a1cfb7))
* prepare `v6.17.0` release ([#2593](https://github.com/gitify-app/gitify/issues/2593)) ([ff0486e](https://github.com/gitify-app/gitify/commit/ff0486e0ca93b1c6eae19dd96bb788ad7d14f68b))
* prepare `v6.18.0` release ([#2729](https://github.com/gitify-app/gitify/issues/2729)) ([0f759f2](https://github.com/gitify-app/gitify/commit/0f759f22f75e597879fa51117a283ad67dad8876))
* prepare `v6.19.0` release ([#2741](https://github.com/gitify-app/gitify/issues/2741)) ([57f2918](https://github.com/gitify-app/gitify/commit/57f29185a2512e58ef636e6e4c5f810600f6d282))
* prepare `v6.20.0` release ([#2819](https://github.com/gitify-app/gitify/issues/2819)) ([7da29ae](https://github.com/gitify-app/gitify/commit/7da29aebeee7b434002526a9edd52415b027e840))
* prepare `v7.0.0` release ([#3062](https://github.com/gitify-app/gitify/issues/3062)) ([bcedd3f](https://github.com/gitify-app/gitify/commit/bcedd3f6a1c0344150c06082e122e256081122b4))
* prepare `v7.0.1` release ([#3067](https://github.com/gitify-app/gitify/issues/3067)) ([1a3f5bb](https://github.com/gitify-app/gitify/commit/1a3f5bb51f5362f895076168f7051f1a74e87d9e))
* ts incremental build info ([ae756ae](https://github.com/gitify-app/gitify/commit/ae756aeceedb12a2e221ec77245dc96f70ad20f7))


### 🤖 Continuous Integration

* add emoji prefixes to release-please changelog sections ([#3095](https://github.com/gitify-app/gitify/issues/3095)) ([47ec087](https://github.com/gitify-app/gitify/commit/47ec08709845e38e2a7c7285b48a4dec7ce3446b))
* **triage:** use pull_request_target so labeler can write on fork PRs ([#2850](https://github.com/gitify-app/gitify/issues/2850)) ([b4d34b4](https://github.com/gitify-app/gitify/commit/b4d34b4796e49fda2e058c76dd0ad32b862ece98))

## [7.1.0](https://github.com/gitify-app/gitify/compare/v7.0.1...v7.1.0) (2026-07-27)


### 🚀 Features

* **notifications:** include repository name and subject type in native Windows OS notifications ([#3058](https://github.com/gitify-app/gitify/issues/3058)) ([ec0701c](https://github.com/gitify-app/gitify/commit/ec0701c00a6c7359f2425ef48691fb7a71e2bb17))


### 🐛 Bug Fixes

* drop cached forge clients on app reset ([#3071](https://github.com/gitify-app/gitify/issues/3071)) ([316ab00](https://github.com/gitify-app/gitify/commit/316ab003329a8fcc04578d795006514df8a3b454))


### 🧼 Code Refactoring

* retire fetch type notification setting ([#3070](https://github.com/gitify-app/gitify/issues/3070)) ([94f37e2](https://github.com/gitify-app/gitify/commit/94f37e2f09b52384fbb0edc02c9153615387c6f6))


### 🤖 Continuous Integration

* add emoji prefixes to release-please changelog sections ([#3095](https://github.com/gitify-app/gitify/issues/3095)) ([47ec087](https://github.com/gitify-app/gitify/commit/47ec08709845e38e2a7c7285b48a4dec7ce3446b))
