# FishDex server

One Supabase edge function, `fishdex-identify`, on project `kokxlzygppakgcebkygc` (shared with Tyre Hunt; the
`ANTHROPIC_API_KEY` secret is already set there). The app posts a photo, its home region and the species list;
the function calls Claude (Sonnet 5 by default), validates the answer against that list, and returns
`{species, confidence, alternates, length, fish_present, note, model}`.

Access: no accounts yet, so the function checks an origin allowlist (GitHub Pages, localhost, Capacitor) and caps
each device at 40 identifications a day with a 4-second gap, via `fishdex_id_tick` (SECURITY DEFINER, service-role
only; see `migrations/`). The photo is not stored.

Deploy: `supabase functions deploy fishdex-identify --no-verify-jwt` from a checkout with this folder under
`supabase/functions/`, or through the Supabase MCP `deploy_edge_function` as it was first deployed.
