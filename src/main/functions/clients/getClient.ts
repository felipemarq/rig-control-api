import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { GetClientController } from "@application/controllers/clients/GetClientController";

export const handler = lambdaHttpAdapter(GetClientController);
