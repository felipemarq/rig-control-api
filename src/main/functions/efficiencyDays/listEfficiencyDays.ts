import "reflect-metadata";
import { lambdaHttpAdapter } from "@main/adapters/lambdaHttpAdapter";
import { ListEfficiencyDaysController } from "@application/controllers/efficiencyDays/ListEfficiencyDaysController";

export const handler = lambdaHttpAdapter(ListEfficiencyDaysController);
