// application/validation/clientSchemas.ts
import { z } from "zod";

/** CREATE: nome obrigatório; taxId opcional */
export const createClientSchema = z.object({
  name: z.string().min(1, "Nome do cliente é obrigatório"),
  taxId: z
    .string()
    .trim()
    .min(11, "Documento muito curto")
    .max(18, "Documento muito longo")
    .optional(), // CNPJ/CPF sem ou com máscara
});
export type CreateClientBody = z.infer<typeof createClientSchema>;
