import "@testing-library/jest-dom";
import { vi } from "vitest";
import { mockDb } from "./test/mocks/db";

vi.mock("@/services/db", () => ({
  db: mockDb,
}));
