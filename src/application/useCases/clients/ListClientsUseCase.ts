import { ListClientQuery } from "@application/controllers/clients/schemas/listClientQuerySchema";
import { Client } from "@application/entities/Client";
import { ClientRepository } from "@infra/database/neon/repositories/ClientRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class ListClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(
    filters: ListClientsUseCase.Input
  ): Promise<ListClientsUseCase.Output> {
    const result = await this.clientRepository.listAll({ filters });

    return result;
  }
}

export namespace ListClientsUseCase {
  export type Input = ListClientQuery;
  export type Output = {
    items: Client[];
    total: number;
    page: string | undefined;
    pageSize: number;
    hasNext: boolean;
  };
}
