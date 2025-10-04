import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { GetRigController } from "@application/controllers/rigs/GetRigController";

export const handler = lambdaHttpAdapter(GetRigController);
