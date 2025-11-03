# Database ER Diagram Update - MinIO Integration

## Overview

This document describes the database schema changes required for MinIO integration to store generated reports as files instead of storing them directly in the database.

## Schema Changes

### Reports Table Enhancement

#### Before (Current Schema)
```sql
CREATE TABLE reports (
    report_id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL,
    report_type report_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    format report_format NOT NULL,
    summary TEXT,
    report_data JSONB,
    file_path VARCHAR(500),
    status report_status NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_reports_assessment 
        FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id) 
        ON DELETE CASCADE
);
```

#### After (With MinIO Integration)
```sql
CREATE TABLE reports (
    report_id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL,
    report_type report_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    format report_format NOT NULL,
    summary TEXT,
    report_data JSONB,
    file_path VARCHAR(500),
    minio_path VARCHAR(500),          -- NEW FIELD
    status report_status NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_reports_assessment 
        FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id) 
        ON DELETE CASCADE
);

-- Add index for efficient MinIO path lookups
CREATE INDEX idx_reports_minio_path ON reports(minio_path) WHERE minio_path IS NOT NULL;
```

## Field Details

### New Field: `minio_path`
- **Type**: `VARCHAR(500)`
- **Nullable**: Yes (NULL allowed)
- **Purpose**: Stores the S3-compatible object path for the report file
- **Format**: `s3://bucket-name/reports/{report-id}/report.{format}`
- **Example**: `s3://reports/reports/123e4567-e89b-12d3-a456-426614174000/report.pdf`

## Data Migration Strategy

### Phase 1: Add New Field
1. Run migration to add `minio_path` column
2. Update application code to handle new field
3. No immediate data migration required

### Phase 2: Gradual Migration
1. New reports automatically use MinIO storage
2. Existing reports remain in database until accessed
3. Migrate existing reports on-demand or via background job

### Phase 3: Cleanup (Optional)
1. After confirming all reports are migrated to MinIO
2. Remove `report_data` field if it contains large BLOB data
3. Update `file_path` field if needed

## Entity Relationship Impact

### Current Relationships
- **reports → assessments**: Many-to-One (assessment_id)
- **reports → action_plans**: One-to-Many (via report_id)

### No Relationship Changes
The MinIO integration does not affect existing relationships. The `minio_path` field is simply an additional attribute that points to external storage.

## Query Impact

### New Queries
```sql
-- Find reports stored in MinIO
SELECT * FROM reports WHERE minio_path IS NOT NULL;

-- Find reports still in database
SELECT * FROM reports WHERE minio_path IS NULL;

-- Update MinIO path after upload
UPDATE reports SET minio_path = 's3://bucket/path' WHERE report_id = ?;
```

### Performance Considerations
- Index on `minio_path` for efficient filtering
- Consider partial index for NULL values if needed
- No impact on existing queries

## Storage Strategy

### Hybrid Approach
- **New Reports**: Store in MinIO, save path in `minio_path`
- **Existing Reports**: Keep in database until migrated
- **Metadata**: Always stored in database

### Benefits
1. **Reduced Database Size**: Large report files moved to MinIO
2. **Faster Backups**: Smaller database backups
3. **Better Performance**: No large BLOB data in queries
4. **Cost Optimization**: MinIO storage typically cheaper

## Backup and Recovery

### Database Backup
- Smaller backups without large report files
- Faster backup and restore operations
- Focus on metadata and relationships

### MinIO Backup
- Separate backup strategy for S3-compatible storage
- Consider cross-region replication for critical reports
- Implement lifecycle policies for cost optimization

## Security Considerations

### Database Security
- `minio_path` contains no sensitive data
- Standard database security practices apply
- Access control through existing user management

### MinIO Security
- Secure credentials in environment variables
- SSL/TLS encryption for data in transit
- Access control through IAM policies
- Consider encryption at rest

## Monitoring and Maintenance

### Database Monitoring
- Monitor `minio_path` usage statistics
- Track migration progress
- Alert on storage anomalies

### MinIO Monitoring
- Monitor bucket usage and costs
- Track upload/download performance
- Set up alerts for storage issues

## Future Considerations

### Potential Enhancements
1. **Multiple Storage Backends**: Support for different S3 providers
2. **Storage Tiers**: Different storage classes for cost optimization
3. **Compression**: Automatic compression for large reports
4. **Versioning**: Support for report versioning
5. **Lifecycle Policies**: Automatic cleanup of old reports

### Schema Evolution
- Consider adding storage backend type field
- Add compression metadata if implemented
- Track storage costs for reporting