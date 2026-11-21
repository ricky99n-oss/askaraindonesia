begin;

create table public.anm_shop_settings (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  qris_path text not null default '/ruangbocah/qris-askara.jpeg',
  merchant_name text not null default 'Askara Indonesia',
  telegram_token_ciphertext text,
  telegram_webhook_secret_hash text,
  telegram_chat_id text,
  telegram_admin_ids text[] not null default '{}',
  telegram_bot_id text,
  telegram_bot_username text,
  telegram_reviewer_id uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.anm_shop_settings(id) values(true);

create table public.anm_products (
  code text primary key check(code in ('starter','professional','enterprise')),
  label text not null check(length(label) between 1 and 100),
  amount_idr integer not null check(amount_idr between 1000 and 100000000),
  compare_at_idr integer check(compare_at_idr >= amount_idr),
  duration_days integer not null default 30 check(duration_days between 1 and 3660),
  max_devices integer not null check(max_devices between 1 and 100),
  max_monitored integer not null check(max_monitored between 1 and 4096),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.anm_products(code,label,amount_idr,compare_at_idr,max_devices,max_monitored) values
 ('starter','Starter',22000,40000,1,50),
 ('professional','Pro',45000,null,2,256),
 ('enterprise','Enterprise',60000,null,4,1024);

create table public.anm_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique default ('ANM-'||to_char(now() at time zone 'Asia/Jakarta','YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  access_hash text not null unique check(length(access_hash)=64),
  access_token_ciphertext text not null,
  ip_hash text not null check(length(ip_hash)=64),
  customer_name text not null check(length(customer_name) between 1 and 120),
  customer_email text not null check(length(customer_email) between 3 and 254),
  customer_phone text not null default '' check(length(customer_phone)<=30),
  product_code text not null references public.anm_products(code),
  kind text not null check(kind in ('new','renew')),
  amount_idr integer not null check(amount_idr>0),
  duration_days integer not null check(duration_days between 1 and 3660),
  max_devices integer not null check(max_devices between 1 and 100),
  max_monitored integer not null check(max_monitored between 1 and 4096),
  status text not null default 'waiting_payment' check(status in ('waiting_payment','reviewing','approved','rejected')),
  license_id uuid references public.anm_licenses(id),
  key_ciphertext text,
  license_expires_at timestamptz,
  proof_path text,
  proof_mime text,
  proof_hash text check(proof_hash is null or length(proof_hash)=64),
  telegram_message_id bigint,
  rejection_reason text check(length(rejection_reason)<=300),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  payment_deadline timestamptz not null default (now()+interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.anm_orders(ip_hash,created_at);
create index on public.anm_orders(customer_email,created_at);
create index on public.anm_orders(status,created_at desc);
create unique index anm_proof_not_reused on public.anm_orders(proof_hash) where proof_hash is not null and status in ('reviewing','approved');

create table public.anm_order_tasks (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.anm_orders(id) on delete cascade,
  kind text not null check(kind in ('email_created','telegram_review','email_decision')),
  state text not null default 'pending' check(state in ('pending','sending','sent')),
  attempts integer not null default 0,
  locked_until timestamptz,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(order_id,kind)
);

create function public.anm_checkout_order(p_values jsonb,p_access_hash text,p_access_ciphertext text,p_ip_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare product public.anm_products; license public.anm_licenses; result public.anm_orders; email text; name text;
begin
  if not exists(select 1 from public.anm_shop_settings where id and enabled and telegram_token_ciphertext is not null)
    then raise exception 'SHOP_NOT_READY'; end if;
  email:=lower(trim(p_values->>'email')); name:=trim(p_values->>'name');
  if email is null or email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(email)>254 or name is null or length(name) not between 1 and 120
    or coalesce(p_values->>'kind','') not in ('new','renew') then raise exception 'INVALID_ORDER'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_ip_hash,10));
  perform pg_advisory_xact_lock(hashtextextended(email,11));
  if (select count(*) from public.anm_orders where ip_hash=p_ip_hash and created_at>now()-interval '1 hour')>=6
    or (select count(*) from public.anm_orders where customer_email=email and created_at>now()-interval '1 hour')>=3 then raise exception 'ORDER_RATE_LIMIT'; end if;
  select * into product from public.anm_products where code=p_values->>'product' and enabled for share;
  if product.code is null then raise exception 'INVALID_PRODUCT'; end if;
  if p_values->>'kind'='renew' then
    select * into license from public.anm_licenses where key_hash=p_values->>'license_hash' and lower(customer_email)=email and status<>'revoked' for share;
    if license.id is null or license.plan<>product.code then raise exception 'RENEWAL_NOT_AVAILABLE'; end if;
  end if;
  insert into public.anm_orders(access_hash,access_token_ciphertext,ip_hash,customer_name,customer_email,customer_phone,product_code,kind,amount_idr,duration_days,max_devices,max_monitored,license_id)
    values(p_access_hash,p_access_ciphertext,p_ip_hash,name,email,coalesce(p_values->>'phone',''),product.code,p_values->>'kind',product.amount_idr,product.duration_days,product.max_devices,product.max_monitored,license.id) returning * into result;
  insert into public.anm_order_tasks(order_id,kind) values(result.id,'email_created');
  return to_jsonb(result);
end; $$;

create function public.anm_submit_order_proof(p_id uuid,p_access_hash text,p_path text,p_mime text,p_proof_hash text) returns void
language plpgsql security definer set search_path='' as $$
declare result public.anm_orders;
begin
  select * into result from public.anm_orders where id=p_id and access_hash=p_access_hash for update;
  if result.id is null then raise exception 'ORDER_NOT_FOUND'; end if;
  if result.status<>'waiting_payment' or result.payment_deadline<now() then raise exception 'PROOF_NOT_ALLOWED'; end if;
  if p_path not like p_id::text||'/%' or p_mime not in ('image/jpeg','image/png','image/webp') then raise exception 'INVALID_PROOF'; end if;
  update public.anm_orders set status='reviewing',proof_path=p_path,proof_mime=p_mime,proof_hash=p_proof_hash,updated_at=now() where id=p_id;
  insert into public.anm_order_tasks(order_id,kind) values(p_id,'telegram_review') on conflict do nothing;
end; $$;

create function public.anm_review_order(p_id uuid,p_actor uuid,p_approve boolean,p_reason text default null,p_key_hash text default null,p_key_hint text default null,p_key_ciphertext text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result public.anm_orders; license public.anm_licenses; expiry timestamptz;
begin
  if not exists(select 1 from public.askara_internal_team where id=p_actor and is_active and role in ('owner','admin','super_admin')) then raise exception 'FORBIDDEN'; end if;
  select * into result from public.anm_orders where id=p_id for update;
  if result.id is null then raise exception 'ORDER_NOT_FOUND'; end if;
  if result.status in ('approved','rejected') then return jsonb_build_object('changed',false,'status',result.status,'order_code',result.order_code); end if;
  if result.status<>'reviewing' or result.proof_path is null then raise exception 'PAYMENT_NOT_READY'; end if;
  if p_approve then
    if result.kind='new' then
      if p_key_hash is null or length(p_key_hash)<>64 or p_key_ciphertext is null then raise exception 'KEY_REQUIRED'; end if;
      expiry:=now()+make_interval(days=>result.duration_days);
      insert into public.anm_licenses(label,customer_email,key_hash,key_hint,plan,expires_at,max_devices,max_monitored)
      values(result.customer_name,result.customer_email,p_key_hash,p_key_hint,result.product_code,expiry,result.max_devices,result.max_monitored) returning * into license;
    else
      select * into license from public.anm_licenses where id=result.license_id and lower(customer_email)=result.customer_email and status<>'revoked' for update;
      if license.id is null then raise exception 'RENEWAL_NOT_AVAILABLE'; end if;
      expiry:=greatest(now(),license.expires_at)+make_interval(days=>result.duration_days);
      update public.anm_licenses set expires_at=expiry,status='active',max_devices=greatest(max_devices,result.max_devices),max_monitored=greatest(max_monitored,result.max_monitored),updated_at=now() where id=license.id;
    end if;
    update public.anm_orders set status='approved',license_id=license.id,key_ciphertext=case when kind='new' then p_key_ciphertext else null end,license_expires_at=expiry,reviewed_at=now(),reviewed_by=p_actor,updated_at=now() where id=p_id;
  else
    update public.anm_orders set status='rejected',rejection_reason=left(coalesce(nullif(trim(p_reason),''),'Pembayaran belum dapat diverifikasi. Hubungi admin Askara.'),300),reviewed_at=now(),reviewed_by=p_actor,updated_at=now() where id=p_id;
  end if;
  insert into public.anm_order_tasks(order_id,kind) values(p_id,'email_decision') on conflict do nothing;
  insert into public.anm_audit_logs(actor_id,action,license_id,details) values(p_actor,case when p_approve then 'order.approve' else 'order.reject' end,license.id,jsonb_build_object('order_id',p_id,'order_code',result.order_code,'amount_idr',result.amount_idr,'kind',result.kind));
  return jsonb_build_object('changed',true,'status',case when p_approve then 'approved' else 'rejected' end,'order_code',result.order_code,'license_expires_at',expiry);
end; $$;

create function public.anm_claim_order_task(p_order_id uuid,p_kind text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare task public.anm_order_tasks;
begin
  select * into task from public.anm_order_tasks where order_id=p_order_id and kind=p_kind and state<>'sent' and attempts<10 and (locked_until is null or locked_until<now()) for update skip locked;
  if task.id is null then return null; end if;
  update public.anm_order_tasks set state='sending',attempts=attempts+1,locked_until=now()+interval '2 minutes' where id=task.id;
  return to_jsonb(task);
end; $$;

alter table public.anm_shop_settings enable row level security;
alter table public.anm_products enable row level security;
alter table public.anm_orders enable row level security;
alter table public.anm_order_tasks enable row level security;
revoke all on public.anm_shop_settings,public.anm_products,public.anm_orders,public.anm_order_tasks from public,anon,authenticated;
grant all on public.anm_shop_settings,public.anm_products,public.anm_orders,public.anm_order_tasks to service_role;
grant usage,select on sequence public.anm_order_tasks_id_seq to service_role;
revoke all on function public.anm_checkout_order(jsonb,text,text,text),public.anm_submit_order_proof(uuid,text,text,text,text),public.anm_review_order(uuid,uuid,boolean,text,text,text,text),public.anm_claim_order_task(uuid,text) from public,anon,authenticated;
grant execute on function public.anm_checkout_order(jsonb,text,text,text),public.anm_submit_order_proof(uuid,text,text,text,text),public.anm_review_order(uuid,uuid,boolean,text,text,text,text),public.anm_claim_order_task(uuid,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('anm-payment-proofs','anm-payment-proofs',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;

commit;
