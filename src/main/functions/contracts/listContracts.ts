import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { ListContractController } from "@application/controllers/contracts/ListContractController";

export const handler = lambdaHttpAdapter(ListContractController);
