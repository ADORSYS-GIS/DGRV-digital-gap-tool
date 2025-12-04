import { listSubmissionsByCooperation } from "@/openapi-client";
import { useQuery } from "@tanstack/react-query";

export const useSubmissionsByCooperation = (
  cooperationId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["submissions", "cooperation", cooperationId],
    queryFn: async () => {
      const response = await listSubmissionsByCooperation({ cooperationId });
      return response.data || [];
    },
    enabled: !!options?.enabled,
  });
};
