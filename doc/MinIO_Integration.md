# MinIO Integration for Report Storage

## Overview

This document outlines the integration of MinIO (S3-compatible storage) for storing generated reports (PDF, Excel, Word) to reduce database storage costs and improve performance.

## Architecture Changes

### 1. Database Schema Updates

#### Reports Table Enhancement
- **New Field**: `minio_path` (String, nullable)
- **Purpose**: Stores the S3 object path for the report file
- **Migration**: `m20240924_000005_add_minio_path_to_reports.rs`

### 2. Configuration Structure

#### MinIO Configuration (`src/config.rs`)
```rust
#[derive(Debug, Deserialize)]
pub struct MinioConfig {
    pub endpoint: String,        // MinIO server endpoint
    pub access_key: String,      // Access key for authentication
    pub secret_key: String,      // Secret key for authentication
    pub bucket_name: String,     // Bucket name for report storage
    pub use_ssl: bool,           // Whether to use SSL/TLS
}
```

#### Environment Variables
```bash
DGAT_MINIO_ENDPOINT=http://localhost:9000
DGAT_MINIO_ACCESS_KEY=minioadmin
DGAT_MINIO_SECRET_KEY=minioadmin
DGAT_MINIO_BUCKET_NAME=reports
DGAT_MINIO_USE_SSL=false
```

### 3. Service Layer Implementation

#### S3 Storage Service (`src/services/s3_storage.rs`)
- **Purpose**: Handles file operations with MinIO/S3-compatible storage
- **Features**:
  - Automatic bucket creation
  - File upload/download/delete operations
  - Content-type handling
  - Error handling and logging

#### File Storage Trait
```rust
#[async_trait]
pub trait FileStorageService: Send + Sync {
    async fn upload_file(
        &self,
        object_name: &str,
        data: Bytes,
        content_type: &str,
    ) -> Result<String, AppError>;

    async fn download_file(&self, object_name: &str) -> Result<Bytes, AppError>;
    async fn delete_file(&self, object_name: &str) -> Result<(), AppError>;
}
```

### 4. Repository Updates

#### Reports Repository (`src/repositories/reports.rs`)
- **New Method**: `update_minio_path()` - Updates the MinIO path for a report
- **Enhanced Update**: Includes `minio_path` field in update operations

## File Storage Strategy

### Object Naming Convention
```
reports/{report_id}/report.{format}
```
Example: `reports/123e4567-e89b-12d3-a456-426614174000/report.pdf`

### Content Types
- PDF: `application/pdf`
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Word: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Integration Workflow

### 1. Report Generation
1. Generate report content (PDF/Excel/Word)
2. Upload file to MinIO using S3StorageService
3. Update database with MinIO path
4. Mark report as completed

### 2. Report Retrieval
1. Query database for report metadata
2. Download file from MinIO using stored path
3. Return file to user

### 3. Report Deletion
1. Delete file from MinIO
2. Remove report record from database

## Error Handling

### New Error Type
```rust
#[error("File storage error: {0}")]
FileStorageError(String),
```

### Error Scenarios
- MinIO connection failures
- Bucket creation failures
- File upload/download failures
- Authentication errors

## Benefits

1. **Reduced Database Storage**: Large report files stored in MinIO instead of database
2. **Improved Performance**: Faster database queries without large BLOB data
3. **Cost Optimization**: MinIO storage typically cheaper than database storage
4. **Scalability**: S3-compatible storage scales horizontally
5. **Flexibility**: Support for multiple file formats and content types

## Setup Instructions

### 1. MinIO Server Setup
```bash
# Run MinIO server
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

### 2. Application Configuration
Set the environment variables as shown in the Configuration section above.

### 3. Database Migration
Run the migration to add the `minio_path` column:
```bash
cargo run -- migrate
```

## Testing

### Unit Tests
- Test file upload/download operations
- Test bucket creation logic
- Test error handling scenarios

### Integration Tests
- Test with actual MinIO server
- Test report generation and storage workflow
- Test file retrieval and deletion

## Security Considerations

1. **Authentication**: Use secure credentials for MinIO access
2. **Encryption**: Enable SSL/TLS for data in transit
3. **Access Control**: Implement proper IAM policies
4. **Data Retention**: Define retention policies for stored reports

## Monitoring and Maintenance

1. **Storage Monitoring**: Monitor MinIO storage usage
2. **Performance Metrics**: Track upload/download performance
3. **Error Logging**: Log all file storage operations
4. **Backup Strategy**: Implement backup for critical reports

## Future Enhancements

1. **Multi-region Support**: Support for multiple MinIO regions
2. **CDN Integration**: Integration with CDN for faster file delivery
3. **Compression**: Automatic compression for large reports
4. **Versioning**: Support for report versioning
5. **Lifecycle Policies**: Automatic cleanup of old reports