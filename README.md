# Fish Hunt — MVP prototype

Catch → Capture → Identify → Verdict → Collect → Progress.

A single-file, installable web app (PWA) that implements the Fish Hunt MVP brief:
camera-first capture, AI species identification, the Catch Verdict reveal, a 164-species
North American registry scoped to the angler's home waters, Trophy Room, XP/levels, achievements, challenges, a private-by-default
catch map, a local community feed preview, and profile/standing.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (styles, data, engine, screens). No build step. |
| `manifest.webmanifest` | PWA install metadata. |
| `sw.js` | Service worker: offline shell, network-first for the app, cached fonts/map library. |
| `icon.svg` | App icon. `icon-192.png` / `icon-512.png` are referenced but not generated yet (needs an SVG rasterizer). |

## Run locally

```bash
python3 -m http.server 8790 --directory /Users/drew.larrigan/Claude/FishHunt
```

Open http://localhost:8790. The camera needs `localhost` or HTTPS. On a phone, deploy the folder
(Vercel / Netlify / GitHub Pages, same as Tyre Hunt) and "Add to Home Screen".

## Species identification

Two modes, switched in **Settings → Species identification**:

- **Demo mode** (default, no key): the app never guesses. After the photo the angler picks the
  species, with quick picks drawn from their own catch history and then common local species.
- **Claude vision** (developer preview): paste an Anthropic API key. The photo is sent from the
  device straight to the Messages API (`claude-opus-5` by default, JSON-schema output) with the
  164-species list with a note of the angler's home waters; the reply carries `species_id`, `confidence`, up to 3 alternates, and an
  optional length estimate when a size reference is visible.
  *For production this call moves into a Supabase edge function (like Tyre Hunt's `verify`) so no
  key ships in the client.*

## How the verdict is scored

`tierFor(species, length, isPersonalBest)` in `index.html`:

- Base points = species rarity (1–5) × 20.
- Size points from where the length falls on a normal curve built from each species'
  `typ` (typical) and `tro` (trophy) inches: top 2% → 70, top 8% → 55, top 15% → 40,
  top 30% → 25, top 50% → 10.
- Personal best (only when a previous catch of that species exists) → +10.
- Tier thresholds: Common < 40 ≤ Uncommon < 60 ≤ Rare < 90 ≤ Epic < 130 ≤ Legendary.

The "Top N% of registered <species>" figure is the same curve. Both are tunable without touching UI.

XP: catch +50, new species +250, personal best +300, Uncommon +100, Rare +500, Epic +850,
Legendary +1,500, challenge complete +3,500–6,000. Level L needs `120(L−1)² + 80(L−1)` cumulative XP.

## Data

Species: 164 across North America, each tagged with range zones (Pacific Northwest, Alaska, California, Rockies,
Southwest, Plains, Great Lakes, Northeast, Southeast, Texas, Florida, boreal North, and the Pacific, Atlantic, Gulf
and Hawaiian coasts). The registry shows the species for the angler's home state by default, with an "All species"
switch; challenges sort the relevant ones first.

Regions: 13 Washington sub-regions, plus sub-regions for Oregon, Idaho, Montana, British Columbia, Alaska and
California, with every other US state and Canadian province as a fallback. GPS picks the region from bounding boxes,
and the review screen always lets the angler correct it.

All state is on-device: `localStorage` key `fh:state` (catches, XP, settings) and IndexedDB
`fishhunt/photos` (downscaled JPEG blobs keyed by catch id). Exact coordinates never leave the
device; the privacy level (Private / Region / Waterbody / Exact) controls what the feed shows.
Settings → Data has JSON export/import, "Load sample catches", and full erase.

## Dev hooks

- `?demo=1` onboards a fresh device with the sample catches (screenshots, store listings, headless checks).
- `#verdict/latest` replays the Verdict screen for the newest catch.
- `python3 -m http.server` plus headless Chrome renders any screen: headless clamps windows to 500px wide,
  so the checks in `.audit/` frame the app in a 375px iframe.

## Not in this prototype

Accounts/sync, real community feed and leaderboards (both are local previews), push, tournaments,
and everything in the brief's "Later" list.
