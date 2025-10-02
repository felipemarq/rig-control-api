import { Controller } from "@application/contracts/Controller";
import { User } from "@application/entities/User";
import { DatabaseService } from "@infra/database/neon";
import { rolePermissions } from "@infra/database/neon/schema";
//import { GetMeQuery } from "@application/queries/GetMeQuery";

import { Injectable } from "@kernel/decorators/Injectable";
import { eq } from "drizzle-orm";

@Injectable()
export class DeleteRolePermissionsController extends Controller<
  "public",
  DeleteRolePermissionsController.Response
> {
  constructor(
    /* private readonly getMeQuery: GetMeQuery */
    private readonly databaseService: DatabaseService
  ) {
    super();
  }

  protected override async handle({
    userId,
  }: Controller.Request<"public">): Promise<
    Controller.Response<DeleteRolePermissionsController.Response>
  > {
    await this.databaseService.db
      .delete(rolePermissions)
      .where(
        eq(rolePermissions.roleId, "ffdd8cbe-0214-4c2d-b488-8677db1e0f03")
      );

    return {
      statusCode: 200,
      body: {
        email: "felipe@moneystack.com.br",
        name: "Felipe",
        externalId: "123456789",
      },
    };
  }
}

export namespace DeleteRolePermissionsController {
  export type Response = User;
}
