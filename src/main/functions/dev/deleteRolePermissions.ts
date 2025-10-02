import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { DeleteRolePermissionsController } from "@application/controllers/dev/DeleteRolePermissionsController";

export const handler = lambdaHttpAdapter(DeleteRolePermissionsController);
