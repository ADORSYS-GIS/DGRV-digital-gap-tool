import { useAuth } from "@/context/AuthContext";

export const useCooperationId = (): string | null => {
  const { user } = useAuth();
  if (user?.cooperation) {
    return user.cooperation;
  }
  return null;
};
