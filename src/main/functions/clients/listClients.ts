import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { ListClientsController } from "@application/controllers/clients/ListClientsController";

export const handler = lambdaHttpAdapter(ListClientsController);
