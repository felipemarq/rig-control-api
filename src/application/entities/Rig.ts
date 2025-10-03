// application/entities/Rig.ts

export type UF =
  | "AC"
  | "AL"
  | "AM"
  | "AP"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MG"
  | "MS"
  | "MT"
  | "PA"
  | "PB"
  | "PE"
  | "PI"
  | "PR"
  | "RJ"
  | "RN"
  | "RO"
  | "RR"
  | "RS"
  | "SC"
  | "SE"
  | "SP"
  | "TO";

export class Rig {
  readonly id?: string; // UUID (gerado no banco)
  readonly name: string; // Nome único da sonda (ex.: "SPT-88")
  readonly clientId?: string | null; // FK -> clients.id (opcional)
  readonly contractId?: string | null; // FK -> contracts.id (opcional)
  readonly baseId?: string | null; // FK -> bases.id (opcional)
  readonly uf: UF; // Estado (enum)
  readonly timezone: string; // IANA TZ (ex.: "America/Bahia")
  readonly isActive: boolean; // Ativa?
  readonly createdAt?: Date; // Audit
  readonly updatedAt?: Date; // Audit

  constructor(attr: Rig.Attributes) {
    this.id = attr.id;
    this.name = attr.name;
    this.clientId = attr.clientId ?? null;
    this.contractId = attr.contractId ?? null;
    this.baseId = attr.baseId ?? null;
    this.uf = attr.uf;
    this.timezone = attr.timezone ?? "America/Bahia";
    this.isActive = attr.isActive ?? true;
    this.createdAt = attr.createdAt;
    this.updatedAt = attr.updatedAt;
  }
}

export namespace Rig {
  export type Attributes = {
    id?: string;
    name: string;
    clientId?: string | null;
    contractId?: string | null;
    baseId?: string | null;
    uf: UF;
    timezone?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
}
