import z from "zod";
import { createClientSchema } from "./createClientSchema";

/** UPDATE: id obrigatório; demais campos parciais */
export const updateClientSchema = createClientSchema;
export type UpdateClientBody = z.infer<typeof updateClientSchema>;
