export const ACCESS_LEVELS = ["none", "read", "write", "admin"] as const;

export type AccessLevel = (typeof ACCESS_LEVELS)[number];

const ACCESS_LEVEL_WEIGHT: Record<AccessLevel, number> = {
  none: 0,
  read: 1,
  write: 2,
  admin: 3,
};

export function hasSufficientAccess(
  current: AccessLevel | null | undefined,
  required: AccessLevel
): boolean {
  const normalizedCurrent = current ?? "none";
  return ACCESS_LEVEL_WEIGHT[normalizedCurrent] >= ACCESS_LEVEL_WEIGHT[required];
}

export function getHigherAccessLevel(
  a: AccessLevel,
  b: AccessLevel
): AccessLevel {
  return ACCESS_LEVEL_WEIGHT[a] >= ACCESS_LEVEL_WEIGHT[b] ? a : b;
}
