import { z } from "zod";

export const createEfficiencyDaySchema = z.object({
  rigId: z.string().uuid({ message: "rigId deve ser um UUID válido" }),
  localDate: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u, {
      message: "localDate deve estar no formato YYYY-MM-DD",
    }),
  status: z.enum(["draft", "ready", "confirmed"]).optional(),
  totals: z.record(z.string(), z.unknown()).nullable().optional(),
  confirmedAt: z
    .union([z.coerce.date(), z.null()])
    .optional(),
  confirmedByUserId: z
    .string()
    .uuid({ message: "confirmedByUserId deve ser UUID" })
    .nullable()
    .optional(),
});

export type CreateEfficiencyDayBody = z.infer<typeof createEfficiencyDaySchema>;
