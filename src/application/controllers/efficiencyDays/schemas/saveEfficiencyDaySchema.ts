import { z } from "zod";

export const dayStatusEnum = z.enum(["draft", "ready", "confirmed"]);

export const segmentKindEnum = z.enum([
  "OPERATING",
  "DTM",
  "GLOSA",
  "REPAIR",
  "OTHER",
]);

export const movementTypeEnum = z.enum(["EQUIPMENTS", "FLUIDS", "TUBES"]);

export const distanceTierEnum = z.enum([
  "KM_0_20",
  "KM_20_50",
  "KM_50_PLUS",
]);

export const daySegmentSchema = z.object({
  id: z.string().uuid().optional(),
  kind: segmentKindEnum,
  subtype: z.string().trim().min(1).optional().nullable(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  wellId: z.string().uuid().optional().nullable(),
  repairSystemId: z.string().uuid().optional().nullable(),
  repairPartId: z.string().uuid().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export const dayMovementSchema = z.object({
  id: z.string().uuid().optional(),
  type: movementTypeEnum,
  distanceKm: z.number().nonnegative(),
  tier: distanceTierEnum.optional(),
  startedAt: z.string().datetime({ offset: true }).optional().nullable(),
  endedAt: z.string().datetime({ offset: true }).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export const dayMovementSegmentSchema = z.object({
  dayMovementId: z.string().uuid(),
  daySegmentId: z.string().uuid(),
});

export const dayMeasureSchema = z.object({
  id: z.string().uuid().optional(),
  key: z.string().min(1),
  unit: z.string().min(1),
  value: z.number(),
  meta: z.record(z.any()).optional().nullable(),
});

export const saveEfficiencyDaySchema = z.object({
  localDate: z.string().regex(/\d{4}-\d{2}-\d{2}/),
  status: dayStatusEnum.optional(),
  segments: z.array(daySegmentSchema).min(1),
  movements: z.array(dayMovementSchema).default([]),
  movementSegments: z.array(dayMovementSegmentSchema).default([]),
  measures: z.array(dayMeasureSchema).default([]),
});

export type SaveEfficiencyDayBody = z.infer<typeof saveEfficiencyDaySchema>;
