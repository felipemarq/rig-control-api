import { Client } from "@application/entities/Client";
import { ClientRepository } from "@infra/database/neon/repositories/ClientRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute({
    name,
    taxId,
  }: CreateClientUseCase.Input): Promise<CreateClientUseCase.Output> {
    const client = new Client({
      name,
      taxId,
    });

    const createdClient = await this.clientRepository.create(client);

    return createdClient;
  }
}

export namespace CreateClientUseCase {
  export type Input = {
    name: string;
    taxId?: string | undefined;
  };

  export type Output = Client;
}
