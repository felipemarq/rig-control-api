import { ListRigUsersQuery } from "@application/controllers/usersRigAcesss/schema/userRigAccessSchemas";
import { ListRigUsersItem } from "@application/queries/types/UserRigAccessItems";
import { UserRigAccessRepository } from "@infra/database/neon/repositories/UserRigAccessRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class ListRigUsersUseCase {
  constructor(private readonly repo: UserRigAccessRepository) {}

  async execute(
    filters: ListRigUsersUseCase.Input
  ): Promise<ListRigUsersUseCase.Output> {
    const page = Math.max(Number(filters.page ?? "1"), 1);
    const pageSize = Math.min(Math.max(Number(filters.pageSize ?? "10"), 1), 100);

    const result = await this.repo.listUsersForRig({
      rigId: filters.rigId,
      page,
      pageSize,
    });

    return {
      items: result.items,
      total: result.total,
      page: filters.page,
      pageSize: result.pageSize,
      hasNext: result.hasNext,
    };
  }
}

export namespace ListRigUsersUseCase {
  export type Input = ListRigUsersQuery;
  export type Output = {
    items: ListRigUsersItem[];
    total: number;
    page: string | undefined;
    pageSize: number;
    hasNext: boolean;
  };
}
