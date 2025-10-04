import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { UpdateEfficiencyDayStatusController } from "@application/controllers/efficiencyDays/UpdateEfficiencyDayStatusController";

export const handler = lambdaHttpAdapter(UpdateEfficiencyDayStatusController);
