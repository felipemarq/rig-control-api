import { Contract } from "@application/entities/Contract";

export type ListContractItem = {
  client: {
    id?: string | undefined;
    name?: string | undefined;
    taxId?: string | null | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: Date | null | undefined;
  };
  id?: string | undefined;
  clientId: string;
  code: string;
  status: Contract.Status;
  startAt: Date;
  endAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};
