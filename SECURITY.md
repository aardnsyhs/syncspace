# Security policy

## Maintenance scope

The maintainer accepts responsibility for maintaining the client development branch `master`. This is the initial maintenance baseline; no historical release or backport commitment is implied. Future releases will follow Semantic Versioning, with documented client/API compatibility. Releases depend on reviewed and verified changes, without a fixed schedule or security response-time SLA.

## Private reporting

GitHub Private Vulnerability Reporting is enabled for this repository, verified through GitHub's public REST endpoint on 2026-10-14. Use GitHub's private reporting form; no separate private security email is published in the inspected files.

Open this repository's [Security Advisories](https://github.com/aardnsyhs/syncspace/security/advisories), select **Report a vulnerability**, sign in if prompted, and submit the report privately. If the form becomes unavailable, ask the maintainer for a private channel without including vulnerability details in the public request. Do not post exploitable details, sensitive attachments, or credentials in public issues.

The matching [syncspace-api repository](https://github.com/aardnsyhs/syncspace-api) is part of the same application. Include the affected repository and revision in your private report; cross-repository issues may need coordinated fixes.

## What to include privately

- Affected commit/version, component, runtime, and deployment assumptions.
- Impact and reproduction using synthetic data, with sanitized requests/logs.
- Whether the issue affects the client, API, or both.
- Any suggested mitigation and a contact method for coordination.

Keep reproduction details private until the maintainer coordinates disclosure. No response-time SLA or bounty program is established. The maintainer must assess reports and agree on remediation/disclosure timing; this document does not promise a deadline.

The maintainer accepts responsibility for monitoring private reports in both repositories and coordinating fixes before disclosure. Security-alert subscriptions, email delivery, and report receipt have not been tested. The maintainer should confirm notification preferences and monitored receipt; enabled reporting alone does not prove delivery. The [Phase 1 decision register](docs/OSS_GOVERNANCE_PHASE1.md#maintainer-decision-register) records the remaining operational checks.

## Secrets and dependencies

Never commit `.env` files, application/database keys, OAuth or broadcasting secrets, bearer tokens, private keys, or production logs. Browser `VITE_*` values are public configuration. Example values are placeholders, not deployment credentials. Use synthetic data in tests and issue attachments. If a secret is exposed, revoke/rotate it and coordinate repository-history cleanup with the maintainer.

Report relevant dependency advisories privately with the package/version and advisory reference. Maintainers should check the applicable lockfile and review compatible updates, tests, and release impact. Renovate configuration exists but does not prove that every security update has been reviewed or deployed.
