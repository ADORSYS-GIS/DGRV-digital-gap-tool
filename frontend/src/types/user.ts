import { KeycloakUser as ApiKeycloakUser } from "@/openapi-client/types.gen";
import { OfflineEntity } from "@/types/sync/index";

export interface KeycloakUser extends ApiKeycloakUser, OfflineEntity {
  orgId: string;
}
