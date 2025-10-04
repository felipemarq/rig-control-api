import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { ListRigUsersController } from "@application/controllers/usersRigAcesss/ListRigUsersController";

export const handler = lambdaHttpAdapter(ListRigUsersController);
