# ADR-019: Environments and CI/CD

**Status:** Proposed · Amended for CR-001, C12

## Context
The playbook requires CI from iteration 1 (lint, type-check, tests, dependency audit), small tickets,
commits per ticket, and the owner testing staging before release. Code is written by AI builders, so
the pipeline is a main safety net.

## Decision
- **Environments:** local (Docker Compose with fake providers), CI (GitHub Actions with Postgres),
  staging and production in separate AWS accounts. Staging never holds production data.
- **On every push:** ruff, mypy (strict for money, outbound, permissions, rules, crypto modules),
  pytest on real Postgres with RLS, import-linter contracts, migration checks (round trip), uv lock
  check, pip-audit, gitleaks, semgrep, `check --deploy`, and a report of PRD acceptance criteria
  without tests. AI evals on prompt or model changes and nightly. Playwright end-to-end (phone viewport
  + axe) nightly and before production.
- **Delivery:** one ARM64 image per commit in ECR. Merge to `main` deploys staging automatically.
  Production needs manual approval, takes a snapshot, runs migrations, then a rolling deploy with
  automatic rollback. GitHub uses OIDC to AWS (no stored keys).
- Infrastructure is Terraform in `infra/`.
- Dependencies managed with uv (locked hashes).

**Amended for CR-001, C12 (2026-11-11).** Environments follow ADR-023 (staging from V0; a separate
low-cost production from V1). Delivery follows ADR-022:
- CI is unchanged. Images are built once per commit for **linux/amd64** (App Platform runs amd64, so the
  ARM build risk goes away), tagged with the commit SHA, and pushed to DigitalOcean Container Registry.
- Deploy: the workflow renders the App Platform spec from `infra/do/app.<env>.yaml` with the image tag,
  `GIT_SHA` and secrets from the GitHub environment (masked; never committed), then runs
  `doctl apps update --spec ... --wait`. The `PRE_DEPLOY` job runs migrations first; if it fails, the
  new version never receives traffic and the old one keeps serving. A smoke test follows.
- Rollback: redeploy the previous image tag (migrations are expand/contract, ADR-017).
- GitHub authenticates to DigitalOcean with a **scoped API token** kept only in the `staging` (later
  `production`) GitHub environment, rotated every 90 days. DigitalOcean has no GitHub OIDC trust, so this
  is the one stored deploy credential; AWS is not touched by deploys.
- Infrastructure is Terraform in `infra/` with three providers (DigitalOcean, AWS, Cloudflare); state in
  an encrypted, versioned S3 bucket with S3 native locking. PRs run static checks only (fmt, validate,
  tflint, checkov); `plan` and `apply` run from the operator's machine and are recorded in the ticket log.
- Production deploys need a manual approval in the GitHub environment and take an on-demand logical
  backup before migrations.

## Options considered
| Option | For | Against |
|---|---|---|
| **GitHub Actions + Terraform + ECS rolling deploys (chosen)** | Standard, cheap, well known to builders | Terraform has a learning curve |
| AWS CodePipeline | Native to AWS | Clunkier; less familiar |
| AWS CDK instead of Terraform | Infrastructure in Python | Smaller community for reuse; ties infra code to AWS |
| Poetry or pip-tools | Long established | Slower; uv is now the common default |

## Consequences
- Every acceptance criterion is a named test, so the owner can see coverage per FR.
- A failed production deploy rolls back automatically. A bad release is reverted by redeploying the
  previous image (ADR-017).
