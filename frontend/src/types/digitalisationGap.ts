export enum Gap {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export const scoreRanges = {
  [Gap.HIGH]: "0-50",
  [Gap.MEDIUM]: "50-75",
  [Gap.LOW]: "75-100",
};

import { SyncStatus } from "@/types/sync";

export interface IDigitalisationGap {
  id: string;
  dimensionId: string;
  gap_severity: Gap;
  scope: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  syncStatus: SyncStatus;
  lastError?: string;
}

// For display in lists, including dimension name
export interface IDigitalisationGapWithDimension extends IDigitalisationGap {
  dimensionName: string;
}

export type AddDigitalisationGapPayload = Omit<
  IDigitalisationGap,
  "id" | "syncStatus" | "createdAt" | "updatedAt" | "isDeleted"
>;

export type UpdateDigitalisationGapPayload =
  Partial<AddDigitalisationGapPayload> & {
    id: string;
  };
