import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { OpenAPI } from "./openapi-client";
import { authService } from "./services/shared/authService";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      networkMode: "always",
    },
  },
});

// Register OpenAPI request middleware to add Bearer token
OpenAPI.interceptors.request.use(async (request) => {
  try {
    const token = await authService.getAccessToken();
    if (token) {
      const headers = new Headers(request.headers);
      headers.set("Authorization", `Bearer ${token}`);
      request.headers = headers;
    }
  } catch (error) {
    console.warn("Failed to get Keycloak token for request:", error);
  }
  return request;
});

// Render app
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
