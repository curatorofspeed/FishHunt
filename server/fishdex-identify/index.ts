// ============================================================
// FISHDEX · identify  (Supabase Edge Function, Deno)  v3
// Server-side species identification. The Anthropic key lives ONLY
// here as a secret; the app never sees it. FishDex has no accounts yet,
// so access is gated by an origin allowlist plus per-device daily caps
// (fishdex_id_tick, SECURITY DEFINER, service-role only).
//
// Deploy: verify_jwt false (custom checks below). Secret: ANTHROPIC_API_KEY
// (shared with Tyre Hunt's verify on this project).
// v3: the structured-output schema uses plain types only (the API rejects
//     minimum/maximum/maxItems and nullable unions); 0 length = unknown,
//     confidence is clamped and alternates trimmed here instead.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEFAULT_MODEL = "claude-sonnet-5";
const MODELS = new Set(["claude-sonnet-5", "claude-opus-5", "claude-haiku-4-5-20251001"]);
const DAY_CAP = 40;        // identifications per device per day
const MIN_GAP_MS = 4000;   // between two calls from one device
const ORIGINS = new Set([
  "https://curatorofspeed.github.io", "http://localhost:8790", "http://127.0.0.1:8790",
  "capacitor://localhost", "ionic://localhost", "http://localhost",
]);

function cors(origin: string) {
  const o = ORIGINS.has(origin) ? origin : "https://curatorofspeed.github.io";
  return {
    "Access-Control-Allow-Origin": o, "Vary": "Origin",
    "Access-Control-Allow-Headers": "content-type, x-fishdex-device",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
function json(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(origin), "Content-Type": "application/json" } });
}

type Sp = { id: string; n: string; sci: string };

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "POST only" }, 405, origin);
  if (origin && !ORIGINS.has(origin)) return json({ error: "origin not allowed" }, 403, origin);
  if (!ANTHROPIC_KEY) return json({ error: "identification is not configured" }, 503, origin);

  const device = String(req.headers.get("x-fishdex-device") || "");
  if (!/^[a-z0-9]{6,40}$/.test(device)) return json({ error: "missing device id" }, 400, origin);

  let p: { image_b64?: string; media_type?: string; home?: { region?: string; place?: string }; species?: Sp[]; model?: string };
  try { p = await req.json(); } catch { return json({ error: "bad json" }, 400, origin); }
  const b64 = String(p.image_b64 || "");
  if (!b64) return json({ error: "no image" }, 400, origin);
  if (b64.length > 8_000_000) return json({ error: "image too large" }, 413, origin);
  const mediaType = ["image/jpeg", "image/png", "image/webp"].includes(String(p.media_type)) ? String(p.media_type) : "image/jpeg";
  const species = (Array.isArray(p.species) ? p.species : []).filter((s) => s && /^[a-z0-9]{1,32}$/.test(String(s.id)))
    .slice(0, 600).map((s) => ({ id: String(s.id), n: String(s.n || "").slice(0, 60), sci: String(s.sci || "").slice(0, 80) }));
  if (species.length < 5) return json({ error: "species list missing" }, 400, origin);
  const ids = new Set(species.map((s) => s.id));
  const model = MODELS.has(String(p.model)) ? String(p.model) : DEFAULT_MODEL;
  const region = String(p.home?.region || "").slice(0, 80), place = String(p.home?.place || "").slice(0, 60);

  // --- per-device rate limit (server-authoritative) ---
  const admin = createClient(SB_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  try {
    const { data, error } = await admin.rpc("fishdex_id_tick", { p_device: device, p_cap: DAY_CAP, p_gap_ms: MIN_GAP_MS });
    if (error) console.error("TICK", error.message);
    else if (data && data.ok === false) return json({ error: data.why === "too fast" ? "too fast, try again in a moment" : "daily identification limit reached", n: data.n }, 429, origin);
  } catch (e) { console.error("TICK FAILED", String(e).slice(0, 200)); }

  // --- call Anthropic (key never leaves the server) ---
  const list = species.map((s) => `${s.id}: ${s.n} (${s.sci})`).join("\n");
  const schema = {
    type: "object", additionalProperties: false,
    required: ["species_id", "confidence", "alternates", "estimated_length_in", "fish_present", "note"],
    properties: {
      species_id: { type: "string" }, confidence: { type: "number" },
      alternates: { type: "array", items: { type: "string" } },
      estimated_length_in: { type: "number" }, fish_present: { type: "boolean" }, note: { type: "string" },
    },
  };
  const system = "You identify fish for FishDex, a worldwide angling registry. Return only the JSON requested. Choose species_id from the provided list (use the id before the colon); use \"unknown\" when no fish is visible or none of the listed species fits. confidence is 0 to 1. alternates are up to three other plausible ids from the list. estimated_length_in is the total length in inches only when a reliable size reference (hand, ruler, rod grip, known object) is visible; otherwise 0. Keep note under 20 words.";
  const text = `Identify the fish in this photo. The angler's home waters: ${region}${place ? " (" + place + ")" : ""}; species that occur there are more likely, but any listed species is possible.\n\nSpecies list:\n` + list;
  let o: { species_id?: string; confidence?: number; alternates?: string[]; estimated_length_in?: number; fish_present?: boolean; note?: string };
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model, max_tokens: 600, thinking: { type: "disabled" },
        output_config: { format: { type: "json_schema", schema } },
        system,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
          { type: "text", text },
        ] }],
      }),
    });
    if (!r.ok) {
      const body = await r.text();
      console.error("ID UPSTREAM", r.status, body.slice(0, 300));
      return json({ error: "identifier upstream " + r.status }, 502, origin);
    }
    const data = await r.json();
    if (data.stop_reason === "refusal") return json({ error: "the identifier declined this photo" }, 422, origin);
    const txt = (data.content || []).map((b: { type: string; text?: string }) => (b.type === "text" ? b.text : "")).join("").replace(/```json|```/g, "").trim();
    o = JSON.parse(txt);
  } catch (e) {
    console.error("ID FAILED", String(e).slice(0, 300));
    return json({ error: "identifier failed" }, 502, origin);
  }

  // --- validate against the list the app sent; the server owns the shape ---
  const sp = o.fish_present && o.species_id && ids.has(String(o.species_id)) ? String(o.species_id) : null;
  const alternates = (Array.isArray(o.alternates) ? o.alternates : []).map(String).filter((id) => ids.has(id) && id !== sp).slice(0, 3);
  const conf = typeof o.confidence === "number" ? Math.max(0, Math.min(1, o.confidence)) : null;
  const len = typeof o.estimated_length_in === "number" && o.estimated_length_in > 0 && o.estimated_length_in < 200 ? Math.round(o.estimated_length_in * 10) / 10 : null;
  return json({ species: sp, confidence: conf, alternates, length: len, fish_present: o.fish_present === true, note: String(o.note || "").slice(0, 160), model }, 200, origin);
});
