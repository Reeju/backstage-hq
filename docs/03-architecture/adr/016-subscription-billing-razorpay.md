# ADR-016: Subscription billing with Razorpay and one entitlements check

**Status:** Proposed

## Context
FR-290 to FR-295 and UC-135: free and paid plans, a trial, monthly or yearly payment by UPI and cards,
a GST invoice from BackstageHQ to the payer, two price points in the beta, downgrade without losing
data. D17 and FR-279: the payer is separate from the owner and paying grants no permissions.

## Decision
- **Razorpay Subscriptions** (UPI Autopay, cards). Signed webhooks stored once by event ID and
  processed by a job. When the creator returns from checkout, the app also fetches the status directly
  so paid features start within a minute.
- `subscription.payer_user_id` is separate from `workspace.owner_user_id`. Paying creates no membership.
- One function, `billing.entitlements(workspace)`, answers "may this workspace use feature X now?".
  It is used by screens, the AI gateway (no AI cost on free for paid features) and the send gate
  (automatic reminders are paid).
- State machine: trialing, active, past_due (7-day retry), free. For manager payers (v1): grace (30
  days), then free. Moving to free pauses automation and deletes nothing.
- BackstageHQ's own GST invoices use a separate number series and are kept as our legal records.

## Options considered
| Option | For | Against |
|---|---|---|
| **Razorpay (chosen)** | Standard Indian gateway; UPI Autopay; good docs | UPI Autopay may need enabling by Razorpay support; debits above ₹15,000 need the customer's PIN (not an issue at our prices) |
| Cashfree | Similar features | Smaller developer ecosystem |
| Stripe | Excellent API | Not open to new Indian merchants |
| Manual invoices for the beta | No integration | Does not test real payment behaviour (M12) |

## Consequences
- The 20-customer beta can still fall back to manual invoices if Razorpay onboarding is slow (PRD I-09).
- Gateway fees (~2% plus GST) belong in the cost model (edit P3).
