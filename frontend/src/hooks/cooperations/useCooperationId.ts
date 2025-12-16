import { useParams } from "react-router-dom";

/**
 * Returns the cooperationId from the current route params.
 * Note: for coop admins landing on routes without a :cooperationId segment,
 * this will be null. In that case you must either navigate with the ID in
 * the path or derive it from another source (e.g., token claim).
 */
export const useCooperationId = (): string | null => {
  const { cooperationId } = useParams<{ cooperationId: string }>();

  // Debug log to visualize what the router is providing.
  // This log is intentional per user request.
  console.log(
    "[useCooperationId] cooperationId from route params:",
    cooperationId,
  );

  return cooperationId || null;
};
