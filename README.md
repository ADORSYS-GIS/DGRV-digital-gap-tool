# Gap Assessment Tool (GAT) for Cooperatives

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Project Status](https://img.shields.io/badge/status-in%20development-orange)

## 📖 Introduction

This project, initiated by **DGRV (Deutscher Genossenschafts- und Raiffeisenverband e.V.)**, aims to develop a robust Gap Assessment Tool (GAT) to support cooperatives in Southern Africa. The primary goal is to transform an existing Excel-based tool into an integrated, user-friendly, and secure Progressive Web App (PWA) with full offline functionality.

The tool empowers cooperatives to assess their digital maturity, identify critical gaps between their current and desired digital states, and formulate actionable strategies for digital growth and resilience.

## ✨ Key Features

* **Multi-Platform Access**: A Progressive Web App (PWA) ensures accessibility on desktops, and mobile devices (Android/iOS) through a web browser, with options for installation for an app-like experience.
* **Offline Capability**: Users can conduct assessments and enter data without an internet connection. Data automatically syncs once connectivity is restored.
* **Comprehensive Assessment Workflow**: A guided, three-stage process:
    1.  Assess Current Level of Digitalization.
    2.  Define the Desired "To-Be" Level.
    3.  Analyze Gaps and receive actionable recommendations.
* **Role-Based Access Control**: Secure user management with distinct roles (e.g., DGRV Admin, Organization Users) to manage permissions and data access, handled by Keycloak.
* **Automated Reporting & Action Plans**: Generates summary reports and draft action plans based on assessment results, which can be customized by the user.
* **Multilingual Support**: The interface supports multiple languages, including English, Portuguese, and others relevant to the region, to ensure broad usability.

## 🛠️ Technology Stack

The solution is built on a modern, secure, and scalable technology stack as proposed by adorsys.

| Component              | Technology                               | Description                                                                     |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| **Backend** | Rust Microservices                  | For high-performance, memory-safe, and efficient server-side logic.             |
| **Frontend (User App)** | ReactJS (PWA)                     | A Progressive Web App for a seamless, offline-first experience on any device.   |
| **Frontend (Admin)** | ReactJS                           | A dedicated web application for DGRV staff to manage the system.                |
| **Database** | PostgreSQL                        | A reliable, open-source object-relational database system.                      |
| **Authentication** | Keycloak                          | An open-source Identity and Access Management (IAM) solution.                   |
| **Infrastructure** | Kubernetes on AWS            | A cloud-native architecture for scalability, resilience, and efficient management. |

## 🚀 Getting Started

Full instructions live in [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md). Quick start below.

### Prerequisites

-   Docker + Docker Compose v2 (easiest path)
-   Node.js 20 + npm (frontend dev without Docker)
-   Rust 1.88 toolchain (`rustup`) (backend dev without Docker)
-   PostgreSQL client (optional, direct DB access)

### Run the full stack with Docker (recommended)

```bash
# Clone the repository
git clone git@github.com:chendiblessing/DGRV-digital-gap-tool.git
cd DGRV-digital-gap-tool

# Configure environment
cp .env.example .env   # edit with strong secrets (see docs/DEPLOYMENT.md §4)

# Build and start all services (Postgres×2, MinIO, Keycloak, backend, frontend)
docker compose up -d --build

# Watch the backend come up (runs DB migrations, validates OpenAPI, starts API)
docker compose logs -f backend
```

Local endpoints:

| Service | URL |
|---|---|
| Frontend (Vite dev) | http://localhost:8000 (run `npm run dev` in `frontend/`) |
| Frontend (container) | http://localhost:8110 |
| Backend API / Swagger | http://localhost:3001/docs |
| Keycloak Admin | http://localhost:8080/keycloak (admin / admin123) |
| MinIO Console | http://localhost:9001 |

### Run the backend locally (against dockerized deps)

```bash
docker compose up -d db keycloak-db keycloak minio
export DGAT_DATABASE_URL="postgres://postgres:postgres@localhost:5430/dgat"
# (see docs/DEVELOPMENT.md §4 for the full env-var set)
cargo run
```

### Run the frontend locally

```bash
cd frontend
cp .env.example .env   # set VITE_KEYCLOAK_URL, VITE_API_BASE_URL, etc.
npm install            # also regenerates the OpenAPI client (postinstall)
npm run dev
```

## 🧪 Testing

-   **Backend:** `cargo nextest run --workspace --all-targets --all-features --no-fail-fast`
    (CI: `rust-backend.yml`).
-   **Frontend:** `cd frontend && npm run test:unit` (CI: `ci.yml`).
-   Validate the OpenAPI spec: `cargo test test_openapi_spec_is_valid`.

## 🚢 Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full runbook (SSH into the
server, `docker compose up`, obtain TLS certs with `certbot`, configure host Nginx,
Keycloak provisioning). The automated CD pipeline is described in
[`docs/CI_CD_PIPELINE.md`](docs/CI_CD_PIPELINE.md).

## 🔐 Backup & Recovery

See [`docs/BACKUP_AND_RECOVERY.md`](docs/BACKUP_AND_RECOVERY.md) for the backup/restore
runbook (`scripts/backup.sh`, `scripts/restore.sh`), scheduling, and the disaster-recovery
procedure.

## 📚 Documentation

The complete, handover-ready documentation is in [`docs/`](docs/). Start with
[`docs/README.md`](docs/README.md). Key documents:

-   [Architecture (as-built)](docs/ARCHITECTURE.md)
-   [RBAC & Roles](docs/RBAC_AND_ROLES.md) — all roles, where & how authorization is
    enforced (and where it isn't)
-   [Database Schema](docs/DATABASE_SCHEMA.md)
-   [Feature Implementation Index](docs/FEATURES.md)
-   [Deployment Runbook](docs/DEPLOYMENT.md)
-   [CI/CD Pipeline](docs/CI_CD_PIPELINE.md)
-   [Backup & Recovery](docs/BACKUP_AND_RECOVERY.md)
-   [Local Development Setup](docs/DEVELOPMENT.md)
-   [RBAC & Auth System (deep dive)](docs/RBAC_AND_AUTH_SYSTEM.md)
-   [End-User Manual](doc/USER_MANUAL.md)