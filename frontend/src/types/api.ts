export interface IApiResponseDimensionState {
  current_state_id?: string;
  desired_state_id?: string;
  dimension_id: string;
  title: string;
  description: string;
  score: number;
  created_at: string;
  updated_at: string;
}
