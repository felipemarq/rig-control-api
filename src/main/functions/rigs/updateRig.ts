import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { UpdateRigController } from "@application/controllers/rigs/UpdateRigController";

export const handler = lambdaHttpAdapter(UpdateRigController);
