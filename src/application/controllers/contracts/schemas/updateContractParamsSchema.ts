import { z } from "zod";

export const updateContractParamsSchema = z.object({
  contractId: z.string().uuid(),
});
export type UpdateContractParams = z.infer<typeof updateContractParamsSchema>;
