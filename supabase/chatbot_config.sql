-- Global chatbot AI provider/model config (single active row)
-- Run once in the Supabase SQL editor.

create table if not exists public.chatbot_config (
  id smallint primary key default 1,
  provider text not null default 'groq'
    check (provider in ('groq', 'gemini', 'vertex-ai')),
  model text not null default 'llama-3.3-70b-versatile',
  updated_at timestamptz not null default now(),
  constraint chatbot_config_singleton check (id = 1)
);

comment on table public.chatbot_config is
  'Singleton admin-selected provider/model for portfolio chatbots';

-- Seed default (matches current Groq-first behavior)
insert into public.chatbot_config (id, provider, model)
values (1, 'groq', 'llama-3.3-70b-versatile')
on conflict (id) do nothing;

-- Deny anon/authenticated direct writes; only service role (API routes) mutates
alter table public.chatbot_config enable row level security;

drop policy if exists "chatbot_config_service_read" on public.chatbot_config;

create policy "chatbot_config_service_read"
  on public.chatbot_config
  for select
  to authenticated, anon
  using (true);
-- no insert/update/delete policies for anon/authenticated
