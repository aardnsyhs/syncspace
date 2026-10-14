# SyncSpace OSS readiness audit

Audit date: 2026-10-14 (Asia/Jakarta). Scope: the local `aardnsyhs/syncspace` client and `aardnsyhs/syncspace-api` API checkouts, plus read-only GitHub metadata and public security/release endpoints. No application redesign, deployment, remote settings change, commit, or push forms part of this work.

## Executive summary

SyncSpace contains a working build of a React Kanban/workspace client and a Laravel API with resource policies, migrations, broadcasts, and feature tests. Documentation now explains repository-specific installation and configuration without describing the application as production-ready or claiming adoption.

The client builds successfully. The API's isolated feature/unit suite initially had one stale registration expectation; after correcting that test to the existing OTP-required contract, all 62 tests pass. Client lint, missing client test cases, backend formatting, dependency triage, and incomplete integration evidence remain engineering gaps.

Both repositories are public and unarchived according to the connected GitHub metadata tool. Neither has a LICENSE file. API MIT metadata alone does not resolve copyright/provenance or the client's licensing. GitHub Private Vulnerability Reporting is disabled for both. The project therefore remains **BLOCKED BY MAINTAINER DECISIONS**, with additional engineering work required.

## Evidence and scope limits

Client baseline HEAD: `3b7e31e`; API baseline HEAD: `590bd57`. Latest inspected commits in both are dated 2026-05-20. These facts establish prior development, not an ongoing maintenance commitment. Local tags and public GitHub releases were absent when checked.

The initial client working tree already contained changes to `src/lib/echo.ts`, `vite.config.ts`, and untracked `LOCAL-WSL.md`, `ops/`, and `scripts/`. The API already contained changes to `config/cors.php`. Those changes were preserved. Validation reflects the local working trees, including those pre-existing changes, not a clean remote checkout.

Runtime used: Node.js 24.18.0, PHP 8.3.35, Composer 2.10.2. Initial shell Yarn was 1.22.22; the final client declares Corepack-managed Yarn 4.9.2 to match its existing modern lockfile and node-modules linker. No dependency versions or lockfiles were changed.

Evidence labels used below:

- Implemented and verified: exercised successfully by an executed test/build, limited to what that check proves.
- Implemented but not verified: code paths exist; no corresponding live workflow evidence.
- Partially implemented: some required paths exist, but a complete workflow is missing.
- Planned but not implemented: no verified committed plan identified; no planned capability is advertised as available.
- Deprecated or outdated: documentation/test assumptions contradict current source.
- Unknown: external state, ownership, adoption, or behavior not established by inspection.

## Assessment after remediation

| Category | Client | API | Evidence and remaining condition |
|---|---|---|---|
| Licensing | BLOCKED | BLOCKED | No LICENSE file; API `composer.json` says MIT. Maintainer authorization/provenance required. |
| README | READY | READY | Repository-specific prerequisites, commands, limitations, and links now follow source/configuration. READY applies to documentation, not runtime completeness. |
| Contributor experience | NEEDS IMPROVEMENT | NEEDS IMPROVEMENT | Contribution guides/forms added; client has no test cases and lint failures; API style baseline fails. |
| Security | BLOCKED | BLOCKED | SECURITY policies added, but no configured private channel or support policy. Dependency review remains private follow-up. |
| Documentation | READY | READY | Focused setup/configuration/architecture/realtime/testing guides added; local links and paths validated. |
| Engineering quality | NEEDS IMPROVEMENT | NEEDS IMPROVEMENT | Client build and API tests pass; lint/formatting/test-coverage gaps and no tracked CI remain. |
| Project governance | NEEDS IMPROVEMENT | NEEDS IMPROVEMENT | No supported release/review cadence or ownership evidence beyond repository account access. No invented SLAs or CLA. |
| Repository hygiene | NEEDS IMPROVEMENT | NEEDS IMPROVEMENT | Environment ignore rules/forms improved; existing Renovate retained. API scaffold Node assets have no committed lockfile. |
| OSS adoption readiness | BLOCKED | BLOCKED | Public source and useful workflows are evidenced; license grant, ownership, and community usage evidence are unresolved. |

## Initial findings and remediation

Severity reflects impact, not a numeric score. “Safe” means within this task's authorization without additional maintainer decisions.

| Finding | Evidence | Severity and impact | Proposed remediation | Safe? / Outcome |
|---|---|---|---|---|
| Missing license/provenance | No tracked LICENSE in either checkout; API manifest declares MIT. Original descriptions use commercial boilerplate language. | High: redistribution rights/ownership unclear. | Confirm rights, choose license, approve notices. | No; recommendation recorded only. |
| Unsubstantiated maturity | Original client README called the application production-ready and fully functional. | Medium: contributors may rely on unsupported guarantees. | Replace maturity claims with concrete capabilities and evidence limits. | Yes; corrected both READMEs. |
| Package manager mismatch | Client manifest selected Yarn 1; `yarn.lock` has modern metadata version 8 and `.yarnrc.yml` uses `nodeLinker`. | High: fresh install cannot reliably honor lockfile with declared manager. | Pin compatible modern Yarn and verify immutable install. | Yes; manager-only change to 4.9.2, lockfile preserved. |
| Database portability claim | API migrations contain MySQL `MODIFY COLUMN ... ENUM` and SQL aliases; analytics uses `YEARWEEK`. | High: documented PostgreSQL setup fails. | Document MySQL-compatible requirement; discuss portability separately. | Documentation yes; no schema/query refactor. |
| Destructive onboarding command | Both old READMEs recommended `migrate:fresh --seed`. | High: drops existing tables and installs demo accounts. | Use ordinary migration, isolate optional demo initialization. | Yes; corrected. |
| Incorrect template initialization | Default `DatabaseSeeder` never calls `BoardTemplateSeeder`. | Medium: promised global templates absent. | Document explicit template seeding. | Yes; corrected. |
| Registration test outdated | `AuthTest` expected a user/token immediately; controller returns verification-required metadata. | Medium: failing suite conceals contract drift. | Assert OTP-required response, unverified user/OTP record, and absence of issued token. | Yes; one existing test corrected, behavior unchanged. |
| Private disclosure unavailable | Public GitHub REST endpoint returned `enabled: false` for both repositories. | High: no verified private reporting route. | Enable reporting or publish verified private contact. | Remote setting no; conditional policy added. |
| No release/support policy | Local tags absent; GitHub releases API returned empty lists. | Medium: support expectations undefined. | Define supported branch/release and security update expectations. | Decision required; no invented SLA. |
| Missing contribution/community files | Neither checkout had CONTRIBUTING, SECURITY, or `.github` templates. | Medium: onboarding/reporting relies on undocumented knowledge. | Add concise repository-specific guidance and forms. | Yes; implemented. |
| Client checks incomplete | Vitest has setup/mocks but no matching cases; initial ESLint reports 56 errors/4 warnings. | High: no automated client behavior evidence. | Add targeted tests, resolve lint in focused changes, then establish CI. | Follow-up engineering; no broad refactor. |
| API formatting baseline | `vendor/bin/pint --test` reports 170 files with style issues. | Low: noisy review and inconsistent style. | Agree on a separate formatting change; avoid mixing it into docs. | Deferred to avoid unrelated churn. |
| Dependency review needed | Both ecosystem advisory checks require triage; Renovate config exists. | High: applicability and compatible fixes need assessment. | Review privately, test updates, then publish coordinated fixes. | Dependency versions unchanged; no sensitive detail here. |
| Client peer/coverage gaps | Modern Yarn warns about missing peers; coverage provider is absent from manifest. | Medium: test/optional integration setup incomplete. | Review required peers and intended coverage workflow. | Follow-up; do not add unused transports automatically. |
| Partial reminder/expiry features | `notifyDueSoon` has no caller/schedule; public expiry validation exists but enable endpoint accepts no expiry input. | Medium: old feature descriptions overpromise workflow. | Describe these boundaries, decide whether to complete them. | Documentation corrected; behavior preserved. |
| Workspace naming differs | Registered `UserObserver` creates a named team; UserService's separate path uses configured name; Google creation uses both. | Medium: configuration claim inaccurate and duplicate teams possible. | Document actual paths and review consolidation separately. | Documentation yes; lifecycle preserved. |
| Managed broadcasting unverified | Ably server config and client Pusher compatibility branch exist; no live validation. Actual backend array has no `pusher` connection. | Medium: deployment assumptions unreliable. | Document Reverb path and alternate-provider limits. | Yes; configuration guidance corrected. |
| Component reuse overstated | Kanban component imports application controls/hooks despite old claim of standalone use with any backend. | Medium: adoption expectations inaccurate. | Document exported props and actual coupling. | Yes; extension guidance corrected. |
| Incomplete accessibility evidence | Client Kanban registers only `PointerSensor`; no browser-wide keyboard/theme/contrast audit performed. | Medium: keyboard movement incomplete; compliance unproven. | Targeted accessible interaction work and browser verification. | Recorded, no UI redesign. |
| Environment/template hygiene | Existing ignore patterns miss some `.env.*` variants; production template described absent automation and included server-specific examples. | High: accidental configuration exposure risk. | Ignore private env variants, preserve examples, use public placeholders. | Yes; rules and client template updated. |
| CI and asset reproducibility | No tracked workflow in either checkout; API has scaffold package.json but no Node lockfile. | Medium: checks/builds not automated/reproducible. | Establish CI after resolving baselines; decide whether API assets are supported. | Follow-up; no Actions permission/settings changes. |

## Capability verification matrix

API evidence links refer to the matching repository and can be checked against the local paired checkout. These new links will become remotely available only after maintainers merge/publish the corresponding files.

| Capability | Classification | Evidence and limits |
|---|---|---|
| Client compilation/bundling | Implemented and verified | Build runs TypeScript and Vite; does not prove browser flows. |
| Core API board/card/RBAC/checklist/analytics/public-sharing operations | Implemented and verified within tests | API [feature tests](https://github.com/aardnsyhs/syncspace-api/tree/main/tests/Feature) pass on isolated MariaDB with MySQL driver. |
| Registration verification-required boundary | Implemented and verified within test | Corrected existing registration test asserts pending verification and no token. OTP delivery/expiry lifecycle not exercised. |
| Google login/reset/OTP resend | Implemented but not verified end to end | Auth controllers and client routes exist; no provider/mail-service test. |
| WebSocket updates and presence | Implemented but not verified live | Events and channel authorization exist; tests use null broadcaster. No two-browser session. |
| Ably transport | Implemented but not verified | Configuration only; no managed-provider account used. |
| Reminder dispatch | Partially implemented | Service helper, no scheduled caller. |
| Public link expiry configuration | Partially implemented | Model checks expiry; enable/regenerate routes do not expose it. |
| UI themes and data states | Implemented but not comprehensively verified | Source contains theme/data-state paths; no exhaustive click-through/contrast/mobile certification. |
| Keyboard drag/drop | Partially implemented accessibility | Pointer-only sensor registration; no keyboard movement path verified. |
| Global template installation from default seed | Deprecated or outdated claim | Explicit template seeder is required. |
| PostgreSQL/SQLite support | Deprecated or outdated claim | MySQL-specific migrations and queries contradict it. |
| Production readiness, adoption, code/asset ownership | Unknown | No deployment evidence, user metrics, provenance records, or license authorization established. |

## Licensing review

Status: **BLOCKED: MAINTAINER DECISION REQUIRED** for both repositories. No license has been applied, and no copyright holder/year has been invented.

MIT is a short permissive option requiring preservation of license/copyright notices; it lacks Apache's express contributor patent grant. Apache-2.0 provides an explicit patent grant and termination provision and has additional redistribution/notice requirements. Review the [MIT text](https://choosealicense.com/licenses/mit/) and [Apache-2.0 text](https://www.apache.org/licenses/LICENSE-2.0) before deciding.

Conditional recommendation: MIT for both repositories if maintainers confirm ownership and the backend's existing MIT declaration reflects their intent. It fits a permissive reusable application with fewer notice-management requirements. Choose Apache-2.0 instead if an explicit contributor patent grant is a project priority and the owners approve its terms. Neither option resolves missing permission for copied code, paid starter materials, trademarks, or third-party assets.

Dependency/asset inspection found:

- Composer lock license declarations include MIT, Apache-2.0, ISC, BSD-3-Clause, and multiple-choice declarations that also mention GPL. An alternative license list is not proof of a sole GPL obligation; inspect package license texts and the chosen distribution before deciding compatibility.
- Installed client package metadata, including scoped package roots, declares MIT, ISC, Apache, BSD, MPL-2.0, CC-BY-4.0, Python-2.0, and other licenses. Installed metadata is not a complete redistribution inventory of all nested/optional lockfile packages or shipped bundle content. Preserve applicable notices; assess file-level/MPL and attribution obligations for what is distributed.
- [index.html](../index.html) loads Inter through Google Fonts; no font binary is tracked. Inter's upstream [license](https://github.com/rsms/inter/blob/master/LICENSE.txt) is SIL OFL 1.1. A future self-hosted font distribution needs its own upstream notices/terms retained.
- [public/icon-syncspace.svg](../public/icon-syncspace.svg), [src/assets/react.svg](../src/assets/react.svg), embedded Google glyphs, and component provenance need owner/upstream confirmation. Repository account control does not prove ownership or trademark permission. No provenance documentation establishes whether starter/template code was purchased or copied under restrictions.
- No new image, logo, testimonial, customer identity, or visual asset was created by this remediation.

Maintainers should confirm project authorship, contributor permissions, starter-code terms, asset/font provenance, and notice obligations, then authorize matching LICENSE files separately. This review is not a blanket compatibility clearance.

## Changes implemented

Client:

- `README.md`: retains actual stack and product workflows, removes unverified maturity/portability/reuse claims, and links focused guides.
- `CONTRIBUTING.md`, `SECURITY.md`: repository-specific workflow, known check limits, support/contact gaps.
- `docs/CONFIGURATION.md`, `docs/DEVELOPMENT.md`: actual environment reads, extension points, deployment and troubleshooting.
- `docs/OSS_READINESS_AUDIT.md`: joint evidence and remediation record.
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`, `.github/PULL_REQUEST_TEMPLATE.md`: synthetic-data reproduction, validation, and cross-repository compatibility prompts.
- `.env.example`: comment corrections only, preserving values and supported names.
- `env.production.template`: public build-time placeholders, no claim of automatic secret injection or production-specific server example.
- `.gitignore`: private env variants, coverage, and build metadata exclusions with example exceptions.
- `package.json`: package-manager pin only, aligned with the existing lockfile.

API:

- `README.md`: correct non-destructive setup, MySQL-compatible requirement, explicit template initialization, tooling/deployment limits.
- `CONTRIBUTING.md`, `SECURITY.md`: API-specific development, disposable test data, private disclosure gap, no invented support promises.
- `docs/ARCHITECTURE.md`, `docs/CONFIGURATION.md`, `docs/DEVELOPMENT.md`, `docs/REALTIME.md`: data/auth model, settings, test isolation, deployment, channels, and partial functionality.
- The same three `.github` community templates, with API-specific reproduction/environment prompts.
- `.gitignore`: private env variants with example exceptions.
- `tests/Feature/AuthTest.php`: one stale test aligned with the current registration contract, including unverified records and no-token assertions. No executable application behavior changed.

Existing Renovate files remain the single configured dependency automation. No Dependabot config, license, fictitious security email, mandatory CLA, governance promises, or CI permissions were added. The user selected session-only antislop usage, so no AGENTS.md pointers or skill installation were added.

## Verification results

Commands ran from the applicable repository unless noted. Local tool logs include detail that should not be attached to public issues without review.

| Check | Actual outcome |
|---|---|
| Initial `yarn build` (shell Yarn 1.22.22) | Passed on installed dependencies; TypeScript plus Vite build. |
| Initial `yarn lint` | Failed: 56 errors, 4 warnings. |
| Initial `yarn test:run` | Failed: no test files found. |
| `yarn install --frozen-lockfile --ignore-scripts --offline` | Failed with missing cache/resolution; helped expose modern lockfile/Classic mismatch. Not a fresh-install success. |
| Immutable installation with Yarn 4.18.0 and 4.14.1 | Refused lockfile format changes. Their automatic local config additions were removed; final `.yarnrc.yml` is unchanged. |
| `corepack yarn install --immutable --mode=skip-build` with Yarn 4.9.2 | Passed with peer warnings; fetched/linked using unchanged lockfile. Dependency build scripts intentionally skipped in the first validation pass. |
| `corepack yarn install --immutable` with Yarn 4.9.2 | Passed with peer warnings in the normal install mode, without a lockfile change. |
| `corepack yarn build`, `corepack yarn lint`, `corepack yarn test:run` after installation | Build passed; lint failed with the same 56 errors/4 warnings; Vitest failed because no test files exist. |
| `composer validate --strict` | Exit 1: valid schema, but strict warnings for exact Reverb and Pusher version constraints. No dependency constraints changed. |
| `composer check-platform-reqs` | Passed with installed PHP 8.3.35/extensions. |
| `vendor/bin/pint --test` | Failed: 170 files with style issues across 187 checked files. No broad formatting applied. |
| `vendor/bin/pest --configuration=/tmp/syncspace-audit-phpunit.xml` | Initial: 61 passed, 1 stale registration failure. Final: 62 passed, 195 assertions. |
| Dependency advisory checks | Completed with modern Yarn and Composer; private applicability/remediation review required. Classic Yarn's earlier result is not the final security baseline. |
| GitHub connected `get_repo` for both repos | Public, unarchived; default branches `master` (client) and `main` (API). No settings modified. |
| `gh api .../private-vulnerability-reporting` and releases | Failed HTTP 401 due to CLI authentication. No credentials printed. |
| Unauthenticated public REST GET for both repositories' reporting/releases endpoints | HTTP 200: reporting disabled; releases empty. Policies updated from this successful evidence. |
| `python3 /tmp/syncspace-check-docs.py` | Passed: 15 Markdown files, 128 local/paired-repository links, referenced source paths, 10 client variables, 64 API example variables, authored-copy/credential-pattern and environment-ignore checks. Framework hashing config supplies `BCRYPT_ROUNDS`. |
| Node `js-yaml` issue-form parse/ID checks | Passed for all four issue forms. |
| `php -l tests/Feature/AuthTest.php` | Passed. |
| `git diff --check` in both repositories | Passed; reviewed changed tracked files and new documentation/forms; preserved pre-existing changes. |

Test isolation: a temporary MariaDB server used a separate data directory, Unix socket, disabled networking, and disposable `syncspace_audit_test` database. A temporary XML config forced database/socket, empty DB URL, test key, null broadcasting, array mail/cache/session, and sync queue, with a separate nonexistent config-cache path. Application `.env`, database schema/data, and deployment caches were not modified. MariaDB compatibility does not establish every MySQL version works.

Installation/key generation/storage publication/production caching commands were cross-checked against source/tooling; they were not executed against the existing application. Backend scaffold Node assets were not installed or built. No real Google/mail/provider call, exhaustive browser click-through, contrast check, mobile keyboard test, hosted demo, or production deployment was performed. The audit does not claim those checks passed.

## Remaining gaps and maintainer decisions

1. Confirm copyright/provenance and authorize license text for both repositories. Resolve the API's existing MIT metadata consistently.
2. Enable GitHub Private Vulnerability Reporting or supply a verified private reporting contact, then update both SECURITY files and define supported revisions/releases. No settings were changed here.
3. Privately triage dependency findings, assess reachability, and prepare compatible, tested fixes. Avoid publishing package-level sensitive findings before coordination.
4. Add client behavior tests and intended coverage setup, address lint and peer requirements, and agree on focused API formatting work. Establish CI once checks have a useful baseline, with explicit Actions-permission review.
5. Verify signup/OTP/reset/Google flows, live Reverb collaboration, notifications, deployment, upload behavior, keyboard controls, themes, contrast, and mobile/zoom states. Complete or stop advertising partial reminder/expiry workflows.
6. Review observer/service workspace duplication and decide whether database portability is in scope. Neither architectural behavior was changed.
7. Confirm whether backend scaffold assets are maintained; if so, choose and commit a compatible Node lockfile in a separate dependency workflow.
8. Define realistic review/release expectations and gather actual use-case, contributor, or adoption evidence. No arbitrary popularity targets are required by this audit.

## Codex for OSS application readiness

This is an evidence review, not a prediction of selection or an interpretation of current program eligibility.

| Evidence area | Verified facts | Missing evidence |
|---|---|---|
| Active maintenance | Local development history dated May 2026; current remediation prepared locally. | Sustained recent release/review cadence; uncommitted work is not a published project achievement. |
| Technical usefulness | Implemented board/workspace workflows, successful client build, passing isolated API tests. | Independent use cases and live integration/deployment validation. |
| Open-source accessibility | Public, unarchived GitHub repositories with inspectable source. | Explicit authorized license grant and provenance. Public access alone is insufficient. |
| Developer reusability | Paired setup/configuration/extension guides and immutable client installation. | Client regression tests, dependable CI, complete portability/packaging guarantees. |
| Community adoption | No adoption claim made. | Verified users, external contributions, downloads, or other community evidence. |
| Responsible ownership | Repository account association verified; security and contributor guidance prepared. | Rights confirmation, configured private reporting, supported-version/release governance. |

No OpenAI endorsement, program acceptance, adoption metric, security certification, or selection promise is asserted.

## Documentation delivery gate

This gate applies to the authored documentation/configuration comments and the narrow test/tooling change. It is not a clean UI audit of the unchanged product.

- R-02 PASS: authored files scanned for em/en dashes; none remain.
- R-17, R-18, R-36, R-38 PASS: capability and validation claims cite inspected source or executed checks; no invented metrics, people, testimonials, or certification.
- R-23 PASS: no visual assets or navigation UI created; example configuration identifies placeholders.
- R-24, R-26 PASS for documentation links: internal destinations and cross-repository source paths validated locally. New cross-repository guides require publication before remote URLs resolve.
- R-33 PASS: no UI feature or CSS was changed with a rewriting script; prose edits and validation scripts are outside that rule's UI scope.
- R-35 PASS for build evidence: client TypeScript/Vite build and API tests executed. No interactive UI verification is claimed.
- R-15, R-16, R-31 and C-1/C-3/C-5 PASS for prose: instructions name concrete actions, section structure follows installation/use/maintenance needs, and unsupported claims were removed.
- Code-comment supplement PASS for edits: `.env.example` changes only comments; new template comments state public-data constraints. No source-comment cleanup changed application code.
- Copywriting supplement PASS: technical English, explicit actors and factual limitations, no fabricated specifics or decorative marketing language; manual prose review completed.
- UI-only rules R-01, R-03 through R-14, R-19 through R-22, R-25, R-27 through R-30, R-32, R-34, R-37; design dials/liveliness; and C-2/C-4: NOT APPLICABLE to this documentation deliverable. Existing UI keyboard/contrast/state/theme/mobile completeness remains unverified, as recorded above. No UI design or asset work was requested or performed.

## Final status

**BLOCKED BY MAINTAINER DECISIONS.** Documentation and safe community/tooling/test improvements are ready for review. Licensing/ownership and private vulnerability reporting remain mandatory maintainer actions; passing API tests and a client build do not remove the remaining engineering and adoption-evidence gaps.
