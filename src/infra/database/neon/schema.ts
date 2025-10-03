// schema_full_v3_json_docs.ts
// Drizzle + Postgres/Neon — campos JSON/JSONB documentados com exemplos.

import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  integer,
  date,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* =========================
   ENUMS GERAIS
========================= */

// Unidade federativa (estado) — usar para bases e rigs.
// Ex.: 'BA', 'SE', 'SP'
export const ufEnum = pgEnum("uf", [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
]);

// Status genérico para entidades versionáveis/ativas
// 'draft' = rascunho, 'active' = em uso, 'archived' = desativado/legado.
export const statusCommon = pgEnum("status_common", [
  "draft",
  "active",
  "archived",
]);

// Nível de acesso padronizado (RBAC e ACL por sonda)
// 'none' = bloqueado, 'read' = leitura, 'write' = leitura+edição,
// 'admin' = controle total no escopo (ex.: na sonda ou módulo).
export const accessLevel = pgEnum("access_level", [
  "none",
  "read",
  "write",
  "admin",
]);

/* =========================
   IDENTIDADE & ACESSO
========================= */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(), // PK UUID
  email: text("email").notNull().unique(), // Email único (login Cognito)
  name: text("name").notNull(), // Nome exibido
  externalId: text("external_id"), // Id externo (Cognito sub/ADID). Ex.: 'cognito:xxxx'
  isActive: boolean("is_active").default(true).notNull(), // Desativa login/ações se false
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(), // Audit: quando criado
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(), // Audit: última atualização
  deletedAt: timestamp("deleted_at", { withTimezone: true }), // Soft-delete opcional
});

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(), // PK
  name: text("name").notNull().unique(), // Nome do papel. Ex.: 'admin', 'viewer', 'operator'
  description: text("description"), // Descrição livre do papel
});

export const modules = pgTable("modules", {
  id: uuid("id").defaultRandom().primaryKey(), // PK
  key: text("key").notNull().unique(), // Identificador do módulo. Ex.: 'EFFICIENCY','BILLING','CHECKLIST'
  description: text("description"), // Texto descritivo
});

// Permissões por papel em cada módulo (RBAC).
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }), // FK → roles
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }), // FK → modules
    level: accessLevel("level").notNull(), // Nível de acesso do papel no módulo
  },
  (t) => ({
    pk: { columns: [t.roleId, t.moduleId] }, // PK composta (permite DELETE/UPDATE no Neon UI)
  })
);

// Atribuição de papéis a usuários (um usuário pode ter vários papéis).
export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // FK → users
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }), // FK → roles
  },
  (t) => ({
    pk: { columns: [t.userId, t.roleId] }, // PK composta
  })
);

/* =========================
   CLIENTES / BASES / RIGS
========================= */

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    name: text("name").notNull(), // Nome do cliente. Ex.: 'PETROBRAS'
    taxId: text("tax_id"), // CNPJ/CPF. Ex.: '12.345.678/0001-99'
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    nameIdx: index("idx_clients_name").on(t.name),
  })
);

export const bases = pgTable(
  "bases",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    name: text("name").notNull(), // Nome da base. Ex.: 'Aracaju'
    uf: ufEnum("uf").notNull(), // Estado da base. Ex.: 'SE'
    stateFlagKey: text("state_flag_key"), // Chave S3 para bandeira/ícone do estado. Ex.: 'flags/SE.png'
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    nameIdx: index("idx_bases_name").on(t.name),
    ufIdx: index("idx_bases_uf").on(t.uf),
  })
);

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }), // FK → clients
    code: text("code").notNull(), // Código interno do contrato. Ex.: 'CT-2025-001'
    status: statusCommon("status").default("active").notNull(), // 'active' = vigente
    startAt: date("start_at").notNull(), // Início de vigência. Ex.: '2025-01-01'
    endAt: date("end_at"), // Fim (opcional). Ex.: '2026-12-31'
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    // Impede duplicidade de código do contrato dentro do mesmo cliente.
    uniqClientCode: uniqueIndex("uq_contracts_client_code").on(
      t.clientId,
      t.code
    ),
  })
);

// Sondas (Rigs). Ligações com cliente, contrato e base.
export const rigs = pgTable(
  "rigs",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    name: text("name").notNull().unique(), // Nome/identificador. Ex.: 'SPT-88'
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }), // FK opcional
    contractId: uuid("contract_id").references(() => contracts.id, {
      onDelete: "set null",
    }), // FK opcional
    baseId: uuid("base_id").references(() => bases.id, {
      onDelete: "set null",
    }), // FK opcional
    uf: ufEnum("uf").notNull(), // Estado onde opera. Ex.: 'SE'
    timezone: text("timezone").notNull().default("America/Bahia"), // Timezone IANA. Ex.: 'America/Sao_Paulo'
    isActive: boolean("is_active").default(true).notNull(), // Sonda ativa/inativa
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    clientIdx: index("idx_rigs_client").on(t.clientId),
    baseIdx: index("idx_rigs_base").on(t.baseId),
    ufIdx: index("idx_rigs_uf").on(t.uf),
    tzIdx: index("idx_rigs_tz").on(t.timezone),
  })
);

// ACL por sonda: limita o usuário a ler/escrever apenas as rigs permitidas.
export const userRigAccess = pgTable(
  "user_rig_access",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // FK → users
    rigId: uuid("rig_id")
      .notNull()
      .references(() => rigs.id, { onDelete: "cascade" }), // FK → rigs
    level: accessLevel("level").notNull().default("read"), // 'read' | 'write' | 'admin'
    assignedByUserId: uuid("assigned_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }), // Quem concedeu a permissão
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqUserRig: uniqueIndex("uq_user_rig_access").on(t.userId, t.rigId), // evita duplicado
    userIdx: index("idx_user_rig_user").on(t.userId),
    rigIdx: index("idx_user_rig_rig").on(t.rigId),
    levelIdx: index("idx_user_rig_level").on(t.level),
  })
);

/* =========================
   WELLS (poços)
========================= */

export const wells = pgTable(
  "wells",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    code: text("code").notNull().unique(), // Código do poço. Ex.: 'P-001'
    name: text("name"), // Nome amigável (opcional)
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }), // FK cliente
    rigId: uuid("rig_id").references(() => rigs.id, { onDelete: "set null" }), // FK sonda
    isOfficial: boolean("is_official").default(false).notNull(), // Marca poço oficial do cliente
    // metadata: informações livres específicas do poço.
    // EXEMPLO:
    // {
    //   "location": {"lat": -12.9718, "lng": -38.5011},
    //   "formation": "Arenito X",
    //   "depthPlan": 120.5,
    //   "notes": "Poço experimental próximo à base"
    // }
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    clientIdx: index("idx_wells_client").on(t.clientId),
    rigIdx: index("idx_wells_rig").on(t.rigId),
  })
);

/* =========================
   EFICIÊNCIA DIÁRIA + SEGMENTOS
========================= */

// Status do dia: 'draft' (rascunho), 'ready' (fechado pelo operador),
// 'confirmed' (aprovado/assinado).
export const dayStatus = pgEnum("day_status", ["draft", "ready", "confirmed"]);

// Natureza do segmento do dia: operação, DTM (deslocamento),
// glosa (sem faturamento), reparo (equipamento), outros.
export const segmentKind = pgEnum("segment_kind", [
  "OPERATING",
  "DTM",
  "GLOSA",
  "REPAIR",
  "OTHER",
]);

// Catálogo macro de sistemas de equipamento usados para REPAIR.
// Ex.: key='mud_pump', label='Bomba de lama'
export const repairSystems = pgTable("repair_systems", {
  id: uuid("id").defaultRandom().primaryKey(), // PK
  key: text("key").notNull().unique(), // Identificador único
  label: text("label").notNull(), // Nome exibido
  description: text("description"), // Descrição/observações
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Catálogo micro: partes do sistema (para classificação fina de REPAIR).
// Ex.: system='mud_pump', key='seal_kit', label='Kit de selo'
export const repairParts = pgTable(
  "repair_parts",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    systemId: uuid("system_id")
      .notNull()
      .references(() => repairSystems.id, { onDelete: "cascade" }), // FK → repair_systems
    key: text("key").notNull(), // Ex.: 'seal_kit'
    label: text("label").notNull(), // Ex.: 'Kit de selo'
    description: text("description"), // Observações
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    // Evita dois 'seal_kit' para o mesmo sistema.
    uniqPartPerSystem: uniqueIndex("uq_repair_part_system_key").on(
      t.systemId,
      t.key
    ),
  })
);

// Um registro por (rig, data local). Os segmentos do dia devem somar 24h.
export const efficiencyDays = pgTable(
  "efficiency_days",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    rigId: uuid("rig_id")
      .notNull()
      .references(() => rigs.id, { onDelete: "restrict" }), // FK → rigs
    localDate: date("local_date").notNull(), // Data local da sonda. Ex.: '2025-09-30'
    status: dayStatus("status").default("draft").notNull(), // Status do dia
    // totals: cache de agregações para listagens/analytics rápidos.
    // NÃO é fonte da verdade; sempre recalculável a partir dos segmentos.
    // EXEMPLO:
    // {
    //   "minutesByKind": { "OPERATING": 720, "DTM": 600, "REPAIR": 120, "GLOSA": 0, "OTHER": 0 },
    //   "uptime_pct": 50.0,
    //   "repairBySystemHours": { "mud_pump": 3.5 },
    //   "movementsSummary": {
    //     "FLUIDS": {"KM_0_20": 1, "KM_20_50": 0, "KM_50_PLUS": 0},
    //     "EQUIPMENTS": {"KM_0_20": 2}
    //   }
    // }
    totals: jsonb("totals"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }), // Quando confirmou
    confirmedByUserId: uuid("confirmed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }), // Quem confirmou
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqRigDate: uniqueIndex("uq_efficiency_day_rig_date").on(
      t.rigId,
      t.localDate
    ), // um por dia/sonda
    rigIdx: index("idx_eff_day_rig").on(t.rigId),
    dateIdx: index("idx_eff_day_date").on(t.localDate),
  })
);

// Segmentos (períodos) do dia — não podem se sobrepor (ver DDL extra).
export const daySegments = pgTable(
  "day_segments",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    dayId: uuid("day_id")
      .notNull()
      .references(() => efficiencyDays.id, { onDelete: "cascade" }), // FK → efficiency_days
    kind: segmentKind("kind").notNull(), // OPERATING | DTM | GLOSA | REPAIR | OTHER
    subtype: text("subtype"), // Subclassificação livre. Ex.: 'perfuração', 'manobra'
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(), // Início (TZ da sonda)
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(), // Fim (TZ da sonda)
    wellId: uuid("well_id").references(() => wells.id, {
      onDelete: "set null",
    }), // Poço (opcional)
    repairSystemId: uuid("repair_system_id").references(
      () => repairSystems.id,
      { onDelete: "set null" }
    ), // Sistema (REPAIR)
    repairPartId: uuid("repair_part_id").references(() => repairParts.id, {
      onDelete: "set null",
    }), // Parte (REPAIR)
    notes: text("notes"), // Observações do período
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    dayIdx: index("idx_day_segments_day").on(t.dayId),
    rangeIdx: index("idx_day_segments_range").on(t.startsAt, t.endsAt),
    repairIdx: index("idx_day_segments_repair").on(
      t.repairSystemId,
      t.repairPartId
    ),
  })
);

/* =========================
   MOVIMENTAÇÕES (eventos/distância)
========================= */

// Tipo de movimentação cobrada: equipamentos, fluidos, tubos/hastes.
export const movementType = pgEnum("movement_type", [
  "EQUIPMENTS",
  "FLUIDS",
  "TUBES",
]);

// Faixa de distância para precificação (tabela de preço).
export const distanceTier = pgEnum("distance_tier", [
  "KM_0_20",
  "KM_20_50",
  "KM_50_PLUS",
]);

// Evento de movimentação por dia (independe da quantidade de segmentos DTM).
export const dayMovements = pgTable(
  "day_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    dayId: uuid("day_id")
      .notNull()
      .references(() => efficiencyDays.id, { onDelete: "cascade" }), // FK → day
    type: movementType("type").notNull(), // EQUIPMENTS | FLUIDS | TUBES
    distanceKm: numeric("distance_km", { precision: 10, scale: 2 }).notNull(), // Distância total do evento. Ex.: 18.50
    tier: distanceTier("tier").notNull(), // Faixa (derivada da distância)
    startedAt: timestamp("started_at", { withTimezone: true }), // Janela temporal (opcional)
    endedAt: timestamp("ended_at", { withTimezone: true }),
    notes: text("notes"), // Observações
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    dayIdx: index("idx_day_movements_day").on(t.dayId),
    typeIdx: index("idx_day_movements_type").on(t.type),
    tierIdx: index("idx_day_movements_tier").on(t.tier),
  })
);

// Mapeamento opcional de um evento de movimentação para segmentos específicos (para UI).
// Não é usado no cálculo, apenas referência visual.
export const dayMovementSegments = pgTable(
  "day_movement_segments",
  {
    dayMovementId: uuid("day_movement_id")
      .notNull()
      .references(() => dayMovements.id, { onDelete: "cascade" }), // FK → day_movements
    daySegmentId: uuid("day_segment_id")
      .notNull()
      .references(() => daySegments.id, { onDelete: "cascade" }), // FK → day_segments
  },
  (t) => ({
    pk: { columns: [t.dayMovementId, t.daySegmentId] }, // PK composta
  })
);

/* =========================
   BILLING (Planos/Componentes)
========================= */

// Moeda de faturamento
export const currencyEnum = pgEnum("currency", ["BRL", "USD", "EUR"]);

// Como cada componente é cobrado:
// - PER_HOUR_BY_KIND: por hora (filtrando kind/subconjunto de REPAIR)
// - PER_DAY_FIXED: valor fixo por dia
// - PER_MEASURE: por medida auxiliar (day_measures.key)
// - PER_MONTH_FIXED: mensal com rateio opcional
// - ONE_TIME: item único (setup, mobilização)
// - PER_MOVEMENT_EVENT: por evento de movimentação (type+tier)
export const cadenceEnum = pgEnum("billing_cadence", [
  "PER_HOUR_BY_KIND",
  "PER_DAY_FIXED",
  "PER_MEASURE",
  "PER_MONTH_FIXED",
  "ONE_TIME",
  "PER_MOVEMENT_EVENT",
]);

// Estratégias de rateio para mensalidade.
export const prorationEnum = pgEnum("proration_strategy", [
  "NONE",
  "BY_CALENDAR_DAYS",
  "BY_OPERATING_HOURS",
]);

// Plano de faturamento por sonda (versionado por vigência)
export const billingPlans = pgTable(
  "billing_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    rigId: uuid("rig_id")
      .notNull()
      .references(() => rigs.id, { onDelete: "restrict" }), // FK → rigs
    version: integer("version").default(1).notNull(), // Versão do plano (inteiro crescente)
    name: text("name").notNull(), // Nome do plano. Ex.: 'SPT-88 Tabela 2025'
    currency: currencyEnum("currency").default("BRL").notNull(), // Moeda
    validFrom: date("valid_from").notNull(), // Vigência início
    validTo: date("valid_to"), // Vigência fim (opcional)
    isActive: boolean("is_active").default(true).notNull(), // Marcação de ativo
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqRigVersion: uniqueIndex("uq_billing_plan_rig_version").on(
      t.rigId,
      t.version
    ),
    rigIdx: index("idx_billplan_rig").on(t.rigId),
    activeIdx: index("idx_billplan_active").on(t.isActive),
  })
);

/**
 * Componentes de faturamento.
 * params (JSONB) — exemplos de acordo com 'cadence':
 * - PER_HOUR_BY_KIND:
 *   {
 *     "filterRepairSystemKey": "mud_pump",     // opcional: filtra REPAIR por sistema
 *     "filterRepairPartKey": "seal_kit"        // opcional: filtra REPAIR por parte
 *   }
 * - PER_MEASURE:
 *   {
 *     "measureKey": "km_translado_extra"       // deve existir em day_measures.key
 *   }
 * - PER_MONTH_FIXED:
 *   { "proration": "BY_CALENDAR_DAYS" }        // 'NONE' | 'BY_CALENDAR_DAYS' | 'BY_OPERATING_HOURS'
 * - PER_MOVEMENT_EVENT:
 *   { "movementType": "FLUIDS", "tier": "KM_0_20" }
 * - PER_DAY_FIXED / ONE_TIME:
 *   { "note": "verba mobilização fora de Aracaju" }
 */
export const billingComponents = pgTable(
  "billing_components",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    planId: uuid("plan_id")
      .notNull()
      .references(() => billingPlans.id, { onDelete: "cascade" }), // FK → plano
    seq: integer("seq").default(0).notNull(), // Ordem de apresentação/cálculo
    code: text("code"), // Código de item. Ex.: 'MOVE_FLUIDS_0_20'
    description: text("description").notNull(), // Descrição para NFe/relatório
    cadence: cadenceEnum("cadence").notNull(), // Cadência (ver enum)
    kind: segmentKind("kind"), // Usado em PER_HOUR_BY_KIND
    measureKey: text("measure_key"), // Usado em PER_MEASURE
    unit: text("unit").notNull(), // Unidade. Ex.: 'h','evento','km','dia','und'
    unitPrice: numeric("unit_price", { precision: 12, scale: 4 }).notNull(), // Preço unitário
    params: jsonb("params"), // Parâmetros (exemplos acima)
    isOptional: boolean("is_optional").default(false).notNull(), // Marca items opcionais
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    planIdx: index("idx_billcomp_plan").on(t.planId),
    seqIdx: index("idx_billcomp_seq").on(t.seq),
  })
);

/* Medidas auxiliares por dia (inputs manuais ou calculados).
 * meta (JSONB) — EXEMPLOS:
 * {
 *   "source": "manual",                    // 'manual' | 'sensor' | 'calc'
 *   "note": "Diária de equipamento X",
 *   "calc": { "base": "horimetro", "factor": 1.2 } // se calculado
 * }
 */
export const dayMeasures = pgTable(
  "day_measures",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    dayId: uuid("day_id")
      .notNull()
      .references(() => efficiencyDays.id, { onDelete: "cascade" }), // FK → day
    key: text("key").notNull(), // Identificador da medida. Ex.: 'tanque_mix_diaria'
    unit: text("unit").notNull(), // Unidade. Ex.: 'und','km','h'
    value: numeric("value", { precision: 14, scale: 4 }).notNull(), // Valor da medida
    meta: jsonb("meta"), // Metadados (exemplo acima)
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqMeasure: uniqueIndex("uq_day_measure_key").on(t.dayId, t.key), // evita medidas duplicadas no mesmo dia
  })
);

/* Faturamento diário consolidado.
 * breakdown (JSONB) — EXEMPLO:
 * {
 *   "hoursByKind": { "OPERATING": 10.5, "DTM": 8.0, "REPAIR": 1.5 },
 *   "movements": { "FLUIDS": { "KM_0_20": 1 }, "EQUIPMENTS": { "KM_20_50": 2 } },
 *   "measures": { "tanque_mix_diaria": 1 },
 *   "items": [
 *     { "code":"MOVE_FLUIDS_0_20", "qty":1, "unitPrice":4936.80, "amount":4936.80 },
 *     { "code":"OPERATING_HOUR", "qty":10.5, "unitPrice":520.00, "amount":5460.00 }
 *   ]
 * }
 */
export const dayBillings = pgTable(
  "day_billings",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    dayId: uuid("day_id")
      .notNull()
      .references(() => efficiencyDays.id, { onDelete: "cascade" }), // FK → day
    planId: uuid("plan_id")
      .notNull()
      .references(() => billingPlans.id, { onDelete: "restrict" }), // Plano usado
    total: numeric("total", { precision: 14, scale: 2 }).default("0").notNull(), // Total do dia
    currency: currencyEnum("currency").default("BRL").notNull(), // Moeda
    breakdown: jsonb("breakdown"), // Detalhamento (exemplo acima)
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(), // Quando foi calculado
  },
  (t) => ({
    uniqDay: uniqueIndex("uq_day_billing").on(t.dayId), // 1 cálculo/dia
  })
);

/* Itens do faturamento diário.
 * meta (JSONB) — EXEMPLO:
 * { "componentParams": {"movementType":"FLUIDS","tier":"KM_0_20"}, "notes":"Promocional" }
 */
export const dayBillingItems = pgTable("day_billing_items", {
  id: uuid("id").defaultRandom().primaryKey(), // PK
  dayBillingId: uuid("day_billing_id")
    .notNull()
    .references(() => dayBillings.id, { onDelete: "cascade" }), // FK → day_billings
  componentId: uuid("component_id")
    .notNull()
    .references(() => billingComponents.id, { onDelete: "restrict" }), // FK → billing_components
  quantity: numeric("quantity", { precision: 14, scale: 4 }).notNull(), // Quantidade faturada. Ex.: 1, 10.5
  unit: text("unit").notNull(), // Unidade (consistente com o componente)
  unitPrice: numeric("unit_price", { precision: 12, scale: 4 }).notNull(), // Preço unitário aplicado
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), // Subtotal (qty * unitPrice)
  meta: jsonb("meta"), // Metadados (exemplo acima)
});

/* =========================
   CHECKLISTS (opcional)
========================= */

// Tipos de item de checklist
export const checklistItemType = pgEnum("checklist_item_type", [
  "boolean",
  "number",
  "text",
  "select",
  "multiselect",
  "date",
]);

export const checklistTemplates = pgTable(
  "checklist_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    rigId: uuid("rig_id").references(() => rigs.id, { onDelete: "set null" }), // Template global (NULL) ou por sonda
    title: text("title").notNull(), // Título do checklist
    version: integer("version").default(1).notNull(), // Versionamento de template
    active: boolean("active").default(true).notNull(), // Ativo/inativo
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    rigIdx: index("idx_chk_tmpl_rig").on(t.rigId),
  })
);

/* options (JSONB) para itens — exemplos por tipo:
 * - select/multiselect:
 *   { "options": [ {"value":"ok","label":"OK"}, {"value":"na","label":"N/A"} ] }
 * - number:
 *   { "min": 0, "max": 100, "step": 0.1, "unit": "°C" }
 * - text:
 *   { "placeholder": "Observações..." }
 */
export const checklistItems = pgTable(
  "checklist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    templateId: uuid("template_id")
      .notNull()
      .references(() => checklistTemplates.id, { onDelete: "cascade" }), // FK → template
    key: text("key").notNull(), // Identificador do item. Ex.: 'pressao_bomba'
    label: text("label").notNull(), // Rótulo exibido
    type: checklistItemType("type").notNull(), // Tipo (enum acima)
    required: boolean("required").default(false).notNull(), // Obrigatoriedade
    order: integer("order").default(0).notNull(), // Ordenação
    options: jsonb("options"), // Config por tipo (exemplos acima)
  },
  (t) => ({
    uniqKey: uniqueIndex("uq_chk_item_template_key").on(t.templateId, t.key),
  })
);

/* value (JSONB) nas respostas — exemplos por tipo:
 * - boolean: true
 * - number:  { "value": 37.5, "unit": "°C" }
 * - text:    "Texto livre"
 * - select:  { "value": "ok", "label": "OK" }
 * - multiselect: [ { "value":"ok","label":"OK" }, { "value":"na","label":"N/A" } ]
 * - date:    "2025-09-30"
 */
export const checklistResponses = pgTable("checklist_responses", {
  id: uuid("id").defaultRandom().primaryKey(), // PK
  templateId: uuid("template_id")
    .notNull()
    .references(() => checklistTemplates.id, { onDelete: "restrict" }), // Template usado
  rigId: uuid("rig_id").references(() => rigs.id, { onDelete: "set null" }), // Sonda (se aplicável)
  dayId: uuid("day_id").references(() => efficiencyDays.id, {
    onDelete: "set null",
  }), // Dia (se aplicável)
  submittedByUserId: uuid("submitted_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }), // Quem respondeu
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .defaultNow()
    .notNull(), // Quando respondeu
});

export const checklistAnswers = pgTable(
  "checklist_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    responseId: uuid("response_id")
      .notNull()
      .references(() => checklistResponses.id, { onDelete: "cascade" }), // FK → resposta
    itemId: uuid("item_id")
      .notNull()
      .references(() => checklistItems.id, { onDelete: "restrict" }), // FK → item
    value: jsonb("value").notNull(), // Valor (exemplos acima)
  },
  (t) => ({
    uniqAnswer: uniqueIndex("uq_chk_answer_resp_item").on(
      t.responseId,
      t.itemId
    ), // um valor por item/resposta
  })
);

/* =========================
   OCORRÊNCIAS / NCR (opcional)
========================= */

export const occurrenceSeverity = pgEnum("occurrence_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);
export const ncrStatus = pgEnum("ncr_status", [
  "open",
  "investigating",
  "resolved",
  "canceled",
]);
export const actionStatus = pgEnum("action_status", [
  "open",
  "in_progress",
  "done",
  "canceled",
]);
export const occurrenceType = pgEnum("occurrence_type", [
  "safety",
  "equipment",
  "process",
  "other",
]);

export const occurrences = pgTable(
  "occurrences",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    rigId: uuid("rig_id")
      .notNull()
      .references(() => rigs.id, { onDelete: "restrict" }), // Sonda
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }), // Quem registrou
    type: occurrenceType("type").notNull(), // Tipo (enum)
    description: text("description"), // Descrição do ocorrido
    happenedAt: timestamp("happened_at", { withTimezone: true }).notNull(), // Quando ocorreu
    severity: occurrenceSeverity("severity").default("low").notNull(), // Gravidade
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    rigIdx: index("idx_occ_rig").on(t.rigId),
    createdByIdx: index("idx_occ_created_by").on(t.createdByUserId),
  })
);

export const occurrenceActions = pgTable(
  "occurrence_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    occurrenceId: uuid("occurrence_id")
      .notNull()
      .references(() => occurrences.id, { onDelete: "cascade" }), // FK → ocorrência
    title: text("title").notNull(), // Título da ação
    status: actionStatus("status").default("open").notNull(), // Status da ação
    responsibleUserId: uuid("responsible_user_id").references(() => users.id, {
      onDelete: "set null",
    }), // Responsável (opcional)
    dueDate: date("due_date"), // Prazo
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    occIdx: index("idx_occ_actions_occ").on(t.occurrenceId),
    statusIdx: index("idx_occ_actions_status").on(t.status),
  })
);

export const nonConformityReports = pgTable("non_conformity_reports", {
  id: uuid("id").defaultRandom().primaryKey(), // PK
  rigId: uuid("rig_id")
    .notNull()
    .references(() => rigs.id, { onDelete: "restrict" }), // Sonda
  openedByUserId: uuid("opened_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }), // Quem abriu
  classification: text("classification"), // Classificação livre
  description: text("description"), // Descrição
  status: ncrStatus("status").default("open").notNull(), // Status
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const ncrActions = pgTable(
  "ncr_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    ncrId: uuid("ncr_id")
      .notNull()
      .references(() => nonConformityReports.id, { onDelete: "cascade" }), // FK → NCR
    title: text("title").notNull(), // Título da ação
    status: actionStatus("status").default("open").notNull(), // Status
    responsibleUserId: uuid("responsible_user_id").references(() => users.id, {
      onDelete: "set null",
    }), // Responsável
    dueDate: date("due_date"), // Prazo
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    ncrIdx: index("idx_ncr_actions_ncr").on(t.ncrId),
    statusIdx: index("idx_ncr_actions_status").on(t.status),
  })
);

/* =========================
   HORAS-HOMEM (opcional)
========================= */

export const manHours = pgTable(
  "man_hours",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }), // Usuário que realizou
    rigId: uuid("rig_id")
      .notNull()
      .references(() => rigs.id, { onDelete: "restrict" }), // Sonda
    activity: text("activity"), // Atividade. Ex.: 'Manutenção preventiva'
    hours: numeric("hours", { precision: 5, scale: 2 }).notNull(), // Horas gastas. Ex.: 3.50
    date: date("date").notNull(), // Data
    notes: text("notes"), // Observações
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    rigDateIdx: index("idx_manhours_rig_date").on(t.rigId, t.date),
    userDateIdx: index("idx_manhours_user_date").on(t.userId, t.date),
  })
);

/* =========================
   FILES (S3)
========================= */

export const files = pgTable(
  "files",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    ownerType: text("owner_type").notNull(), // A que entidade pertence. Ex.: 'day','occurrence','ncr'
    ownerId: uuid("owner_id").notNull(), // Id da entidade dona
    bucket: text("bucket").notNull(), // Nome do bucket S3. Ex.: 'rig-manager-prod'
    objectKey: text("object_key").notNull().unique(), // Chave S3. Ex.: 'days/uuid/relatorio.pdf'
    contentType: text("content_type"), // MIME. Ex.: 'application/pdf'
    size: integer("size"), // Tamanho em bytes. Ex.: 1048576
    uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }), // Quem subiu
    checksum: text("checksum"), // SHA256/ETag para integridade
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(), // Quando subiu
  },
  (t) => ({
    ownerIdx: index("idx_files_owner").on(t.ownerType, t.ownerId),
  })
);

/* =========================
   LOGS / SISTEMA
========================= */

// Log de ações do usuário (auditoria).
// meta (JSONB) — EXEMPLOS:
// - CREATE_DAY:    { "rigId": "...", "localDate": "2025-09-29", "segmentsCount": 8 }
// - CONFIRM_DAY:   { "dayId": "...", "confirmedBy": "user@ex.com" }
// - GENERATE_BILLING: { "dayId":"...", "planId":"...", "items": 12, "total": 10300.0 }
export const userLogs = pgTable(
  "user_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(), // PK
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }), // Quem executou
    action: text("action").notNull(), // Código da ação. Ex.: 'CREATE_DAY'
    entityType: text("entity_type"), // Tipo da entidade afetada. Ex.: 'efficiency_day'
    entityId: uuid("entity_id"), // Id da entidade afetada
    meta: jsonb("meta"), // Metadados (exemplos acima)
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(), // Quando ocorreu
  },
  (t) => ({
    userIdx: index("idx_user_logs_user").on(t.userId),
    entIdx: index("idx_user_logs_entity").on(t.entityType, t.entityId),
  })
);

export const systemVersions = pgTable("system_versions", {
  id: uuid("id").defaultRandom().primaryKey(), // PK
  tag: text("tag").notNull(), // Tag/versão. Ex.: 'v1.3.0'
  notes: text("notes"), // Notas de release/migração
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* =======================================================
   DDL EXTRA (SQL manual recomendado executar no banco)
===========================================================
1) Impedir OVERLAP de segmentos no mesmo dia (requer btree_gist):
   CREATE EXTENSION IF NOT EXISTS btree_gist;
   ALTER TABLE day_segments
   ADD CONSTRAINT no_overlap_per_day
   EXCLUDE USING gist (
     day_id WITH =,
     tstzrange(starts_at, ends_at, '[)') WITH &&
   );

2) REPAIR exige 'repair_system_id' (macro obrigatório):
   ALTER TABLE day_segments
   ADD CONSTRAINT repair_requires_system
   CHECK (kind <> 'REPAIR' OR repair_system_id IS NOT NULL);

3) (Opcional) Índices parciais para analytics de REPAIR:
   CREATE INDEX idx_repair_system ON day_segments(repair_system_id) WHERE kind='REPAIR';
   CREATE INDEX idx_repair_part   ON day_segments(repair_part_id)   WHERE kind='REPAIR';
*/
