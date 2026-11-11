# ADR-012: Authentication and sessions

**Status:** Proposed · Sign-in methods amended for CR-001, C4 (2026-11-11); sessions unchanged. (S6 in `architecture.md` §26)

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

## Amendment for CR-001, C4 (2026-11-11)
SMS costs money per message, differs per country, needs DLT registration in India and is open to SIM
swap. The owner adopted GQ3. The methods become:
- **First factor:** an **email code** (6 digits, 5 minutes, hashed, same lock-out and send limits), sent
  through the email adapter (SES, ADR-022). Google sign-in (basic profile only) is added in iteration 2.
  Email is the sign-in identity; `user.email` is required and unique (case-insensitive).
- **Second factor and second check:** an **authenticator app** (TOTP, RFC 6238: 6 digits, 30-second
  steps, one step of clock drift either way, a used step cannot be reused) plus **10 one-time backup
  codes** shown once at setup and stored only as keyed hashes. The seed is encrypted with the platform
  data key (ADR-005, C7). Setup offers a QR code, an "Open in authenticator app" link (`otpauth://`)
  and "Copy setup key", so a creator on one phone can set it up. Libraries: `pyotp` (codes) and `segno`
  (QR as inline SVG); both small, pure Python and widely used.
- **Independence rule:** an email code and Google on the same address are the same kind. The second
  factor is always the authenticator, a backup code, or (where switched on) a phone code; never email or
  Google again.
- **Phone codes:** built behind the per-country setting `PHONE_SIGNIN_COUNTRIES` (empty, so off). Only
  the `SmsClient` interface and a fake client exist until a country is switched on; then a provider
  client (MSG91 for India, after DLT) is added. When on, a phone code may be a first or second factor.
- **Lock-out:** wrong email codes, authenticator codes and backup codes for one account all count toward
  the same 5-try, 15-minute lock.
- **Recovery** (iteration 2): lost authenticator means email code plus a backup code. Lost both: no
  recovery through support alone (E9 unchanged).
- **Staging:** SES sandbox only delivers to verified addresses, so it is the staging allow-list. The
  earlier "SMS to email relay" is not built unless the phone switch is tested on staging.
- MSG91 and DLT registration leave the critical path ("not needed until phone codes are switched on").

## Options considered
| Option | For | Against |
|---|---|---|
| **Own Django auth + allauth; email code first, authenticator second, SMS switchable (chosen; amended for CR-001, C4)** | Instant revocation; fits per-workspace rules and step-up; works in every country at near-zero cost | More security-sensitive code we own; one extra setup step for creators used to phone OTPs (measured, GL-A2) |
| AWS Cognito | Managed; MFA built in | Awkward custom flows; SMS in India through AWS needs its own DLT setup; tokens harder to revoke instantly |
| Firebase / Identity Platform | Easy phone sign-in | Another cloud; still need our own sessions and rules |
| JWT tokens | Stateless | Cannot be revoked instantly without a deny-list |

## Consequences
- Auth tickets are tier A and in scope for the external security review (NFR-029).
- SMS templates must be registered before phone codes are switched on for India (lead time). (Amended for CR-001, C4.)
