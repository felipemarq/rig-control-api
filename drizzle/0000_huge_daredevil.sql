CREATE TYPE "public"."access_level" AS ENUM('none', 'read', 'write', 'admin');--> statement-breakpoint
CREATE TYPE "public"."action_status" AS ENUM('open', 'in_progress', 'done', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."billing_cadence" AS ENUM('PER_HOUR_BY_KIND', 'PER_DAY_FIXED', 'PER_MEASURE', 'PER_MONTH_FIXED', 'ONE_TIME', 'PER_MOVEMENT_EVENT');--> statement-breakpoint
CREATE TYPE "public"."checklist_item_type" AS ENUM('boolean', 'number', 'text', 'select', 'multiselect', 'date');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('BRL', 'USD', 'EUR');--> statement-breakpoint
CREATE TYPE "public"."day_status" AS ENUM('draft', 'ready', 'confirmed');--> statement-breakpoint
CREATE TYPE "public"."distance_tier" AS ENUM('KM_0_20', 'KM_20_50', 'KM_50_PLUS');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('EQUIPMENTS', 'FLUIDS', 'TUBES');--> statement-breakpoint
CREATE TYPE "public"."ncr_status" AS ENUM('open', 'investigating', 'resolved', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."occurrence_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."occurrence_type" AS ENUM('safety', 'equipment', 'process', 'other');--> statement-breakpoint
CREATE TYPE "public"."proration_strategy" AS ENUM('NONE', 'BY_CALENDAR_DAYS', 'BY_OPERATING_HOURS');--> statement-breakpoint
CREATE TYPE "public"."segment_kind" AS ENUM('OPERATING', 'DTM', 'GLOSA', 'REPAIR', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."status_common" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."uf" AS ENUM('AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO');--> statement-breakpoint
CREATE TABLE "bases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"uf" "uf" NOT NULL,
	"state_flag_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_components" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"seq" integer DEFAULT 0 NOT NULL,
	"code" text,
	"description" text NOT NULL,
	"cadence" "billing_cadence" NOT NULL,
	"kind" "segment_kind",
	"measure_key" text,
	"unit" text NOT NULL,
	"unit_price" numeric(12, 4) NOT NULL,
	"params" jsonb,
	"is_optional" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rig_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"currency" "currency" DEFAULT 'BRL' NOT NULL,
	"valid_from" date NOT NULL,
	"valid_to" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"type" "checklist_item_type" NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"options" jsonb
);
--> statement-breakpoint
CREATE TABLE "checklist_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"rig_id" uuid,
	"day_id" uuid,
	"submitted_by_user_id" uuid NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rig_id" uuid,
	"title" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tax_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"code" text NOT NULL,
	"status" "status_common" DEFAULT 'active' NOT NULL,
	"start_at" date NOT NULL,
	"end_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_billing_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_billing_id" uuid NOT NULL,
	"component_id" uuid NOT NULL,
	"quantity" numeric(14, 4) NOT NULL,
	"unit" text NOT NULL,
	"unit_price" numeric(12, 4) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "day_billings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"currency" "currency" DEFAULT 'BRL' NOT NULL,
	"breakdown" jsonb,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_measures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"key" text NOT NULL,
	"unit" text NOT NULL,
	"value" numeric(14, 4) NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_movement_segments" (
	"day_movement_id" uuid NOT NULL,
	"day_segment_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"type" "movement_type" NOT NULL,
	"distance_km" numeric(10, 2) NOT NULL,
	"tier" "distance_tier" NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"kind" "segment_kind" NOT NULL,
	"subtype" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"well_id" uuid,
	"repair_system_id" uuid,
	"repair_part_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "efficiency_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rig_id" uuid NOT NULL,
	"local_date" date NOT NULL,
	"status" "day_status" DEFAULT 'draft' NOT NULL,
	"totals" jsonb,
	"confirmed_at" timestamp with time zone,
	"confirmed_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_type" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"bucket" text NOT NULL,
	"object_key" text NOT NULL,
	"content_type" text,
	"size" integer,
	"uploaded_by_user_id" uuid,
	"checksum" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "files_object_key_unique" UNIQUE("object_key")
);
--> statement-breakpoint
CREATE TABLE "man_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rig_id" uuid NOT NULL,
	"activity" text,
	"hours" numeric(5, 2) NOT NULL,
	"date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"description" text,
	CONSTRAINT "modules_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "ncr_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ncr_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "action_status" DEFAULT 'open' NOT NULL,
	"responsible_user_id" uuid,
	"due_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "non_conformity_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rig_id" uuid NOT NULL,
	"opened_by_user_id" uuid NOT NULL,
	"classification" text,
	"description" text,
	"status" "ncr_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occurrence_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurrence_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "action_status" DEFAULT 'open' NOT NULL,
	"responsible_user_id" uuid,
	"due_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rig_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"type" "occurrence_type" NOT NULL,
	"description" text,
	"happened_at" timestamp with time zone NOT NULL,
	"severity" "occurrence_severity" DEFAULT 'low' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"system_id" uuid NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_systems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repair_systems_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "rigs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"client_id" uuid,
	"contract_id" uuid,
	"base_id" uuid,
	"uf" "uf" NOT NULL,
	"timezone" text DEFAULT 'America/Bahia' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rigs_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"level" "access_level" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "system_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wells" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text,
	"client_id" uuid,
	"rig_id" uuid,
	"is_official" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wells_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "billing_components" ADD CONSTRAINT "billing_components_plan_id_billing_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."billing_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_plans" ADD CONSTRAINT "billing_plans_rig_id_rigs_id_fk" FOREIGN KEY ("rig_id") REFERENCES "public"."rigs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_answers" ADD CONSTRAINT "checklist_answers_response_id_checklist_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."checklist_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_answers" ADD CONSTRAINT "checklist_answers_item_id_checklist_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."checklist_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_template_id_checklist_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."checklist_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_responses" ADD CONSTRAINT "checklist_responses_template_id_checklist_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."checklist_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_responses" ADD CONSTRAINT "checklist_responses_rig_id_rigs_id_fk" FOREIGN KEY ("rig_id") REFERENCES "public"."rigs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_responses" ADD CONSTRAINT "checklist_responses_day_id_efficiency_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."efficiency_days"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_responses" ADD CONSTRAINT "checklist_responses_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_rig_id_rigs_id_fk" FOREIGN KEY ("rig_id") REFERENCES "public"."rigs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_billing_items" ADD CONSTRAINT "day_billing_items_day_billing_id_day_billings_id_fk" FOREIGN KEY ("day_billing_id") REFERENCES "public"."day_billings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_billing_items" ADD CONSTRAINT "day_billing_items_component_id_billing_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."billing_components"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_billings" ADD CONSTRAINT "day_billings_day_id_efficiency_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."efficiency_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_billings" ADD CONSTRAINT "day_billings_plan_id_billing_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."billing_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_measures" ADD CONSTRAINT "day_measures_day_id_efficiency_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."efficiency_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_movement_segments" ADD CONSTRAINT "day_movement_segments_day_movement_id_day_movements_id_fk" FOREIGN KEY ("day_movement_id") REFERENCES "public"."day_movements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_movement_segments" ADD CONSTRAINT "day_movement_segments_day_segment_id_day_segments_id_fk" FOREIGN KEY ("day_segment_id") REFERENCES "public"."day_segments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_movements" ADD CONSTRAINT "day_movements_day_id_efficiency_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."efficiency_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_segments" ADD CONSTRAINT "day_segments_day_id_efficiency_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."efficiency_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_segments" ADD CONSTRAINT "day_segments_well_id_wells_id_fk" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_segments" ADD CONSTRAINT "day_segments_repair_system_id_repair_systems_id_fk" FOREIGN KEY ("repair_system_id") REFERENCES "public"."repair_systems"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_segments" ADD CONSTRAINT "day_segments_repair_part_id_repair_parts_id_fk" FOREIGN KEY ("repair_part_id") REFERENCES "public"."repair_parts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "efficiency_days" ADD CONSTRAINT "efficiency_days_rig_id_rigs_id_fk" FOREIGN KEY ("rig_id") REFERENCES "public"."rigs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "efficiency_days" ADD CONSTRAINT "efficiency_days_confirmed_by_user_id_users_id_fk" FOREIGN KEY ("confirmed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "man_hours" ADD CONSTRAINT "man_hours_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "man_hours" ADD CONSTRAINT "man_hours_rig_id_rigs_id_fk" FOREIGN KEY ("rig_id") REFERENCES "public"."rigs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ncr_actions" ADD CONSTRAINT "ncr_actions_ncr_id_non_conformity_reports_id_fk" FOREIGN KEY ("ncr_id") REFERENCES "public"."non_conformity_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ncr_actions" ADD CONSTRAINT "ncr_actions_responsible_user_id_users_id_fk" FOREIGN KEY ("responsible_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "non_conformity_reports" ADD CONSTRAINT "non_conformity_reports_rig_id_rigs_id_fk" FOREIGN KEY ("rig_id") REFERENCES "public"."rigs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "non_conformity_reports" ADD CONSTRAINT "non_conformity_reports_opened_by_user_id_users_id_fk" FOREIGN KEY ("opened_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_actions" ADD CONSTRAINT "occurrence_actions_occurrence_id_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."occurrences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_actions" ADD CONSTRAINT "occurrence_actions_responsible_user_id_users_id_fk" FOREIGN KEY ("responsible_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_rig_id_rigs_id_fk" FOREIGN KEY ("rig_id") REFERENCES "public"."rigs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_parts" ADD CONSTRAINT "repair_parts_system_id_repair_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."repair_systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rigs" ADD CONSTRAINT "rigs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rigs" ADD CONSTRAINT "rigs_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rigs" ADD CONSTRAINT "rigs_base_id_bases_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."bases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "user_logs" ADD CONSTRAINT "user_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_rig_id_rigs_id_fk" FOREIGN KEY ("rig_id") REFERENCES "public"."rigs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bases_name" ON "bases" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_bases_uf" ON "bases" USING btree ("uf");--> statement-breakpoint
CREATE INDEX "idx_billcomp_plan" ON "billing_components" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_billcomp_seq" ON "billing_components" USING btree ("seq");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_billing_plan_rig_version" ON "billing_plans" USING btree ("rig_id","version");--> statement-breakpoint
CREATE INDEX "idx_billplan_rig" ON "billing_plans" USING btree ("rig_id");--> statement-breakpoint
CREATE INDEX "idx_billplan_active" ON "billing_plans" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_chk_answer_resp_item" ON "checklist_answers" USING btree ("response_id","item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_chk_item_template_key" ON "checklist_items" USING btree ("template_id","key");--> statement-breakpoint
CREATE INDEX "idx_chk_tmpl_rig" ON "checklist_templates" USING btree ("rig_id");--> statement-breakpoint
CREATE INDEX "idx_clients_name" ON "clients" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_contracts_client_code" ON "contracts" USING btree ("client_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_day_billing" ON "day_billings" USING btree ("day_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_day_measure_key" ON "day_measures" USING btree ("day_id","key");--> statement-breakpoint
CREATE INDEX "idx_day_movements_day" ON "day_movements" USING btree ("day_id");--> statement-breakpoint
CREATE INDEX "idx_day_movements_type" ON "day_movements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_day_movements_tier" ON "day_movements" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_day_segments_day" ON "day_segments" USING btree ("day_id");--> statement-breakpoint
CREATE INDEX "idx_day_segments_range" ON "day_segments" USING btree ("starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "idx_day_segments_repair" ON "day_segments" USING btree ("repair_system_id","repair_part_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_efficiency_day_rig_date" ON "efficiency_days" USING btree ("rig_id","local_date");--> statement-breakpoint
CREATE INDEX "idx_eff_day_rig" ON "efficiency_days" USING btree ("rig_id");--> statement-breakpoint
CREATE INDEX "idx_eff_day_date" ON "efficiency_days" USING btree ("local_date");--> statement-breakpoint
CREATE INDEX "idx_files_owner" ON "files" USING btree ("owner_type","owner_id");--> statement-breakpoint
CREATE INDEX "idx_manhours_rig_date" ON "man_hours" USING btree ("rig_id","date");--> statement-breakpoint
CREATE INDEX "idx_manhours_user_date" ON "man_hours" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_ncr_actions_ncr" ON "ncr_actions" USING btree ("ncr_id");--> statement-breakpoint
CREATE INDEX "idx_ncr_actions_status" ON "ncr_actions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_occ_actions_occ" ON "occurrence_actions" USING btree ("occurrence_id");--> statement-breakpoint
CREATE INDEX "idx_occ_actions_status" ON "occurrence_actions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_occ_rig" ON "occurrences" USING btree ("rig_id");--> statement-breakpoint
CREATE INDEX "idx_occ_created_by" ON "occurrences" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_repair_part_system_key" ON "repair_parts" USING btree ("system_id","key");--> statement-breakpoint
CREATE INDEX "idx_rigs_client" ON "rigs" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_rigs_base" ON "rigs" USING btree ("base_id");--> statement-breakpoint
CREATE INDEX "idx_rigs_uf" ON "rigs" USING btree ("uf");--> statement-breakpoint
CREATE INDEX "idx_rigs_tz" ON "rigs" USING btree ("timezone");--> statement-breakpoint
CREATE INDEX "idx_user_logs_user" ON "user_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_logs_entity" ON "user_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_wells_client" ON "wells" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_wells_rig" ON "wells" USING btree ("rig_id");