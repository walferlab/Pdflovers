-- Add random public IDs for books while keeping numeric primary keys for relations.

create extension if not exists pgcrypto;

alter table public.pdfs
add column if not exists public_id uuid;

alter table public.pdfs
alter column public_id set default gen_random_uuid();

update public.pdfs
set public_id = gen_random_uuid()
where public_id is null;

alter table public.pdfs
alter column public_id set not null;

create unique index if not exists idx_pdfs_public_id on public.pdfs (public_id);
