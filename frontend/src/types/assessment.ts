import { OfflineEntity } from "./sync";

export interface Assessment extends OfflineEntity {
  name: string;
  dimensionIds?: string[];
}