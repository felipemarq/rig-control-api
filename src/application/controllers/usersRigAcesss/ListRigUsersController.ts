import { Controller } from "@application/contracts/Controller";
import { ListRigUsersUseCase } from "@application/useCases/userRigAccess/ListRigUsersUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import {
  ListRigUsersQuery,
  listRigUsersQuerySchema,
} from "./schema/userRigAccessSchemas";
import { ListRigUsersItem } from "@application/queries/types/UserRigAccessItems";

@Injectable()
export class ListRigUsersController extends Controller<
  "private",
  ListRigUsersController.Response
> {
  constructor(
    private readonly listRigUsersUseCase: ListRigUsersUseCase
  ) {
    super();
  }

  protected override async handle({
    queryParams,
  }: Controller.Request<
    "private",
    Record<string, never>,
    Record<string, never>,
    ListRigUsersQuery
  >): Promise<Controller.Response<ListRigUsersController.Response>> {
    const filters = listRigUsersQuerySchema.parse(queryParams ?? {});

    const { hasNext, items, page, pageSize, total } =
      await this.listRigUsersUseCase.execute(filters);

    return {
      statusCode: 200,
      body: { hasNext, items, page, pageSize, total },
    };
  }
}

export namespace ListRigUsersController {
  export type Response = {
    items: ListRigUsersItem[];
    total: number;
    page: string | undefined;
    pageSize: number;
    hasNext: boolean;
  };
}
