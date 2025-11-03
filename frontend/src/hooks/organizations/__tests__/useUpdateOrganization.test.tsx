import { renderHook, act, waitFor } from "@testing-library/react";
import { useUpdateOrganization } from "../useUpdateOrganization";
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

describe("useUpdateOrganization", () => {
  beforeEach(() => {
    vi.spyOn(organizationRepository, "update").mockImplementation(
      async (_id, updates) => {
        return {
          ...(updates as Organization),
          updatedAt: new Date().toISOString(),
        };
      },
    );
  });

  it("should optimistically update an organization", async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const initialOrganizations: Organization[] = [
      { id: "1", name: "Org 1", domain: "org1.com", syncStatus: "synced" },
      { id: "2", name: "Org 2", domain: "org2.com", syncStatus: "synced" },
    ];
    queryClient.setQueryData(["organizations"], initialOrganizations);

    const { result } = renderHook(() => useUpdateOrganization(), {
      wrapper,
    });

    act(() => {
      result.current.mutate({
        id: "1",
        name: "Updated Org",
        domain: "updated.com",
        syncStatus: "synced",
      });
    });

    await waitFor(() => {
      const organizations = queryClient.getQueryData<Organization[]>([
        "organizations",
      ]);
      expect(organizations).toHaveLength(2);
      const updatedOrg = organizations?.find((org) => org.id === "1");
      expect(updatedOrg?.name).toBe("Updated Org");
    });
  });
});
