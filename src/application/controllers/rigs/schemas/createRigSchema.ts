// application/validation/rigSchemas.ts
import { z } from "zod";

const ufEnum = z.enum([
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
]);

/** CREATE */
export const createRigSchema = z.object({
  name: z.string().min(1, "Nome da sonda é obrigatório"),
  clientId: z.string().uuid().optional().nullable(),
  contractId: z.string().uuid().optional().nullable(),
  baseId: z.string().uuid().optional().nullable(),
  uf: ufEnum,
  timezone: z.string().min(1).default("America/Bahia"),
  isActive: z.boolean().default(true),
});
export type CreateRigBody = z.infer<typeof createRigSchema>;
