# DGAT Assessment Tool - Frontend

## 1. Project Overview

This is the frontend for the DGAT Assessment Tool, a comprehensive platform for sustainability assessment. It is a modern single-page application (SPA) built with React, Vite, and TypeScript, featuring a robust architecture that includes offline support, role-based access control, and a component-based UI library.

## 2. Features

- **Modern UI:** A responsive and intuitive user interface built with Tailwind CSS and shadcn-ui.
- **Authentication:** Secure authentication and authorization using Keycloak.
- **Offline Support:** IndexedDB integration for offline data access and synchronization.
- **Role-Based Access:** Different views and permissions for different user roles (Admin, User, etc.).
- **Component-Based:** A modular and reusable component library.
- **Type-Safe:** Fully written in TypeScript for improved code quality and maintainability.

## 3. Tech Stack

- **Framework:** [React](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn-ui](https://ui.shadcn.com/)
- **State Management:** [React Query](https://tanstack.com/query/latest)
- **Routing:** [React Router](https://reactrouter.com/)
- **Offline Storage:** [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Authentication:** [Keycloak](https://www.keycloak.org/)

## 4. Getting Started

### 4.1. Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)
- A running instance of the backend service.
- A running and configured Keycloak instance.

### 4.2. Installation

1.  **Clone the repository:**

    ```sh
    git clone git@github.com:ADORSYS-GIS/DGRV-digital-gap-tool.git
    cd DGRV-digital-gap-tool/frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

### 4.3. Environment Variables

Create a `.env` file in the `frontend` directory by copying the example file:

```sh
cp .env.example .env
```

Update the `.env` file with the correct values for your local environment:

```
VITE_KEYCLOAK_URL=http://localhost:8080/
VITE_KEYCLOAK_REALM=my-realm
VITE_KEYCLOAK_CLIENT_ID=my-client-id
VITE_API_BASE_URL=http://localhost:8081
```

### 4.4. Running the Application

```sh
npm run dev
```

The application will be available at `http://localhost:8000`.

## 5. Development Workflow

### 5.1. API Client Generation

The OpenAPI client is generated from the backend's OpenAPI specification. To update the client:

1.  Ensure the backend is running and the `openapi.json` is accessible.
2.  Run the generation script:
    ```sh
    npm run generate-api
    ```

### 5.2. Linting and Formatting

- **Lint:** `npm run lint`
- **Format Check:** `npm run prettier:check`
- **Format Fix:** `npm run prettier:fix`

### 5.3. Type Checking

```sh
npm run ts:check
```

### 5.4. Testing

```sh
npm run test:unit
```

## 6. Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── layouts/         # Layout components
│   ├── services/        # API services and repositories
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── openapi-client/  # Generated OpenAPI client
│   ├── router/          # Routing configuration
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── .env.example         # Environment variable template
├── package.json         # Project configuration
└── vite.config.ts       # Vite configuration
```

## 7. License

This project is open source and available under the [MIT License](./LICENSE).
