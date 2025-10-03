import { Contract } from "@application/entities/Contract";
import { z } from "zod";

const statusEnum = z.nativeEnum(Contract.Status);

/** CREATE */
export const createContractSchema = z.object({
  clientId: z.string().uuid("clientId inválido"),
  code: z.string().trim().min(1, "Código é obrigatório"),
  status: statusEnum.optional().default(Contract.Status.ACTIVE),
  // aceita string "YYYY-MM-DD" ou Date
  startAt: z.coerce.date({ invalid_type_error: "startAt inválido" }),
  endAt: z
    .union([z.coerce.date(), z.null()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v)),
});
export type CreateContractBody = z.infer<typeof createContractSchema>;
