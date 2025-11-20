import { useParams } from "react-router-dom";

export const useCooperationId = (): string | undefined => {
  const { cooperationId } = useParams<{ cooperationId: string }>();
  return cooperationId;
};
