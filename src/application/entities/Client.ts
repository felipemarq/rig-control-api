export class Client {
  readonly id?: string; // UUID gerado no banco
  readonly name: string; // Nome do cliente (ex.: "PETROBRAS")
  readonly taxId?: string; // CNPJ/CPF (ex.: "12.345.678/0001-99")
  readonly createdAt?: Date; // Audit
  readonly updatedAt?: Date; // Audit
  readonly deletedAt?: Date | null; // Soft delete (quando não-null)

  constructor(attr: Client.Attributes) {
    this.id = attr.id;
    this.name = attr.name;
    this.taxId = attr.taxId;
    this.createdAt = attr.createdAt;
    this.updatedAt = attr.updatedAt;
    this.deletedAt = attr.deletedAt ?? null;
  }
}

export namespace Client {
  export type Attributes = {
    id?: string;
    name: string;
    taxId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
  };
}
