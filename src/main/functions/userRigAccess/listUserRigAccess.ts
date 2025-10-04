import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { ListUserRigAccessController } from "@application/controllers/usersRigAcesss/ListUserRigAccessController";

export const handler = lambdaHttpAdapter(ListUserRigAccessController);
