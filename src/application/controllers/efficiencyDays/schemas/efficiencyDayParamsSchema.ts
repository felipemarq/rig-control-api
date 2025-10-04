import { z } from "zod";

export const efficiencyDayParamsSchema = z.object({
  rigId: z.string().uuid(),
  localDate: z.string().regex(/\d{4}-\d{2}-\d{2}/),
});

export type EfficiencyDayParams = z.infer<typeof efficiencyDayParamsSchema>;
