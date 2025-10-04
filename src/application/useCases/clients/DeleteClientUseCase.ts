import { ClientRepository } from "@infra/database/neon/repositories/ClientRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { NotFoundException } from "@application/errors/http/NotFoundException";

@Injectable()
export class DeleteClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute({ clientId }: DeleteClientUseCase.Input): Promise<void> {
    const deleted = await this.clientRepository.delete(clientId);

    if (!deleted) {
      throw new NotFoundException("Client not found");
    }
  }
}

export namespace DeleteClientUseCase {
  export type Input = {
    clientId: string;
  };
}
