import { renderHook, act, waitFor } from "@testing-library/react";
import { useAddOrganization } from "../useAddOrganization";
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

describe("useAddOrganization", () => {
  beforeEach(() => {
    vi.spyOn(organizationRepository, "add").mockImplementation(async (org) => ({
      ...org,
      id: crypto.randomUUID(),
      syncStatus: "synced",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  });

  it("should optimistically add a new organization", async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAddOrganization(), {
      wrapper,
    });

    act(() => {
      queryClient.setQueryData(["organizations"], []);
      result.current.mutate({ name: "New Org", domain: "new.org" });
    });

    await waitFor(() => {
      const organizations = queryClient.getQueryData<Organization[]>([
        "organizations",
      ]);
      expect(organizations).not.toBeUndefined();
      if (organizations) {
        expect(organizations).toHaveLength(1);
        if (organizations[0]) {
          expect(organizations[0].name).toBe("New Org");
        }
      }
    });
  });
});
