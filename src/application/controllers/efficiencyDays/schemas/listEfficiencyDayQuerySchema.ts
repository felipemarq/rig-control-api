import { z } from "zod";
import { dayStatusEnum } from "./saveEfficiencyDaySchema";

export const listEfficiencyDayQuerySchema = z.object({
  rigId: z.string().uuid().optional(),
  status: dayStatusEnum.optional(),
  localDateGte: z.string().regex(/\d{4}-\d{2}-\d{2}/).optional(),
  localDateLte: z.string().regex(/\d{4}-\d{2}-\d{2}/).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export type ListEfficiencyDayQuery = z.infer<
  typeof listEfficiencyDayQuerySchema
>;
