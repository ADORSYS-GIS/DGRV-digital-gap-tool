use dgat_backend::{
    auth::jwt_validator::JwtValidator,
    config, database,
    entities::{current_states, desired_states, dimensions, gaps, recommendations},
    services::{keycloak::KeycloakService, report_service::ReportService},
    AppState,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use std::sync::Arc;
use uuid::Uuid;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    let config = config::load_config()?;
    let db = Arc::new(database::init_db(&config.database_url).await?);
    let keycloak_service = Arc::new(KeycloakService::new(config.clone()));
    let jwt_validator = Arc::new(JwtValidator::new(config.keycloak.clone()));
    let report_service = Arc::new(ReportService::new(&config.minio, db.clone()).await?);

    let state = AppState {
        db: db.clone(),
        keycloak_service,
        jwt_validator,
        report_service,
    };

    seed_dimensions(state.db.as_ref()).await?;
    seed_states(state.db.as_ref()).await?;
    seed_recommendations(state.db.as_ref()).await?;
    seed_gaps(state.db.as_ref()).await?;

    Ok(())
}

async fn seed_dimensions(db: &sea_orm::DatabaseConnection) -> anyhow::Result<()> {
    println!("Seeding dimensions...");

    let dimensions_to_seed = vec![
        (
            "Digital Strategy",
            "Developing a clear vision and roadmap for digital transformation.",
        ),
        (
            "Technology Infrastructure",
            "Assessing the adequacy and modernity of the IT infrastructure.",
        ),
        (
            "Data Management & Analytics",
            "Evaluating the collection, storage, and use of data for decision-making.",
        ),
        (
            "Digital Skills & Culture",
            "Gauging the digital literacy and mindset of the workforce.",
        ),
        (
            "Customer Experience",
            "Analyzing the digital channels and touchpoints with customers.",
        ),
        (
            "Innovation & Agility",
            "Measuring the ability to experiment and adapt to new technologies.",
        ),
        (
            "Cybersecurity & Risk Management",
            "Assessing the preparedness for digital threats and compliance.",
        ),
    ];

    for (name, description) in dimensions_to_seed {
        let existing_dimension = dimensions::Entity::find()
            .filter(dimensions::Column::Name.eq(name))
            .one(db)
            .await?;

        if existing_dimension.is_none() {
            let new_dimension = dimensions::ActiveModel {
                dimension_id: Set(Uuid::new_v4()),
                name: Set(name.to_owned()),
                description: Set(Some(description.to_owned())),
                ..Default::default()
            };

            if let Err(e) = new_dimension.insert(db).await {
                eprintln!("Error seeding dimension '{}': {}", name, e);
            }
        } else {
            println!("Dimension '{}' already exists, skipping.", name);
        }
    }

    println!("Dimensions seeded successfully.");
    Ok(())
}

async fn seed_states(db: &sea_orm::DatabaseConnection) -> anyhow::Result<()> {
    println!("Seeding current and desired states...");

    let dimensions = dimensions::Entity::find().all(db).await?;

    for dimension in dimensions {
        // Clear existing states for the dimension
        current_states::Entity::delete_many()
            .filter(current_states::Column::DimensionId.eq(dimension.dimension_id))
            .exec(db)
            .await?;
        desired_states::Entity::delete_many()
            .filter(desired_states::Column::DimensionId.eq(dimension.dimension_id))
            .exec(db)
            .await?;

        let states = get_states_for_dimension(&dimension.name);
        for (is_current, description, score) in states {
            if is_current {
                let new_state = current_states::ActiveModel {
                    current_state_id: Set(Uuid::new_v4()),
                    dimension_id: Set(dimension.dimension_id),
                    description: Set(Some(description.to_owned())),
                    score: Set(score),
                    ..Default::default()
                };
                if let Err(e) = new_state.insert(db).await {
                    eprintln!("Error seeding current state '{}': {}", description, e);
                }
            } else {
                let new_state = desired_states::ActiveModel {
                    desired_state_id: Set(Uuid::new_v4()),
                    dimension_id: Set(dimension.dimension_id),
                    description: Set(Some(description.to_owned())),
                    score: Set(score),
                    ..Default::default()
                };
                if let Err(e) = new_state.insert(db).await {
                    eprintln!("Error seeding desired state '{}': {}", description, e);
                }
            }
        }
    }

    println!("States seeded successfully.");
    Ok(())
}

fn get_states_for_dimension(_dimension_name: &str) -> Vec<(bool, &str, i32)> {
    vec![
        (true, "Level 1: Ad-hoc processes.", 1),
        (true, "Level 2: Repeatable but intuitive processes.", 2),
        (true, "Level 3: Defined and documented processes.", 3),
        (true, "Level 4: Managed and measured processes.", 4),
        (
            true,
            "Level 5: Optimized and continuously improving processes.",
            5,
        ),
        (
            false,
            "Achieve Level 1: Foundational capabilities established.",
            1,
        ),
        (false, "Achieve Level 2: Processes are standardized.", 2),
        (false, "Achieve Level 3: Processes are integrated.", 3),
        (
            false,
            "Achieve Level 4: Processes are quantitatively managed.",
            4,
        ),
        (
            false,
            "Achieve Level 5: Drive continuous improvement and innovation.",
            5,
        ),
    ]
}

async fn seed_recommendations(db: &sea_orm::DatabaseConnection) -> anyhow::Result<()> {
    println!("Seeding recommendations...");

    let dimensions = dimensions::Entity::find().all(db).await?;

    for dimension in dimensions {
        // Clear existing recommendations for the dimension
        recommendations::Entity::delete_many()
            .filter(recommendations::Column::DimensionId.eq(dimension.dimension_id))
            .exec(db)
            .await?;

        let recommendations_data = get_recommendations_for_dimension(&dimension.name);
        for (priority, description) in recommendations_data {
            let new_recommendation = recommendations::ActiveModel {
                recommendation_id: Set(Uuid::new_v4()),
                dimension_id: Set(dimension.dimension_id),
                priority: Set(priority),
                description: Set(description.to_owned()),
                ..Default::default()
            };
            if let Err(e) = new_recommendation.insert(db).await {
                eprintln!("Error seeding recommendation '{}': {}", description, e);
            }
        }
    }

    println!("Recommendations seeded successfully.");
    Ok(())
}

fn get_recommendations_for_dimension(
    _dimension_name: &str,
) -> Vec<(recommendations::RecommendationPriority, &str)> {
    use recommendations::RecommendationPriority;
    vec![
        (
            RecommendationPriority::High,
            "Generic high priority recommendation.",
        ),
        (
            RecommendationPriority::Medium,
            "Generic medium priority recommendation.",
        ),
        (
            RecommendationPriority::Low,
            "Generic low priority recommendation.",
        ),
    ]
}

async fn seed_gaps(db: &sea_orm::DatabaseConnection) -> anyhow::Result<()> {
    println!("Seeding gaps...");

    let dimensions = dimensions::Entity::find().all(db).await?;

    for dimension in dimensions {
        // Clear existing gaps for the dimension
        gaps::Entity::delete_many()
            .filter(gaps::Column::DimensionId.eq(dimension.dimension_id))
            .exec(db)
            .await?;

        let gaps_data = get_gaps_for_dimension(&dimension.name);
        for (size, severity, description) in gaps_data {
            let new_gap = gaps::ActiveModel {
                gap_id: Set(Uuid::new_v4()),
                dimension_id: Set(dimension.dimension_id),
                gap_size: Set(size),
                gap_severity: Set(severity),
                gap_description: Set(Some(description.to_owned())),
                ..Default::default()
            };
            if let Err(e) = new_gap.insert(db).await {
                eprintln!("Error seeding gap '{}': {}", description, e);
            }
        }
    }

    println!("Gaps seeded successfully.");
    Ok(())
}

fn get_gaps_for_dimension(_dimension_name: &str) -> Vec<(i32, gaps::GapSeverity, &str)> {
    use gaps::GapSeverity;
    vec![
        (4, GapSeverity::High, "Generic high severity gap."),
        (2, GapSeverity::Medium, "Generic medium severity gap."),
        (1, GapSeverity::Low, "Generic low severity gap."),
    ]
}
