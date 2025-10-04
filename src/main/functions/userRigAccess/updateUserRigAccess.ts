import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { UpdateUserRigAccessController } from "@application/controllers/usersRigAcesss/UpdateUserRigAccessController";

export const handler = lambdaHttpAdapter(UpdateUserRigAccessController);
