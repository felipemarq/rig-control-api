import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { CreateUserRigAccessController } from "@application/controllers/usersRigAcesss/CreateUserRigAccessController";

export const handler = lambdaHttpAdapter(CreateUserRigAccessController);
