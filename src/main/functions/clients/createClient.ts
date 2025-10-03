import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { CreateClientController } from "@application/controllers/clients/CreateClientController";

export const handler = lambdaHttpAdapter(CreateClientController);
