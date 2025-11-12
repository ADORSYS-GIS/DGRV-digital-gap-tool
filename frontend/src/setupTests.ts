import "@testing-library/jest-dom";
import { vi } from "vitest";
import { mockDb } from "./test/mocks/db";
import { OpenAPI } from "@/openapi-client";

// Set a base URL for the API client
OpenAPI.BASE = "http://localhost:3000";

vi.mock("@/services/db", () => ({
  db: mockDb,
}));
