import { SyncStatus } from "./sync";

export type RecommendationPriority = "LOW" | "MEDIUM" | "HIGH";

export interface IRecommendation {
  id: string;
  recommendation_id?: string;
  dimension_id: string;
  title?: string;
  description: string;
  category?: string;
  priority?: RecommendationPriority;
  effort?: string;
  cost?: number;
  impact?: number;
  created_at?: string;
  updated_at?: string;
  syncStatus?: SyncStatus;
  lastError?: string;
}

export interface ICreateRecommendationRequest {
  dimension_id: string;
  priority: RecommendationPriority;
  description: string;
}

export interface IUpdateRecommendationRequest {
  id: string;
  dimension_id?: string;
  priority?: RecommendationPriority;
  description?: string;
}

export interface IRecommendationResponse {
  recommendation_id: string;
  dimension_id: string;
  title: string;
  description: string;
  category?: string;
  priority?: RecommendationPriority;
  effort?: string;
  cost?: number;
  impact?: number;
  created_at: string;
  updated_at: string;
}
