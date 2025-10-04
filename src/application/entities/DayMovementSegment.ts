export class DayMovementSegment {
  readonly dayMovementId: string;
  readonly daySegmentId: string;

  constructor(attributes: DayMovementSegment.Attributes) {
    this.dayMovementId = attributes.dayMovementId;
    this.daySegmentId = attributes.daySegmentId;
  }
}

export namespace DayMovementSegment {
  export type Attributes = {
    dayMovementId: string;
    daySegmentId: string;
  };
}
