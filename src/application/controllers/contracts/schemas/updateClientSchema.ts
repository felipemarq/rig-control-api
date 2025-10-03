import z from "zod";
import { createContractSchema } from "./createContractSchema";

/** UPDATE: id obrigatório; demais campos parciais */
export const updateContractSchema = createContractSchema;
export type UpdateContractBody = z.infer<typeof updateContractSchema>;
