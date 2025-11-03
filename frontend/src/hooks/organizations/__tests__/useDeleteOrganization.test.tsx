import { renderHook, act, waitFor } from "@testing-library/react";
import { useDeleteOrganization } from "../useDeleteOrganization";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Organization } from "@/types/organization";
import { organizationRepository } from "@/services/organizations/organizationRepository";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("useDeleteOrganization", () => {
  beforeEach(() => {
    vi.spyOn(organizationRepository, "delete").mockImplementation(
      async () => {},
    );
  });

  it("should optimistically delete an organization", async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const initialOrganizations: Organization[] = [
      { id: "1", name: "Org 1", domain: "org1.com", syncStatus: "synced" },
      { id: "2", name: "Org 2", domain: "org2.com", syncStatus: "synced" },
    ];
    queryClient.setQueryData(["organizations"], initialOrganizations);

    const { result } = renderHook(() => useDeleteOrganization(), {
      wrapper,
    });

    act(() => {
      result.current.mutate("1");
    });

    await waitFor(() => {
      const organizations = queryClient.getQueryData<Organization[]>([
        "organizations",
      ]);
      expect(organizations).not.toBeUndefined();
      if (organizations) {
        expect(organizations).toHaveLength(1);
        if (organizations[0]) {
          expect(organizations[0].id).toBe("2");
        }
      }
    });
  });
});
