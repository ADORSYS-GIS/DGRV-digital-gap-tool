# CORS Issue Fix for Keycloak Authentication

## Problem

The application was experiencing CORS errors when making requests from the frontend (localhost:8000) to Keycloak (localhost:8080) with credentials included.

**Error Message:**

```
Access to XMLHttpRequest at 'http://localhost:8080/realms/sustainability-realm/protocol/openid-connect/token' from origin 'http://localhost:8000' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

## Root Cause

The Keycloak client was configured to make direct requests to `http://localhost:8080` instead of going through the Vite development server proxy. When credentials (cookies/tokens) are included in cross-origin requests, the server cannot respond with `Access-Control-Allow-Origin: *`.

## Solution

### 1. Vite Proxy Configuration

The proxy was already correctly configured in [`vite.config.ts`](frontend/vite.config.ts:12):

```typescript
proxy: {
  "/realms": {
    target: "http://localhost:8080",
    changeOrigin: true,
    secure: false,
  },
  "/admin": {
    target: "http://localhost:8080",
    changeOrigin: true,
    secure: false,
  },
},
```

### 2. Keycloak Configuration Update

Changed the Keycloak URL configuration in [`keycloakConfig.ts`](frontend/src/services/shared/keycloakConfig.ts:7) to use the same origin:

```typescript
export const keycloakConfig = {
  url: window.location.origin, // Use same origin to leverage Vite proxy
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "sustainability-realm",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "sustainability-tool",
};
```

This ensures that all Keycloak requests go through the frontend server (localhost:8000) and are proxied to Keycloak (localhost:8080), avoiding CORS issues.

## How It Works

1. Frontend makes request to `http://localhost:8000/realms/...`
2. Vite development server proxies the request to `http://localhost:8080/realms/...`
3. Since both requests appear to come from the same origin (localhost:8000), no CORS restrictions apply
4. Credentials can be safely included without CORS violations

## Additional Improvements Made

1. **Better Error Handling**: Updated authentication service to handle errors gracefully without throwing unhandled promise rejections
2. **Token Refresh Cleanup**: Added proper cleanup for token refresh intervals to prevent memory leaks
3. **State Management**: Improved initialization logic to avoid duplicate Keycloak initialization attempts
4. **Robust Token Handling**: Enhanced token validation and refresh logic

## Production Considerations

For production environments, ensure that:

1. Keycloak and the frontend are served from the same domain or proper CORS headers are configured
2. The production server has proper reverse proxy configuration for Keycloak requests
3. Environment variables are properly set for production Keycloak URLs

## Testing

After applying these changes:

1. Restart the development server
2. Verify that authentication works without CORS errors
3. Check that token refresh and logout functionality work correctly
