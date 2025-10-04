export type SegmentKind =
  | "OPERATING"
  | "DTM"
  | "GLOSA"
  | "REPAIR"
  | "OTHER";

export class DaySegment {
  readonly id?: string;
  readonly dayId?: string;
  readonly kind: SegmentKind;
  readonly subtype?: string | null;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly wellId?: string | null;
  readonly repairSystemId?: string | null;
  readonly repairPartId?: string | null;
  readonly notes?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(attributes: DaySegment.Attributes) {
    this.id = attributes.id;
    this.dayId = attributes.dayId;
    this.kind = attributes.kind;
    this.subtype = attributes.subtype ?? null;
    this.startsAt = attributes.startsAt;
    this.endsAt = attributes.endsAt;
    this.wellId = attributes.wellId ?? null;
    this.repairSystemId = attributes.repairSystemId ?? null;
    this.repairPartId = attributes.repairPartId ?? null;
    this.notes = attributes.notes ?? null;
    this.createdAt = attributes.createdAt;
    this.updatedAt = attributes.updatedAt;
  }
}

export namespace DaySegment {
  export type Attributes = {
    id?: string;
    dayId?: string;
    kind: SegmentKind;
    subtype?: string | null;
    startsAt: Date;
    endsAt: Date;
    wellId?: string | null;
    repairSystemId?: string | null;
    repairPartId?: string | null;
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  };
}
