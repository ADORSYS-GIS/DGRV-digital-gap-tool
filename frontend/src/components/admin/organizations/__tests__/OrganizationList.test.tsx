import { render, screen } from "@/utils/test-utils";
import { OrganizationList } from "../OrganizationList";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { Organization } from "@/types/organization";

describe("OrganizationList", () => {
  it("renders a list of organizations", () => {
    const organizations: Organization[] = [
      { id: "1", name: "Org 1", domain: "org1.com", syncStatus: "synced" },
      { id: "2", name: "Org 2", domain: "org2.com", syncStatus: "synced" },
    ];

    render(<OrganizationList organizations={organizations} />);

    expect(screen.getByText("Org 1")).toBeInTheDocument();
    expect(screen.getByText("Org 2")).toBeInTheDocument();
  });

  it("renders a message when no organizations are provided", () => {
    render(<OrganizationList organizations={[]} />);

    expect(screen.getByText("No organizations found.")).toBeInTheDocument();
  });
});
