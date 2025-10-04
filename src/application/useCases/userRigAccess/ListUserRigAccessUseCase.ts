import { ListUserRigAccessQuery } from "@application/controllers/usersRigAcesss/schema/userRigAccessSchemas";
import { ListUserRigAccessItem } from "@application/queries/types/UserRigAccessItems";
import { UserRigAccessRepository } from "@infra/database/neon/repositories/UserRigAccessRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class ListUserRigAccessUseCase {
  constructor(private readonly repo: UserRigAccessRepository) {}

  async execute(
    filters: ListUserRigAccessUseCase.Input
  ): Promise<ListUserRigAccessUseCase.Output> {
    const page = Math.max(Number(filters.page ?? "1"), 1);
    const pageSize = Math.min(Math.max(Number(filters.pageSize ?? "10"), 1), 100);

    const result = await this.repo.listRigsForUser({
      userId: filters.userId,
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

export namespace ListUserRigAccessUseCase {
  export type Input = ListUserRigAccessQuery;
  export type Output = {
    items: ListUserRigAccessItem[];
    total: number;
    page: string | undefined;
    pageSize: number;
    hasNext: boolean;
  };
}
