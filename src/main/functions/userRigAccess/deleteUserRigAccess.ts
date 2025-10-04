import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { DeleteUserRigAccessController } from "@application/controllers/usersRigAcesss/DeleteUserRigAccessController";

export const handler = lambdaHttpAdapter(DeleteUserRigAccessController);
