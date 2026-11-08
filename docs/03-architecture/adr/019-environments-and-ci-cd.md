# ADR-019: Environments and CI/CD

**Status:** Proposed

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
