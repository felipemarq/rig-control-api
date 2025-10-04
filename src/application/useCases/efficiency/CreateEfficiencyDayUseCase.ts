import { EfficiencyDay } from "@application/entities/EfficiencyDay";
import { EfficiencyDayRepository } from "@infra/database/neon/repositories/EfficiencyDayRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateEfficiencyDayUseCase {
  constructor(
    private readonly efficiencyDayRepository: EfficiencyDayRepository
  ) {}

  async execute(
    input: CreateEfficiencyDayUseCase.Input
  ): Promise<CreateEfficiencyDayUseCase.Output> {
    const day = new EfficiencyDay({
      rigId: input.rigId,
      localDate: input.localDate,
      status: input.status ?? "draft",
      totals: input.totals ?? null,
      confirmedAt: input.confirmedAt,
      confirmedByUserId: input.confirmedByUserId,
    });

    const upsertedDay = await this.efficiencyDayRepository.upsert(day);

    return upsertedDay;
  }
}

export namespace CreateEfficiencyDayUseCase {
  export type Input = {
    rigId: string;
    localDate: string;
    status?: EfficiencyDay.Status;
    totals?: EfficiencyDay.Totals | null;
    confirmedAt?: Date | null;
    confirmedByUserId?: string | null;
  };

  export type Output = EfficiencyDay;
}
