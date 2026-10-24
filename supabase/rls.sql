-- =====================================================================
-- SORA · Tabelas do usuário + Row Level Security (RLS)
-- Rode no Supabase: SQL Editor → New query → cole tudo → Run.
-- Idempotente: pode rodar mais de uma vez sem quebrar nada.
--
-- Usuários ficam APENAS em auth.users (gerenciado pelo Supabase Auth).
-- Nenhuma tabela aqui guarda senha. Cada linha pertence a um user_id e
-- só o próprio dono consegue ler, criar, alterar ou apagar.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. VENDAS (tabela principal: controle de sites vendidos)
-- ---------------------------------------------------------------------
create table if not exists public.vendas (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome_site    text not null default '' check (char_length(nome_site) <= 200),
  cliente_pais text not null default '' check (char_length(cliente_pais) <= 200),
  valor_eur    numeric(12, 2) not null default 0 check (valor_eur >= 0 and valor_eur <= 10000000),
  data_venda   date not null default current_date,
  status       text not null default 'Negociando' check (status in ('Pago', 'Pendente', 'Negociando')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists vendas_user_id_idx on public.vendas (user_id);
create index if not exists vendas_user_data_idx on public.vendas (user_id, data_venda);

-- ---------------------------------------------------------------------
-- 2. PROGRESSO DA ACADEMIA (um registro por usuário e módulo)
-- ---------------------------------------------------------------------
create table if not exists public.progresso_modulos (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  modulo      smallint not null check (modulo between 1 and 4),
  concluido   boolean not null default false,
  checklist   boolean[] not null default array[false, false, false],
  anotacoes   text not null default '' check (char_length(anotacoes) <= 20000),
  video_url   text not null default '' check (char_length(video_url) <= 500),
  updated_at  timestamptz not null default now(),
  primary key (user_id, modulo)
);

-- ---------------------------------------------------------------------
-- 3. CONFIGURAÇÕES DO USUÁRIO (cotação, meta, nichos favoritos)
-- ---------------------------------------------------------------------
create table if not exists public.configuracoes_usuario (
  user_id         uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  cotacao_eur     numeric(8, 4) not null default 6.20 check (cotacao_eur > 0 and cotacao_eur < 1000),
  meta_eur        numeric(12, 2) not null default 10000 check (meta_eur >= 0),
  nichos_favoritos smallint[] not null default '{}',
  idioma_pitch    text not null default 'pt' check (idioma_pitch in ('pt', 'en', 'es', 'fr', 'de', 'it')),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists vendas_updated_at on public.vendas;
create trigger vendas_updated_at before update on public.vendas
  for each row execute function public.set_updated_at();

drop trigger if exists progresso_updated_at on public.progresso_modulos;
create trigger progresso_updated_at before update on public.progresso_modulos
  for each row execute function public.set_updated_at();

drop trigger if exists configuracoes_updated_at on public.configuracoes_usuario;
create trigger configuracoes_updated_at before update on public.configuracoes_usuario
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS: ativa, força (vale até para o dono da tabela) e cria as policies
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['vendas', 'progresso_modulos', 'configuracoes_usuario']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);

    -- Visitantes não logados (anon) não têm acesso nenhum.
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);

    execute format('drop policy if exists "dono_select" on public.%I', t);
    execute format('drop policy if exists "dono_insert" on public.%I', t);
    execute format('drop policy if exists "dono_update" on public.%I', t);
    execute format('drop policy if exists "dono_delete" on public.%I', t);

    execute format(
      'create policy "dono_select" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "dono_insert" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "dono_update" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "dono_delete" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end
$$;

-- ---------------------------------------------------------------------
-- AUDITORIA: lista qualquer tabela do schema public ainda SEM RLS.
-- O resultado precisa vir VAZIO. Se aparecer alguma tabela, ative o RLS
-- e crie policies para ela antes de ir para produção.
-- ---------------------------------------------------------------------
select c.relname as tabela_sem_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and not c.relrowsecurity;
