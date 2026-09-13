# FishDex — MVP prototype

Catch → Capture → Identify → Verdict → Collect → Progress.

A single-file, installable web app (PWA) that implements the FishDex MVP brief:
camera-first capture, AI species identification, the Catch Verdict reveal, a 348-species
worldwide registry scoped to the angler's home waters, Trophy Room, XP/levels, achievements, challenges, a private-by-default
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

Photos are identified on the server. The app posts the photo, the home region and the species list to the
`fishdex-identify` Supabase edge function (see `server/`), which holds the Anthropic key, asks Claude Sonnet 5 for
a structured answer, validates the species id against the list it was sent, and returns species, confidence,
up to three alternates, an optional length estimate (only when a size reference is visible) and a short note.
The app never holds a key. Photos are not stored. Each device gets 40 identifications a day with a four-second
gap, enforced in Postgres; offline, the camera falls back to picking the species yourself with quick picks from
your history and common local species.

Developer path: Settings → Developer options accepts an Anthropic API key and model; with a key set the app calls
Anthropic directly from the device instead of the server (useful for prompt work, never for real users).

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
Legendary +1,500, trophy fish (at or past the species' trophy length) +1,000, fully verified catch +100,
today's hunt +150, season complete +2,000–2,500, challenge complete +3,500–6,000.
Level L needs `120(L−1)² + 80(L−1)` cumulative XP. All of it lives in `XP`, `TIERS`, `SEASONS` and `CHALLENGES`.

## The game layer

The collection is the reward; XP is the progression layer. Home is **Your FishDex**: species discovered in
your home waters, level, new species this month, and then:

- **Today's hunts.** Pick one of three each day (new species, PB, rarity). The next qualifying catch
  completes it for +150 XP. Stored as `S.hunt = {date, kind, done}`; sample catches never complete a hunt.
- **Your next hunts.** Derived, never stored: the easiest species you haven't caught in home waters, beating
  the PB in your most-fished group, five species this month, and the most relevant unfinished challenge.
- **Collections.** Salmon, Trout & char, Bass & panfish and Saltwater within the registry scope. Each row opens
  the FishDex with that filter, and "Next unlock" prices the next discovery in XP.
- **Seasons** (`SEASONS`). Date windows that repeat every year: Fall Salmon (Sep 1 – Nov 30), Winter Steelhead,
  Spring Trout, Summer Warmwater, Fall Redfish and Hard Water. Catching every listed species inside the window
  earns a permanent badge and XP once per year (`S.seasonsDone[id-year]`). Home shows the active season for your
  waters; Challenges lists every active season on top; finished ones sit under Achievements as seasonal trophies.
- **Species levels.** Every species card climbs Caught → Verified (photo, identified species, timestamp) →
  Trophy (trophy length, or a Legendary catch). Stars on registry cards, a ladder on the species page.
- **Verification ladder** on catch detail: Unverified → Photo → Species → Size → Fully verified (photo,
  species, time and GPS).
- **PB deltas.** The verdict and the inbox say by how much a record fell; species pages show the gain this year.
- **Badges** added: Ten / Twenty-five / Fifty Species, First Trophy, Five Personal Bests, Verified Century.
  Badges introduced after a user's first session unlock quietly at boot (`backfillAch`).

## Data

Species: 348 worldwide. Every species carries range zones; the North American zones are joined by Australia (east, south,
tropical north, Murray-Darling), New Zealand, the UK and Ireland, the Nordics, western and central Europe, the
Mediterranean, Japan (with a Hokkaido/Tohoku zone), South Africa, Brazil and the Amazon, Mexico (Baja, Pacific, Gulf,
Caribbean, inland), Central America, the Caribbean, and catch-all zones for the rest of Europe, Asia, Africa, South
America and Oceania. Cosmopolitan fish carry regional names (`aka`: bluefish is also Tailor, Elf and Shad) that the
species search matches. The Fishdex shows the species for the angler's home territory by default, with an "All species"
switch; registry chips (Salmon, Coarse & Carp, Bream & Snapper, Reef & Jacks) appear only where those fish live.

Territories: 13 Washington sub-regions plus sub-regions for Oregon, Idaho, Montana, British Columbia, Alaska and
California; every other US state and Canadian province; and 63 territories abroad, from Australian states and New
Zealand islands to UK nations, European countries, Japanese regions, South African provinces, Brazilian and Mexican
regions, Central America and the Caribbean, with "Elsewhere in…" fallbacks per continent. GPS picks the region from
bounding boxes (checked against 200 world cities in `.audit/global_data.py`), and the review screen always lets the
angler correct it. The home-region picker groups sub-regions by state at home and by country abroad.

Units: catches are stored in inches and pounds. Display and entry follow the angler's units, which default from home
waters (inches and pounds in the US and Canada, centimetres and pounds in the UK and Ireland, centimetres and kilograms
everywhere else) and can be overridden in Settings.

Seasons and slams cover the new markets too: Snapper Season, Barra Run-off, the Coarse Season Opener, Pike Season,
Midnight Sun Salmon, Ayu Season, the Sardine Run, the Amazon Dry Season, Mediterranean Tuna, Kiwi Summer and Baja Blue
Water, plus 22 regional slams. Home shows only seasons relevant to your waters; Challenges lists at most two far ones.

All state is on-device: `localStorage` key `fh:state` (catches, XP, settings) and IndexedDB
`fishhunt/photos` (downscaled JPEG blobs keyed by catch id). Exact coordinates never leave the
device; the privacy level (Private / Region / Waterbody / Exact) controls what the feed shows.
Settings → Data has JSON export/import, "Load sample catches", and full erase.

## Design

Dark-first. Every screen opens on a drawn sunset scene that fades into the page; titles are Inter 800. Home is the
angler's status board: level pill, conditions for the home region (Open-Meteo, region centre only, cached 30 minutes,
degrees follow the units setting), stat tiles, Today's hunts, the hero Recent catch card, the active season, next
milestones and a Collections rail. The bottom nav is Home · FishDex · Record · Trophy Room · More; the map, challenges,
feed and regional collections live under More.

## Dev hooks

- `?demo=1` onboards a fresh device with the sample catches (screenshots, store listings, headless checks).
- `#verdict/latest` replays the Verdict screen for the newest catch.
- `.audit/frame.html?u=<app url>&w=375&h=812&js=<code>` frames the app and runs `js` inside it after boot, so a headless
  shot can set up state first (choose a hunt, commit a catch, open the verdict).
- `python3 -m http.server` plus headless Chrome renders any screen: headless clamps windows to 500px wide,
  so the checks in `.audit/` frame the app in a 375px iframe.

## Not in this prototype

Accounts/sync, real community feed and leaderboards (both are local previews), push, tournaments,
and everything in the brief's "Later" list.
