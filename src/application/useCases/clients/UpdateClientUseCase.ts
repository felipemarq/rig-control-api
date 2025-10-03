import { Client } from "@application/entities/Client";
import { ClientRepository } from "@infra/database/neon/repositories/ClientRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { CreateClientUseCase } from "./CreateClientUseCase";

@Injectable()
export class UpdateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute({
    clientId,
    name,
    taxId,
  }: UpdateClientUseCase.Input): Promise<UpdateClientUseCase.Output> {
    const client = new Client({
      id: clientId,
      name,
      taxId,
    });

    const updatedClient = await this.clientRepository.update(clientId, client);

    return updatedClient;
  }
}

export namespace UpdateClientUseCase {
  export type Input = CreateClientUseCase.Input & {
    clientId: string;
  };

  export type Output = Client;
}
