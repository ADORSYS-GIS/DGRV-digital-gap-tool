import { renderHook, waitFor } from "@testing-library/react";
import { useOrganizations } from "../useOrganizations";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect } from "vitest";
import { Organization } from "@/types/organization";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("useOrganizations", () => {
  it("should return a list of organizations", async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const initialOrganizations: Organization[] = [
      { id: "1", name: "Org 1", domain: "org1.com", syncStatus: "synced" },
      { id: "2", name: "Org 2", domain: "org2.com", syncStatus: "synced" },
    ];
    queryClient.setQueryData(["organizations"], initialOrganizations);

    const { result } = renderHook(() => useOrganizations(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
    });
  });
});
