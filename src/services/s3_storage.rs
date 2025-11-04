use crate::config::MinioConfig;
use crate::error::AppError;
use async_trait::async_trait;
use aws_config::BehaviorVersion;
use aws_credential_types::provider::SharedCredentialsProvider;
use aws_credential_types::Credentials;
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::Client as S3Client;
use bytes::Bytes;

pub struct S3StorageService {
    client: S3Client,
    bucket_name: String,
}

impl S3StorageService {
    pub async fn new(config: &MinioConfig) -> Result<Self, AppError> {
        let credentials =
            Credentials::new(&config.access_key, &config.secret_key, None, None, "static");

        let credentials_provider = SharedCredentialsProvider::new(credentials);

        let sdk_config = aws_config::defaults(BehaviorVersion::latest())
            .endpoint_url(&config.endpoint)
            .credentials_provider(credentials_provider)
            .load()
            .await;

        let client = S3Client::new(&sdk_config);

        let service = Self {
            client,
            bucket_name: config.bucket_name.clone(),
        };

        // Ensure bucket exists
        service.ensure_bucket().await?;

        Ok(service)
    }

    async fn ensure_bucket(&self) -> Result<(), AppError> {
        // Try to create bucket (idempotent operation)
        match self
            .client
            .create_bucket()
            .bucket(&self.bucket_name)
            .send()
            .await
        {
            Ok(_) => Ok(()),
            Err(e) => {
                // Check if bucket already exists by error message
                let error_message = e.to_string();
                if error_message.contains("BucketAlreadyExists")
                    || error_message.contains("BucketAlreadyOwnedByYou")
                {
                    Ok(())
                } else {
                    Err(AppError::FileStorageError(format!(
                        "Failed to create bucket: {e}"
                    )))
                }
            }
        }
    }

    pub async fn upload_file(
        &self,
        object_name: &str,
        data: Bytes,
        content_type: &str,
    ) -> Result<String, AppError> {
        let byte_stream = ByteStream::from(data);

        self.client
            .put_object()
            .bucket(&self.bucket_name)
            .key(object_name)
            .body(byte_stream)
            .content_type(content_type)
            .send()
            .await
            .map_err(|e| AppError::FileStorageError(format!("Failed to upload file: {e}")))?;

        Ok(format!("s3://{}/{}", self.bucket_name, object_name))
    }

    pub async fn download_file(&self, object_name: &str) -> Result<Bytes, AppError> {
        let response = self
            .client
            .get_object()
            .bucket(&self.bucket_name)
            .key(object_name)
            .send()
            .await
            .map_err(|e| AppError::FileStorageError(format!("Failed to download file: {e}")))?;

        let data = response
            .body
            .collect()
            .await
            .map_err(|e| AppError::FileStorageError(format!("Failed to collect file data: {e}")))?
            .into_bytes();

        Ok(data)
    }

    pub async fn delete_file(&self, object_name: &str) -> Result<(), AppError> {
        self.client
            .delete_object()
            .bucket(&self.bucket_name)
            .key(object_name)
            .send()
            .await
            .map_err(|e| AppError::FileStorageError(format!("Failed to delete file: {e}")))?;

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
impl FileStorageService for S3StorageService {
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
