import { OfflineEntity } from "@/types/sync/index";
import { CreateDimensionRequest } from "@/openapi-client/types.gen";

export interface IDimension extends OfflineEntity {
  name: string;
  description?: string | null;
  category?: string | null;
  weight?: number | null;
  is_active?: boolean | null;
}

export interface ICreateDimensionRequest extends CreateDimensionRequest {
  id?: string; // Temporary ID for offline creation
}
