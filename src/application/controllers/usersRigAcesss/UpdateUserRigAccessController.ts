import { Controller } from "@application/contracts/Controller";
import { UserRigAccess } from "@application/entities/UserRigAcess";
import { UpdateUserRigAccessUseCase } from "@application/useCases/userRigAccess/UpdateUserRigAccessUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import {
  UpdateUserRigAccessBody,
  updateUserRigAccessSchema,
} from "./schema/userRigAccessSchemas";

@Injectable()
@Schema(updateUserRigAccessSchema)
export class UpdateUserRigAccessController extends Controller<
  "private",
  UserRigAccess
> {
  constructor(
    private readonly updateUserRigAccessUseCase: UpdateUserRigAccessUseCase
  ) {
    super();
  }

  protected override async handle({
    userId,
    body,
  }: Controller.Request<
    "private",
    UpdateUserRigAccessBody
  >): Promise<Controller.Response<UserRigAccess>> {
    const access = await this.updateUserRigAccessUseCase.execute(userId, body);

    return {
      statusCode: 200,
      body: access,
    };
  }
}
