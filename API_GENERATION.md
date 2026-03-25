# Generating a TypeScript API Client from an OpenAPI Specification

This guide explains how to automatically generate a TypeScript API client from an OpenAPI specification file (`openapi.json`). This approach is used in this project to ensure the frontend is always in sync with the backend API.

## Why Generate API Methods?

Manually writing API client code can be time-consuming and error-prone, especially as your API evolves. Generating the client directly from the OpenAPI specification offers several benefits:

-   **Consistency:** Ensures your frontend client always matches the backend API.
-   **Type Safety:** Provides strong TypeScript types for requests, responses, and data models, reducing runtime errors.
-   **Productivity:** Automates boilerplate code, allowing developers to focus on business logic.
-   **Maintainability:** Easier to update the client when API changes occur.

For a deeper dive into the benefits of OpenAPI code generation, you can read this article: [Why use OpenAPI Generator?](https://openapi-ts.pages.dev/introduction/why/)

## Prerequisites

Before you begin, ensure you have the following dependency installed in your project:

-   [openapi-typescript](https://www.npmjs.com/package/openapi-typescript): A tool to generate TypeScript types from an OpenAPI schema.

You can install it using npm:

```bash
npm install openapi-typescript -D
```

## Step 1: Obtaining the OpenAPI Specification

To implement this ticket, you need the OpenAPI specification from the backend. Since this ticket is dependent on the `51-implement-endpoints-to-expose-data-needed-for-the-frontend` branch, which might not yet be merged, you can obtain the `openapi.json` file as follows:

1.  **Switch to the Backend Branch:** Ensure your backend project is on the `51-implement-endpoints-to-expose-data-needed-for-the-frontend` branch.
2.  **Run the Backend:** Start the backend application.
3.  **Access the OpenAPI Endpoint:** Open your browser and navigate to `http://localhost:3000/api-doc.json`.
4.  **Copy Content:** Copy the entire JSON content from this page.
5.  **Create `openapi.json`:** Paste the copied content into a new file named `openapi.json` in your `frontend/` directory. This is the file you will use to generate the API methods in the frontend.

## Step 2: Fetching the OpenAPI Specification Dynamically

To ensure the generated client is always up-to-date with the latest API changes, we use a script to fetch the `openapi.json` file from the running backend instance.

The script, located at [`scripts/fetch_openapi.js`](scripts/fetch_openapi.js:1), does the following:

1.  **Fetches from Backend:** It attempts to download the `openapi.json` from the URL specified in the `BACKEND_OPENAPI_URL` environment variable (defaults to `http://127.0.0.1:3001/docs/openapi.json`).
2.  **Fallback to Local:** If the backend is not running or the fetch fails, it falls back to using a local `openapi.json` file as a backup.
3.  **Saves the File:** The fetched or fallback `openapi.json` is saved to [`frontend/openapi.json`](frontend/openapi.json:1), where the code generation tool can access it.

## Step 3: Setting up `package.json` Scripts

To automate the process, we add several scripts to the [`frontend/package.json`](frontend/package.json:1) file:

```json
"scripts": {
  "predev": "node ../scripts/fetch_openapi.js",
  "dev": "vite",
  "codegen": "openapi-ts --input openapi.json --output ./src/openapi-client --client fetch",
  "postinstall": "npm run codegen"
}
```

Here’s a breakdown of these scripts:

-   `"predev": "node ../scripts/fetch_openapi.js"`: This script runs automatically before the `dev` script. It executes the fetch script to ensure you have the latest API specification before starting the development server.
-   `"codegen": "openapi-ts --input openapi.json --output ./src/openapi-client --client fetch"`: This is the core script for code generation. It uses `openapi-ts` to:
    -   `--input openapi.json`: Read the [`frontend/openapi.json`](frontend/openapi.json:1) file.
    -   `--output ./src/openapi-client`: Place the generated TypeScript files in the `src/openapi-client` directory.
    -   `--client fetch`: Generate client code that uses the `fetch` API.
-   `"postinstall": "npm run codegen"`: This script runs automatically after `npm install`. It generates the API client right after installing the dependencies, ensuring that the project is ready for development.

## Step 4: Generating the API Client

With the scripts in place, you can generate the API client by running:

```bash
npm run codegen
```

This command will create the `src/openapi-client` directory (if it doesn't exist) and populate it with TypeScript files that define all the types and services from your API.

## Step 5: Verifying the Output and Ignoring from Git

After running the `codegen` script, you can verify its success by checking for the existence of the `src/openapi-client` directory. Inside this directory, you should find the generated TypeScript files.

### Ignoring Generated Files

Since the API client is generated automatically, it should not be committed to your Git repository. To prevent this, add the generated directory to your `.gitignore` file.

Open the [`frontend/.gitignore`](frontend/frontend/.gitignore:1) file and add the following line:

```
# Generated API client
src/openapi-client
```

This ensures that the generated files are not tracked by version control.

## Further Reading

For more detailed information about `openapi-typescript` and its capabilities, please refer to the official documentation:

-   [openapi-typescript Documentation](https://openapi-ts.pages.dev/)
