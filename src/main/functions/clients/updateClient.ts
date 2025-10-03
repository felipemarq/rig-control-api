import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { UpdateClientController } from "@application/controllers/clients/UpdateClientController";

export const handler = lambdaHttpAdapter(UpdateClientController);
