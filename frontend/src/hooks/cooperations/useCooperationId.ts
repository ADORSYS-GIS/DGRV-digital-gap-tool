import { useParams } from "react-router-dom";

export const useCooperationId = (): string | null => {
  const { cooperationId } = useParams<{ cooperationId: string }>();
  return cooperationId || null;
};
