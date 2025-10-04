import { Controller } from "@application/contracts/Controller";
import { EfficiencyDay } from "@application/entities/EfficiencyDay";
import { SaveEfficiencyDayBody, saveEfficiencyDaySchema } from "./schemas/saveEfficiencyDaySchema";
import { Injectable } from "@kernel/decorators/Injectable";
import { UpsertEfficiencyDayUseCase } from "@application/useCases/efficiencyDays/UpsertEfficiencyDayUseCase";
import { updateRigParamsSchema } from "@application/controllers/rigs/schemas/updateRigParamsSchema";

@Injectable()
export class CreateEfficiencyDayController extends Controller<
  "private",
  CreateEfficiencyDayController.Response
> {
  constructor(
    private readonly upsertEfficiencyDayUseCase: UpsertEfficiencyDayUseCase
  ) {
    super();
  }

  protected override async handle({
    userId,
    body,
    params,
  }: Controller.Request<
    "private",
    SaveEfficiencyDayBody,
    { rigId: string },
    Record<string, never>
  >): Promise<
    Controller.Response<CreateEfficiencyDayController.Response>
  > {
    const parsedBody = saveEfficiencyDaySchema.parse(body ?? {});
    const { rigId } = updateRigParamsSchema.parse(params ?? {});

    const efficiencyDay = await this.upsertEfficiencyDayUseCase.execute(
      userId,
      {
        ...parsedBody,
        rigId,
      }
    );

    return {
      statusCode: 201,
      body: efficiencyDay,
    };
  }
}

export namespace CreateEfficiencyDayController {
  export type Response = EfficiencyDay;
}
