export class Contract {
  readonly id?: string; // UUID gerado no banco
  readonly clientId: string; // FK -> clients.id
  readonly code: string; // Código interno/contratual (ex.: "CT-2025-001")
  readonly status: Contract.Status; // "draft" | "active" | "archived"
  readonly startAt: Date; // Data de início de vigência
  readonly endAt?: Date | null; // Data de término (null = em aberto)
  readonly createdAt?: Date; // Audit
  readonly updatedAt?: Date; // Audit

  constructor(attr: Contract.Attributes) {
    this.id = attr.id;
    this.clientId = attr.clientId;
    this.code = attr.code;
    this.status = attr.status ?? Contract.Status.ACTIVE;
    this.startAt = new Date(attr.startAt);
    this.endAt = attr.endAt ? new Date(attr.endAt) : null;
    this.createdAt = attr.createdAt;
    this.updatedAt = attr.updatedAt;
  }
}

export namespace Contract {
  export type Attributes = {
    id?: string;
    clientId: string;
    code: string;
    status?: Contract.Status;
    startAt: Date;
    endAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  };

  export enum Status {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
  }
}
