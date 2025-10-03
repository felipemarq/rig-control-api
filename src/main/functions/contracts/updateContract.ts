import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { UpdateContractController } from "@application/controllers/contracts/UpdateContractController";

export const handler = lambdaHttpAdapter(UpdateContractController);
