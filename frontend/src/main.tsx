import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      networkMode: "always",
    },
  },
});

// Render app
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
