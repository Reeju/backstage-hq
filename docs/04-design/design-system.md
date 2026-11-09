# BackstageHQ design system (MVP mockups)

Shared rules for every screen. Code for these lives in `assets/app.css` (components) and
`assets/tailwind-config.js` (Tailwind setup). Mockups use Tailwind utility classes for layout and these
shared classes for components.

## Principles
1. Phone first, one hand. Desktop is the same screens with a side menu and a wider column.
2. Calm. Warm off-white background, one teal accent, plenty of space, plain words.
3. One obvious next tap per card (Approve, Send, Confirm). Everything else is secondary.
4. Rupees are always exact, Indian grouping (Rs 1,20,000), never abbreviated in figures that matter.
5. AI is always violet, always labelled, always with a source link and an explicit human approval.
6. Never show a guess for money or tax: show "needs a CA check", "not checked", or an error instead.

## Colour (Tailwind default palette names, hex shown for contrast)
| Role | Colour | Use |
|---|---|---|
| Background | `#FAFAF8` | Page |
| Surface / line | `#FFFFFF` / `#E7E5E4` (stone-200) | Cards, dividers |
| Text | `#1C1917` (stone-900); secondary `#57534E` (stone-600, 7.5:1) | |
| Brand (teal-700) | `#0F766E`, dark `#115E59`, soft `#F0FDFA` | Primary buttons, links, active nav |
| AI (violet-700) | `#6D28D9`, soft `#F5F3FF`, line `#DDD6FE` | Every AI suggestion, draft, source link |
| Attention / owed (amber-800) | `#92400E`, soft `#FFFBEB` | Money owed, warnings, "check this" |
| Danger (red-700) | `#B91C1C`, soft `#FEF2F2` | Scam, overdue, errors, destructive |
| Success (green-800) | `#166534`, soft `#F0FDF4` | Paid, verified, send-rule notes |
| Mockup-only gap marker | `#BE185D` pink dashed | Placeholder choices (not part of the product) |

Colour is never the only signal: every status chip has words, and warnings carry an icon or label.
All text pairs above meet WCAG AA (4.5:1).

## Type and spacing
- System font stack (Noto Sans Devanagari for Hindi). Body 16px, secondary 14px, card title 18px, big figures 32px bold.
- Spacing steps of 4px; cards use 16px padding and 12px gaps; page padding 16px (24 to 32px on desktop).
- Radius: cards 14px, buttons 10px, chips full.

## Components
| Component | Class | Notes |
|---|---|---|
| Buttons | `.btn` + `-primary`, `-secondary`, `-danger`, `-ai`, `-ghost`, `-sm`, `-block` | Min height 44px (NFR-041). One primary per card |
| Card / row | `.card`, `.row` | Rows min 56px high |
| Chip | `.chip` + `ok`, `warn`, `bad`, `ai`, `brand` | Status and category labels |
| Tabs | `.tabs` | Horizontal scroll, 44px targets |
| Form | `.field`, `.input`, `.check`, `.err` | Visible label, hint, inline error with `role="alert"` |
| AI suggestion | `.ai-box`, `.draft`, `.src` | Header tag "AI suggestion", per-value source link, buttons Edit / Confirm; nothing saved or sent until tapped |
| Send-rule note | `.gate` | Green padlock line: "Nothing is sent until you tap" |
| Banners | `.banner` + `info`, `warn`, `bad`, `ok` | Errors use `role="alert"`, results use `role="status"` |
| Empty state | `.empty` | Icon, one sentence on why, one next action |
| Loading state | `.skel` | Skeleton rows; `prefers-reduced-motion` stops the shimmer |
| Error state | `.banner.bad` | Say what failed, that nothing was lost or half-sent, and the retry action |
| Toast | script | Short confirmation with Undo where the action can be reversed |
| Modal / sheet | `.modal-bg`, `.modal` | Bottom sheet on phone, centred on desktop |
| Navigation | shell in `app.js` | Phone: bottom bar (Today, Inbox, Leads, Money, More). Desktop: side menu. A "Waiting" pill with the queue count is on every screen. Assistant button bottom right |

## State pattern (required on every data screen)
Each data screen shows Normal, Loading, Empty and Error. Where relevant it also shows Free plan
(paid feature gated with a plain explanation and Upgrade, never a broken screen, FR-290), and
screen-specific states (for example "Likely scam", "Revoked", "Payment failed"). The dark mockup bar
at the top switches states; `#loading`, `#empty` and so on work as links.

## How AI suggestions are shown, edited and approved
1. Violet box with the tag "AI suggestion" (or "Drafted by assistant").
2. Every value has a source link; missing values are called out ("Missing") rather than guessed.
3. The person can edit any value or the whole draft.
4. Approval is an explicit tap: Confirm (records), Create lead, Approve and send. Until then nothing is saved or sent.
5. Anything leaving BackstageHQ goes through the approval queue (S-17) or the draft screen (S-11), shows recipient, sending account and reason, and carries the green send-rule note.
6. If anyone edits an approved item, it returns to the queue (send gate, FR-236).
7. The assistant never approves its own work; money confirmations show a confirmation card.
8. When the AI is down: "unavailable, try later" with a manual route; reminders in automatic mode and sending still work (NFR-045).

## Accessibility checklist (WCAG 2.1 AA)
- Tap targets at least 44px; visible focus ring (3px teal); skip link on every page.
- Every input has a visible label; errors are text, linked and announced.
- Headings in order; landmarks (`main`, `nav`); live regions for loading and results.
- Colour is never the only signal; text contrast at least 4.5:1; 200% zoom works because layout is fluid.
- Motion respects `prefers-reduced-motion`.

## Writing style
Plain, short, friendly, second person. Say what happened and what happens next. No jargon (say "second check", not "2FA"). Tax outputs carry "Not tax advice" on the same screen (FR-152).
