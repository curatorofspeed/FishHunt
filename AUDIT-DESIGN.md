# Fish Hunt — Impeccable Design Pass

**Scope:** `index.html` (every screen, sheet and the camera) · **Method:** judged against the product brief and the six mocks → screenshots plus an automated layout scan at 360, 375, 390 and 430px → one anchored patch script (`.audit/design_patch.py`) replayed onto the post-audit backup → every change re-checked live, with the contrast measurer re-run so the accessibility floor could not regress.

This pass follows `AUDIT.md`, which covered the accessibility floor. The visual identity stayed: dark navy, the mountain header, serif titles and the script tagline. What changed is craft and fidelity to the brief.

**Severity guide for design:** 🔴 visible breakage (clipping, collisions, broken graphics) · 🟠 gaps against the brief on the defining screens · 🟡 consistency and rhythm · 🟢 minor polish.

## Findings by severity

### 🔴 Critical

**Oversized icons.** Three inline icons had no size, so each filled its container.

| Where | Rendered size | Effect |
|---|---|---|
| More, profile card chevron | 244px | Name squeezed into a one-word column |
| Review, species chevron | 205px | Covered the species name |
| Review, "Released" segment icon | 136px | Filled the segment |

→ **Fixed:** chevrons and segment icons have explicit sizes. After: 0 oversized icons at every width scanned.

**Profile truncation.**
- The standing card clipped 9 labels at 375px and 10 at 360px, including leaderboard names, XP values and the "Global" tab.
- The region and home-waters tiles truncated "Pacific Northwest" and "Puget Sound North" at every width.

→ **Fixed:** the standing card stacks under 440px, and the tiles sit one per row. After: 0 clipped labels.

**Feed caption collision.** The Latin name ran under the length pill on the photo. → **Fixed:** the caption and stat pills share one bottom row, and the Latin name ends with an ellipsis.

**Camera layout.** Several parts collided or broke:
- The "Align fish" hint and the bottom frame corners sat under the controls panel.
- The option tiles squeezed into four-line stacks.
- After the hint moved, the camera-unavailable message ran through the frame corners.

→ **Fixed:**
- The frame and hint are now part of the layout flow between the species bar and the controls.
- The tiles stack their icon over the label, and "Auto-detect size" is now "Auto size".
- When there is no camera, the frame and hint hide.

### 🟠 High

**Fish art read as clip art.** Every species used flat shapes, cartoon eyes and a gray lozenge for silhouettes. That covered the Registry, Trophy Room, Verdict, Feed, species pages and Home. The brief says to avoid cartoon graphics and make the fish the hero. Several species also used the wrong body plan: walleye drawn as a pike, perch and shad as sunfish, and Pacific cod as a catfish.

→ **Fixed with a field-guide renderer:**
- **Body plans.** 16 of them, including salmon, trout, grayling, bass, panfish, perch, cod, pike, catfish, carp, sturgeon, rockfish, flatfish, shark, eel and tuna.
- **Bodies.** Countershaded, with scale texture, species markings clipped to the body, a lateral line and gill plate, translucent fins with rays, and eyes with an iris and highlight.
- **Registry plates.** Underwater cards in three palettes for fresh, salt and sea-run water.
- **Demo "photos".** Lit underwater stills with light shafts, bokeh and a lake bed.
- **Silhouettes.** A dark shape with a rim light that reads clearly against the plate.

Real catch photos still replace the demo scenes.

**Header wordmark detached from its logo.** The logo button's centered text alignment centered "Fish Hunt" inside the wider tagline box. → **Fixed:** a left-aligned lockup, as in the mocks.

**Page titles wrapped.** The script tagline squeezed the titles: "Community / Feed", "Catch / Map", "Welcome back, / Drew". → **Fixed:** the title spans the full row, and the subtitle and tagline share the next row. All titles now fit on one line at 360px.

**Verdict reward row was untidy.**
- The XP banner rendered as "+ 1,149 XP", split by a gap.
- The banners were uneven: two lines on the left, one on the right.
- The registry line broke mid-phrase.
- "#1" was the species' list position, not registry progress.

→ **Fixed:**
- One XP token.
- Equal-height banners.
- "Species Registry: 17 / 72", or "#17 / 72 new" for a new discovery.
- The hero photo frame glows in its tier color, for a card-pack feel.

**Home recent trophy was a 96px thumbnail.** The brief makes photography the hero. → **Fixed:** an image-first card with the tier tag and a personal-best badge.

### 🟡 Medium

**Next target spoiled the collection language.** It showed the undiscovered species in full color, while the registry uses silhouettes. → **Fixed:** a silhouette plate.

**Orphans and stray line breaks.**
- Challenges: "+5,000 / XP".
- Trophy Room stats: "160 / 3,080 / XP".
- Registry dates: "Jun 28, / 2026".
- Nav at 360px: "Trophy / Room".

→ **Fixed:** XP values and nav labels no longer wrap. Registry cards show month and year. Subtitles use balanced wrapping.

| Width | Orphans before | Orphans after |
|---|---|---|
| 375px | 30 | 16 |
| 360px | 56 | 26 |

The remaining orphans are natural two-word wraps in three-column cards, such as "Largemouth / Bass".

**Registry count crowded its label.** The "17 / 72" glyphs touched "discovered". → **Fixed:** more spacing.

**Map header crowding.** The privacy pill forced the title and subtitle to wrap. → **Fixed:** the pill sits on its own row under the header.

### 🟢 Low — noted, not changed

**Type scale drift.** The app uses 27 distinct font sizes, from 9 to 44px. Consolidating them touches almost every template, so it's recommended below rather than done here.

## Verified

- **Before and after screenshots.** Home (top and trophy card), Registry, Trophy Room, Verdict (hero and reward row), Profile (tiles and standing), Feed, Review, a species page, and the camera in both states. At 360px: Home, Feed, camera and the bottom nav.
- **Layout scan on the final build, at 360 and 375px.** 0 clipped labels, 0 text overlaps, 0 oversized icons, no horizontal overflow.
- **Layout scan at 390 and 430px, before the last two fixes.** 0 clipped labels and 0 oversized icons. The only two flags were the profile tile and the registry count, which those fixes addressed.
- **Accessibility floor re-measured.** 1,094 text runs. Only the exempt logo lockup and the inactive VIDEO label fall below threshold.

  | Text | Contrast | Needs |
  |---|---|---|
  | Page titles | 3.38 | 3.0 |
  | Subtitles | 5.09 | 4.5 |
  | Tagline | 7.98 | 4.5 |
  | Map privacy pill | 5.55 | 4.5 |
  | Feed species name over the brightest photo | 8.15 | 3.0 |
  | Feed Latin name over the brightest photo | 10.45 | 4.5 |
  | Tier tags over the brightest photo | 5.14 | 4.5 |
  | "Personal best" badge over the brightest photo | at least 7.42 | 4.5 |

- **ARIA readbacks.**
  - The home trophy card is a named, focusable link.
  - Registry card names include the first-caught month.
  - The map uses the standard header.
  - Verdict reads "+1,150 XP" and "Species Registry: 17 / 72".
  - The camera's "Auto size" tile keeps its pressed state.
  - Profile tiles are one column, and every nav label renders on one line.
- **Camera.** With no camera, the frame and hint are hidden and focus lands on Gallery. With a camera, the frame starts below the species bar and the hint sits between the frame and the controls.
- **Console.** No errors on any reload.

**Limits of this verification:**
- The camera can't run in the preview pane. The camera-working layout was checked by removing the no-camera state.
- Demo scenes are illustrations. Real photos replace them for real catches.

## Recommended (not done)

- **Type scale.** Consolidate the 27 font sizes into about 8 steps. It's mechanical but touches most templates.
- **Imagery.** Use real photography for sample data, store screenshots and marketing, or commission species plates. The new renderer is a strong placeholder, not a photograph.
- **Header look.** The mocks show dark text on a light misty sky. That's still a design decision for Drew.
- **Phone check.** Test the camera layout on a real phone, with a notch and home indicator.
- **Re-running this pass.** `.audit/design_patch.py` replays onto `.audit/index.design-orig.html`, so it's only for reproducing this pass, never after later edits to `index.html`.

---

# Follow-up pass — header direction, honest demo ID, clean seeding, type scale

**Scope:** `index.html`, `manifest.webmanifest`, `README.md` · **Method:** one anchored patch script (`.audit/polish3_patch.py`) replayed onto `.audit/index.polish3-orig.html`, then contrast re-measured on the live render, the layout scan at 375 and 360, keyboard and flow checks in the browser, and every screen rendered with headless Chrome at 375 and 360.

## What changed and why

### Header direction: light sky, navy type

The mocks put dark type on a pale, misty sky on five of six screens. The previous dark veil existed only to make white type pass contrast. → **Changed:**
- The scene is a pale sky with a far, misty ridge under the title band and a darker range, forest and lake under the cards. The hand-over point moves per screen: 205px on screens with a page title, 175px on centred headers, 300px on Profile, 120px on onboarding.
- Header type is navy: wordmark, bell, titles, subtitles, tagline, back buttons, sort button, "Edit Profile", and the profile identity row.
- Cards went from 72% to 93% navy so the first card reads the same as the rest. Chips are solid navy pills, as in the Feed mock.
- The logo is one artwork coloured by context: navy on the sky, light on the camera.
- Onboarding carries its own navy behind the copy, since the copy is bottom-anchored and starts near 230px on short phones.
- `theme-color` and the manifest colour follow the sky, and the iOS status bar style is `default`.

| Header copy on the sky | Before (white on the veil) | After (navy on the sky) |
|---|---|---|
| Wordmark "Fish Hunt" | 2.86 (exempt) | 15.2 |
| Wordmark caps | 2.93 (exempt) | 9.91 |
| Subtitles | 5.09 | 8.71 |
| Tagline | 7.98 | 11.55 |
| Profile name / quote | 3.38 / 4.6 | 14.6 / 9.06 |

### Demo species ID no longer guesses

Without an API key, the review screen used to propose a random species with a small "Demo ID" tag. → **Changed:** demo mode proposes nothing. The species button reads "Choose species" with "Demo mode does not identify photos. Tap to pick." Quick picks come from the angler's own catch history, then common local species. Get Verdict stays disabled until a species is chosen. The camera bar and the screen-reader announcement say the same thing.

### Sample data no longer spams the inbox

Seeding 24 catches left 17 unread notifications. → **Changed:** the seed clears what it generated and leaves one note, "Sample catches loaded". Removing the samples removes the note.

### Vestigial counter

The Verdict header's "1 / 1" meant nothing. → Removed.

### Type scale

27 distinct sizes from 9 to 44px. → **Changed:** ten tokens on the root: 10, 11, 12.5, 14, 15, 17, 20, 24, 30 and 40px, plus a 16px input floor for phones. All 119 size declarations map to a token. The two logotype captions stay at 9px as artwork. Numerals in the four- and three-column strips step down one token so "42.1 in" keeps to one line.

## Verified

- **Contrast, full app at 375×812.** 1,062 text runs, 0 non-exempt failures. The two remaining flags are the inactive VIDEO label and a disabled button, both exempt.
- **Contrast at 360×740.** Onboarding copy 7.53, feed captions over the brightest photo 7.95, tier tags over photos 4.75, no failures on Home, Profile, Registry, Feed, More or Trophy Room.
- **Layout scan at 375 and 360.** 0 clipped labels, 0 text overlaps, 0 oversized icons, no horizontal overflow. Font sizes in use: 9 10 11 12.5 14 15 17 20 24 30 40.
- **Wordmark** fits its row at 375 and 360.
- **Demo flow.** After a photo with no key: species empty, "Demo mode" pill, "Choose species", four quick picks drawn from the catch history, Get Verdict disabled, announcement "Demo mode. Choose the species yourself." After picking: enabled, label "Or:", three alternates.
- **Seeding.** Inbox holds 1 unread item, and the bell reads "Notifications, 1 unread".
- **Meta.** `theme-color` `#eef5fb`, status bar `default`, manifest `theme_color` updated.
- **Screens rendered with headless Chrome** at 375 and 360: Home, Registry, Trophy Room, Profile, Feed, Species, Verdict, Explore, Challenges, Settings, onboarding and the camera.

**Limits of this verification:**
- The preview pane stayed hidden, so no pane screenshots. Headless Chrome stood in. It clamps windows to 500px, so screens were framed in a 375px iframe.
- The measurer only sees photo scrims when they are hit-testable, which is why one intermediate run reported feed captions at 1:1. The final runs include that rule.
- The status bar treatment in an installed iOS app still needs a phone check.

## Recommended (not done)

- **Real photography** for sample data and store screenshots.
- **Phone check** of the light header under a notch and of the camera screen.
