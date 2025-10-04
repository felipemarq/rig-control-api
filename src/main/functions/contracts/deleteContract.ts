import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { DeleteContractController } from "@application/controllers/contracts/DeleteContractController";

export const handler = lambdaHttpAdapter(DeleteContractController);
