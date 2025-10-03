import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { CreateRigController } from "@application/controllers/rigs/CreateRigController";

export const handler = lambdaHttpAdapter(CreateRigController);
