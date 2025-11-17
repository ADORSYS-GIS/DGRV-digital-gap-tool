#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dgat_backend::run().await
}
