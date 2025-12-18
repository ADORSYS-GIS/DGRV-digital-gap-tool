# Backend Logic for Consolidated Report Generation

This document provides a detailed breakdown of the backend process for generating the consolidated reports for both DGRV Admins and Organization Admins.

## 1. API Request

The process begins when a request is made from the frontend to one of two dedicated API endpoints:

-   **DGRV Admin**: `GET /api/v1/consolidated-reports/dgrv-admin`
    -   This endpoint is for super administrators and gathers data across all organizations in the system.
-   **Organization Admin**: `GET /api/v1/consolidated-reports/org-admin/{organization_id}`
    -   This endpoint is for organization-level administrators and gathers data only from the cooperatives belonging to the specified `organization_id`.

## 2. Data Fetching: Initial Submissions

Based on the user's role, the backend performs an initial database query to fetch the relevant set of assessment submissions.

-   **For DGRV Admin**: The `get_all_organization_submissions` repository function is executed. It retrieves every assessment submission from the `assessments` table.
-   **For Org Admin**: The `get_cooperative_submissions_by_organization` repository function is executed. It performs a more targeted query, fetching only the submissions made by cooperatives linked to the given `organization_id`.

## 3. Core Logic: `process_submissions` Function

This is the central function where the raw submission data is transformed into aggregated insights.

### 3.1. Grouping Assessments by Dimension

The system iterates through every submission retrieved in the previous step. For each submission, it fetches all of its associated records from the `dimension_assessments` table.

These dimension assessments are then grouped into a `HashMap`, where each key is a unique `dimension_id` and the value is a list of all assessment records for that dimension. This effectively collects all performance data for a single dimension (e.g., "Finance") from all relevant submissions into one place.

### 3.2. Calculating Metrics for Each Dimension

Next, the system iterates through each group of dimension assessments to calculate a set of metrics. This is handled by the `calculate_dimension_metrics` function.

-   **Average Gap Score**: The `gap_score` from all assessments in the group are summed and then divided by the number of assessments.
    ```
    average_gap_score = total_gap_score / number_of_assessments
    ```
-   **Risk Level Distribution**: The system counts how many assessments fall into predefined risk categories based on their `gap_score`:
    -   **High Risk**: `gap_score >= 3`
    -   **Medium Risk**: `gap_score == 2`
    -   **Low Risk**: `gap_score < 2`
    These counts are then converted into percentages of the total number of assessments for that dimension.
-   **Average Risk Level**: To provide a single numerical value for risk, each assessment is assigned a risk score (`High`=3, `Medium`=2, `Low`=1). These scores are summed and averaged.
    ```
    average_risk_level = total_risk_score / number_of_assessments
    ```

### 3.3. Fetching High-Priority Recommendations

For each dimension being processed, the `RecommendationsRepository` queries the `recommendations` table to find all recommendations linked to that `dimension_id`. The resulting list is then **filtered in the service layer** to retain only the recommendations where the `priority` field is equal to `HIGH`.

## 4. Calculating Overall Report Metrics

After all dimensions have been processed, the final high-level metrics for the report are calculated:

-   **Overall Average Gap Score**: The average of all gap scores across every dimension assessment included in the report.
-   **Overall Average Risk Level**: The average of the `average_risk_level` values calculated for each individual dimension.
-   **Total Entities Analyzed & Total Submissions**: A count of the initial submissions fetched in step 2.

## 5. Constructing and Sending the Final Response

Finally, all the calculated data is assembled into the `ConsolidatedReport` DTO (Data Transfer Object). This struct includes:
- The overall summary metrics.
- A list of `DimensionSummary` objects, where each object contains the calculated metrics and the filtered list of high-priority recommendations for that specific dimension.

This `ConsolidatedReport` object is then serialized into a JSON payload and sent back to the frontend in the API response.