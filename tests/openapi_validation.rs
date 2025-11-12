use std::fs::read_to_string;
/// OpenAPI Specification Validation Tests
/// 
/// This test module ensures that the generated OpenAPI specification is valid
/// and can be parsed by standard OpenAPI tools. It validates:
/// - All schema references ($ref) are resolvable
/// - All paths are properly defined
/// - All components are valid
/// - The overall structure conforms to OpenAPI 3.0 specification
///
/// This test will fail the build if the OpenAPI spec is invalid, preventing
/// broken specs from being deployed.

use dgat_backend::api::openapi::ApiDoc;
use utoipa::OpenApi;
use serde_json::Value;

#[test]
fn test_openapi_spec_is_valid() {
    // Generate the OpenAPI document from utoipa annotations
    let spec = ApiDoc::openapi();
    
    // Serialize to JSON string
    let json = serde_json::to_string_pretty(&spec)
        .expect("Failed to serialize OpenAPI spec to JSON");
    
    println!("{}", json);
    // Parse and validate using openapiv3
    let validation_result = serde_json::from_str::<openapiv3::OpenAPI>(&json);
    
    match validation_result {
        Ok(parsed_spec) => {
            // Additional validation: ensure we have paths defined
            assert!(
                !parsed_spec.paths.paths.is_empty(),
                "OpenAPI spec has no paths defined"
            );
            
            // Ensure we have components/schemas defined
            if let Some(components) = &parsed_spec.components {
                assert!(
                    !components.schemas.is_empty(),
                    "OpenAPI spec has no schemas defined in components"
                );
            } else {
                panic!("OpenAPI spec has no components section");
            }
            
            println!("✓ OpenAPI specification is valid!");
            println!("  - Paths defined: {}", parsed_spec.paths.paths.len());
            if let Some(components) = &parsed_spec.components {
                println!("  - Schemas defined: {}", components.schemas.len());
                println!("  - Security schemes: {}", components.security_schemes.len());
            }
        }
        Err(e) => {
            // Print the JSON for debugging
            eprintln!("\n❌ OpenAPI Validation Failed!\n");
            eprintln!("Error: {}\n", e);
            eprintln!("Generated OpenAPI JSON (first 2000 chars):");
            eprintln!("{}\n", &json.chars().take(2000).collect::<String>());
            
            panic!(
                "Invalid OpenAPI specification generated. Error: {}\n\
                 This means the utoipa annotations in the codebase are producing an invalid spec.\n\
                 Common issues:\n\
                 - Unresolved $ref references (missing schema in components)\n\
                 - Invalid schema definitions\n\
                 - Missing required fields in path definitions\n\
                 \n\
                 Check the error message above and fix the corresponding utoipa annotations.",
                e
            );
        }
    }
}

#[test]
fn test_openapi_spec_has_required_metadata() {
    let spec = ApiDoc::openapi();
    
    // Verify info section
    assert!(!spec.info.title.is_empty(), "OpenAPI spec must have a title");
    assert!(!spec.info.version.is_empty(), "OpenAPI spec must have a version");
    
    println!("✓ OpenAPI metadata is valid");
    println!("  - Title: {}", spec.info.title);
    println!("  - Version: {}", spec.info.version);
}

#[test]
fn test_openapi_spec_serialization() {
    let spec = ApiDoc::openapi();
    
    // Test JSON serialization
    let json_result = serde_json::to_string(&spec);
    assert!(
        json_result.is_ok(),
        "Failed to serialize OpenAPI spec to JSON: {:?}",
        json_result.err()
    );
    
    // Test pretty JSON serialization
    let pretty_json_result = serde_json::to_string_pretty(&spec);
    assert!(
        pretty_json_result.is_ok(),
        "Failed to serialize OpenAPI spec to pretty JSON: {:?}",
        pretty_json_result.err()
    );
    
    println!("✓ OpenAPI spec can be serialized to JSON");
}

#[test]
fn test_all_refs_are_resolvable() {
    // Validate in-memory spec
    let spec = ApiDoc::openapi();
    let json = serde_json::to_string(&spec).expect("Failed to serialize OpenAPI spec");
    assert_all_component_refs_resolve("in-memory ApiDoc::openapi()", &json);

    // Overwrite persisted openapi.json with the freshly generated spec so UI validates the same doc
    std::fs::write("./openapi.json", &json).expect("Failed to write ./openapi.json");

    // Validate the just-persisted file as well
    if let Ok(file_json) = read_to_string("./openapi.json") {
        assert_all_component_refs_resolve("persisted ./openapi.json", &file_json);
    }
}

fn assert_all_component_refs_resolve(label: &str, json: &str) {
    let v: Value = serde_json::from_str(json).expect("Spec is not valid JSON");
    let comp_schemas = v
        .get("components")
        .and_then(|c| c.get("schemas"))
        .and_then(|s| s.as_object())
        .cloned()
        .unwrap_or_default();

    let mut missing: Vec<String> = Vec::new();
    collect_refs(&v, &mut |r| {
        if let Some(name) = r.strip_prefix("#/components/schemas/") {
            // Direct hit
            if comp_schemas.contains_key(name) {
                return;
            }
            // Fallback: if the schema name is fully-qualified (contains dots),
            // match by the last path segment (the actual Rust type name)
            if let Some(last) = name.rsplit('.').next() {
                if comp_schemas.contains_key(last) {
                    return;
                }
            }
            missing.push(name.to_string());
        }
    });

    if !missing.is_empty() {
        panic!(
            "Unresolvable $ref entries in {}: {:?}",
            label, missing
        );
    }
}

fn collect_refs<F: FnMut(&str)>(v: &Value, f: &mut F) {
    match v {
        Value::Object(map) => {
            if let Some(Value::String(s)) = map.get("$ref") {
                f(s);
            }
            for (_k, vv) in map.iter() {
                collect_refs(vv, f);
            }
        }
        Value::Array(arr) => {
            for vv in arr {
                collect_refs(vv, f);
            }
        }
        _ => {}
    }
}
