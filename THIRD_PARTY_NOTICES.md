# Third-party notices

The project's MIT license covers original first-party application code. Third-party source, packages, fonts, logos, and other material retain their upstream terms. This inventory preserves verified upstream notices; it is not a grant of trademark rights or a blanket distribution clearance.

The [machine-readable inventory](third-party/inventory.json) records package versions, notice hashes, source locations/URLs, provenance limits, and distribution scope. Files under `third-party/licenses/` preserve original package/upstream text without editing copyright claims. Identical texts share one file. Pusher PHP is the documented exception: its original version-pinned README copyright/license section is followed by the canonical MIT terms it references, without inventing a holder. Future dependency/source changes require regenerating and reviewing this inventory.

## Browser and source distributions

Browser entries come from rendered modules in an in-memory production Vite build, plus the explicit Tailwind and tw-animate-css imports. Development tools such as Lightning CSS, caniuse-lite, and argparse are not classified as browser code merely because they are installed. No font binaries are tracked: Inter loads externally through Google Fonts and remains under its [OFL terms](https://github.com/rsms/inter/blob/master/LICENSE.txt). Including fonts or build tools in a future archive changes the review scope.

[public/third-party-notices.txt](public/third-party-notices.txt) contains the first-party license, runtime/CSS notices, and the shadcn source notice for static hosting. Vite's existing default public-directory handling copies this file in a normal build. Keep it in the deployed `dist/` directory; this phase did not write or deploy a new production build. The unused React SVG is tracked source material with a Vite notice, but it is not part of that browser notice file. Original component/template import revisions are not fully recorded; retaining upstream notices does not invent that history.

## Artwork excluded from the first-party MIT grant

- `public/icon-syncspace.svg`: the maintainer reports Gemini generation through Google Antigravity IDE around November 2025 with a personal Google account and authorizes continued project use. That date is approximate. Archived general Google terms and current Antigravity terms were reviewed, but the accepted November 2025 Antigravity-specific version is unverified. The logo is unchanged and remains outside the first-party MIT grant; see the governance report for the conditional terms conclusion and exact remaining confirmation.
- [public/google-sign-in.svg](public/google-sign-in.svg): unchanged Google-provided light rectangular full-button artwork from the [official download archive](https://developers.google.com/static/identity/images/signin-assets.zip), used under [Google Identity branding guidance](https://developers.google.com/identity/branding-guidelines). Its lettering and artwork are paths, so no local font binary is needed. The SHA-256 and archive member are recorded in the inventory. The mark is not relicensed under MIT; the former hand-embedded monochrome paths were removed from the button.
- `src/assets/react.svg`: verified Vite template origin, unused by current client source. Its code/artwork attribution does not establish trademark permission or endorsement.

The Google button now uses the permitted published asset without altering it. The remaining generation-time logo-terms uncertainty still prevents complete distribution clearance. See the [governance report](docs/OSS_GOVERNANCE_PHASE1.md).

## Package and source notice inventory

| Material | Version / snapshot | Terms | Scope | Original notice text |
|---|---|---|---|---|
| `@date-fns/tz` | `1.4.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/cc7267726f809c066c35c81a17d7525bccf588ecc826b15ca65a15d34106c804.txt) |
| `@dnd-kit/accessibility` | `3.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/537607e3f1533ad2c5b12978967f5ab27f34ffb7e626e321017a7ccca6cc24ff.txt) |
| `@dnd-kit/core` | `6.3.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/537607e3f1533ad2c5b12978967f5ab27f34ffb7e626e321017a7ccca6cc24ff.txt) |
| `@dnd-kit/sortable` | `10.0.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/537607e3f1533ad2c5b12978967f5ab27f34ffb7e626e321017a7ccca6cc24ff.txt) |
| `@dnd-kit/utilities` | `3.2.2` | MIT | rendered-browser-js | [text 1](third-party/licenses/537607e3f1533ad2c5b12978967f5ab27f34ffb7e626e321017a7ccca6cc24ff.txt) |
| `@floating-ui/core` | `1.7.5` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e4c9a9b6c71019cbbea3bdc20b01223110a9035700f9c960c8fcbf78c2325ce.txt) |
| `@floating-ui/dom` | `1.7.6` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e4c9a9b6c71019cbbea3bdc20b01223110a9035700f9c960c8fcbf78c2325ce.txt) |
| `@floating-ui/react-dom` | `2.1.8` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e4c9a9b6c71019cbbea3bdc20b01223110a9035700f9c960c8fcbf78c2325ce.txt) |
| `@floating-ui/utils` | `0.2.11` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e4c9a9b6c71019cbbea3bdc20b01223110a9035700f9c960c8fcbf78c2325ce.txt) |
| `@hookform/resolvers` | `5.2.2` | MIT | rendered-browser-js | [text 1](third-party/licenses/e8eeb472f0a5889c2c51625b86a3f9b8630680adb9f49a125352e2e426392780.txt) |
| `@radix-ui/number` | `1.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/primitive` | `1.1.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-alert-dialog` | `1.1.15` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-arrow` | `1.1.7` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-avatar` | `1.1.11` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-checkbox` | `1.3.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-collection` | `1.1.7` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-compose-refs` | `1.1.2` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-context` | `1.1.2` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-context` | `1.1.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-dialog` | `1.1.15` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-direction` | `1.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-dismissable-layer` | `1.1.11` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-dropdown-menu` | `2.1.16` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-focus-guards` | `1.1.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-focus-scope` | `1.1.7` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-id` | `1.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-label` | `2.1.8` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-menu` | `2.1.16` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-popover` | `1.1.15` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-popper` | `1.2.8` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-portal` | `1.1.9` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-presence` | `1.1.5` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-primitive` | `2.1.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-primitive` | `2.1.4` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-roving-focus` | `1.1.11` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-scroll-area` | `1.2.10` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-select` | `2.2.6` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-separator` | `1.1.8` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-slot` | `1.2.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-slot` | `1.2.4` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-switch` | `1.2.6` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-tabs` | `1.1.13` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-tooltip` | `1.2.8` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-use-callback-ref` | `1.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-use-controllable-state` | `1.2.2` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-use-escape-keydown` | `1.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-use-is-hydrated` | `0.1.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-use-layout-effect` | `1.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-use-previous` | `1.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-use-size` | `1.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@radix-ui/react-visually-hidden` | `1.2.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/0e80a2d229d2fd4fc7e8636142ec5d0ff0bc031f14c15b682e2ac01dfd5b5138.txt) |
| `@reduxjs/toolkit` | `2.12.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/49784961ec6c4941437b7a2c54d8977d0528076a9e7c73dd40f7d0942b8f106d.txt) |
| `aria-hidden` | `1.2.6` | MIT | rendered-browser-js | [text 1](third-party/licenses/30f0cfddf483d1128e3610205020f2041a6c5e837aa999e0aa82e5576187d4a9.txt) |
| `class-variance-authority` | `0.7.1` | Apache-2.0 | rendered-browser-js | [text 1](third-party/licenses/0ccbf956cffc8dcf515809433cb5242ee67c94513d46e48c261d68d0880de406.txt) |
| `clsx` | `2.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/9a9edad7baae52622bddf3c15b2ef8a33d2c89f2d25408ad13e8a7481c6b0c97.txt) |
| `cmdk` | `1.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/b5acfd21b3b61508365224c40ec1b03ec71091248baaf989d4be916551e7d532.txt) |
| `d3-array` | `3.2.4` | ISC | rendered-browser-js | [text 1](third-party/licenses/3e6849627f74ff73c257a3ae1efb574015d94fc1035c05ec3c15805165efcbc4.txt) |
| `d3-color` | `3.1.0` | ISC | rendered-browser-js | [text 1](third-party/licenses/faa682e3e430941f958d26180458f5934a62f58dac4d70ccdd15608c15d0f884.txt) |
| `d3-format` | `3.1.2` | ISC | rendered-browser-js | [text 1](third-party/licenses/2a6d2d5f32ba0b755ddbc1c833f766e30cdbe6ebe9a6d4e3e24427721f0b63d3.txt) |
| `d3-interpolate` | `3.0.1` | ISC | rendered-browser-js | [text 1](third-party/licenses/e008c5e25a6be382593089c29bfabbc553c6378eee02895aec46ce396cc404ee.txt) |
| `d3-path` | `3.1.0` | ISC | rendered-browser-js | [text 1](third-party/licenses/a09b0d6d76e768fca2085fad05743ee81ddd11946bcda160a3cf5e1081a479aa.txt) |
| `d3-scale` | `4.0.2` | ISC | rendered-browser-js | [text 1](third-party/licenses/e008c5e25a6be382593089c29bfabbc553c6378eee02895aec46ce396cc404ee.txt) |
| `d3-shape` | `3.2.0` | ISC | rendered-browser-js | [text 1](third-party/licenses/faa682e3e430941f958d26180458f5934a62f58dac4d70ccdd15608c15d0f884.txt) |
| `d3-time` | `3.1.0` | ISC | rendered-browser-js | [text 1](third-party/licenses/faa682e3e430941f958d26180458f5934a62f58dac4d70ccdd15608c15d0f884.txt) |
| `d3-time-format` | `4.1.0` | ISC | rendered-browser-js | [text 1](third-party/licenses/e008c5e25a6be382593089c29bfabbc553c6378eee02895aec46ce396cc404ee.txt) |
| `date-fns` | `4.2.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/8d3951c38967b964b1fe259bfd200c2647cc04c858b55a4414e3122a60f1ef4b.txt) |
| `decimal.js-light` | `2.5.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/fc0397fbd5c128bec7edef4e8d3f45e15db5fd043cdd0a2edfc4f14d47fbc3e4.txt) |
| `es-toolkit` | `1.46.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/ed68888a2a28f32a05e88f24d4d4ee75075a1bda2b6372a1f2e00fa0576a5524.txt) |
| `eventemitter3` | `5.0.4` | MIT | rendered-browser-js | [text 1](third-party/licenses/3aecc12b1cb28832b5f65ab64291de96568c3f236a74d646281b4491f7bcadbf.txt) |
| `get-nonce` | `1.0.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/acf3b087b348d2f2e731b9d4131af185aad694c1204ce14a46909483fd42da05.txt) |
| `immer` | `10.2.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/99cf22f6960a6fe228ec84ea9aefb0d75b27999ece83a3a9801e1c2081fa270b.txt) |
| `immer` | `11.1.8` | MIT | rendered-browser-js | [text 1](third-party/licenses/99cf22f6960a6fe228ec84ea9aefb0d75b27999ece83a3a9801e1c2081fa270b.txt) |
| `input-otp` | `1.4.2` | MIT | rendered-browser-js | [text 1](third-party/licenses/079031192fea535a245aa64a637d8433c406b82a14f91c3606b1d63e41c00152.txt) |
| `internmap` | `2.0.3` | ISC | rendered-browser-js | [text 1](third-party/licenses/9ea8903938dab5f12c4572d60725069bec2d1b0dc3bcc210b09bae946a5ebb1f.txt) |
| `laravel-echo` | `2.3.4` | MIT | rendered-browser-js | [text 1](third-party/licenses/7b4f9149597fbae2ce689bc9317d1869e17f1b3fa5f01c289998c108f8c37cf7.txt) |
| `lucide-react` | `0.555.0` | ISC | rendered-browser-js | [text 1](third-party/licenses/3c57143f22dac950efebf84002e360bba5458c7b90fe583b0667aaaef1a7256e.txt) |
| `pusher-js` | `8.5.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/e7170db862044802ed3db75d61113e48aed5061ba5c97ec9820ff9856c4dc0f5.txt) |
| `react` | `19.2.6` | MIT | rendered-browser-js | [text 1](third-party/licenses/da6d3703ed11cbe42bd212c725957c98da23cbff1998c05fa4b3d976d1a58e93.txt) |
| `react-day-picker` | `9.14.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/45d115f88e2b50de2113bafbc5e877f8e85dc9236d5d304a855ed4756f7e4439.txt) |
| `react-dom` | `19.2.6` | MIT | rendered-browser-js | [text 1](third-party/licenses/da6d3703ed11cbe42bd212c725957c98da23cbff1998c05fa4b3d976d1a58e93.txt) |
| `react-hook-form` | `7.76.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/e8eeb472f0a5889c2c51625b86a3f9b8630680adb9f49a125352e2e426392780.txt) |
| `react-is` | `19.2.6` | MIT | rendered-browser-js | [text 1](third-party/licenses/da6d3703ed11cbe42bd212c725957c98da23cbff1998c05fa4b3d976d1a58e93.txt) |
| `react-redux` | `9.3.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/f2da73c752c6b87624755edacf927cbd915fa76555d383e74494bad4a5155ab3.txt) |
| `react-remove-scroll` | `2.7.2` | MIT | rendered-browser-js | [text 1](third-party/licenses/30f0cfddf483d1128e3610205020f2041a6c5e837aa999e0aa82e5576187d4a9.txt) |
| `react-remove-scroll-bar` | `2.3.8` | MIT | rendered-browser-js | [text 1](third-party/licenses/a79aae0c0f21990d9d963bb3c5a79cdcea9a46f8523ba55c58d7fe776b6ebc84.txt) |
| `react-router` | `7.15.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/77c9ee6a9c5d5782fb0c50b50d101189116314c14f7df0a1b0d385fc96a7ba49.txt) |
| `react-style-singleton` | `2.2.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/30f0cfddf483d1128e3610205020f2041a6c5e837aa999e0aa82e5576187d4a9.txt) |
| `recharts` | `3.8.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/2d3aa48a8d1d3b93093680e8e68d3a64cfb590c3ade377ffcaefc69dac7c2ce5.txt) |
| `redux` | `5.0.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/f2da73c752c6b87624755edacf927cbd915fa76555d383e74494bad4a5155ab3.txt) |
| `redux-thunk` | `3.1.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/635da794c92d278f8355428be0f9922d643f556d4f75f33fe4aca6b98d27affe.txt) |
| `reselect` | `5.1.1` | MIT | rendered-browser-js | [text 1](third-party/licenses/0bb5035e49bf9b5661655b402bab3c3efccb8eab2a50e37392100139fe3280f2.txt) |
| `scheduler` | `0.27.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/da6d3703ed11cbe42bd212c725957c98da23cbff1998c05fa4b3d976d1a58e93.txt) |
| `sonner` | `2.0.7` | MIT | rendered-browser-js | [text 1](third-party/licenses/da9201378c36ffd81f51ad0b305f3f0981e90bc558789210ad65d1161eec3b7d.txt) |
| `tailwind-merge` | `3.6.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/d4c70c7ce38cea8778f0aed3fc0bef0a9dbd27f13bd8b6773cbd6d37941971e5.txt) |
| `tailwindcss` | `4.3.0` | MIT | browser-css-import | [text 1](third-party/licenses/60e0b68c0f35c078eef3a5d29419d0b03ff84ec1df9c3f9d6e39a519a5ae7985.txt) |
| `tiny-invariant` | `1.3.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/b1c501095de70182748cb8e8d97ac5577701a4ef3b755ba30d59fd87b24bdb0f.txt) |
| `tslib` | `2.8.1` | 0BSD | rendered-browser-js | [text 1](third-party/licenses/da16ddb65f8ca390998fb99223d0112498b56b45784d00afd77ff8ce1ac4de8b.txt), [text 2](third-party/licenses/210b19e543130388c68654b7497e967119ce17145f66ab7d85688fbd70f08751.txt) |
| `tw-animate-css` | `1.4.0` | MIT | browser-css-import | [text 1](third-party/licenses/039184dfa0a822397b3f45a435b5b1e538721587fbade96b9fa80f86cb354109.txt) |
| `use-callback-ref` | `1.3.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/30f0cfddf483d1128e3610205020f2041a6c5e837aa999e0aa82e5576187d4a9.txt) |
| `use-sidecar` | `1.1.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/30f0cfddf483d1128e3610205020f2041a6c5e837aa999e0aa82e5576187d4a9.txt) |
| `use-sync-external-store` | `1.6.0` | MIT | rendered-browser-js | [text 1](third-party/licenses/da6d3703ed11cbe42bd212c725957c98da23cbff1998c05fa4b3d976d1a58e93.txt) |
| `zod` | `4.4.3` | MIT | rendered-browser-js | [text 1](third-party/licenses/3f1189b28e3866e0d979968d466b78f813f76827cfdca1fbb124cc0a5c8841f8.txt) |
| `shadcn/ui` | `upstream-license-snapshot-2026-10-14` | MIT | copied-ui-source | [text 1](third-party/licenses/1564074e13439397221ffd522e2e504d56561994a23d371aa5e3ad43e4f5423f.txt) |
| `Vite React template` | `upstream-license-snapshot-2026-10-14` | MIT | source-only-react-svg | [text 1](third-party/licenses/692057af3d664cbb79ac38293eb50aa3c4987f8182e2a440136e59e08f1b4a54.txt) |
| `Google Sign-In approved button asset` | `official-asset-snapshot-2026-10-14` | [Google branding guidance](https://developers.google.com/identity/branding-guidelines), excluded from MIT | public-branding-asset | [Unmodified SVG](public/google-sign-in.svg) |
