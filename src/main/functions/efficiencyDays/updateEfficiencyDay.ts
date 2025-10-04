import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { UpdateEfficiencyDayController } from "@application/controllers/efficiencyDays/UpdateEfficiencyDayController";

export const handler = lambdaHttpAdapter(UpdateEfficiencyDayController);
