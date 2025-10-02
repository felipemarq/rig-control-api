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

export const statusCommon = pgEnum("status_common", [
  "draft",
  "active",
  "archived",
]);
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
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  externalId: text("external_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const modules = pgTable("modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  description: text("description"),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    level: accessLevel("level").notNull(),
  },
  (t) => ({
    pk: { columns: [t.roleId, t.moduleId] },
  })
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
  },
  (t) => ({
    pk: { columns: [t.userId, t.roleId] },
  })
);

/* =========================
   CLIENTES / BASES / RIGS
========================= */

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    taxId: text("tax_id"),
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
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    uf: ufEnum("uf").notNull(),
    stateFlagKey: text("state_flag_key"),
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
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    code: text("code").notNull(),
    status: statusCommon("status").default("active").notNull(),
    startAt: date("start_at").notNull(),
    endAt: date("end_at"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqClientCode: uniqueIndex("uq_contracts_client_code").on(
      t.clientId,
      t.code
    ),
  })
);

export const rigs = pgTable(
  "rigs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(), // Ex.: "SPT-88"
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    contractId: uuid("contract_id").references(() => contracts.id, {
      onDelete: "set null",
    }),
    baseId: uuid("base_id").references(() => bases.id, {
      onDelete: "set null",
    }),
    uf: ufEnum("uf").notNull(),
    timezone: text("timezone").notNull().default("America/Bahia"),
    isActive: boolean("is_active").default(true).notNull(),
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

export const userRigAccess = pgTable(
  "user_rig_access",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rigId: uuid("rig_id")
      .notNull()
      .references(() => rigs.id, { onDelete: "cascade" }),
    level: accessLevel("level").notNull().default("read"),
    assignedByUserId: uuid("assigned_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqUserRig: uniqueIndex("uq_user_rig_access").on(t.userId, t.rigId),
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
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name"),
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    rigId: uuid("rig_id").references(() => rigs.id, { onDelete: "set null" }),
    isOfficial: boolean("is_official").default(false).notNull(),
    // metadata: informações livres do poço (opcionais e variáveis)
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

export const dayStatus = pgEnum("day_status", ["draft", "ready", "confirmed"]);
export const segmentKind = pgEnum("segment_kind", [
  "OPERATING",
  "DTM",
  "GLOSA",
  "REPAIR",
  "OTHER",
]);

// Catálogo REPAIR macro
export const repairSystems = pgTable("repair_systems", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(), // ex.: 'mud_pump', 'generator'
  label: text("label").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Catálogo REPAIR micro (partes por sistema)
export const repairParts = pgTable(
  "repair_parts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    systemId: uuid("system_id")
      .notNull()
      .references(() => repairSystems.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqPartPerSystem: uniqueIndex("uq_repair_part_system_key").on(
      t.systemId,
      t.key
    ),
  })
);

// Um dia por (rig, data local). Segmentos devem somar 24h.
export const efficiencyDays = pgTable(
  "efficiency_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    rigId: uuid("rig_id")
      .notNull()
      .references(() => rigs.id, { onDelete: "restrict" }),
    localDate: date("local_date").notNull(), // YYYY-MM-DD na TZ da rig
    status: dayStatus("status").default("draft").notNull(),
    // totals: cache de agregações do dia para exibição/listagens rápidas.
    // EXEMPLO:
    // {
    //   "minutesByKind": { "OPERATING": 720, "DTM": 600, "REPAIR": 120, "GLOSA": 0, "OTHER": 0 },
    //   "uptime_pct": 50.0,
    //   "repairBySystemHours": { "mud_pump": 3.5 },
    //   "movementsSummary": { "FLUIDS": {"KM_0_20": 1, "KM_20_50": 0, "KM_50_PLUS": 0} }
    // }
    totals: jsonb("totals"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    confirmedByUserId: uuid("confirmed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
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
    ),
    rigIdx: index("idx_eff_day_rig").on(t.rigId),
    dateIdx: index("idx_eff_day_date").on(t.localDate),
  })
);

// Períodos do dia (sem overlap). REPAIR pode referenciar sistema/parte.
export const daySegments = pgTable(
  "day_segments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dayId: uuid("day_id")
      .notNull()
      .references(() => efficiencyDays.id, { onDelete: "cascade" }),
    kind: segmentKind("kind").notNull(),
    subtype: text("subtype"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    wellId: uuid("well_id").references(() => wells.id, {
      onDelete: "set null",
    }),
    repairSystemId: uuid("repair_system_id").references(
      () => repairSystems.id,
      { onDelete: "set null" }
    ),
    repairPartId: uuid("repair_part_id").references(() => repairParts.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
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

export const movementType = pgEnum("movement_type", [
  "EQUIPMENTS",
  "FLUIDS",
  "TUBES",
]);
export const distanceTier = pgEnum("distance_tier", [
  "KM_0_20",
  "KM_20_50",
  "KM_50_PLUS",
]);

// Um evento de movimentação no dia (independe de quantos segmentos DTM houve)
export const dayMovements = pgTable(
  "day_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dayId: uuid("day_id")
      .notNull()
      .references(() => efficiencyDays.id, { onDelete: "cascade" }),
    type: movementType("type").notNull(),
    distanceKm: numeric("distance_km", { precision: 10, scale: 2 }).notNull(),
    tier: distanceTier("tier").notNull(), // derivado: ≤20, 20–50, >50
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    notes: text("notes"),
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

// (Opcional) vincular visualmente um movimento a segmentos (não usado no cálculo)
export const dayMovementSegments = pgTable(
  "day_movement_segments",
  {
    dayMovementId: uuid("day_movement_id")
      .notNull()
      .references(() => dayMovements.id, { onDelete: "cascade" }),
    daySegmentId: uuid("day_segment_id")
      .notNull()
      .references(() => daySegments.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: { columns: [t.dayMovementId, t.daySegmentId] },
  })
);

/* =========================
   BILLING (Planos/Componentes)
========================= */

export const currencyEnum = pgEnum("currency", ["BRL", "USD", "EUR"]);

export const cadenceEnum = pgEnum("billing_cadence", [
  "PER_HOUR_BY_KIND",
  "PER_DAY_FIXED",
  "PER_MEASURE",
  "PER_MONTH_FIXED",
  "ONE_TIME",
  "PER_MOVEMENT_EVENT",
]);

export const prorationEnum = pgEnum("proration_strategy", [
  "NONE",
  "BY_CALENDAR_DAYS",
  "BY_OPERATING_HOURS",
]);

// Plano por sonda (versionado)
export const billingPlans = pgTable(
  "billing_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    rigId: uuid("rig_id")
      .notNull()
      .references(() => rigs.id, { onDelete: "restrict" }),
    version: integer("version").default(1).notNull(),
    name: text("name").notNull(),
    currency: currencyEnum("currency").default("BRL").notNull(),
    validFrom: date("valid_from").notNull(),
    validTo: date("valid_to"),
    isActive: boolean("is_active").default(true).notNull(),
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
 * params (JSONB) com exemplos:
 * - PER_HOUR_BY_KIND: { "filterRepairSystemKey": "mud_pump", "filterRepairPartKey": "seal_kit" }
 * - PER_MEASURE:      { "measureKey": "km_translado_extra" }
 * - PER_MONTH_FIXED:  { "proration": "BY_CALENDAR_DAYS" }
 * - PER_MOVEMENT_EVENT:{ "movementType": "FLUIDS", "tier": "KM_0_20" }
 */
export const billingComponents = pgTable(
  "billing_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => billingPlans.id, { onDelete: "cascade" }),
    seq: integer("seq").default(0).notNull(),
    code: text("code"),
    description: text("description").notNull(),
    cadence: cadenceEnum("cadence").notNull(),
    kind: segmentKind("kind"),
    measureKey: text("measure_key"),
    unit: text("unit").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 4 }).notNull(),
    params: jsonb("params"),
    isOptional: boolean("is_optional").default(false).notNull(),
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

/* Medidas auxiliares por dia.
 * meta (JSONB) — EXEMPLOS:
 * { "source":"manual", "note":"Diária de equipamento X", "calc":{"base":"horimetro","factor":1.2} }
 */
export const dayMeasures = pgTable(
  "day_measures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dayId: uuid("day_id")
      .notNull()
      .references(() => efficiencyDays.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    unit: text("unit").notNull(),
    value: numeric("value", { precision: 14, scale: 4 }).notNull(),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqMeasure: uniqueIndex("uq_day_measure_key").on(t.dayId, t.key),
  })
);

/* breakdown (JSONB) no faturamento diário — EXEMPLO:
 * {
 *   "hoursByKind": {"OPERATING": 10.5, "DTM": 8.0},
 *   "movements": { "FLUIDS": {"KM_0_20": 1} },
 *   "measures": { "tanque_mix_diaria": 1 },
 *   "items": [
 *     { "code":"MOVE_FLUIDS_0_20", "qty":1, "unitPrice":4936.80, "amount":4936.80 }
 *   ]
 * }
 */
export const dayBillings = pgTable(
  "day_billings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dayId: uuid("day_id")
      .notNull()
      .references(() => efficiencyDays.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => billingPlans.id, { onDelete: "restrict" }),
    total: numeric("total", { precision: 14, scale: 2 }).default("0").notNull(),
    currency: currencyEnum("currency").default("BRL").notNull(),
    breakdown: jsonb("breakdown"),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqDay: uniqueIndex("uq_day_billing").on(t.dayId),
  })
);

/* meta (JSONB) nos itens — EXEMPLO:
 * { "componentParams": {"movementType":"FLUIDS","tier":"KM_0_20"}, "notes":"Promocional" }
 */
export const dayBillingItems = pgTable("day_billing_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  dayBillingId: uuid("day_billing_id")
    .notNull()
    .references(() => dayBillings.id, { onDelete: "cascade" }),
  componentId: uuid("component_id")
    .notNull()
    .references(() => billingComponents.id, { onDelete: "restrict" }),
  quantity: numeric("quantity", { precision: 14, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 4 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  meta: jsonb("meta"),
});

/* =========================
   CHECKLISTS (opcional)
========================= */

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
    id: uuid("id").defaultRandom().primaryKey(),
    rigId: uuid("rig_id").references(() => rigs.id, { onDelete: "set null" }), // global (NULL) ou específico
    title: text("title").notNull(),
    version: integer("version").default(1).notNull(),
    active: boolean("active").default(true).notNull(),
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

/* options (JSONB) nos itens — EXEMPLOS por tipo:
 * - select/multiselect: { "options": [ {"value":"ok","label":"OK"}, {"value":"na","label":"N/A"} ] }
 * - number: { "min": 0, "max": 100, "step": 0.1, "unit": "°C" }
 * - text: { "placeholder": "Observações..." }
 */
export const checklistItems = pgTable(
  "checklist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => checklistTemplates.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    type: checklistItemType("type").notNull(),
    required: boolean("required").default(false).notNull(),
    order: integer("order").default(0).notNull(),
    options: jsonb("options"),
  },
  (t) => ({
    uniqKey: uniqueIndex("uq_chk_item_template_key").on(t.templateId, t.key),
  })
);

/* value (JSONB) nas respostas — EXEMPLOS por tipo:
 * - boolean: true/false
 * - number: { "value": 37.5, "unit": "°C" }
 * - text: "Texto livre"
 * - select: { "value":"ok","label":"OK" }
 * - multiselect: [{ "value":"ok","label":"OK" }, { "value":"na","label":"N/A" }]
 * - date: "2025-09-30"
 */
export const checklistResponses = pgTable("checklist_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => checklistTemplates.id, { onDelete: "restrict" }),
  rigId: uuid("rig_id").references(() => rigs.id, { onDelete: "set null" }),
  dayId: uuid("day_id").references(() => efficiencyDays.id, {
    onDelete: "set null",
  }),
  submittedByUserId: uuid("submitted_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const checklistAnswers = pgTable(
  "checklist_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => checklistResponses.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => checklistItems.id, { onDelete: "restrict" }),
    value: jsonb("value").notNull(),
  },
  (t) => ({
    uniqAnswer: uniqueIndex("uq_chk_answer_resp_item").on(
      t.responseId,
      t.itemId
    ),
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
    id: uuid("id").defaultRandom().primaryKey(),
    rigId: uuid("rig_id")
      .notNull()
      .references(() => rigs.id, { onDelete: "restrict" }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    type: occurrenceType("type").notNull(),
    description: text("description"),
    happenedAt: timestamp("happened_at", { withTimezone: true }).notNull(),
    severity: occurrenceSeverity("severity").default("low").notNull(),
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
    id: uuid("id").defaultRandom().primaryKey(),
    occurrenceId: uuid("occurrence_id")
      .notNull()
      .references(() => occurrences.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: actionStatus("status").default("open").notNull(),
    responsibleUserId: uuid("responsible_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    dueDate: date("due_date"),
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
  id: uuid("id").defaultRandom().primaryKey(),
  rigId: uuid("rig_id")
    .notNull()
    .references(() => rigs.id, { onDelete: "restrict" }),
  openedByUserId: uuid("opened_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  classification: text("classification"),
  description: text("description"),
  status: ncrStatus("status").default("open").notNull(),
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
    id: uuid("id").defaultRandom().primaryKey(),
    ncrId: uuid("ncr_id")
      .notNull()
      .references(() => nonConformityReports.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: actionStatus("status").default("open").notNull(),
    responsibleUserId: uuid("responsible_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    dueDate: date("due_date"),
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
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    rigId: uuid("rig_id")
      .notNull()
      .references(() => rigs.id, { onDelete: "restrict" }),
    activity: text("activity"),
    hours: numeric("hours", { precision: 5, scale: 2 }).notNull(),
    date: date("date").notNull(),
    notes: text("notes"),
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
    id: uuid("id").defaultRandom().primaryKey(),
    ownerType: text("owner_type").notNull(), // 'day' | 'occurrence' | 'ncr' | ...
    ownerId: uuid("owner_id").notNull(),
    bucket: text("bucket").notNull(),
    objectKey: text("object_key").notNull().unique(),
    contentType: text("content_type"),
    size: integer("size"),
    uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    checksum: text("checksum"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    ownerIdx: index("idx_files_owner").on(t.ownerType, t.ownerId),
  })
);

/* =========================
   LOGS / SISTEMA
========================= */

// meta (JSONB) — EXEMPLOS:
// - CREATE_DAY: { "rigId": "...", "localDate": "2025-09-29", "segmentsCount": 8 }
// - CONFIRM_DAY: { "dayId": "...", "confirmedBy": "user@ex.com" }
// - GENERATE_BILLING: { "dayId":"...", "planId":"...", "items": 12, "total": 10300.0 }
export const userLogs = pgTable(
  "user_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    action: text("action").notNull(), // "CREATE_DAY" | "CONFIRM_DAY" | "GENERATE_BILLING" ...
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    userIdx: index("idx_user_logs_user").on(t.userId),
    entIdx: index("idx_user_logs_entity").on(t.entityType, t.entityId),
  })
);

export const systemVersions = pgTable("system_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tag: text("tag").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* =======================================================
   DDL EXTRA
===========================================================
1) Impedir OVERLAP de segmentos no mesmo dia (requer btree_gist):
   CREATE EXTENSION IF NOT EXISTS btree_gist;
   ALTER TABLE day_segments
   ADD CONSTRAINT no_overlap_per_day
   EXCLUDE USING gist (
     day_id WITH =,
     tstzrange(starts_at, ends_at, '[)') WITH &&
   );

2) REPAIR requer 'repair_system_id' (macro obrigatório):
   ALTER TABLE day_segments
   ADD CONSTRAINT repair_requires_system
   CHECK (kind <> 'REPAIR' OR repair_system_id IS NOT NULL);

3) (Opcional) Índices para analytics de REPAIR:
   CREATE INDEX idx_repair_system ON day_segments(repair_system_id) WHERE kind='REPAIR';
   CREATE INDEX idx_repair_part   ON day_segments(repair_part_id)   WHERE kind='REPAIR';
*/
