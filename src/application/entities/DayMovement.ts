export type MovementType = "EQUIPMENTS" | "FLUIDS" | "TUBES";

export type DistanceTier = "KM_0_20" | "KM_20_50" | "KM_50_PLUS";

export class DayMovement {
  readonly id?: string;
  readonly dayId?: string;
  readonly type: MovementType;
  readonly distanceKm: number;
  readonly tier: DistanceTier;
  readonly startedAt?: Date | null;
  readonly endedAt?: Date | null;
  readonly notes?: string | null;
  readonly createdAt?: Date;

  constructor(attributes: DayMovement.Attributes) {
    this.id = attributes.id;
    this.dayId = attributes.dayId;
    this.type = attributes.type;
    this.distanceKm = attributes.distanceKm;
    this.tier = attributes.tier;
    this.startedAt = attributes.startedAt ?? null;
    this.endedAt = attributes.endedAt ?? null;
    this.notes = attributes.notes ?? null;
    this.createdAt = attributes.createdAt;
  }
}

export namespace DayMovement {
  export type Attributes = {
    id?: string;
    dayId?: string;
    type: MovementType;
    distanceKm: number;
    tier: DistanceTier;
    startedAt?: Date | null;
    endedAt?: Date | null;
    notes?: string | null;
    createdAt?: Date;
  };
}
