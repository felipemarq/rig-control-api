import { csvToUuidArray } from "@application/utils/csvToUuidArray";
import { z } from "zod";

export const listContractQuerySchema = z.object({
  clientId: csvToUuidArray.optional(),
  sortBy: z.enum(["createdAt", "code"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  search: z.string().optional(),
});

export type ListContractQuery = z.infer<typeof listContractQuerySchema>;
