use async_trait::async_trait;
use bytes::Bytes;
use minio::s3::client::Client as MinioClient;
use minio::s3::creds::StaticProvider;
use minio::s3::http::BaseUrl;
use crate::config::MinioConfig;
use crate::error::AppError;
use crate::services::minio;

pub struct MinioService {
    client: MinioClient,
    bucket_name: String,
}

impl MinioService {
    pub async fn new(config: &MinioConfig) -> Result<Self, AppError> {
        let base_url = BaseUrl::from_string(&config.endpoint)
            .map_err(|e| AppError::FileStorageError(format!("Invalid MinIO endpoint: {}", e)))?;
        
        let static_provider = StaticProvider::new(
            &config.access_key,
            &config.secret_key,
            None,
        );

        let client = MinioClient::new(
            base_url,
            Some(Box::new(static_provider)),
            None,
            Some(config.use_ssl),
        )
        .map_err(|e| AppError::FileStorageError(format!("Failed to create MinIO client: {}", e)))?;

        let service = Self {
            client,
            bucket_name: config.bucket_name.clone(),
        };

        // Ensure bucket exists
        service.ensure_bucket().await?;

        Ok(service)
    }

    async fn ensure_bucket(&self) -> Result<(), AppError> {
        let exists = self.client
            .bucket_exists(&self.bucket_name)
            .await
            .map_err(|e| AppError::FileStorageError(format!("Failed to check bucket existence: {}", e)))?;

        if !exists {
            self.client
                .make_bucket(&self.bucket_name)
                .await
                .map_err(|e| AppError::FileStorageError(format!("Failed to create bucket: {}", e)))?;
        }

        Ok(())
    }

    pub async fn upload_file(
        &self,
        object_name: &str,
        data: Bytes,
        _content_type: &str,
    ) -> Result<String, AppError> {
        self.client
            .put_object(&self.bucket_name, object_name, data)
            .await
            .map_err(|e| AppError::FileStorageError(format!("Failed to upload file: {}", e)))?;

        Ok(format!("{}/{}", self.bucket_name, object_name))
    }

    pub async fn download_file(&self, object_name: &str) -> Result<Bytes, AppError> {
        let data = self.client
            .get_object(&self.bucket_name, object_name)
            .await
            .map_err(|e| AppError::FileStorageError(format!("Failed to download file: {}", e)))?;

        Ok(data)
    }

    pub async fn delete_file(&self, object_name: &str) -> Result<(), AppError> {
        self.client
            .remove_object(&self.bucket_name, object_name)
            .await
            .map_err(|e| AppError::FileStorageError(format!("Failed to delete file: {}", e)))?;

        Ok(())
    }

    pub fn generate_object_name(&self, report_id: &uuid::Uuid, format: &str) -> String {
        format!("reports/{}/report.{}", report_id, format.to_lowercase())
    }
}

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

#[async_trait]
impl FileStorageService for MinioService {
    async fn upload_file(
        &self,
        object_name: &str,
        data: Bytes,
        content_type: &str,
    ) -> Result<String, AppError> {
        self.upload_file(object_name, data, content_type).await
    }

    async fn download_file(&self, object_name: &str) -> Result<Bytes, AppError> {
        self.download_file(object_name).await
    }

    async fn delete_file(&self, object_name: &str) -> Result<(), AppError> {
        self.delete_file(object_name).await
    }
}
