export const MODULE_KEYS = {
  RIGS: "RIGS",
  RIG_ACCESS: "RIGS_ACCESS",
  EFFICIENCY: "EFFICIENCY",
} as const;

export type ModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS];
