export const MODULE_KEYS = {
  RIGS: "rigs",
  RIG_ACCESS: "rig-access",
  EFFICIENCY: "efficiency",
} as const;

export type ModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS];
