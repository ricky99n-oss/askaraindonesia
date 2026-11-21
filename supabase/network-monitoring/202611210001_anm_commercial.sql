begin;
create extension if not exists pgcrypto with schema extensions;

create table public.anm_licenses (
  id uuid primary key default gen_random_uuid(),
  label text not null check (length(label) between 1 and 120),
  customer_email text not null check (length(customer_email) <= 254),
  user_id uuid references auth.users(id) on delete set null,
  key_hash text not null unique,
  key_hint text not null,
  plan text not null default 'professional' check (plan in ('starter','professional','enterprise')),
  status text not null default 'active' check (status in ('active','suspended','revoked')),
  expires_at timestamptz not null,
  max_devices integer not null default 1 check (max_devices between 1 and 100),
  max_monitored integer not null default 50 check (max_monitored between 1 and 4096),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.anm_activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.anm_licenses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null check (length(device_id) between 16 and 128),
  device_name text not null check (length(device_name) between 1 and 120),
  revoked_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (license_id, device_id)
);
create table public.anm_activation_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index on public.anm_activation_attempts(user_id, attempted_at);
create index on public.anm_activations(user_id, device_id);
create index on public.anm_licenses(user_id);
create table public.anm_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  license_id uuid references public.anm_licenses(id) on delete set null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create table public.anm_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  created_at timestamptz not null default now()
);
create index on public.anm_locations(user_id);
create table public.anm_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  location_id uuid not null references public.anm_locations(id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  ip_address inet not null check (family(ip_address) = 4 and masklen(ip_address) = 32
    and (ip_address <<= inet '10.0.0.0/8' or ip_address <<= inet '172.16.0.0/12' or ip_address <<= inet '192.168.0.0/16')),
  is_monitored boolean not null default true,
  created_at timestamptz not null default now(),
  unique (location_id, ip_address)
);
create index on public.anm_devices(user_id);
create table public.anm_monitoring_logs (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.anm_devices(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  latency double precision check (latency >= 0 and latency <= 60000),
  packet_loss double precision not null default 0 check (packet_loss between 0 and 100),
  status text not null check (status in ('online','offline')),
  created_at timestamptz not null default now()
);
create index on public.anm_monitoring_logs(user_id, created_at desc);
create index on public.anm_monitoring_logs(device_id, created_at desc);
create table public.anm_ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  location_id uuid not null references public.anm_locations(id) on delete cascade,
  summary text not null,
  recommendation text not null,
  raw_response jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create function public.anm_has_license() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.anm_licenses l join public.anm_activations a on a.license_id=l.id
    where l.user_id=auth.uid() and a.user_id=auth.uid() and a.revoked_at is null
    and l.status='active' and l.expires_at > now());
$$;

create function public.anm_license_status(p_device_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare l public.anm_licenses; a public.anm_activations;
begin
  if auth.uid() is null then return jsonb_build_object('valid',false,'message','Silakan login.'); end if;
  select ax.* into a from public.anm_activations ax
    join public.anm_licenses lx on lx.id=ax.license_id
    where ax.user_id=auth.uid() and ax.device_id=p_device_id and ax.revoked_at is null
    and lx.user_id=auth.uid() and lx.status='active' and lx.expires_at>now()
    order by lx.expires_at desc limit 1;
  if a.id is null then return jsonb_build_object('valid',false,'message','Lisensi belum aktif, kedaluwarsa, atau akses perangkat dicabut.'); end if;
  select * into l from public.anm_licenses where id=a.license_id;
  update public.anm_activations set last_seen_at=now() where id=a.id;
  return jsonb_build_object('valid',true,'license_id',l.id,'plan',l.plan,'expires_at',l.expires_at,
    'max_devices',l.max_devices,'max_monitored',l.max_monitored,'key_hint',l.key_hint,'server_time',now());
end; $$;

create function public.anm_activate_license(p_key text, p_device_id text, p_device_name text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare l public.anm_licenses; a public.anm_activations; email text;
begin
  if auth.uid() is null then return jsonb_build_object('valid',false,'message','Silakan login.'); end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  delete from public.anm_activation_attempts where user_id=auth.uid() and attempted_at<now()-interval '1 hour';
  if (select count(*) from public.anm_activation_attempts where user_id=auth.uid() and attempted_at>now()-interval '15 minutes')>=10
    then return jsonb_build_object('valid',false,'message','Terlalu banyak percobaan. Tunggu 15 menit.'); end if;
  insert into public.anm_activation_attempts(user_id) values(auth.uid());
  if length(p_key)>100 or length(p_device_id) not between 16 and 128 or length(p_device_name) not between 1 and 120
    then return jsonb_build_object('valid',false,'message','Data aktivasi tidak valid.'); end if;
  select * into l from public.anm_licenses where key_hash=encode(extensions.digest(upper(regexp_replace(p_key,'[^A-Za-z0-9]','','g')),'sha256'),'hex') for update;
  select lower(u.email) into email from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null;
  if l.id is null or l.status<>'active' or l.expires_at<=now() or email is null or lower(l.customer_email)<>email
    or (l.user_id is not null and l.user_id<>auth.uid()) then
    return jsonb_build_object('valid',false,'message','Kunci tidak valid untuk akun ini atau masa berlaku telah berakhir.');
  end if;
  select * into a from public.anm_activations where license_id=l.id and device_id=p_device_id;
  if a.revoked_at is not null then return jsonb_build_object('valid',false,'message','Akses perangkat telah dicabut. Hubungi admin.'); end if;
  if a.id is null and (select count(*) from public.anm_activations where license_id=l.id and revoked_at is null)>=l.max_devices
    then return jsonb_build_object('valid',false,'message','Batas perangkat tercapai. Hubungi admin untuk melepas perangkat.'); end if;
  update public.anm_licenses set user_id=auth.uid(),updated_at=now() where id=l.id;
  insert into public.anm_activations(license_id,user_id,device_id,device_name) values(l.id,auth.uid(),p_device_id,p_device_name)
    on conflict(license_id,device_id) do update set last_seen_at=now(),device_name=excluded.device_name;
  insert into public.anm_audit_logs(actor_id,action,license_id) values(auth.uid(),'license.activate',l.id);
  return public.anm_license_status(p_device_id);
end; $$;

create function public.anm_admin_license(p_actor uuid,p_id uuid,p_values jsonb,p_key_hash text default null,p_key_hint text default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result uuid;
begin
  if not exists(select 1 from public.askara_internal_team where id=p_actor and is_active=true and role in ('admin','owner','super_admin'))
    then raise exception 'FORBIDDEN'; end if;
  if p_id is null then
    insert into public.anm_licenses(label,customer_email,plan,status,expires_at,max_devices,max_monitored,key_hash,key_hint)
    values(p_values->>'label',lower(p_values->>'customer_email'),p_values->>'plan',p_values->>'status',
      (p_values->>'expires_at')::timestamptz,(p_values->>'max_devices')::int,(p_values->>'max_monitored')::int,p_key_hash,p_key_hint) returning id into result;
  else
    update public.anm_licenses set label=p_values->>'label',plan=p_values->>'plan',status=p_values->>'status',
      expires_at=(p_values->>'expires_at')::timestamptz,max_devices=(p_values->>'max_devices')::int,
      max_monitored=(p_values->>'max_monitored')::int,updated_at=now() where id=p_id returning id into result;
    if result is null then raise exception 'NOT_FOUND'; end if;
  end if;
  insert into public.anm_audit_logs(actor_id,action,license_id,details)
    values(p_actor,case when p_id is null then 'license.create' else 'license.update' end,result,p_values - 'customer_email');
  return result;
end; $$;

create function public.anm_admin_device(p_actor uuid,p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare lid uuid;
begin
  if not exists(select 1 from public.askara_internal_team where id=p_actor and is_active=true and role in ('admin','owner','super_admin'))
    then raise exception 'FORBIDDEN'; end if;
  update public.anm_activations set revoked_at=now() where id=p_id returning license_id into lid;
  if lid is null then raise exception 'NOT_FOUND'; end if;
  insert into public.anm_audit_logs(actor_id,action,license_id,details) values(p_actor,'device.revoke',lid,jsonb_build_object('activation_id',p_id));
end; $$;

create function public.anm_enforce_device_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare cap integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,1));
  if not exists(select 1 from public.anm_locations where id=new.location_id and user_id=new.user_id) then raise exception 'Lokasi tidak valid'; end if;
  select max(l.max_monitored) into cap from public.anm_licenses l join public.anm_activations a on a.license_id=l.id
    where l.user_id=new.user_id and a.user_id=new.user_id and a.revoked_at is null and l.status='active' and l.expires_at>now();
  if cap is null or (new.is_monitored and (select count(*) from public.anm_devices where user_id=new.user_id and is_monitored and id<>new.id)>=cap)
    then raise exception 'Batas perangkat monitoring tercapai atau lisensi tidak aktif'; end if;
  return new;
end; $$;
create trigger anm_devices_limit before insert or update on public.anm_devices for each row execute function public.anm_enforce_device_limit();

alter table public.anm_licenses enable row level security;
alter table public.anm_activations enable row level security;
alter table public.anm_activation_attempts enable row level security;
alter table public.anm_audit_logs enable row level security;
alter table public.anm_locations enable row level security;
alter table public.anm_devices enable row level security;
alter table public.anm_monitoring_logs enable row level security;
alter table public.anm_ai_insights enable row level security;
revoke all on public.anm_licenses,public.anm_activations,public.anm_activation_attempts,public.anm_audit_logs from anon,authenticated;
revoke all on public.anm_locations,public.anm_devices,public.anm_monitoring_logs,public.anm_ai_insights from anon,authenticated;
grant select,insert,update,delete on public.anm_locations,public.anm_devices to authenticated;
grant select,insert on public.anm_monitoring_logs,public.anm_ai_insights to authenticated;
grant usage on sequence public.anm_monitoring_logs_id_seq to authenticated;
grant all on public.anm_licenses,public.anm_activations,public.anm_activation_attempts,public.anm_audit_logs,public.anm_locations,public.anm_devices,public.anm_monitoring_logs,public.anm_ai_insights to service_role;
grant usage,select on sequence public.anm_audit_logs_id_seq,public.anm_monitoring_logs_id_seq to service_role;
create policy anm_locations_owner on public.anm_locations for all to authenticated using(user_id=auth.uid() and public.anm_has_license()) with check(user_id=auth.uid() and public.anm_has_license());
create policy anm_devices_owner on public.anm_devices for all to authenticated using(user_id=auth.uid() and public.anm_has_license()) with check(user_id=auth.uid() and public.anm_has_license() and exists(select 1 from public.anm_locations where id=location_id and user_id=auth.uid()));
create policy anm_logs_read on public.anm_monitoring_logs for select to authenticated using(user_id=auth.uid() and public.anm_has_license());
create policy anm_logs_insert on public.anm_monitoring_logs for insert to authenticated with check(user_id=auth.uid() and public.anm_has_license() and created_at between now()-interval '5 minutes' and now()+interval '1 minute' and exists(select 1 from public.anm_devices where id=device_id and user_id=auth.uid()));
create policy anm_insights_read on public.anm_ai_insights for select to authenticated using(user_id=auth.uid() and public.anm_has_license());
create policy anm_insights_insert on public.anm_ai_insights for insert to authenticated with check(user_id=auth.uid() and public.anm_has_license() and exists(select 1 from public.anm_locations where id=location_id and user_id=auth.uid()));
revoke all on function public.anm_has_license(),public.anm_license_status(text),public.anm_activate_license(text,text,text),public.anm_enforce_device_limit(),public.anm_admin_license(uuid,uuid,jsonb,text,text),public.anm_admin_device(uuid,uuid) from public,anon,authenticated;
grant execute on function public.anm_has_license(),public.anm_license_status(text),public.anm_activate_license(text,text,text) to authenticated;
grant execute on function public.anm_admin_license(uuid,uuid,jsonb,text,text),public.anm_admin_device(uuid,uuid) to service_role;

comment on table public.anm_licenses is 'Lisensi ANM. Hash kunci saja; pengelolaan melalui API admin Askara.';
notify pgrst, 'reload schema';
commit;
