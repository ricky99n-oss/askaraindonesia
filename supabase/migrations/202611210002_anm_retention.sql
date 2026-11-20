begin;
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('anm-retention-daily','17 18 * * *',
  $job$delete from public.anm_monitoring_logs where created_at < now()-interval '30 days';
  delete from public.anm_ai_insights where created_at < now()-interval '30 days';
  delete from public.anm_activation_attempts where attempted_at < now()-interval '1 day';$job$);
commit;
