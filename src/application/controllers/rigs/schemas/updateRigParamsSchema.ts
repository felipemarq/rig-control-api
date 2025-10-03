import { z } from "zod";

export const updateRigParamsSchema = z.object({
  rigId: z.string().uuid(),
});
export type UpdateRigParams = z.infer<typeof updateRigParamsSchema>;
