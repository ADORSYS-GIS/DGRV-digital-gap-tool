/// <reference types="vitest/globals" />
import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useActionPlans } from "../useActionPlans";
import { actionPlanRepository } from "@/services/action_plans/actionPlanRepository";
import { ActionPlan } from "@/types/actionPlan";
import { vi, Mock } from "vitest";

// Mock the actionPlanRepository
vi.mock("@/services/action_plans/actionPlanRepository", () => ({
  actionPlanRepository: {
    getActionPlans: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useActionPlans", () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it("should fetch action plans successfully", async () => {
    const mockActionPlans: ActionPlan[] = [
      {
        action_plan_id: "1",
        assessment_id: "assessment123",
        created_at: new Date().toISOString(),
        action_items: [],
      },
      {
        action_plan_id: "2",
        assessment_id: "assessment456",
        created_at: new Date().toISOString(),
        action_items: [],
      },
    ];
    (actionPlanRepository.getActionPlans as Mock).mockResolvedValue(
      mockActionPlans,
    );

    const { result } = renderHook(() => useActionPlans(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockActionPlans);
    expect(actionPlanRepository.getActionPlans).toHaveBeenCalledTimes(1);
  });

  it("should handle error when fetching action plans", async () => {
    const errorMessage = "Failed to fetch action plans";
    (actionPlanRepository.getActionPlans as Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useActionPlans(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
    expect(actionPlanRepository.getActionPlans).toHaveBeenCalledTimes(1);
  });
});
