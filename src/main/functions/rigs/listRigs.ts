import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { ListRigsController } from "@application/controllers/rigs/ListRigsController";

export const handler = lambdaHttpAdapter(ListRigsController);
