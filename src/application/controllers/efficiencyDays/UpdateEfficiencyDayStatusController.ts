import { Controller } from "@application/contracts/Controller";
import { EfficiencyDay } from "@application/entities/EfficiencyDay";
import { Injectable } from "@kernel/decorators/Injectable";
import { UpdateEfficiencyDayStatusUseCase } from "@application/useCases/efficiencyDays/UpdateEfficiencyDayStatusUseCase";
import { efficiencyDayParamsSchema } from "./schemas/efficiencyDayParamsSchema";
import {
  UpdateEfficiencyDayStatusBody,
  updateEfficiencyDayStatusSchema,
} from "./schemas/updateEfficiencyDayStatusSchema";

@Injectable()
export class UpdateEfficiencyDayStatusController extends Controller<
  "private",
  EfficiencyDay
> {
  constructor(
    private readonly updateEfficiencyDayStatusUseCase: UpdateEfficiencyDayStatusUseCase
  ) {
    super();
  }

  protected override async handle({
    userId,
    body,
    params,
  }: Controller.Request<
    "private",
    UpdateEfficiencyDayStatusBody,
    { rigId: string; localDate: string },
    Record<string, never>
  >): Promise<Controller.Response<EfficiencyDay>> {
    const parsedBody = updateEfficiencyDayStatusSchema.parse(body ?? {});
    const { rigId, localDate } = efficiencyDayParamsSchema.parse(params ?? {});

    const efficiencyDay = await this.updateEfficiencyDayStatusUseCase.execute(
      userId,
      {
        rigId,
        localDate,
        status: parsedBody.status,
      }
    );

    return {
      statusCode: 200,
      body: efficiencyDay,
    };
  }
}
