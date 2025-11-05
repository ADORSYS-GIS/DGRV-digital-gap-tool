import { useQuery } from "@tanstack/react-query";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";

export const useCooperations = () => {
  return useQuery({
    queryKey: ["cooperations"],
    queryFn: cooperationRepository.getAll,
  });
};
