import { Client } from "@application/entities/Client";
import { ClientRepository } from "@infra/database/neon/repositories/ClientRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { NotFoundException } from "@application/errors/http/NotFoundException";

@Injectable()
export class GetClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute({ clientId }: GetClientUseCase.Input): Promise<Client> {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException("Client not found");
    }

    return client;
  }
}

export namespace GetClientUseCase {
  export type Input = {
    clientId: string;
  };
}
