import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

export const useCurrentUser = () => {
  const { roles } = useAuth();

  const isRole = (role: string) => roles.includes(role);

  const isAdmin = isRole(ROLES.ADMIN);
  const isOrgAdmin = isRole(ROLES.ORG_ADMIN);
  const isCoopAdmin = isRole(ROLES.COOP_ADMIN);

  return {
    roles,
    isRole,
    isAdmin,
    isOrgAdmin,
    isCoopAdmin,
  };
};
