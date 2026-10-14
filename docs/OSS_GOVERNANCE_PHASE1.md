# SyncSpace Phase 1 OSS governance: Phase 1C verification

Review date: 2026-10-14 (Asia/Jakarta). Client: `aardnsyhs/syncspace`, maintained development branch `master`. API: `aardnsyhs/syncspace-api`, maintained development branch `main`.

## Phase 1C executive summary

The Google button now uses an unchanged, official Google-provided full-button SVG instead of hand-embedded monochrome paths. Its existing OAuth handler is unchanged. A written, isolated frontend production build includes the official asset, the unchanged SyncSpace logo, and the notice file containing the complete MIT license and applicable upstream texts. Scoped browser checks passed across both CSS themes and three viewport widths.

Logo provenance is more specific: the maintainer reports Gemini generation through Google Antigravity IDE around November 2025 using a personal Google account. Archived general Google terms support the output non-ownership statement, but the exact Antigravity-specific conditions accepted then were not verified. The logo remains unchanged and outside the first-party MIT grant; no originality, copyright protection, or trademark-clearance guarantee is inferred.

**PHASE 1 PARTIALLY COMPLETE.** Google branding and written frontend notice inclusion are resolved for the checked implementation. Generation-time logo terms and security notification/receipt confirmation remain open. This report does not certify application readiness, security, or Codex for OSS acceptance. The [original audit](OSS_READINESS_AUDIT.md) remains historical.

## Governance improvements

The Phase 1B authorization and subsequent holder confirmation remain effective:

- Original first-party application code is MIT-licensed in both repositories. The maintainer declares the necessary rights; that declaration is not an independent legal title opinion.
- Both canonical LICENSE files use `Copyright (c) 2025-2026 Ardiansyah Sulistyo`. The client declares MIT; the API's existing MIT metadata remains unchanged. Upstream source, packages, fonts, and branding retain separate terms.
- The maintainer handles maintenance, issue triage, PR review/merge decisions, releases, and private security reports.
- Initial maintained development branches are `master` (client) and `main` (API). Future releases use Semantic Versioning and document compatible client/API versions, breaking changes, and upgrade implications.
- Release reviewed and verified changes when ready, without a fixed schedule, response-time SLA, or historical backport commitment. No CLA, committee, extra maintainer, or adoption evidence is invented.

The [client notices](../THIRD_PARTY_NOTICES.md), [client inventory](../third-party/inventory.json), and [API notices](https://github.com/aardnsyhs/syncspace-api/blob/main/THIRD_PARTY_NOTICES.md) retain the earlier package/source inventory rather than repeat a full provenance audit. Canonical first-party MIT texts and original notice files were preserved.

## Antigravity/Gemini logo provenance

### Maintainer declaration

`public/icon-syncspace.svg` was generated specifically for SyncSpace using Gemini through Google Antigravity IDE, approximately November 2025. The maintainer used a personal Google account, not employer-managed Workspace, Cloud, or Gemini Enterprise access, and did not intentionally copy an existing brand or proprietary asset. Continued project use/redistribution is authorized subject to applicable Google terms and third-party rights. The exact generation day and accepted account-specific conditions are unavailable. This is a declaration of provenance and intended use, not proof of originality, exclusivity, or trademark permission.

### Official sources and applicable periods

| Source | Version/date and relevant evidence | Limitation |
|---|---|---|
| [Google Terms of Service, archived](https://policies.google.com/terms/archive/20240522) | Effective May 22, 2024; candidate general terms for November 2025. Content in Google services says Google does not claim ownership of generated original content. Users must respect others' rights. | Does not establish the accepted Antigravity-specific conditions or create copyright in AI output. |
| [Google Antigravity Additional Terms](https://antigravity.google/terms) | Current page, no displayed effective/version date. For individual access it incorporates Google general terms/privacy policy; Cloud/Enterprise access can follow administrator terms instead. Agents remain the user's responsibility. | The personal-account declaration supports the individual route; the current text is not a verified November 2025 snapshot. |
| [Google Antigravity Plans](https://antigravity.google/docs/plans) | Current documentation explicitly distinguishes individual Google-derived terms from team/Enterprise Cloud terms. | Current product documentation, not historical acceptance evidence. |
| [Google Terms of Service, current](https://policies.google.com/terms) | Effective July 30, 2026. Output non-ownership and third-party-rights requirements remain relevant. Google's own service software/branding is distinct from generated user content. | Cannot retroactively substitute this version for the generation-time contract; account-country conditions were not independently verified. |
| [Google Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy) | Last modified December 17, 2024. Restrictions include others' intellectual property rights and deceptive provenance claims. | Neither an output ownership grant nor independent infringement clearance. |
| [Antigravity launch announcement](https://antigravity.google/blog/introducing-google-antigravity) | November 18, 2025; individual public preview is consistent with the reported approximate timeframe. | Launch evidence is not a terms archive. |

No automatic equivalence with Gemini API, AI Studio, or Gemini Apps terms was assumed. These products' separate terms were not used to establish this IDE output's rights.

### Evidence-based conclusion

For the reviewed individual-account route, Google does not claim generated original content ownership. No output-specific commercial-use ban, mandatory Google attribution, publication requirement, or SVG-specific restriction was found in the reviewed general/current Antigravity texts. Open-source/commercial redistribution appears consistent with those provisions **conditionally**, subject to applicable additional terms, laws, and third-party rights. This is an inference from the reviewed provisions, not an originality or copyright-protection guarantee.

The historical gap remains: the exact November 2025 Antigravity-specific agreement was not retrieved. An official `/terms/archive` request returned 404; a November-version query served the current undated text; a public archive-index lookup returned 503. Current terms and general-terms continuity do not prove the missing conditions were identical.

Exact maintainer action: retain the accepted generation-time Antigravity terms/account notice or obtain Google confirmation that the applicable November 2025 personal-account terms permit this use. Confirm account-country/additional conditions if relevant. Until then, keep the qualified provenance record and do not claim unconditional redistribution clearance or relicense the logo. No logo replacement or modification was made.

## Google Sign-In branding

The previous `currentColor` paths were replaced with the full light rectangular asset from Google's [pre-approved download archive](https://developers.google.com/static/identity/images/signin-assets.zip), linked by the [Identity branding guidelines](https://developers.google.com/identity/branding-guidelines), last updated July 7, 2026.

- Archive member: `Android + Web/SVG/Light/Theme=Light, Show text=Yes, Shape=Square, Platform=Android+Web.svg`.
- Local asset: [public/google-sign-in.svg](../public/google-sign-in.svg), 23,965 bytes. SHA-256: `9dbc9beb1660ca4de76a724cae014be02b22ecdd8124282318f9f0362579474c`.
- The asset is byte-identical to the download. It includes lettering as paths and the prescribed artwork/background/spacing; no manual trademark reconstruction or font binary was added.
- The image is rendered proportionally at 198 by 44 CSS pixels, inside the existing native Button primitive. Accessible name: `Sign in with Google`; the decorative image has empty alt text and is hidden from accessibility APIs.
- `type="button"` and `onClick={loginWithGoogle}` remain. AuthContext, provider URL construction, callbacks, and login loading/error handling were not changed. The primitive's native disabled behavior remains; the control originally had no independent async/loading state.

Design Read: existing authentication control with official Google branding, ENERGY 1 / RHYTHM 1 / MOTION 1. Reasons: approved full artwork avoids color/type/spacing reconstruction; 44px height provides a touch target; proportional sizing preserves the brand geometry; black/light 2px outlines identify keyboard focus in both CSS themes. No other auth-page component was redesigned.

Chromium checks exercised the actual built login route in light and explicit `.dark` CSS mode, at 320, 768, and 1280px widths. In each case: asset loads, aspect ratio remains 4.5, the button has a 44px target, Tab reaches it, the 2px focus outline appears, and mouse/Enter/Space each reach the existing OAuth redirect. Provider requests were intercepted before transmission. Callback origin and the synthetic public client ID matched expectations. Real provider consent/code exchange was not tested.

The Google artwork remains third-party branding used under Google's applicable guidance, not under the project's MIT license. This is implementation verification against the published asset, not Google app-verification approval.

## Distribution verification

### Frontend written artifact

Executed the existing approved `corepack yarn build` script, including TypeScript compilation, with `--outDir /tmp/syncspace-phase1c-dist --emptyOutDir`. Only this phase's temporary output directory was emptied. The repository's existing `dist/`, lockfile, dependency versions, and private environment files were not replaced.

All application-specific `VITE_*` variables were overridden with synthetic public test values; no live client/provider credential was needed. The written artifact contains:

- `index.html` and production JS/CSS chunks.
- `icon-syncspace.svg`, byte-identical to the unchanged source logo.
- `google-sign-in.svg`, byte-identical to the official asset/source file.
- `third-party-notices.txt`, byte-identical to the current public notice file, including the entire first-party MIT body and all applicable client notice texts.

A local-only HTTP server verified the built app and public asset availability. No deployment or release occurred. Private `.env`, key/config filenames and credential-pattern scans found no matches in the artifact; this is a scoped scan, not proof that every imaginable secret pattern is absent.

Current client inventory: 103 runtime/CSS package versions, two source-origin entries, and the new branding-asset entry (106 entries; 44 distinct original notice texts unchanged). Versions match the unchanged Yarn lock. Google source/hash/terms are recorded separately from package licenses. Build/test tools and externally loaded fonts are not falsely represented as bundled runtime dependencies.

### Backend source/server layout

Read-only checks confirm both working-layout LICENSE and third-party notice directories are present. The runtime inventory matches Composer's 94 `packages` entries exactly and excludes `packages-dev`; original upstream notice hashes remain intact. Server artifacts containing `vendor/` must retain the packages' own texts as well as the notice directory. Laravel-derived source notices remain relevant to source-only distributions.

No concrete server release/archive process is defined. A HEAD-only Git archive currently omits the pending, untracked LICENSE/notice files; a future source/server artifact must explicitly include this reviewed work after the maintainer publishes it. No source archive was mislabeled as release-ready, no server deployment was created, and no install, migration, production database, or backend application command was run.

## Security reporting

Read-only rechecks returned HTTP 200 and `enabled: true` for both repositories' private-vulnerability-reporting endpoints. Both Security Advisories pages returned HTTP 200 and showed the reporting entry point. Both SECURITY files use their correct repository destination and the adopted monitoring/responsibility policy; their content needed no change.

Notification subscriptions, administrator inbox access, delivery, and actual report receipt remain manual checks. No dummy report was submitted, no subscription or remote setting changed, and no fictional email or response SLA introduced. Sensitive advisory identifiers/details are absent from this report.

## Files changed in Phase 1C

Client only:

1. `src/features/auth/components/GoogleLoginButton.tsx`: official artwork, accessible label, proportional touch target, theme-aware focus; existing handler retained.
2. `public/google-sign-in.svg`: new, unchanged official asset.
3. `third-party/inventory.json`: official branding asset's source/member/hash/terms entry.
4. `THIRD_PARTY_NOTICES.md`: specific logo provenance and resolved Google asset source/status.
5. `public/third-party-notices.txt`: current branding attribution/terms reference; original license bodies preserved.
6. `README.md`: remaining uncertainty now refers to generation-time Antigravity terms.
7. `docs/OSS_GOVERNANCE_PHASE1.md`: this current verification report.

Backend files, LICENSE texts, package manifests, lockfiles, original notice texts, SyncSpace logo, original readiness audit, AuthContext, existing runtime/CORS changes, and unrelated local work are unchanged. No permanent unit-test prototype or extra project dependency was retained.

## Verification results

| Executed check | Result and limit |
|---|---|
| `corepack yarn build --outDir /tmp/syncspace-phase1c-dist --emptyOutDir` with explicit synthetic public variables | Passed: TypeScript and written Vite production build. No deployment. |
| `corepack yarn exec eslint src/features/auth/components/GoogleLoginButton.tsx` | Passed. Unrelated global lint baseline was not refactored or re-audited. |
| Targeted Vitest prototype | Could not run: existing `@testing-library/dom` peer missing. The prototype also initially exposed a missing `screen` type export during compilation; it was removed, dependencies unchanged, and the final production compilation passed. |
| `corepack yarn test:run` | Failed: no matching test files in the final checkout. No test success is claimed. |
| `node /tmp/syncspace-phase1c-browser.mjs` | Passed for six theme/viewport scenarios: native activation, focus, asset geometry/loading, disabled behavior, redirect boundary, no normal-viewport overflow; no page or console errors. Two additional zoom diagnostics described below. |
| Contrast checker | Text `#1f1f1f`/white: 16.48:1; approved border `#747775`/white: 4.53:1; light focus on dark background passes. Original brand art is not recolored. |
| Asset/archive byte checks and notice hashes | Official SVG matches archive; build copies both SVGs and current notices unchanged; full MIT and original upstream texts retained. |
| Notice versions and backend runtime classification | 103 client versions match Yarn lock; 94 API runtime entries match Composer lock/installed layout; dev entries excluded from runtime list. |
| Private artifact/credential-pattern scan | Passed for the listed file/key patterns and synthetic build configuration. |
| Markdown, license/metadata, baseline preservation and diff-scope checks | Passed: canonical MIT/metadata, 202 original notice references, 272 Markdown destinations, exact seven client-file changes and no backend changes; all earlier local work preserved. |
| `git diff --check` in both repositories | Passed in both repositories. |

At 320px with CSS zoom set to 200% (effective layout width about 160px), the auth shell overflows in both themes. Removing the Google button from the DOM reproduces the overflow, so it is an existing shell limitation rather than this button's regression. The asset's aspect ratio remains intact. No full-page 200% zoom/accessibility pass is claimed; fixing the surrounding layout is outside this focused branding change.

A complete provider sign-in, mobile on-screen-keyboard test, administrator inbox/notification test, and backend release packaging were not performed. Backend tests were not rerun because no backend application code changed. Existing dependencies, source notice text and all pre-existing modifications were preserved.

## Maintainer decision register

| Item | Disposition | Required next action |
|---|---|---|
| Original-code MIT/holder | Resolved and preserved. | Keep upstream material outside the first-party grant. |
| Adopted maintenance/branches/SemVer | Resolved and preserved. | Apply the policy to future reviewed releases. |
| Google button branding | Resolved for the official-asset implementation and checked states. | Retain source/terms notice; provider app verification is a separate process. |
| Logo generation-time agreement | Personal-account route/date estimate established; exact November 2025 Antigravity-specific conditions unverified. | Obtain the accepted historical agreement or Google confirmation, including any relevant account-country conditions. Logo unchanged, no automatic replacement or relicensing. |
| Written frontend notice inclusion | Verified locally. | Retain legal notice file in eventual deployment artifacts. |
| Backend release method | Undefined; working-layout notices retained but pending files absent from HEAD archives. | Define/review actual source/server package contents when authorized to publish. |
| Security operations | Enabled channel and responsibility verified; delivery/receipt not tested. | Maintainer confirms subscriptions, inbox access and monitored receipt without dummy reports unless separately authorized. |

**PHASE 1 PARTIALLY COMPLETE.** The remaining historical terms gap prevents formal provenance closure. Successful documentation/build checks do not establish unconditional logo rights, a completed security-response workflow, or broader application readiness.

## Delivery gate for the changed control and authored report

- R-23/R-37/R-31 PASS: official asset use explicitly authorized; Design Read/dials and each major button decision's purpose recorded. Existing logo unchanged.
- R-03/R-25/R-32/R-34 PASS within the checked control scope: 44px target, preserved geometry, visible 2px focus and keyboard activation, normal viewport checks and both CSS themes. Existing shell zoom limitation disclosed separately.
- R-26/R-35 PASS within scope: actual written build and Chromium click/Enter/Space checks reach the unchanged redirect handler; no console/page errors. No claim of provider completion or whole-product verification.
- R-02/R-17/R-18/R-36/R-38 PASS for authored prose: factual English, source-backed terms statements, no fabricated rights, contacts, tests, endorsement or acceptance. Upstream notice copies remain unedited.
- Purpose/quality rules PASS for this button: approved artwork supplies identity and typography, restrained focus is functional, no unrelated layout/card/background/motion additions. Copy, human and UI supplements checked for the scoped change; no new data view or source-comment cleanup.
