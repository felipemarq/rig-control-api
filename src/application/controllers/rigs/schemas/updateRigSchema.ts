import z from "zod";

import { createRigSchema } from "./createRigSchema";

/** UPDATE: id obrigatório; demais campos parciais */
export const updateRigSchema = createRigSchema;
export type UpdateRigBody = z.infer<typeof updateRigSchema>;
