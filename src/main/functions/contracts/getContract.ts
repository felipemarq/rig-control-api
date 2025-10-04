import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { GetContractController } from "@application/controllers/contracts/GetContractController";

export const handler = lambdaHttpAdapter(GetContractController);
