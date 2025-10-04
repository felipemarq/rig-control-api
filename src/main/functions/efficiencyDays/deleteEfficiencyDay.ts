import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { DeleteEfficiencyDayController } from "@application/controllers/efficiencyDays/DeleteEfficiencyDayController";

export const handler = lambdaHttpAdapter(DeleteEfficiencyDayController);
