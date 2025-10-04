import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { CreateEfficiencyDayController } from "@application/controllers/efficiency/CreateEfficiencyDayController";

export const handler = lambdaHttpAdapter(CreateEfficiencyDayController);
