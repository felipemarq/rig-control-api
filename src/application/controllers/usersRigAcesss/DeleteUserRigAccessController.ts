import { Controller } from "@application/contracts/Controller";
import { DeleteUserRigAccessUseCase } from "@application/useCases/userRigAccess/DeleteUserRigAccessUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import {
  RevokeUserRigAccessBody,
  revokeUserRigAccessSchema,
} from "./schema/userRigAccessSchemas";

@Injectable()
@Schema(revokeUserRigAccessSchema)
export class DeleteUserRigAccessController extends Controller<
  "private",
  void
> {
  constructor(
    private readonly deleteUserRigAccessUseCase: DeleteUserRigAccessUseCase
  ) {
    super();
  }

  protected override async handle({
    userId,
    body,
  }: Controller.Request<
    "private",
    RevokeUserRigAccessBody
  >): Promise<Controller.Response<void>> {
    await this.deleteUserRigAccessUseCase.execute(userId, body);

    return {
      statusCode: 204,
    };
  }
}
