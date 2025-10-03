import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { CreateContractController } from "@application/controllers/contracts/CreateContractController";

export const handler = lambdaHttpAdapter(CreateContractController);
