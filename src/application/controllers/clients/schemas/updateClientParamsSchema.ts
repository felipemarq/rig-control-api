import { z } from "zod";

export const updateClientParamsSchema = z.object({
  clientId: z.string().uuid(),
});
export type UpdateClientParams = z.infer<typeof updateClientParamsSchema>;
