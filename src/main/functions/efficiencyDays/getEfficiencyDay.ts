import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { GetEfficiencyDayController } from "@application/controllers/efficiencyDays/GetEfficiencyDayController";

export const handler = lambdaHttpAdapter(GetEfficiencyDayController);
