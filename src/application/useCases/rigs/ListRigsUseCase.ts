import { ListRigQuery } from "@application/controllers/rigs/schemas/listRigQuerySchema";
import { ListRigItem } from "@application/queries/types/ListRigItem";
import { RigRepository } from "@infra/database/neon/repositories/RigRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class ListRigsUseCase {
  constructor(private readonly rigRepository: RigRepository) {}

  async execute(filters: ListRigsUseCase.Input): Promise<ListRigsUseCase.Output> {
    const result = await this.rigRepository.listAll({ filters });

    return result;
  }
}

export namespace ListRigsUseCase {
  export type Input = ListRigQuery;
  export type Output = {
    items: ListRigItem[];
    total: number;
    page: string | undefined;
    pageSize: number;
    hasNext: boolean;
  };
}
