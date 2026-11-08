# ADR-012: Authentication and sessions

**Status:** Proposed · Needs owner sign-off (S6 in `architecture.md` §26)

## Context
FR-001 (phone code or Google), FR-002 (second factor of a different kind on a new device; none for 30
days on a known device), NFR-027 (30-day inactivity, sign out everywhere within 1 minute), FR-262
(revoke ends a manager's sessions at once), second checks for sensitive actions (FR-004, FR-210,
FR-212), account recovery never through support alone (E9), Indian SMS rules (A8).

## Decision
- Django auth with **server-side sessions** in Postgres. django-allauth for Google sign-in. **MSG91**
  for SMS codes (DLT-registered template). SES for email codes.
- Codes hashed, 5-minute expiry, 5 wrong tries lock for 15 minutes.
- Trusted-device cookie (random, stored hashed). A new device or more than 30 days since its last
  sign-in requires a second factor of a different kind.
- Step-up: a one-time code grants a single-use, 5-minute token bound to the session and purpose.
- Recovery needs two independent factors (email code and Google). Staff use passkey or authenticator.

## Options considered
| Option | For | Against |
|---|---|---|
| **Own Django auth + allauth + MSG91 (chosen)** | Instant revocation; fits per-workspace rules and step-up; India SMS | More security-sensitive code we own |
| AWS Cognito | Managed; MFA built in | Awkward custom flows; SMS in India through AWS needs its own DLT setup; tokens harder to revoke instantly |
| Firebase / Identity Platform | Easy phone sign-in | Another cloud; still need our own sessions and rules |
| JWT tokens | Stateless | Cannot be revoked instantly without a deny-list |

## Consequences
- Auth tickets are tier A and in scope for the external security review (NFR-029).
- SMS templates must be registered before beta (lead time).
