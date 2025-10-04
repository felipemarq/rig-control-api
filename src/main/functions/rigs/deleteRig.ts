import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { DeleteRigController } from "@application/controllers/rigs/DeleteRigController";

export const handler = lambdaHttpAdapter(DeleteRigController);
