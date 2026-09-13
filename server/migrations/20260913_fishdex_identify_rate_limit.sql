-- FishDex species identification: per-device daily caps for the fishdex-identify edge function.
-- Applied to project kokxlzygppakgcebkygc on Sep 13 2026 (migration name fishdex_identify_rate_limit).
create table if not exists public.fishdex_id_calls (
  device text not null,
  day date not null default current_date,
  n int not null default 0,
  last timestamptz not null default now(),
  primary key (device, day)
);
revoke all on public.fishdex_id_calls from public, anon, authenticated;

create or replace function public.fishdex_id_tick(p_device text, p_cap int, p_gap_ms int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r record;
begin
  insert into fishdex_id_calls (device, day, n, last) values (p_device, current_date, 0, now() - interval '1 day')
  on conflict (device, day) do nothing;
  select * into r from fishdex_id_calls where device = p_device and day = current_date for update;
  if r.n >= p_cap then return jsonb_build_object('ok', false, 'why', 'daily cap', 'n', r.n); end if;
  if now() - r.last < make_interval(secs => p_gap_ms / 1000.0) then return jsonb_build_object('ok', false, 'why', 'too fast', 'n', r.n); end if;
  update fishdex_id_calls set n = n + 1, last = now() where device = p_device and day = current_date;
  return jsonb_build_object('ok', true, 'n', r.n + 1);
end $$;
revoke execute on function public.fishdex_id_tick(text, int, int) from public, anon, authenticated;
grant execute on function public.fishdex_id_tick(text, int, int) to service_role;
