import { z } from "zod";

export const listClientQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export type ListClientQuery = z.infer<typeof listClientQuerySchema>;
