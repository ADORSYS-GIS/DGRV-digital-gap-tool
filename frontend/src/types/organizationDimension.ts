import { OfflineEntity } from "./sync";

export interface OrganizationDimension extends OfflineEntity {
  organizationId: string;
  dimensionId: string;
  createdAt: Date;
  updatedAt: Date;
}
