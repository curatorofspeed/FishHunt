# Fish Hunt — Impeccable Audit & Polish Pass

**Scope:** `index.html` (the whole app: 24 screens and states, 3 sheets, the camera room) · **Method:** floor scan → contrast measured on the live render at four phone sizes → one anchored patch script run from the pristine backup → every fix driven in the browser.

Contrast was measured, not eyeballed. A measurer sampled the real paint stack under every visible text run: element backgrounds and gradients, opacity groups, rasterized inline SVGs, and the mountain scene re-rendered from its live CSS. Photos and camera video count as arbitrary, so they were scored at the worse of pure white and pure black. **Before:** 1,093 text runs, 59 failing groups. **After:** 1,097 runs, every non-exempt run passes.

## Findings by severity

### 🔴 Critical

**Keyboard-dead cards and rows.** Eleven clickable templates were `<div>`s with click handlers and no `tabindex`. They covered the home cards, Explore and More rows, all 72 registry cards, trophy cards, catch rows, challenge pills, the registry challenge box and species-picker rows. The registry, Trophy Room and home actions could not be reached without a pointer. → **Fixed:** a shared `enhance()` pass gives every `[data-go]` / `[data-pick]` element `tabindex="0"`. Navigation gets `role="link"` and the picker gets `role="button"`. Enter activates, and Space also activates buttons. Rich cards carry the visible information in their name, for example "Chinook Salmon, caught, Epic, personal best 42.1 inches, first caught Sep 8, 2026".

**No focus indication.** There were zero `:focus-visible` rules, and inputs had `outline:none`. → **Fixed:** a global ring (2px `#9fd0ff`, 2px offset) with a 5px navy halo, so it stays visible over bright photos. A `forced-colors` variant switches to `CanvasText`. The `outline:none` is gone.

### 🟠 High

**Header text over the scene failed on every screen.**

| Text | Before | After | Needs |
|---|---|---|---|
| Page titles | 1.87–2.26 | ≥ 3.38 | 3.0 |
| Subtitles | 1.87–3.12 | ≥ 5.09 | 4.5 |
| Script tagline | 2.60 | ≥ 4.75 | 4.5 |
| Profile name / quote | 2.22 / 3.53 | pass | 3.0 / 4.5 |

The scene was also `position:fixed`, so any card scrolled into the bright top band failed too. Examples: the verdict tier name fell to 1.09, species labels to 1.46, locked achievements to 1.7.

→ **Fixed in two steps:**
- The scene now scrolls with the page. This is the root cause of every scrolled-card failure.
- The veil was re-solved row by row at 360×740, 375×812, 390×844 and 430×932, for the least darkness that clears every title, subtitle and header icon. The old veil ran 0.08 → 0.35 at 22% → 0.82 at 40% → opaque at 60%. The new one runs 0.08 → 0.31 at 70px → 0.66 from 120 to 240px → 0.87 at 340px → opaque at 487px. It is never lighter than before at any row.

The visible effect is a moodier sky behind the titles, and the mountains no longer stay pinned while scrolling.

**Text over photos and live video was unreadable in the worst case.**

| Element | Before | After (worst case) |
|---|---|---|
| Feed species name / Latin name | 1.00 | 9.86 / 10.28 |
| Tier tags on photos | 1.31–1.82 | 5.14 |
| "View Photo" pill | 1.00 | 9.66 |
| Camera title / subtitle | 1.00 | 7.32 / 5.95 |
| Camera hint | 4.02 | pass |
| Capture options | 3.23 | pass |

→ **Fixed:**
- a bottom scrim on feed photos
- a 0.88 navy backing under tier tags that sit on photos
- a backing on the View Photo pill
- a top scrim in the camera
- the hint pill raised from 0.72 to 0.82
- the capture-controls gradient now starts at 0.62

**Button and selection blues below AA.** Minimal bumps came from `contrast.py --fix`:

| Element | Before | After |
|---|---|---|
| Primary buttons, selected chips (white on top stop) | `#3b8fe6` 3.36 | `#3177c0` 4.64 (4.77 measured at the text) |
| Selected segments, Following button | `#1f7ae0` 4.27 | `#1e76d9` 4.52 |
| Leaderboard "you" row | ice text 4.38 | white text 4.95 |

**Faint token below AA on raised surfaces.** `--fog` `#6f86a3` measured 4.24 on cards, 4.35 on solid glass and 4.04 on inputs and pills. → `#798ea9` measures 4.73, 4.84 and 4.50. It still sits well below `--mist` (7.87 on the same surface), so the hierarchy holds. Placeholders now use this token explicitly.

**Locked achievements were hard to read.** Opacity 0.55 on the whole card dropped descriptions to about 3.5. → Only the badge is dimmed now.

**Map attribution link.** `#0078a8` measured 3.08. → `#005c81` measures 4.59.

**Camera controls lied about their state.**
- Flash cycled Auto/On/Off and did nothing.
- "Add length" and "Add weight" had no handler.
- "Auto-detect size" showed a green active state that couldn't change.
- The species bar had a chevron and no action.
- VIDEO looked selectable.

→ **Fixed:**
- Flash drives the camera torch where the device exposes one. Otherwise it is disabled and reads "Unavailable".
- Add length and Add weight open a validated entry sheet that pre-fills the review.
- Auto-detect size is a real toggle, and without an API key it explains what it needs.
- The species bar opens the species picker.
- VIDEO is dimmed and hidden from assistive tech.

**The camera kept running after leaving it.** X, Back and Species Guide navigated away with the stream still live, so the camera light stayed on. A permission prompt that resolved after leaving also started the camera. → The stream stops on every route change away from capture, and a late stream is stopped at once.

**Shutter stuck after backgrounding.** Returning to the app left the camera stopped, with "Camera is still starting" forever. → The camera restarts on return.

**Double submits and duplicate paid calls.**
- Any re-render during identification started another request, such as tapping Kept/Released, privacy or an alternate species. With an API key, each one is a paid Claude call, and the finished request could wipe what the angler was typing.
- A double-tapped shutter processed two photos.
- Share could fire twice, and cancelling the share sheet fell through to a download.

→ **Fixed:** single-flight guards on identification, photo capture and share, with `aria-busy` while working. Typed input is preserved, and cancelling a share now cancels.

### 🟡 Medium

**Sheets weren't real dialogs.** They had `role="dialog"` but no modal flag or label, no focus management and no Escape, and the page behind stayed focusable. → Now `aria-modal`, labelled by their title, with focus moved to the first control and Tab trapped in both directions. Stray focus is pulled back, Escape closes the top layer, the page behind is `inert`, and focus returns to the trigger. The full-screen camera is a modal dialog too: Escape closes it and focus returns to the Record button.

**The whole page was a live region, and toasts were silent.** `<main aria-live="polite">` re-announced the entire screen on every render, while toasts were created on the fly with no role. → The live region is removed from `main`. A persistent `role="status"` toast region exists from page load, and a screen-reader status line announces identification results, measurements and the verdict summary.

**Focus lost and page reset on every re-render.** Filters, favorites and segments rebuilt the view, which dropped focus to `<body>` and scrolled to the top. → Same-screen re-renders keep the scroll position and put focus back on the same control. Route changes move focus to the page heading and update the tab title.

**Unlabelled form fields and state.** Labels weren't associated in Settings, Review and onboarding. Segmented controls had no group or selected state. → Added `label[for]`, `role="group"` with a label, and `aria-pressed` on segments, chips, favorites and likes. The onboarding switch is labelled, and icon-only buttons are named (Back, sort, locate). Across 8 screens, 0 controls remain unnamed, and all decorative icons are `aria-hidden`.

**Nested interactive control.** The favorite button sat inside the trophy-card link. → It is now a sibling overlay.

**Reduced-motion gaps.** The kill switch skipped `::before`, so the legendary shimmer kept spinning. The staged verdict reveal (about 3.5s), XP count-up and confetti ignored the preference, and the map animated. → Pseudo-elements are covered. The verdict now appears at once with its final XP and no confetti, and map animations are off.

**iOS zoom on focus.** Inputs were 15px and map filter selects 13.5px. → Both are 16px under 760px.

**Small targets.** Back buttons were 20px wide. → They now have a 40×40 hit area with no visual change.

### 🟢 Low

- `::selection` is styled to the brand.
- The disabled shutter is dimmed.
- The nav is labelled "Primary" with `aria-current`, the bell announces the unread count, and map markers have names.
- Canvas share cards printed HTML entities in names (for example `O&#39;BRIEN`) and now print plain text.

### Exempt, left as is

- **Header logo lockup.** "Fish Hunt / CATCH · EXPLORE · COLLECT" is a logotype, exempt under WCAG 1.4.3. It now measures 2.83 / 2.97, up from 2.34 / 2.04.
- **VIDEO label.** It measures 2.76, and it's an inactive, `aria-hidden` indicator.
- **Decoration.** Borders, dividers and progress tracks are decorative and were not changed.

## Verified

- **Real Tab keypress.** The trophy card matched `:focus-visible` with the 2px ring and navy halo, confirmed by computed style. The screenshot shows the ring on the favorite button over a photo.
- **Real Enter on a card** opened the catch, with focus on its heading and the tab title "Pink Salmon · Fish Hunt". Real Space on a link did nothing, as expected.
- **Favorite toggle.** Focus returned to the same button after re-render. Scroll stayed at 650px.
- **Confirm dialog.**
  - Labelled "Delete this catch?", with focus on Cancel and the page behind inert.
  - Tab from the last button wraps to Cancel, and Shift+Tab from the first wraps to Delete.
  - Stray focus is pulled back to Cancel.
  - Escape closes it, focus returns to Delete, and nothing is deleted.
- **Sheet over the camera.** The first Escape closes only the sheet, and focus returns to Add length.
- **Camera dialog.**
  - Labelled "Record Catch", with focus inside on Gallery.
  - Flash is disabled with "Unavailable", and Tab and Shift+Tab wrap.
  - Add length saved 24.5, announced it and returned focus.
  - Weight 900 was rejected with an error and the sheet stayed open.
  - A picker row is a named button, and Space selected Chinook Salmon and returned focus.
  - Escape closed the camera, focus returned to Record, and the stream was stopped.
- **Camera stream** stops when navigating away.
- **Guards.**
  - A double photo call wrote once, and 3 re-renders during identification made 1 call.
  - Text typed during identification was kept.
  - A double share call made 1 card, with `aria-busy` set while working and cleared after.
- **Reduced motion.** 8 of 8 verdict sections revealed immediately, XP read 850, no confetti appeared, and the verdict was announced.
- **Toast.** `role="status"`, polite, present from page load outside the inert app, and the text was delivered.
- **CSS readbacks.**
  - The reduced-motion rule covers `::before`.
  - The forced-colors ring uses `canvastext`, and `::selection` is present.
  - Inputs are 16px, `--fog` is `#798ea9`, and the scene is `absolute`.
  - No outline declaration targets inputs.
- **Contrast after.** Every non-exempt text run passes at 375×812. The photo and video overlays were re-measured with their scrims visible to the measurer.

**Limits of this verification:**
- The preview pane freezes CSS animations at frame 0, so contrast was measured at each animation's end state.
- The pane's Enter key sends no `keypress`, so native `<button>` triggers were opened with focus plus click. Custom cards and rows were driven with real Enter and Space.
- While the pane was off screen, the page had no focus, which means no focus events and no `:focus` matching. The trap and pull-back were driven by dispatching the same key and focus events to the handlers. The ring itself was verified while the pane was visible.
- The camera can't run in the pane, so torch, the shutter busy state and scrims over a live feed still need a real phone.
- Card backdrop blur was ignored, so card text was sampled against the unblurred scene.

## Recommended (not done)

- **Real-phone pass.** Torch support varies: Android Chrome exposes it, and iOS Safari does not. Also run capture → verdict with VoiceOver and TalkBack.
- **Header look.** The mocks show dark text on a light misty sky. That's an alternative to the darker veil, and it's a design decision for Drew.
- **API key in the browser.** Before real users, move species identification behind a server function so no key ships in the page.
- **Re-running this pass.** Tooling lives in `.audit/` (git-excluded): the measurer, the patch script, the solved veil and the pristine backup. `python3 .audit/patch.py` replays this pass onto the pre-audit backup, so only use it to reproduce the audit, never after later edits to `index.html`.
