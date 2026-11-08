# ADR-002: Managed hosting on AWS Mumbai with a lean beta posture

**Status:** Proposed · Needs owner sign-off (S1 and S4 in `architecture.md` §26)

## Context
We hold PAN, bank details, income and Gmail access for Indian creators. The PRD sets 99.5% uptime,
at most 1 hour of money data lost, recovery within 8 hours (NFR-042, NFR-043), no residency promise
but published regions (D11, NFR-006), and a low cost per creator (M14). The team cannot run servers.
Claude now offers in-country processing in India on Amazon Bedrock (Mumbai and Hyderabad), but not on
Google Vertex in Mumbai.

## Decision
AWS region ap-south-1 (Mumbai), backups and DR in ap-south-2 (Hyderabad). ECS Fargate runs two
services from one container image (web, worker) behind an Application Load Balancer with AWS WAF.
RDS PostgreSQL, S3, KMS (multi-Region keys), Secrets Manager, SES, GuardDuty Malware Protection for S3.
Separate AWS accounts for staging and production under AWS Organizations. Terraform in `infra/`.

**Lean beta posture:** single-zone RDS with point-in-time restore and cross-region backup copies, one
web task, one worker, tasks in public subnets that accept traffic only from the load balancer (no NAT
gateway), and a private database. **v1 posture** (before public launch or about 50 paying creators):
Multi-AZ RDS, at least two web tasks.

## Options considered
| Option | For | Against |
|---|---|---|
| **AWS Mumbai (chosen)** | App, data and AI all in India; very standard; KMS and IAM are strong; multi-Region keys for DR | More setup than a PaaS; NAT and load-balancer costs need care |
| Google Cloud Run (Mumbai) | Simplest containers; scale to zero; Pub/Sub for Gmail is native | Claude not offered in Mumbai on Vertex; AI would leave India or need a second cloud |
| Render / Railway (Singapore) | Least operations work | Data outside India; less control over keys; still needs a separate AI contract |

## Consequences
- Lean beta costs about ₹17–25k a month in total; the v1 posture about ₹29–40k (§24).
- A zone outage in the beta means a restore of 1–2 hours. That is inside the 8-hour target.
- Public subnets without NAT save about $35–45 a month. Tasks still accept no inbound traffic except
  from the load balancer. Revisit at the v1 posture.
- Lock-in: moderate. We use containers, PostgreSQL and object storage, which exist on every cloud.
  Moving would take weeks, not months.
