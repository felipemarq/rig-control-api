import { csvToUuidArray } from "@application/utils/csvToUuidArray";
import { z } from "zod";
import { ufEnum } from "./createRigSchema";

const csvToUfArray = z.preprocess((value) => {
  if (value == null) {
    return [];
  }
  const arr = Array.isArray(value) ? value : [String(value)];
  return arr
    .flatMap((entry) => String(entry).split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(ufEnum));

export const listRigQuerySchema = z.object({
  clientId: csvToUuidArray.optional(),
  contractId: csvToUuidArray.optional(),
  baseId: csvToUuidArray.optional(),
  uf: csvToUfArray.optional(),
  isActive: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "uf"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export type ListRigQuery = z.infer<typeof listRigQuerySchema>;
