create extension if not exists pgcrypto;

create table if not exists public.meal_history (
    id uuid primary key default gen_random_uuid(),
    user_email text null,
    meal_label text null,
    food_items jsonb not null default '[]'::jsonb,
    total_nutrition jsonb not null default '{}'::jsonb,
    details jsonb not null default '[]'::jsonb,
    metadata jsonb not null default '{}'::jsonb,
    source text not null default 'manual',
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists meal_history_created_at_idx on public.meal_history (created_at desc);
create index if not exists meal_history_user_email_idx on public.meal_history (user_email);