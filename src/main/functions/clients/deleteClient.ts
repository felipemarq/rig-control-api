import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { DeleteClientController } from "@application/controllers/clients/DeleteClientController";

export const handler = lambdaHttpAdapter(DeleteClientController);
