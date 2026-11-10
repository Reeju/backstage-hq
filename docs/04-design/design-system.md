# BackstageHQ design system (MVP mockups)

> **Visual style follows the owner's reference (`reference/owner-inbox-mockup.png`), restyled on 2026-11-10.**
> This was a visual restyle only. Screens, states, copy, links, sample data and PRD notes are unchanged,
> except the AI labels, which now read "AI-prepared ..." with a "Needs your approval" chip (see below).
> The reference's own navigation and sample data were not adopted; navigation follows the PRD.

Shared rules for every screen. Code for these lives in `assets/app.css` (components) and
`assets/tailwind-config.js` (Tailwind setup). Mockups use Tailwind utility classes for layout and these
shared classes for components. The visual check in a browser has not been done yet.

## Principles
1. Phone first, one hand. Desktop is the same screens with a top bar, a side menu and, in the Inbox, three panes.
2. Calm and cool. Light cool-grey page, white panels, hairline borders, dark navy text, one bright blue accent, plenty of space, plain words.
3. One obvious next tap per card (Approve, Send, Confirm). Everything else is secondary.
4. Rupees are always exact, Indian grouping (Rs 1,20,000), never abbreviated in figures that matter.
5. AI is always violet, always marked with the sparkle (&#10022;) and an "AI-prepared ..." label, always with a source link and an explicit human approval.
6. Never show a guess for money or tax: show "needs a CA check", "not checked", or an error instead.

## Colour
Contrast ratios use the WCAG formula. Pairs marked with a tinted background are the real pairs used in `app.css`.

| Role | Hex | Contrast and use |
|---|---|---|
| Page background | `#F5F7FA` | Page, sidebar, desktop top bar |
| Surface | `#FFFFFF` | Cards, panes, header |
| Line (hairline) | `#E2E8F0` | Dividers and card borders. Decorative only |
| Control edge | `#718096` | Input and secondary-button borders, 4.0:1 on white (needs 3:1) |
| Text | `#0F172A` (slate-900) | 17.9:1 on white, 16.6:1 on page background |
| Secondary text | `#475569` (slate-600) | 7.6:1 on white, 7.1:1 on page background, about 6.7:1 on soft blue. Used for all grey text. `#64748B` is not used for text because it drops below 4.5:1 on the page background |
| Brand blue | `#2563EB` | White on blue 5.2:1 (primary button, count badge). Blue on white 5.2:1, on page background 4.8:1. Logo, focus ring, progress bars |
| Brand dark (links, active nav text) | `#1D4ED8` | 6.7:1 on white, 6.2:1 on page background, 5.9:1 on active pill `#E8F0FE`, 6.2:1 on soft blue `#EFF6FF`. Primary-button hover |
| Brand soft / pill / chip | `#EFF6FF` / `#E8F0FE` / `#DBEAFE` | Info banner, selected list row / active nav and tab / "Brand pitch" chip. Chip text `#1D4ED8` on `#DBEAFE` 5.5:1 |
| AI (violet-700) | `#6D28D9` | 7.1:1 on white, 6.5:1 on `#F5F3FF`, 5.7:1 on chip `#EDE9FE`. Line `#DDD6FE` |
| Needs approval / owed (amber-800) | `#92400E` | 7.1:1 on white, 6.9:1 on banner `#FFFBEB`, 6.4:1 on chip `#FEF3C7` |
| Danger (red-700) | `#B91C1C` | 6.5:1 on white, 5.9:1 on `#FEF2F2`, 5.3:1 on chip `#FEE2E2`. White on red badge 6.5:1 |
| Success (green-800) | `#166534` | 7.1:1 on white, 6.8:1 on `#F0FDF4`, 6.5:1 on chip `#DCFCE7` |
| Neutral chip | `#334155` on `#F1F5F9` | About 9:1 |
| Mockup bar (not product) | `#0F172A`, links `#93C5FD` | About 9:1 |
| Mockup-only gap marker | `#BE185D` pink dashed | Placeholder choices (not part of the product) |

Colour is never the only signal: every status chip has words, warnings carry an icon or label, the
selected list row has a left bar as well as a tint, the active nav item is bold, and AI is marked
with the sparkle and the words "AI-prepared".

### Why the AI colour stays violet
Violet (hue about 263) is the only hue that is neither the brand blue (217), the amber of "needs
approval", the red of danger, nor the green of success. It keeps its meaning from before the restyle, so
nothing has to be relearned. Brand-blue buttons are solid fills; AI is a soft violet panel with violet
text and the sparkle, so the two cannot be mistaken. Violet is never used for a primary action button
(only the assistant's own Send and its floating button), so "tap blue to act" stays true.

## Type and spacing
- Inter (Google Fonts, weights 400 to 800), then the system stack. Noto Sans Devanagari stays in the stack for Hindi. Body 16px, secondary 14px, card title 18px bold with slightly tight tracking, big figures 32px extra-bold.
- Section labels (sidebar groups, context-panel headings, table headers): 12px, semi-bold, uppercase, letter-spaced.
- Secondary text uses regular weight and `#475569`.
- Spacing steps of 4px; cards use 16px padding and 12px gaps; page padding 16px (24 to 32px on desktop).
- Radius: cards 12px, buttons and inputs 10px, chips 6px (not full pills), tabs full, avatars round.

## Logo
Original drawing modelled on the owner's reference: a rounded-square app icon in brand blue with a bold
white lowercase "b", and a wordmark "backstage" in heavy navy with a smaller blue "HQ" set low.

| File | What |
|---|---|
| `assets/logo-mark.svg` | The icon alone. Use in the phone header, push notification and any square slot |
| `assets/logo.svg` | Icon plus wordmark ("backstage" + "HQ"). Use in the desktop top bar, sign-in, index and the digest email |
| `assets/favicon.svg` | Icon with a heavier "b" for small sizes. Linked from every page by `app.js` and from `index.html` |

- The "b" is drawn from shapes, so it needs no font. The wordmark is live SVG text with the stack Inter, Segoe UI, Helvetica Neue, Arial; its width is fixed (`textLength`), so the lockup keeps its shape even when Inter is missing. It is not converted to outlines, because no font tool was available for this pass. Convert to paths before it is used outside these mockups.
- Clear space: at least half the icon's height on every side.
- Minimum size: icon 20px, full logo 24px high (about 120px wide).
- Do not recolour it (blue and navy only), stretch it, add effects, put it on a busy photo, or use the blue icon on a blue background. On a dark background use the full-colour icon on a white or very light tile.
- The creator's own documents (invoice, credit note and quote PDFs, X-02) carry the creator's details, not the BackstageHQ mark; the mark appears only on things BackstageHQ itself sends (digest email, push).

## Components
| Component | Class | Notes |
|---|---|---|
| Buttons | `.btn` + `-primary`, `-secondary`, `-danger`, `-ai`, `-ghost`, `-sm`, `-block` | Min height 44px (NFR-041). One primary per card. Primary is solid blue with white text; secondary is white with a `#718096` edge |
| Card / row | `.card`, `.row` | White, 1px hairline, 12px radius, no shadow. Rows min 56px high |
| Chip | `.chip` + `ok`, `warn`, `bad`, `ai`, `brand`, `approve` | Soft pastel background, darker text of the same hue, 6px radius, no border. Status and category labels |
| Tabs | `.tabs` | Horizontal scroll, 44px targets. The selected tab is a pale-blue pill with blue text |
| Form | `.field`, `.input`, `.check`, `.err` | Visible label, hint, inline error with `role="alert"` |
| Avatar | `.av` | Round, pale-blue fill `#DBEAFE`, navy initials `#1E3A8A` (about 9:1) |
| AI suggestion | `.ai-box`, `.ai-head`, `.tag`, `.chip.approve`, `.draft`, `.src` | See below |
| Send-rule note | `.gate` | Green padlock line: "Nothing is sent until you tap" |
| Banners | `.banner` + `info`, `warn`, `bad`, `ok` | Errors use `role="alert"`, results use `role="status"` |
| Alert cards | `.card.tone-bad`, `.card.tone-warn` | Scam and hidden-instruction panels on S-07 |
| Empty state | `.empty` | Icon, one sentence on why, one next action |
| Loading state | `.skel` | Skeleton rows; `prefers-reduced-motion` stops the shimmer |
| Error state | `.banner.bad` | Say what failed, that nothing was lost or half-sent, and the retry action |
| Toast | script | Short confirmation with Undo where the action can be reversed |
| Modal / sheet | `.modal-bg`, `.modal` | Bottom sheet on phone, centred on desktop |
| Mockup bar | `.mockbar` | Stays dark; switches states. Not part of the product |

### Shell (in `app.js`)
- **Desktop (900px and up):** a top bar with the logo on the left, a wide rounded search field with a magnifier and a "/" key hint (pressing "/" focuses it), then the workspace name ("Arjun Creates") and a round avatar. Under it, a sidebar and the page. The page header keeps the title and the "Waiting" pill with the queue count.
- **Sidebar:** small uppercase section labels, each item is a line icon, a label and, where there is one, a right-aligned count. The active item is a soft pale-blue pill with blue text. Sections: WORKSPACE (Today, Inbox, Leads, Add a file or photo), MONEY (Invoices, Money, Payments, Tax), REVIEW (Approvals, Activity log), SETTINGS (the seven settings screens). A muted footer shows the user, "Creator workspace, sample data", the sample date and "All actions simulated". Counts shown: Inbox 9 (matches S-06 "All 9", hidden on an empty Inbox) and Approvals 6 (matches the Waiting pill, hidden when nothing waits).
- **Phone:** bottom bar (Today, Inbox, Leads, Money, More) with line icons; header has the logo mark, the page title (or Back), the magnifier (search), the Waiting pill and the avatar. Same cool palette and soft chips.
- **Search (FR-205, S-43):** the top-bar field opens S-43 (type then Enter, or click); "/" focuses it. On a phone, a 44px magnifier button (`.mag`, label "Search") sits in every screen's header, before the Waiting pill, and opens S-43 full-screen with its own field (`.srchp`) and no bottom bar. Result rows are `.sr` (type icon, title, one context line, optional chip) inside `.sg` cards, one per type, with matched words in `<mark>`. Up to 5 rows per group, then a "Show all (N)" button (`.more`). Type chips use the `.tabs` look with `aria-pressed`. A risky message row (`.sr.risk`) carries its scam chip. The "Ask the assistant" row (`.ask`) is violet, paid plans only, under results only, and says nothing is sent or counted until the words are sent in the assistant. No recent searches are shown, because the words are never kept and never placed in the page address.

### Inbox and message detail on wide screens (S-06, S-07)
- Under 768px: one column, list then detail, as before.
- 768 to 1239px: S-06 is one list; S-07 is thread | context (two columns).
- 1240px and up: three panes, list (360px) | thread (flexible) | context (340px). Each pane scrolls on its own. The selected list row has a pale-blue background and a blue left bar.
- S-06 shows the list with the first message selected, its thread and its context (safety check, "what we read" with source links). In the Free-plan state the list stays single-pane, because that plan has no sorting or leads. S-07 shows the same list on the left, with the open message selected, then the thread, then the context panel (deal facts, scam reasons, hidden-instruction warning, source links). Context headings are small uppercase labels.

## State pattern (required on every data screen)
Each data screen shows Normal, Loading, Empty and Error. Where relevant it also shows Free plan
(paid feature gated with a plain explanation and Upgrade, never a broken screen, FR-290), and
screen-specific states (for example "Likely scam", "Revoked", "Payment failed"). The dark mockup bar
at the top switches states; `#loading`, `#empty` and so on work as links.

## How AI suggestions are shown, edited and approved
1. A violet panel headed "&#10022; AI-prepared ..." (for example "AI-prepared suggestion", "AI-prepared draft, in your voice") with an amber **"Needs your approval"** chip on the right whenever a tap would save or send something.
2. Every value has a source link; missing values are called out ("Missing") rather than guessed.
3. The person can edit any value or the whole draft.
4. Approval is an explicit tap on a blue button: Confirm (records), Create lead, Approve and send. Until then nothing is saved or sent.
5. Anything leaving BackstageHQ goes through the approval queue (S-17) or the draft screen (S-11), shows recipient, sending account and reason, and carries the green send-rule note.
6. If anyone edits an approved item, it returns to the queue (send gate, FR-236).
7. The assistant never approves its own work; money confirmations show a confirmation card.
8. When the AI is down: "AI unavailable, try later" with a manual route; reminders in automatic mode and sending still work (NFR-045).
9. Panels that only inform (for example "AI question for you", "AI could not read this", the hidden-instructions warning) carry the sparkle label but no approval chip, because there is nothing to approve.

## Accessibility checklist (WCAG 2.1 AA)
- Tap targets at least 44px; visible focus ring (3px brand blue, 5.2:1 on white); skip link on every page.
- Every input has a visible label; errors are text, linked and announced.
- Headings in order; landmarks (`main`, `nav`, `search`); live regions for loading and results.
- Colour is never the only signal; text contrast at least 4.5:1 (see the table); 200% zoom works because layout is fluid.
- Motion respects `prefers-reduced-motion`.
- Icons are decorative (`aria-hidden`); the logo has the text alternative "BackstageHQ".

## Writing style
Plain, short, friendly, second person. Say what happened and what happens next. No jargon (say "second check", not "2FA"). Tax outputs carry "Not tax advice" on the same screen (FR-152).
