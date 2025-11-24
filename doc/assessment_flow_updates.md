# Assessment Flow Updates: Implementation Plan

This document outlines the necessary changes to the database schema and API endpoints to support the new role-based assessment and submission flow for `ORG_ADMIN`, `COOP_ADMIN`, and `COOP_USER`.

## 1. Database Schema Modifications

A new database migration will be created to apply the following changes:

### `assessments` Table

A new column will be added to store the cooperation ID.

| Column Name | Data Type | Constraints | Description                                                                 |
| :---------- | :-------- | :---------- | :-------------------------------------------------------------------------- |
| `coop_id`   | `String`  | `NULLABLE`  | Stores the ID of the cooperation to which the assessment is assigned.         |

### `dimension_assessments` Table

Two new columns will be added to store the organization and cooperation IDs.

| Column Name | Data Type | Constraints | Description                                                                 |
| :---------- | :-------- | :---------- | :-------------------------------------------------------------------------- |
| `org_id`    | `String`  | `NOT NULL`  | Stores the ID of the organization that owns the assessment.                 |
| `coop_id`   | `String`  | `NULLABLE`  | Stores the ID of the cooperation. Mandatory for `COOP_ADMIN` and `COOP_USER`. |

## 2. API Endpoint Modifications

The following API endpoints will be created or updated:

### Assessment Creation

#### `POST /api/v1/assessments` (Updated)

This endpoint is used by an `ORG_ADMIN` to create a new assessment.

**Request Payload:**

```json
{
  "assessment_name": "string",
  "dimensions_id": [
    "string"
  ],
  "organization_id": "string",
  "cooperation_id": "string"
}
```

**Response (201 Created):**

```json
{
  "data": {
    "assessment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "completed_at": "2025-11-21T11:01:52.555Z",
    "created_at": "2025-11-21T11:01:52.555Z",
    "dimensions_id": "string",
    "document_title": "string",
    "organization_id": "string",
    "cooperation_id": "string",
    "started_at": "2025-11-21T11:01:52.555Z",
    "status": "Draft",
    "updated_at": "2025-11-21T11:01:52.555Z"
  },
  "error": "string",
  "message": "string",
  "success": true
}
```

### Dimension Assessment Submission

#### `POST /api/v1/assessments/{id}/dimension-assessments` (Updated)

This endpoint is used to submit a dimension assessment.

**Request Payload:**

```json
{
  "current_state_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "desired_state_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "dimension_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "gap_score": 0,
  "org_id": "org-uuid-abcde",
  "coop_id": "coop-uuid-12345"
}
```

**Response (200 OK):**

```json
{
  "data": {
    "assessment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "created_at": "2025-11-21T11:11:55.676Z",
    "current_state_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "desired_state_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "dimension_assessment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "dimension_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "gap_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "gap_score": 0,
    "updated_at": "2025-11-21T11:11:55.676Z",
    "org_id": "org-uuid-abcde",
    "coop_id": "coop-uuid-12345"
  },
  "error": "string",
  "message": "string",
  "success": true
}
```

### New Retrieval Endpoints

#### `GET /api/v1/assessments` (Updated)

This endpoint will be updated to allow filtering assessments by `organization_id` and `cooperation_id`.

**Query Parameters:**

*   `organization_id` (string, optional)
*   `cooperation_id` (string, optional)

**Response (200 OK):**

```json
{
  "data": [
    {
      "assessment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "completed_at": "2025-11-21T11:01:52.555Z",
      "created_at": "2025-11-21T11:01:52.555Z",
      "dimensions_id": "string",
      "document_title": "string",
      "organization_id": "string",
      "cooperation_id": "string",
      "started_at": "2025-11-21T11:01:52.555Z",
      "status": "Draft",
      "updated_at": "2025-11-21T11:01:52.555Z"
    }
  ],
  "error": "string",
  "message": "string",
  "success": true
}
```

#### `GET /api/v1/assessments/{id}/summary` (Updated)

This endpoint will be updated to return submission summaries, which can be filtered by `organization_id` and `cooperation_id`.

**Query Parameters:**

*   `organization_id` (string, optional)
*   `cooperation_id` (string, optional)

**Response (200 OK):**

```json
{
  "data": {
    "assessment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "summary": "Assessment summary here...",
    "submissions": [
      {
        "submission_id": "sub-uuid-123",
        "organization_id": "org-uuid-abcde",
        "cooperation_id": "coop-uuid-12345",
        "submitted_by": "user-uuid-xyz",
        "submitted_at": "2023-10-28T14:00:00Z"
      }
    ]
  },
  "error": "string",
  "message": "string",
  "success": true
}