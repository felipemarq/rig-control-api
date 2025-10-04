import { Client } from "@application/entities/Client";
import { Contract } from "@application/entities/Contract";
import { Rig } from "@application/entities/Rig";

export type ListRigItem = Rig & {
  client: Client | null;
  contract: Contract | null;
  base: {
    id: string;
    name: string;
    uf: Rig["uf"];
    stateFlagKey: string | null;
  } | null;
};
