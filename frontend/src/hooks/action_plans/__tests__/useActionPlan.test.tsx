import { vi, Mock, expect, describe, beforeEach, it } from "vitest";
import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useActionPlan } from "../useActionPlan";
import { actionPlanRepository } from "@/services/action_plans/actionPlanRepository";
import { ActionPlan } from "@/types/actionPlan";

// Mock the actionPlanRepository
vi.mock("@/services/action_plans/actionPlanRepository", () => ({
  actionPlanRepository: {
    getActionPlanByAssessmentId: vi.fn(),
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

describe("useActionPlan", () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it("should fetch the action plan by assessment ID successfully", async () => {
    const mockActionPlan: ActionPlan = {
      action_plan_id: "1",
      assessment_id: "assessment123",
      created_at: new Date().toISOString(),
      action_items: [],
    };
    (actionPlanRepository.getActionPlanByAssessmentId as Mock).mockResolvedValue(mockActionPlan);

    const { result } = renderHook(() => useActionPlan("assessment123"), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockActionPlan);
    expect(actionPlanRepository.getActionPlanByAssessmentId).toHaveBeenCalledWith("assessment123");
  });

  it("should not fetch if assessmentId is undefined", () => {
    const { result } = renderHook(() => useActionPlan(undefined), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(actionPlanRepository.getActionPlanByAssessmentId).not.toHaveBeenCalled();
  });

  it("should handle error when fetching action plan", async () => {
    const errorMessage = "Failed to fetch action plan";
    (actionPlanRepository.getActionPlanByAssessmentId as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useActionPlan("assessment123"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
    expect(actionPlanRepository.getActionPlanByAssessmentId).toHaveBeenCalledWith("assessment123");
  });
});