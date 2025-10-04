export class DayMeasure {
  readonly id?: string;
  readonly dayId?: string;
  readonly key: string;
  readonly unit: string;
  readonly value: number;
  readonly meta?: Record<string, unknown> | null;
  readonly createdAt?: Date;

  constructor(attributes: DayMeasure.Attributes) {
    this.id = attributes.id;
    this.dayId = attributes.dayId;
    this.key = attributes.key;
    this.unit = attributes.unit;
    this.value = attributes.value;
    this.meta = attributes.meta ?? null;
    this.createdAt = attributes.createdAt;
  }
}

export namespace DayMeasure {
  export type Attributes = {
    id?: string;
    dayId?: string;
    key: string;
    unit: string;
    value: number;
    meta?: Record<string, unknown> | null;
    createdAt?: Date;
  };
}
