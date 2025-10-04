Rig Manager — AI Context (Resumo para Codex)

Propósito: Este documento dá o contexto mínimo completo para a IA entender a arquitetura, o domínio e as convenções do projeto.
Stack: Front React + Tailwind; Back Serverless Framework (AWS Lambda), Drizzle ORM + PostgreSQL (Neon), S3 (arquivos), SES (e-mail), SQS (tarefas assíncronas), Cognito (auth).

1. Domínio em uma frase

Sistema para gestão de sondas perfuratrizes com:

lançamento diário de eficiência (24h compostas por segmentos),

movimentações (fluids/equipments/tubes com distância),

checklists, ocorrências/NCR, horas-homem,

faturamento diário flexível por planos e componentes (por hora/por dia/por medida/por evento de movimento),

controle de acesso global por módulo (RBAC) e escopo por sonda (ACL).

2. Convenções do projeto

Camadas e Padrão das Entidades

application/entities/<Entity>.ts — classe de domínio imutável (readonly), com construtor tipado (<Entity>.Attributes).

infra/db/items/<Entity>Item.ts — mapper DB ⇄ domínio

Tipos:
type <Entity>Row = InferSelectModel<typeof <table>>;
type New<Entity>Row = InferInsertModel<typeof <table>>;

Converte tipos sensíveis (ex.: numeric string ⇄ number) e datas.

application/validation/\*Schemas.ts — Zod para bodies/queries de controllers (create/update/list).

Repositórios — recebem/retornam Entidades, convertem com o Item.

UseCases — regras de negócio + autorização.

Controllers — recebem (userId, body/query, params) do lambdaHttpAdapter, chamam UseCases e retornam resposta serializável.

3. Modelagem (tabelas principais)

Observação: os nomes abaixo correspondem ao schema Drizzle já enviado/versão v3.

3.1 Identidade & Acesso

users — usuários (chave externa com Cognito via external_id, opcional).

RBAC Global por Módulo

roles — papéis (ex.: admin, planner, viewer).

modules — chaves funcionais (ex.: rigs, efficiency, billing, checklists).

role_permissions — (roleId, moduleId) → level (none|read|write|admin). PK composta.

user_roles — (userId, roleId). PK composta.

ACL por Sonda (escopo)

user_rig_access — (userId, rigId) → level (read|write|admin). uniqueIndex(userId, rigId).

Usado para responder: “quais sondas o usuário pode ver/editar?”

3.2 Clientes / Bases / Contratos / Sondas

clients — cliente (nome/taxId).

bases — bases/UF (onde a sonda pode operar).

contracts — por cliente (status/intervalo de vigência).

rigs — sondas (nome único, UF, timezone, vinculação opcional a cliente/contrato/base).

3.3 Wells (poços)

wells — poços associados à sonda/cliente (metadados livres em JSONB).

3.4 Eficiência diária (core)

efficiency_days — um dia por (rig, local_date).

status: draft|ready|confirmed

totals (JSONB) — cache de agregados (ex.: minutos por tipo, uptime, resumos de reparo/movimento).

day_segments — períodos que compõem o dia (não podem se sobrepor).

kind: OPERATING|DTM|GLOSA|REPAIR|OTHER

well_id opcional

REPAIR: repair_system_id (macro), repair_part_id (micro)

DDL extra (recomendado):

Evitar overlap (btree_gist + constraint EXCLUDE (day_id WITH =, tstzrange(starts_at, ends_at) WITH &&)).

Garantir que REPAIR tenha repair_system_id.

3.5 Movimentações (distância/evento)

day_movements — eventos independentes por dia (tipo + km + faixa tier derivada).

type: EQUIPMENTS|FLUIDS|TUBES

tier: KM_0_20 | KM_20_50 | KM_50_PLUS

Importante: Pode haver 1 movimento por dia mesmo com vários segmentos DTM; evita somar distância duplicada.

day_movement_segments — vínculo visual entre movimento e segmentos (não entra no cálculo, só referência/UI).

3.6 Faturamento (versão flexível)

billing_plans (por rig, versionado e com vigência).

billing_components — linhas do plano (regras de precificação):

cadence:

PER_HOUR_BY_KIND → tarifa por hora filtrando kind e opcionalmente repairSystem/Part.

PER_DAY_FIXED → diária fixa.

PER_MEASURE → usa uma medida do dia (day_measures.key).

PER_MONTH_FIXED → mensal com proration (NONE|BY_CALENDAR_DAYS|BY_OPERATING_HOURS).

ONE_TIME → item eventual.

PER_MOVEMENT_EVENT → conta eventos em day_movements (tipo/tier).

params (JSONB) — filtros/config. Ex.:

// PER_HOUR_BY_KIND
{"kind":"REPAIR","filterRepairSystemKey":"mud_pump","filterRepairPartKey":"seal_kit"}
// PER_MEASURE
{"measureKey":"km_translado_extra"}
// PER_MOVEMENT_EVENT
{"movementType":"FLUIDS","tier":"KM_0_20"}

day_measures — medidas auxiliares por dia (ex.: horímetro, km extras, diária de equipamento X).

meta (JSONB) com origem/cálculo.

day_billings — faturamento do dia (um por dia).

breakdown (JSONB): horas por tipo, movimentos, medidas e itens calculados (code/qty/unitPrice/amount).

day_billing_items — linhas concretas geradas a partir do plano.

3.7 Checklists (opcional)

checklist_templates + checklist_items (com options JSONB por tipo).

checklist_responses + checklist_answers (valor JSONB por tipo).

3.8 Ocorrências/NCR (opcional)

occurrences + occurrence_actions

non_conformity_reports + ncr_actions

3.9 Horas-Homem (opcional)

man_hours — horas por usuário/sonda (analytics / folha).

3.10 Arquivos e Logs

files — ponte para S3 (bucket, object_key, owner_type/id).

user_logs — auditoria em JSONB (quem, o quê, quando).

system_versions — notas de versão.

4. Regras essenciais

Eficiência diária = 24h
Um efficiency_day por (rig, data local).
Seus day_segments devem somar 24h (validado em use case).
Sem overlap (constraint recomendada no DB).

DTM por distância vs por hora
Separado do segmento: distância é por dia (day_movements).
Desenha 1 evento de movimento (ex.: FLUIDS 20km) e N segmentos DTM; o faturamento por distância usa só o evento.

REPAIR macro/micro
repair_systems e repair_parts modelam níveis para análise de MTBF/recorrência.
Segmentos REPAIR devem ter repair_system_id; repair_part_id é opcional.

Billing flexível por componentes
Cada billing_component define o quê contar e como precificar; o gerador de diária varre o dia (segundos/medidas/eventos) e emite day_billing_items.

5. Autorização (como aplicar)

Guarda de Módulo (RBAC global):
consultar role_permissions para o módulo (ex.: efficiency, billing) e requerer read|write|admin.

Guarda de Escopo por Sonda (ACL):
consultar user_rig_access para (userId, rigId) e comparar level com read|write|admin.

Regra prática: para mutações de eficiência/billing:

role_permissions(module="efficiency", level ≥ write)

user_rig_access(level ≥ write) na rigId alvo.

PermissionService (pseudo):

await RoleService.ensure("efficiency", "write", actingUserId);
await PermissionService.ensureRigAccess(actingUserId, rigId, "write");

6. Fluxos principais (exemplos end-to-end)
   6.1 Criar dia de eficiência (com segmentos + movimento)

Front → Back (JSON)

{
"rigId": "rig-uuid",
"localDate": "2025-10-01",
"segments": [
{"kind":"OPERATING","startsAt":"2025-10-01T06:00:00-03:00","endsAt":"2025-10-01T12:00:00-03:00","wellId":null,"notes":"Perfuração"},
{"kind":"DTM","startsAt":"2025-10-01T12:00:00-03:00","endsAt":"2025-10-01T15:00:00-03:00","notes":"Translado"}
],
"movements": [
{"type":"FLUIDS","distanceKm":20,"startedAt":"2025-10-01T12:15:00-03:00","endedAt":"2025-10-01T13:45:00-03:00","notes":"Caminhão 1"}
],
"measures": [
{"key":"tanque_mix_diaria","unit":"un","value":1}
]
}

Back (use case)

PermissionService.ensureRigAccess(userId, rigId, "write").

Cria efficiency_day (upsert por rigId+localDate).

Valida que todos os segmentos estão contidos em localDate da rig (timezone!).
Valida sem overlap e fecham 24h (pode aceitar draft sem somar 24h e só exigir isso ao ready/confirm).

Insere day_segments (bulk).

Para cada movimento, calcula tier (<=20, 20–50, >50) e insere day_movements.

Insere day_measures se houver.

Atualiza efficiency_days.totals (cache JSONB) — ex.: minutos por kind, uptime, contagens de movimentos.

Retorna o dia criado.

6.2 Gerar faturamento do dia

Localiza billing_plan ativo na data (validFrom ≤ date < validTo|null).

Para cada billing_component do plano:

PER*HOUR_BY_KIND: soma minutos de segmentos com kind (e filtros repair*\* se houver) → converte para horas → qty.

PER_DAY_FIXED: qty = 1.

PER_MEASURE: busca day_measures.key → qty = value.

PER_MONTH_FIXED: calcula pró-rata (dias do mês ou horas operando).

PER_MOVEMENT_EVENT: conta day_movements por type/tier.

Gera day_billing_items com unit, unitPrice, quantity e amount.

Totaliza e grava day_billings (+ breakdown JSONB com as bases do cálculo).

7. Exemplos Drizzle (consultas típicas)

Minutos por tipo em um dia

// SELECT kind, SUM(EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60) as minutes
// FROM day_segments WHERE day_id = $1 GROUP BY kind;

Movimentos por tier em um dia

// SELECT type, tier, COUNT(\*) FROM day_movements
// WHERE day_id = $1 GROUP BY type, tier;

Filtrar dias por rig e status

// db.select().from(efficiencyDays).where(
// and(eq(efficiencyDays.rigId, rigId), eq(efficiencyDays.status, "ready"))
// )

Checar acesso

// const acc = await db.query.userRigAccess.findFirst({
// where: and(eq(userRigAccess.userId, userId), eq(userRigAccess.rigId, rigId))
// });
// if (!acc || (weight[acc.level] < weight.required)) throw 403;

8. Padrões de Código (exemplos já prontos)

Entity + Item + Schema já entregues para:

Client, Contract, Rig, UserRigAccess (+ schemas zod)

(Solicitar quando precisar: EfficiencyDay, DaySegment, DayMovement, BillingPlan, BillingComponent, DayBilling, DayBillingItem, Checklist\*, etc.)

Repository: CRUD enxuto, sempre convertendo com Item.

UseCases: Grant/Update/Revoke/List para ACL de sonda; CreateRig, etc.

Controllers: padrão lambdaHttpAdapter(ControllerClass).

9. Integrações AWS (como usamos)

S3: upload/download de arquivos (files guarda bucket/object_key e metadados).

SES: envio de e-mails (notificações, relatórios).

SQS: enfileirar tarefas assíncronas pesadas/longas, ex.:

geração de PDFs de faturamento por período,

reprocessamento de faturamentos após ajuste de plano,

importação/migração de dados antigos.

Cognito: autenticação; users.external_id pode guardar o sub do Cognito.

10. Regras de migração (do banco antigo)

Mapear entidades antigas → novas

TUDO que era “opção específica da sonda” virou catálogos ou JSON (metadados) — minimizando colunas “gambiarras”.

Eficiência

Se antes você duplicava distância em cada DTM: agora converta para 1 day_movements por dia com a distância total correta.

REPAIR

Normalizar macro/micro: preencher repair_systems e repair_parts e referenciar nos day_segments do tipo REPAIR.

Planos de faturamento

Transformar regras fixas por sonda em billing_plans + billing_components.

Validações

Script para checar overlap, somatório 24h e coerência de timezone.

11. DDLs/Índices Recomendados

Sem overlap em day_segments (exige btree_gist):

CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE day_segments
ADD CONSTRAINT no_overlap_per_day
EXCLUDE USING gist (
day_id WITH =,
tstzrange(starts_at, ends_at, '[)') WITH &&
);

REPAIR exige sistema:

ALTER TABLE day_segments
ADD CONSTRAINT repair_requires_system
CHECK (kind <> 'REPAIR' OR repair_system_id IS NOT NULL);

Índices úteis:

idx_eff_day_rig (rig_id), idx_eff_day_date (local_date)

idx_day_segments_range (starts_at, ends_at)

idx_day_movements_type (type), idx_day_movements_tier (tier)

uq_efficiency_day_rig_date (rig_id, local_date)

uq_user_rig_access (user_id, rig_id)

12. Exemplos de payloads

Grant ACL (ADM)

{ "userId": "uuid-user", "rigId": "uuid-rig", "level": "write" }

Criar Rig

{ "name":"SPT-88","uf":"BA","timezone":"America/Bahia","clientId":null,"contractId":null,"baseId":null,"isActive":true }

Criar dia (simples)

{
"rigId":"uuid-rig",
"localDate":"2025-10-01",
"segments":[
{"kind":"OPERATING","startsAt":"2025-10-01T00:00:00-03:00","endsAt":"2025-10-01T12:00:00-03:00"},
{"kind":"DTM","startsAt":"2025-10-01T12:00:00-03:00","endsAt":"2025-10-01T14:00:00-03:00"},
{"kind":"OPERATING","startsAt":"2025-10-01T14:00:00-03:00","endsAt":"2025-10-01T24:00:00-03:00"}
],
"movements":[{"type":"FLUIDS","distanceKm":20}],
"measures":[{"key":"tanque_mix_diaria","unit":"un","value":1}]
}

13. Roadmap / TODOs para a IA

Implementar UseCases/Controllers faltantes para:

EfficiencyDay (create/update/confirm), DaySegment (CRUD), DayMovement (CRUD).

BillingPlan/BillingComponent CRUD + gerador de diária (DayBilling) com base nos componentes.

Criar guards de autorização: RBAC de módulo + ACL por sonda (Permission/Role services).

Adicionar métricas de agregação automática (atualizar efficiency_days.totals a cada mutação).

Escrever tests unit/integration (mocks de repos e DB de teste).

Handlers para SQS (jobs de faturamento em lote, PDFs).

Endpoints para S3 pre-signed URLs (upload/download de anexos).

Observabilidade: Sentry já listado no front; no back integrar logs estruturados.

14. Decisões que evitam bugs históricos

Distância ≠ duração de DTM. Distância é por dia (day_movements), não replicar em cada segmento.

Somatório de 24h por dia: checar ao ready/confirm.

Timezone de rig em toda a lógica de data.

REPAIR com macro obrigatória: dados melhores para analytics.

Planos de faturamento versionados por vigência: evite “recalcular passado” com regra nova sem intenção explícita.

15. Glossário rápido

Rig: sonda (ex.: SPT-88).

Efficiency Day: um dia local de operação/divisões de 24h.

Segment: bloco contínuo de tempo (OPERATING/DTM/GLOSA/REPAIR/OTHER).

Movement: evento de deslocamento de FLUIDS/EQUIPMENTS/TUBES com distância e faixa.

Measure: valor auxiliar por dia (ex.: horímetro, diária de equipamento, km extra).

Billing Plan/Component: regra de faturamento (por hora, por dia, por medida ou por movimento).

RBAC: permissões globais por módulo.

ACL por Rig: escopo “quem pode ver/editar a sonda X”.

Contato para a IA: quando precisar gerar código, seguir fielmente este padrão: Entity + Item + Schema + Repository + UseCase + Controller, aplicando RBAC + ACL conforme descrito e consultando as tabelas desta versão do schema.
