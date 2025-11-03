import { OfflineEntity } from "@/types/sync";

export type Dimension = OfflineEntity & {
  name: string;
  description?: string;
};
