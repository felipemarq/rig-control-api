import { z } from "zod";
import { dayStatusEnum } from "./saveEfficiencyDaySchema";

export const updateEfficiencyDayStatusSchema = z.object({
  status: dayStatusEnum,
});

export type UpdateEfficiencyDayStatusBody = z.infer<
  typeof updateEfficiencyDayStatusSchema
>;
