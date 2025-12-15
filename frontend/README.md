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

## 8. Internationalization (i18n)

Multilingual support is implemented with i18next and react-i18next.

- Supported languages: English (en), Deutsch (de), Français (fr), Português (pt), siSwati (ss), Zulu (zu)
- i18n initialization: see [frontend/src/i18n/index.ts](frontend/src/i18n/index.ts)
- App entry imports i18n to initialize before render:
  - [frontend/src/main.tsx](frontend/src/main.tsx)
  - [frontend/src/main.lazy.tsx](frontend/src/main.lazy.tsx)
- Language switcher in the navbar:
  - [frontend/src/components/shared/LanguageSwitcher.tsx](frontend/src/components/shared/LanguageSwitcher.tsx)

### 8.1 Directory structure

- Config and resources:
  - [frontend/src/i18n/index.ts](frontend/src/i18n/index.ts)
  - [frontend/src/i18n/locales/en.json](frontend/src/i18n/locales/en.json)
  - [frontend/src/i18n/locales/de.json](frontend/src/i18n/locales/de.json)
  - [frontend/src/i18n/locales/fr.json](frontend/src/i18n/locales/fr.json)
  - [frontend/src/i18n/locales/pt.json](frontend/src/i18n/locales/pt.json)
  - [frontend/src/i18n/locales/ss.json](frontend/src/i18n/locales/ss.json)
  - [frontend/src/i18n/locales/zu.json](frontend/src/i18n/locales/zu.json)

### 8.2 Initialization, detection and persistence

- i18next is initialized in [frontend/src/i18n/index.ts](frontend/src/i18n/index.ts) with:
  - fallbackLng: "en"
  - supportedLngs: ["en","de","fr","pt","ss","zu"]
  - Detection order: ["localStorage", "navigator"]
  - Cache: ["localStorage"] using key "i18nextLng"
- This ensures:
  - English is the default and fallback language.
  - If a user has a previously selected language in localStorage, it is used.
  - Otherwise, the browser (navigator) language is used if supported.
  - Selection persists across reloads automatically.

### 8.3 Using translations in components

- For examples, see:
  - Navbar: [frontend/src/components/shared/Navbar.tsx](frontend/src/components/shared/Navbar.tsx)
  - Home page: [frontend/src/pages/HomePage.tsx](frontend/src/pages/HomePage.tsx)
  - Onboarding flow: [frontend/src/pages/OnboardingFlow.tsx](frontend/src/pages/OnboardingFlow.tsx)
  - Shared controls: [frontend/src/components/shared/LanguageSwitcher.tsx](frontend/src/components/shared/LanguageSwitcher.tsx)

Pattern:

1. Import the hook:
   `import { useTranslation } from "react-i18next";`
2. Inside your component:
   `const { t } = useTranslation();`
3. Replace strings: `t("namespace.key")`

### 8.4 Adding a new language

1. Create a new translation file under [frontend/src/i18n/locales](frontend/src/i18n/locales) (e.g., `xh.json`).
2. Add the import and resource mapping in [frontend/src/i18n/index.ts](frontend/src/i18n/index.ts).
3. Add the language to the `supportedLanguages` list in [frontend/src/i18n/index.ts](frontend/src/i18n/index.ts) and to the UI in [frontend/src/components/shared/LanguageSwitcher.tsx](frontend/src/components/shared/LanguageSwitcher.tsx).
4. Keep keys consistent with the English file. Missing keys will fall back to English automatically.

### 8.5 Verifying behavior

- Auto-detect:
  - Clear localStorage key `i18nextLng`, refresh the app; the UI should render in the device/browser language if supported.
- Persistence:
  - Use the language switcher in the navbar, reload the page; the selection persists (stored under `i18nextLng` in localStorage).
- Fallback:
  - If a key is missing in the selected language, English text will be shown.

### 8.6 Notes

- Keep translation keys semantic and reusable (e.g., `navbar.login`, `home.features.title`).
- Prefer adding translations for the most visible UI first; English fallback ensures graceful degradation when keys are missing.
