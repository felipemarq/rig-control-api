import { Controller } from "@application/contracts/Controller";
import { EfficiencyDay } from "@application/entities/EfficiencyDay";
import { BadRequestException } from "@application/errors/http/BadRequestException";
import {
  SaveEfficiencyDayBody,
  saveEfficiencyDaySchema,
} from "./schemas/saveEfficiencyDaySchema";
import { Injectable } from "@kernel/decorators/Injectable";
import { UpsertEfficiencyDayUseCase } from "@application/useCases/efficiencyDays/UpsertEfficiencyDayUseCase";
import { efficiencyDayParamsSchema } from "./schemas/efficiencyDayParamsSchema";

@Injectable()
export class UpdateEfficiencyDayController extends Controller<
  "private",
  UpdateEfficiencyDayController.Response
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
    { rigId: string; localDate: string },
    Record<string, never>
  >): Promise<Controller.Response<UpdateEfficiencyDayController.Response>> {
    const { rigId, localDate } = efficiencyDayParamsSchema.parse(params ?? {});
    if (body?.localDate && body.localDate !== localDate) {
      throw new BadRequestException(
        "Body localDate must match the URL parameter"
      );
    }

    const parsedBody = saveEfficiencyDaySchema.parse({
      ...body,
      localDate,
    });

    const efficiencyDay = await this.upsertEfficiencyDayUseCase.execute(
      userId,
      {
        ...parsedBody,
        localDate,
        rigId,
      }
    );

    return {
      statusCode: 200,
      body: efficiencyDay,
    };
  }
}

export namespace UpdateEfficiencyDayController {
  export type Response = EfficiencyDay;
}
