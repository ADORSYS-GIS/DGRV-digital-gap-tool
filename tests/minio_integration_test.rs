use bytes::Bytes;
use uuid::Uuid;
use sea_orm::{Database, DatabaseConnection};

// Import from the library crate
use dgat_backend::config::MinioConfig;
use dgat_backend::services::s3_storage::S3StorageService;
use dgat_backend::services::report_service::ReportService;
use dgat_backend::entities::reports::{ReportFormat, ReportType, ReportStatus};

async fn setup_test_config() -> MinioConfig {
    MinioConfig {
        endpoint: "http://localhost:9000".to_string(),
        access_key: "minioadmin".to_string(),
        secret_key: "minioadmin".to_string(),
        bucket_name: "test-reports".to_string(),
        use_ssl: false,
    }
}

async fn setup_test_db() -> DatabaseConnection {
    let database_url = std::env::var("TEST_DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost/dgat_test".to_string());
    
    Database::connect(&database_url)
        .await
        .expect("Failed to connect to test database")
}

#[ignore]
#[tokio::test]
async fn test_s3_storage_service_creation() {
    let config = setup_test_config().await;
    let result = S3StorageService::new(&config).await;
    assert!(result.is_ok(), "S3StorageService should be created successfully");
}

#[ignore]
#[tokio::test]
async fn test_file_upload_download() {
    let config = setup_test_config().await;
    let storage_service = S3StorageService::new(&config).await.unwrap();
    
    let test_data = Bytes::from("Test report content");
    let object_name = format!("test-report-{}.pdf", Uuid::new_v4());
    let content_type = "application/pdf";
    
    // Test upload
    let upload_result = storage_service
        .upload_file(&object_name, test_data.clone(), content_type)
        .await;
    assert!(upload_result.is_ok(), "File upload should succeed");
    
    let uploaded_path = upload_result.unwrap();
    assert!(uploaded_path.contains(&config.bucket_name), "Upload path should contain bucket name");
    
    // Test download
    let download_result = storage_service.download_file(&object_name).await;
    assert!(download_result.is_ok(), "File download should succeed");
    
    let downloaded_data = download_result.unwrap();
    assert_eq!(downloaded_data, test_data, "Downloaded data should match uploaded data");
    
    // Cleanup
    let delete_result = storage_service.delete_file(&object_name).await;
    assert!(delete_result.is_ok(), "File deletion should succeed");
}

#[ignore]
#[tokio::test]
async fn test_report_generation_and_storage() {
    let config = setup_test_config().await;
    let db = setup_test_db().await;
    let report_service = ReportService::new(&config, db).await.unwrap();
    
    let assessment_id = Uuid::new_v4();
    let report_content = Bytes::from("Sample PDF report content");
    
    let result = report_service
        .generate_and_store_report(
            assessment_id,
            ReportType::Summary,
            "Test Report".to_string(),
            ReportFormat::Pdf,
            report_content,
        )
        .await;
    
    assert!(result.is_ok(), "Report generation and storage should succeed");
    
    let report = result.unwrap();
    assert_eq!(report.assessment_id, assessment_id);
    assert_eq!(report.title, "Test Report");
    assert_eq!(report.format, ReportFormat::Pdf);
    assert_eq!(report.report_type, ReportType::Summary);
    assert_eq!(report.status, ReportStatus::Completed);
    assert!(report.file_path.is_some(), "File path should be set");
    
    // Test report retrieval
    let retrieval_result = report_service
        .get_report_file(report.report_id)
        .await;
    
    assert!(retrieval_result.is_ok(), "Report retrieval should succeed");
    
    let (retrieved_report, file_data) = retrieval_result.unwrap();
    assert_eq!(retrieved_report.report_id, report.report_id);
    assert_eq!(file_data, Bytes::from("Sample PDF report content"));
    
    // Cleanup
    let delete_result = report_service.delete_report(report.report_id).await;
    assert!(delete_result.is_ok(), "Report deletion should succeed");
}

#[ignore]
#[tokio::test]
async fn test_object_name_generation() {
    let config = setup_test_config().await;
    let storage_service = S3StorageService::new(&config).await.unwrap();
    
    let report_id = Uuid::new_v4();
    let format = "pdf";
    
    let object_name = storage_service.generate_object_name(&report_id, format);
    
    assert!(object_name.contains("reports"));
    assert!(object_name.contains(&report_id.to_string()));
    assert!(object_name.contains("report.pdf"));
}

#[tokio::test]
async fn test_error_handling_invalid_bucket() {
    let mut config = setup_test_config().await;
    config.bucket_name = "invalid-bucket-name-with-special-chars-!@#".to_string();
    
    let result = S3StorageService::new(&config).await;
    assert!(result.is_err(), "Should fail with invalid bucket name");
}

#[tokio::test]
async fn test_error_handling_invalid_credentials() {
    let mut config = setup_test_config().await;
    config.access_key = "invalid-key".to_string();
    config.secret_key = "invalid-secret".to_string();
    
    let result = S3StorageService::new(&config).await;
    assert!(result.is_err(), "Should fail with invalid credentials");
}