export class EfficiencyDay {
  readonly id?: string;
  readonly rigId: string;
  readonly localDate: string;
  readonly status: EfficiencyDay.Status;
  readonly totals: EfficiencyDay.Totals | null;
  readonly confirmedAt?: Date | null;
  readonly confirmedByUserId?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(attributes: EfficiencyDay.Attributes) {
    this.id = attributes.id;
    this.rigId = attributes.rigId;
    this.localDate = attributes.localDate;
    this.status = attributes.status;
    this.totals = attributes.totals ?? null;
    this.confirmedAt =
      attributes.confirmedAt === undefined
        ? undefined
        : attributes.confirmedAt ?? null;
    this.confirmedByUserId =
      attributes.confirmedByUserId === undefined
        ? undefined
        : attributes.confirmedByUserId ?? null;
    this.createdAt = attributes.createdAt;
    this.updatedAt = attributes.updatedAt;
  }
}

export namespace EfficiencyDay {
  export type Status = "draft" | "ready" | "confirmed";

  export type Totals = Record<string, unknown>;

  export type Attributes = {
    id?: string;
    rigId: string;
    localDate: string;
    status: Status;
    totals?: Totals | null;
    confirmedAt?: Date | null;
    confirmedByUserId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  };
}
