// application/validation/userRigAccessSchemas.ts
import { z } from "zod";

export const accessLevelEnum = z.enum(["none", "read", "write", "admin"]);

export const createUserRigAccessSchema = z.object({
  userId: z.string().uuid("userId inválido"),
  rigId: z.string().uuid("rigId inválido"),
  level: accessLevelEnum.default("read"),
});
export type CreateUserRigAccessBody = z.infer<typeof createUserRigAccessSchema>;

export const updateUserRigAccessSchema = z.object({
  userId: z.string().uuid("userId inválido"),
  rigId: z.string().uuid("rigId inválido"),
  level: accessLevelEnum, // novo nível
});
export type UpdateUserRigAccessBody = z.infer<typeof updateUserRigAccessSchema>;

export const revokeUserRigAccessSchema = z.object({
  userId: z.string().uuid("userId inválido"),
  rigId: z.string().uuid("rigId inválido"),
});
export type RevokeUserRigAccessBody = z.infer<typeof revokeUserRigAccessSchema>;

export const listUserRigAccessQuerySchema = z.object({
  userId: z.string().uuid("userId inválido"),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
});
export type ListUserRigAccessQuery = z.infer<
  typeof listUserRigAccessQuerySchema
>;

export const listRigUsersQuerySchema = z.object({
  rigId: z.string().uuid("rigId inválido"),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
});
export type ListRigUsersQuery = z.infer<typeof listRigUsersQuerySchema>;
