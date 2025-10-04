import { UserRigAccess } from "@application/entities/UserRigAcess";
import { Rig } from "@application/entities/Rig";

export type ListUserRigAccessItem = UserRigAccess & {
  rig: {
    id: string;
    name: string;
    timezone: string;
    uf: Rig["uf"];
  };
};

export type ListRigUsersItem = UserRigAccess & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};
