// application/entities/UserRigAccess.ts

export type AccessLevel = "none" | "read" | "write" | "admin";

export class UserRigAccess {
  readonly userId: string; // FK -> users.id
  readonly rigId: string; // FK -> rigs.id
  readonly level: AccessLevel; // "read" | "write" | "admin" (evite "none" na prática)
  readonly assignedByUserId?: string | null; // quem concedeu
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(attr: UserRigAccess.Attributes) {
    this.userId = attr.userId;
    this.rigId = attr.rigId;
    this.level = attr.level ?? "read";
    this.assignedByUserId = attr.assignedByUserId ?? null;
    this.createdAt = attr.createdAt;
    this.updatedAt = attr.updatedAt;
  }
}

export namespace UserRigAccess {
  export type Attributes = {
    userId: string;
    rigId: string;
    level?: AccessLevel;
    assignedByUserId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  };
}
