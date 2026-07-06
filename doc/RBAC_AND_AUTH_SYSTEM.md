# RBAC & Authentication System — Detailed Documentation

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Keycloak Configuration](#2-keycloak-configuration)
3. [Role Hierarchy & Definitions](#3-role-hierarchy--definitions)
4. [Hierarchical Structure: Organizations & Cooperatives](#4-hierarchical-structure-organizations--cooperatives)
5. [Frontend Authentication Flow](#5-frontend-authentication-flow)
6. [Backend Middleware & JWT Validation](#6-backend-middleware--jwt-validation)
7. [Frontend Route Protection (RBAC)](#7-frontend-route-protection-rbac)
8. [Organization Creation Flow](#8-organization-creation-flow)
9. [Cooperative (Group) Creation Flow](#9-cooperative-group-creation-flow)
10. [User Creation & Invitation Flow](#10-user-creation--invitation-flow)
11. [Adding Members to Cooperatives](#11-adding-members-to-cooperatives)
12. [Backend-to-Keycloak Communication](#12-backend-to-keycloak-communication)
13. [Complete Data Flow Diagrams](#13-complete-data-flow-diagrams)
14. [Keycloak Realm Export Details](#14-keycloak-realm-export-details)
15. [Token Claims & Role Extraction](#15-token-claims--role-extraction)
16. [Offline Support](#16-offline-support)
17. [Bootstrap / Initial Provisioning](#17-bootstrap--initial-provisioning)
18. [Security Considerations & Gaps](#18-security-considerations--gaps)

---

## 1. Architecture Overview

The DGRV Digital Gap Tool uses **Keycloak 26.3.1** as its identity provider (IdP) and central authority for authentication and role management. The application architecture has three layers:

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  keycloak-js → AuthService → ProtectedRoute → API calls     │
│  Role-based route guards & UI conditional rendering          │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTP (Bearer JWT)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND (Rust / Axum)                    │
│  Auth Middleware → JWT Validation → Route Handlers           │
│  KeycloakService → Admin REST API calls to Keycloak         │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTP (Service Account Token)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                   KEYCLOAK 26.3.1                            │
│  Realm: digital-gap                                          │
│  Organizations feature (preview) enabled                    │
│  Realm roles, client roles, groups, org memberships         │
│  PostgreSQL backend for persistence                          │
└──────────────────────────────────────────────────────────────┘
```

**Key principle:** Keycloak is the single source of truth for users, roles, organizations, cooperatives (groups), and authentication. The backend's PostgreSQL database only stores application data (assessments, dimensions, gaps, etc.) — all user/role/org data lives in Keycloak.

---

## 2. Keycloak Configuration

### 2.1 Realm Settings

- **Realm name:** `digital-gap`
- **Features enabled:** `preview,organization` (enables Keycloak's Organization feature)
- **SMTP configured** for email verification and invitation emails

### 2.2 Clients

| Client | Type | Purpose | Auth Flow |
|--------|------|---------|-----------|
| `dgat-client` | Public | Frontend SPA | Authorization Code + PKCE, `openid offline_access` scope |
| `dgat-admin-client` | Confidential, service-account enabled | Backend service | Client Credentials Grant |
| `admin-portal` | Public | Admin self-service portal | Authorization Code |

### 2.3 Token Mappers

**`dgat-client` token mappers:**

| Mapper Name | Type | Claim | Description |
|-------------|------|-------|-------------|
| `cooperation` | OIDC Group Membership Mapper | `cooperation` | Maps user's group memberships to `cooperation` claim with `full.path=true` |
| `organizations` | OIDC Organization Role Mapper | `organizations` | Maps organization memberships to `organizations` claim |

**`admin-portal` token mappers:**

| Mapper Name | Type | Claim | Description |
|-------------|------|-------|-------------|
| `organizations` | OIDC Organization Role Mapper | `organizations` | Maps org memberships |
| `org_id` | User Session Note Mapper | `org_id` | Adds organization ID from session notes to token |

### 2.4 Client Scopes

The `dgat-client` has these default client scopes:
- `web-origins`, `acr`, `profile`, `roles`, `basic`, `email`, **`organization`**, **`user_attributes`**

The `organization` scope (added during provisioning) includes the organization membership mapper. The `user_attributes` scope maps custom attributes like `assigned_dimensions` and `invited_organization` into the token.

### 2.5 Service Account

`dgat-admin-client` has a **service account** with `realm-admin` role from the `realm-management` client. The backend uses this service account to make Admin REST API calls to Keycloak.

---

## 3. Role Hierarchy & Definitions

### 3.1 Realm Roles

The following realm roles are defined in the Keycloak realm:

| Role | Description | Level |
|------|-------------|-------|
| `dgrv_admin` | Platform super-admin. Full control over all organizations, cooperatives, users, and system settings. | 1 (Highest) |
| `application_admin` | Application-level admin. Assigned to the bootstrap user alongside `dgrv_admin`. | 1 |
| `org_admin` | Organization administrator. Can manage cooperatives within their org, invite/manage org members, create assessments. | 2 |
| `Org_User` | Organization regular user (not currently used in frontend routing). | 2 |
| `coop_admin` | Cooperative administrator. Can manage cooperative members, create and answer assessments within their cooperative. | 3 |
| `coop_user` | Cooperative regular user. Can answer assessments and view submissions; may have `assigned_dimensions` restricting which dimensions they see. | 4 (Lowest) |
| `uma_authorization` | Standard Keycloak UMA role (auto-assigned). | — |
| `offline_access` | Standard Keycloak offline access role (auto-assigned). | — |

### 3.2 Client Roles (realm-management)

These are assigned to users based on their role when they are created/invited:

**For `org_admin` (organization invitation):**
- `view-users`, `query-users`, `manage-users`, `manage-organizations`, `manage-clients`, `manage-realm`
- Also assigned `org_admin` realm role

**For `coop_admin` (cooperative member addition):**
- `manage-users`, `view-users`, `query-users`, `query-groups`, `view-realm`, `query-clients`, `view-clients`
- Also `view-groups` on `account` client
- Assigned `coop_admin` realm role

**For `coop_user` (cooperative member addition):**
- `query-groups`, `view-users`
- Also `view-groups` on `account` client
- Assigned `coop_user` realm role

### 3.3 Role Assignment Mapping

```
dgrv_admin (invites org_admin):
  └── assigns realm role: org_admin
  └── assigns realm-management client roles:
        view-users, query-users, manage-users, manage-organizations,
        manage-clients, manage-realm

coop_admin (adds member as coop_admin):
  └── assigns realm role: coop_admin
  └── assigns realm-management client roles:
        manage-users, view-users, query-users, query-groups,
        view-realm, query-clients, view-clients
  └── assigns account client role: view-groups

coop_admin (adds member as coop_user):
  └── assigns realm role: coop_user
  └── assigns realm-management client roles:
        query-groups, view-users
  └── assigns account client role: view-groups
```

---

## 4. Hierarchical Structure: Organizations & Cooperatives

### 4.1 Hierarchy Model

```
┌─────────────────────────────────────────────────────────┐
│                    dgrv_admin                            │
│  (Platform-level super-admin, manages everything)        │
│  Routes: /admin/*                                        │
└──────────────────────┬──────────────────────────────────┘
                       │ Creates and manages
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Organization                            │
│  (Keycloak Organization entity)                         │
│  Members have org_admin / Org_User roles                 │
│  Routes: /second-admin/*                                 │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Cooperative (Keycloak Group)           │  │
│  │  Group name format: "{org_id}-{cooperative_name}"  │  │
│  │  Members have coop_admin / coop_user roles         │  │
│  │  Routes: /third-admin/* (coop_admin)              │  │
│  │           /user/*         (coop_user)              │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4.2 How Keycloak Models This

- **Organizations** are modeled using Keycloak's native **Organization** feature (preview). An `Organization` entity has a name, domains, attributes, and members.
- **Cooperatives** are modeled as **Keycloak Groups** with the naming convention `{org_id}-{cooperative_name}`. This prefix convention allows filtering groups by organization.
- **User membership:**
  - A user belongs to **one organization** (via Keycloak Organization membership)
  - A user belongs to **one cooperative** (via Keycloak Group membership)
  - **Exclusivity rule:** A user cannot be in more than one organization or more than one cooperative. This is enforced by backend checks when adding members.

### 4.3 Token Claims Mapping

When a user authenticates, their JWT token contains:

```json
{
  "realm_access": {
    "roles": ["org_admin", "offline_access", "uma_authorization"]
  },
  "organization": {
    "My Organization": {
      "id": "uuid-of-org"
    }
  },
  "cooperation": ["/uuid-of-org-cooperative-name"],
  "assigned_dimensions": ["dimension-uuid-1", "dimension-uuid-2"],
  "is_member_of": true,
  "preferred_username": "user@example.com",
  "email": "user@example.com",
  "sub": "keycloak-user-uuid"
}
```

- `realm_access.roles` — Contains the user's realm roles
- `organization` — Contains the organization name and ID (from OIDC Organization Role Mapper)
- `cooperation` — Contains the group path(s) (from OIDC Group Membership Mapper)
- `assigned_dimensions` — Custom attribute pushed into token (from user attributes)
- `is_member_of` — Keycloak organization membership flag

---

## 5. Frontend Authentication Flow

### 5.1 Keycloak Initialization

**File:** `frontend/src/services/shared/keycloakConfig.ts`

```typescript
export const keycloak = new Keycloak({
  url: VITE_KEYCLOAK_URL,      // e.g., https://gat.dgrvcoop360.com/keycloak
  realm: "digital-gap",
  clientId: "dgat-client",
});

export const keycloakInitOptions = {
  onLoad: "check-sso",           // Check SSO silently on page load
  pkceMethod: "S256",            // PKCE for security
  checkLoginIframe: false,       // Disable iframe checks (CORS issues)
  scope: "openid offline_access", // Request offline access for refresh tokens
};
```

### 5.2 Authentication Sequence

```
User visits app
      │
      ▼
keycloak.init({ onLoad: "check-sso" })
      │
      ├── If session exists → Token available → Parse claims → Allow access
      │
      └── If no session → Redirect to login page or show home
               │
               ▼
          keycloak.login({ scope: "openid offline_access" })
               │
               ▼
          User enters credentials on Keycloak login page
               │
               ▼
          Keycloak redirects back with authorization code
               │
               ▼
          keycloak-js exchanges code for tokens (PKCE)
               │
               ▼
          Tokens stored in memory + IndexedDB (idb-keyval)
               │
               ▼
          AuthService.getUserProfile() extracts roles, org, etc.
               │
               ▼
          React context updates → ProtectedRoute grants access
```

### 5.3 AuthService (`frontend/src/services/shared/authService.ts`)

Key methods:

| Method | Purpose |
|--------|---------|
| `login()` | Redirects to Keycloak login page |
| `logout()` | Clears stored tokens, redirects to Keycloak logout |
| `getAccessToken()` | Returns valid JWT; refreshes if expiring within 30s; falls back to cached token offline |
| `getUserProfile()` | Parses JWT claims into `UserProfile` with roles, org ID, org name, dimensions |
| `getOrganizationId()` | Extracts org ID from `organization` claim, falls back to parsing `cooperation` path |
| `hasRole(roles[])` | Checks if user has any of the specified realm roles |
| `getCooperationPath()` | Returns the first cooperation group path from the token |
| `fetchWithAuth(url, init)` | Makes authenticated HTTP requests with Bearer token |
| `storeTokens()` / `clearStoredTokens()` | Manages IndexedDB token persistence for offline support |

### 5.4 UserProfile Interface

```typescript
interface UserProfile {
  sub: string;                  // Keycloak user ID
  preferred_username?: string;
  name?: string;
  email?: string;
  roles?: string[];             // Combined realm + resource roles
  realm_access?: { roles: string[] };
  organization_name?: string;   // Name of the org from token
  organization?: string;        // Org ID from token
  cooperation?: string;         // Group path
  assigned_dimensions?: string[]; // Dimension IDs user can assess
  is_member_of?: boolean;       // Keycloak org membership flag
}
```

---

## 6. Backend Middleware & JWT Validation

### 6.1 Auth Middleware

**File:** `src/auth/middleware.rs`

The middleware is applied **globally** to all API routes in `create_app()`:

```rust
let api_router = routes::api::create_api_routes()
    .layer(axum::middleware::from_fn_with_state(
        state.clone(),
        crate::auth::middleware::auth_middleware,
    ));
```

The middleware:
1. Extracts the `Authorization: Bearer <token>` header
2. Validates the JWT signature against Keycloak's JWKS
3. Validates the issuer matches `{public_url}/realms/{realm}`
4. On success: inserts `Claims` struct and raw token string into request extensions
5. On failure: returns `401 UNAUTHORIZED`

### 6.2 JWT Validator

**File:** `src/auth/jwt_validator.rs`

- Fetches OIDC config from `{keycloak_url}/realms/{realm}/.well-known/openid-configuration`
- Gets JWKS from Keycloak (with URL replacement for container networking)
- Validates tokens using RS256 algorithm
- Caches JWKS in `Arc<RwLock<>>` (lazily fetched)

### 6.3 Claims Extraction

**File:** `src/auth/claims.rs`

```rust
struct Claims {
    subject: String,                              // Keycloak user ID (sub claim)
    realm_access: Option<RealmAccess>,            // { roles: Vec<String> }
    resource_access: Option<HashMap<String, RealmAccess>>, // Client roles
    preferred_username: String,
    email: String,
    name: Option<String>,
    organization_id: Option<String>,               // From org_id mapper
}

impl Claims {
    fn is_application_admin(&self) -> bool {
        self.has_realm_role("dgrv_admin")
    }

    fn has_realm_role(&self, role: &str) -> bool {
        // Checks if the given role exists in realm_access.roles
    }

    fn get_organization_id(&self) -> Option<String> {
        self.organization_id.clone()
    }
}
```

**Important:** `Claims` implements `FromRequestParts`, so it can be injected directly into Axum handlers via `Extension(claims): Extension<Claims>`.

---

## 7. Frontend Route Protection (RBAC)

### 7.1 Route Configuration

**File:** `frontend/src/router/routes.ts`

Route protection is implemented via `ProtectedRoute` component with `allowedRoles` prop:

| Route | Allowed Roles | Layout |
|-------|---------------|--------|
| `/onboarding` | `dgrv_admin`, `org_admin`, `coop_admin`, `coop_user` | — |
| `/admin/*` | `dgrv_admin` | `AdminLayout` |
| `/second-admin/*` | `org_admin` | `SecondAdminLayout` |
| `/third-admin/*` | `coop_admin` | `ThirdAdminLayout` |
| `/user/*` | `coop_user`, `coop_admin` | `UserLayout` |

### 7.2 ProtectedRoute Component

**File:** `frontend/src/router/ProtectedRoute.tsx`

Logic flow:
1. Check if user is authenticated (via Keycloak + cached tokens)
2. Combine `user.roles` and `user.realm_access.roles` into role list
3. If user has `dgrv_admin` role and visits `/dashboard`, redirect to `/admin/dashboard`
4. If `allowedRoles` is specified and user lacks the role, redirect to `/unauthorized`
5. If route requires `org_admin` but user has no organization ID, show "Organization Required" message (offline users bypass this check)

### 7.3 Navbar Redirection

**File:** `frontend/src/components/shared/Navbar.tsx`

Based on role:
- `dgrv_admin` → `/admin/dashboard`
- `org_admin` → `/second-admin/dashboard`
- `coop_admin` → `/third-admin/dashboard`
- `coop_user` → `/user/dashboard`

### 7.4 Onboarding Flow

**File:** `frontend/src/pages/OnboardingFlow.tsx`

After login, the onboarding flow redirects based on role:
- `dgrv_admin` → `/admin/dashboard`
- `org_admin` → `/second-admin/dashboard`
- `coop_admin` → `/third-admin/dashboard`
- `coop_user` → `/user/dashboard`

### 7.5 Invitation Pending Detection

In `AuthContext.tsx`, if a user has the `org_admin` role but `is_member_of === false`, an `InvitationPendingDialog` is shown. This handles the case where a user has been assigned the `org_admin` role via invitation but hasn't yet accepted the Keycloak organization membership.

---

## 8. Organization Creation Flow

### 8.1 Flow: dgrv_admin Creates an Organization

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │     │ Backend  │     │ Keycloak │     │ Database │
│ (dgrv_   │     │ (Axum)   │     │ Admin    │     │ (Postgre)│
│  admin)  │     │          │     │ API      │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └──────────┘
     │                │                │
     │ POST /admin/organizations      │
     │ {name, domains, attributes}    │
     │───────────────▶│                │
     │                │                │
     │                │ Get Admin Token│
     │                │ (client-creds) │
     │                │───────────────▶│
     │                │                │
     │                │ Bearer token    │
     │                │◀───────────────│
     │                │                │
     │                │ POST /admin/realms/digital-gap/organizations
     │                │ {name, domains, redirectUrl, enabled, attributes}
     │                │───────────────▶│
     │                │                │
     │                │ Organization   │
     │                │ created        │
     │                │◀───────────────│
     │                │                │
     │ 201 Created   │                │
     │◀───────────────│                │
     │                │                │
```

### 8.2 Frontend Call

**File:** `frontend/src/services/organizations/organizationRepository.ts`

```typescript
const response = await createOrganization({
  requestBody: {
    name: organization.name,
    domains: [{ name: organization.domain }],
    redirectUrl: `${VITE_APP_PUBLIC_URL}/`,
    enabled: "true",
    attributes: { description: [organization.description] },
  },
});
```

### 8.3 Backend Handler

**File:** `src/api/handlers/organization.rs` → `create_organization()`

```rust
pub async fn create_organization(
    State(state): State<AppState>,
    Extension(_token): Extension<String>,
    Json(request): Json<OrganizationCreateRequest>,
) -> AppResult<impl IntoResponse> {
    let admin_token = keycloak_service.get_admin_token().await?;
    keycloak_service.create_organization(
        &admin_token, &request.name, request.domains,
        request.redirect_url, request.enabled, request.attributes,
    ).await
}
```

### 8.4 Keycloak Admin API Call

**File:** `src/services/keycloak.rs` → `create_organization()`

```rust
POST {keycloak_url}/admin/realms/{realm}/organizations
{
    "name": "...",
    "domains": [{ "name": "example.com" }],
    "redirectUrl": "...",
    "enabled": true,
    "attributes": { "description": ["..."] }
}
```

**No role check is performed in the backend handler.** The only protection is the auth middleware ensuring a valid JWT exists, and the frontend `ProtectedRoute` ensuring only `dgrv_admin` users reach this route.

---

## 9. Cooperative (Group) Creation Flow

### 9.1 Flow: org_admin Creates a Cooperative

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │     │ Backend  │     │ Keycloak │
│ (org_    │     │ (Axum)   │     │ Admin    │
│  admin)  │     │          │     │ API      │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     │ POST /admin/organizations/{org_id}/groups
     │ {name, description}             │
     │───────────────▶│                │
     │                │                │
     │                │ Group name = "{org_id}-{name}"
     │                │                │
     │                │ Get Admin Token │
     │                │───────────────▶│
     │                │                │
     │                │ POST /admin/realms/digital-gap/groups
     │                │ {name: "uuid-coopname", attributes: {description: [...]}}
     │                │───────────────▶│
     │                │                │
     │                │ 201 Created    │
     │                │◀───────────────│
     │                │                │
     │ 201 Created    │                │
     │◀───────────────│                │
```

### 9.2 Name Convention

Cooperatives are named with the prefix `{org_id}-` to namespace them per organization. For example, if the org ID is `abc-123` and the coop name is `Marketing`, the Keycloak group name becomes `abc-123-Marketing`.

When listing cooperatives for an org, the backend filters by this prefix:
```rust
let search_prefix = format!("{}-", org_id);
keycloak_service.get_groups(&token, Some(&search_prefix)).await
```

---

## 10. User Creation & Invitation Flow

### 10.1 Invitation to Organization (by dgrv_admin)

This is the most complex flow. Only `dgrv_admin` can invite users to organizations.

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │     │ Backend  │     │ Keycloak │
│ (dgrv_   │     │ (Axum)   │     │ Admin    │
│  admin)  │     │          │     │ API      │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     │ POST /admin/organizations/{org_id}/invitations
     │ {email, first_name, last_name, roles}
     │───────────────▶│                │
     │                │                │
     │                │ Check: caller has dgrv_admin role
     │                │◀──────────────(claims check)
     │                │                │
     │                │ Get Admin Token │
     │                │───────────────▶│
     │                │                │
     │                │ Search user by email
     │                │ GET /admin/realms/{realm}/users?search=email
     │                │───────────────▶│
     │                │                │
     │                │ User found?    │
     │                │                │
     │    ┌──── YES ─┤     NO ────┐   │
     │    │          │            │   │
     │    │          │ Create user│   │
     │    │          │ POST /admin/realms/{realm}/users
     │    │          │ {username, email, enabled:true, VERIFY_EMAIL action}
     │    │          │─────────────────▶│
     │    │          │            │   │
     │    │          │            │ Update attributes
     │    │          │            │ PUT /admin/realms/{realm}/users/{id}
     │    │          │            │ {invited_organization: [org_id]}
     │    │          │─────────────────▶│
     │    │          │            │   │
     │    │          │            │ Trigger email verification
     │    │          │            │ POST .../users/{id}/send-verify-email
     │    │          │─────────────────▶│
     │    │          │            │   │
     │    │          │◄─────────────┘   │
     │    │          │                │
     │    │          │ Exclusivity check: user not in any group or other org
     │    │          │ (checks groups + organizations + invited_organization attr)
     │    │          │                │
     │    │          │ Assign org_admin realm role
     │    │          │ POST .../users/{id}/role-mappings/realm
     │    │          │ {roles: [{name: "org_admin"}]}
     │    │          │───────────────▶│
     │    │          │                │
     │    │          │ Assign realm-management client roles
     │    │          │ (view-users, query-users, manage-users, manage-organizations,
     │    │          │  manage-clients, manage-realm)
     │    │          │───────────────▶│
     │    │          │                │
     │    │          │ Update invited_organization attribute
     │    │          │───────────────▶│
     │    │          │                │
     │    │          │ Create org invitation
     │    │          │ POST .../organizations/{org_id}/members/invite-user
     │    │          │───────────────▶│
     │    │          │                │
     │                │ 201 Created   │
     │◀───────────────│                │
```

### 10.2 Invitation Handlers

**File:** `src/api/handlers/invitation.rs`

| Endpoint | Handler | Auth Check |
|----------|---------|------------|
| `POST /admin/organizations/{org_id}/invitations` | `invite_user_to_organization` | `dgrv_admin` required |
| `GET /admin/organizations/{org_id}/invitations` | `get_organization_invitations` | None (JWT only) |
| `DELETE /admin/organizations/{org_id}/invitations/{id}` | `delete_organization_invitation` | `dgrv_admin` required |
| `POST /admin/organizations/{org_id}/invitations/{id}/resend` | `resend_organization_invitation` | `dgrv_admin` required |

### 10.3 Invitation Pending Detection

When a user is invited to an organization but hasn't accepted yet, their `is_member_of` claim is `false`. The frontend detects this in `AuthContext.tsx`:

```typescript
if (roles.includes(ROLES.ORG_ADMIN) && user?.is_member_of === false) {
    setIsInvitationPending(true);
}
```

This shows an `InvitationPendingDialog` on the frontend.

---

## 11. Adding Members to Cooperatives

### 11.1 Flow: coop_admin or org_admin Adds a Member

```
POST /admin/groups/{group_id}/members
{email, first_name, last_name, roles: ["coop_admin" | "coop_user"], dimension_ids}
```

**File:** `src/api/handlers/user.rs` → `add_member()`

Steps:
1. Get admin token from Keycloak
2. Search for existing user by email
3. **If user exists:**
   - Check user is not already in another group (exclusivity)
   - Check user is not already in an organization (exclusivity)
   - Check user doesn't have `invited_organization` attribute pointing to a different org
   - Update user attributes (e.g., `assigned_dimensions`) if provided
4. **If user doesn't exist:**
   - Create user with `email_verified: true`, `enabled: true`
   - Set `assigned_dimensions` attribute if provided
5. **Assign realm role** (`coop_admin` or `coop_user`)
6. **Assign client roles** based on the realm role:
   - `coop_admin`: realm-management roles (manage-users, view-users, query-users, query-groups, view-realm, query-clients, view-clients) + account role (view-groups)
   - `coop_user`: realm-management roles (query-groups, view-users) + account role (view-groups)
7. **Add user to the Keycloak group** (cooperative)
8. Return 201

### 11.2 Frontend Cooperation User Sync

**File:** `frontend/src/services/cooperationUsers/cooperationUserSyncService.ts`

The frontend:
1. Fetches members via `GET /admin/groups/{group_id}/members`
2. Maps each member to `CooperationUser` with roles, dimension IDs, etc.
3. Stores in IndexedDB for offline support
4. For adding users, calls `POST /admin/groups/{group_id}/members`

### 11.3 Dimension Assignment

Cooperative users can be restricted to specific assessment dimensions via the `assigned_dimensions` user attribute. This is stored in Keycloak as a custom attribute and propagated into the JWT token.

---

## 12. Backend-to-Keycloak Communication

### 12.1 Service Account Authentication

The backend authenticates to Keycloak's Admin API using the **client credentials grant**:

```
POST {keycloak_url}/realms/{realm}/protocol/openid-connect/token
  grant_type=client_credentials
  client_id=dgat-admin-client
  client_secret={DGAT_KEYCLOAK_CLIENT_SECRET}
```

This returns an access token with `realm-admin` privileges, which is then used for all Admin REST API calls.

**File:** `src/services/keycloak.rs` → `get_admin_token()`

The token is cached and reused until expiry.

### 12.2 KeycloakService Methods

**File:** `src/services/keycloak.rs` (1761 lines)

| Method | Keycloak Admin API Endpoint | Purpose |
|--------|---------------------------|---------|
| `get_admin_token()` | `POST /realms/{realm}/protocol/openid-connect/token` | Obtain service account token |
| `create_organization()` | `POST /admin/realms/{realm}/organizations` | Create org |
| `get_organizations()` | `GET /admin/realms/{realm}/organizations` | List orgs |
| `get_organization()` | `GET /admin/realms/{realm}/organizations/{id}` | Get org |
| `update_organization()` | `PUT /admin/realms/{realm}/organizations/{id}` | Update org |
| `delete_organization()` | `DELETE /admin/realms/{realm}/organizations/{id}` | Delete org + cascade |
| `create_invitation()` | `POST /admin/realms/{realm}/organizations/{id}/members/invite-user` | Send org invitation |
| `get_organization_invitations()` | `GET /admin/realms/{realm}/organizations/{id}/invitations` | List invitations |
| `delete_organization_invitation()` | `DELETE /admin/realms/{realm}/organizations/{id}/invitations/{iid}` | Cancel invitation |
| `resend_organization_invitation()` | `POST /admin/realms/{realm}/organizations/{id}/invitations/{iid}/resend` | Resend invitation |
| `create_user_with_email_verification()` | `POST /admin/realms/{realm}/users` | Create user |
| `update_user_attributes()` | `PUT /admin/realms/{realm}/users/{id}` | Update user attrs |
| `assign_realm_role_to_user()` | `POST /admin/realms/{realm}/users/{id}/role-mappings/realm` | Assign realm role |
| `assign_client_role_to_user()` | `POST /admin/realms/{realm}/users/{id}/role-mappings/clients/{cid}` | Assign client role |
| `add_user_to_organization()` | `POST /admin/realms/{realm}/organizations/{oid}/members` | Add user to org |
| `add_user_to_group()` | `PUT /admin/realms/{realm}/users/{uid}/groups/{gid}` | Add user to group |
| `create_group()` | `POST /admin/realms/{realm}/groups` | Create group |
| `get_groups()` | `GET /admin/realms/{realm}/groups?search=` | List groups |
| `delete_group()` | `DELETE /admin/realms/{realm}/groups/{id}` | Delete group |
| `get_user_groups()` | `GET /admin/realms/{realm}/users/{id}/groups` | User's groups |
| `get_user_organizations()` | `GET /admin/realms/{realm}/users/{id}/organizations` | User's orgs |
| `trigger_email_verification()` | `POST /admin/realms/{realm}/users/{id}/send-verify-email` | Verify email |
| `delete_user()` | `DELETE /admin/realms/{realm}/users/{id}` | Delete user |

### 12.3 Configuration

**File:** `src/config.rs`

```rust
struct KeycloakConfigs {
    url: String,           // Internal URL: http://keycloak:8080/keycloak
    public_url: String,    // Public URL: https://gat.dgrvcoop360.com/keycloak
    realm: String,         // "digital-gap"
    client_id: String,     // "dgat-admin-client"
    client_secret: String, // From env: DGAT_KEYCLOAK_CLIENT_SECRET
}
```

The internal URL is used for backend-to-Keycloak communication within the Docker network. The public URL is used for JWKS validation (token issuer must match the public URL).

---

## 13. Complete Data Flow Diagrams

### 13.1 User Login & Token Flow

```
Browser                         Frontend (React)                Keycloak               Backend (Axum)
  │                                  │                            │                        │
  │ 1. Visit app                     │                            │                        │
  │─────────────────────────────────▶│                            │                        │
  │                                  │                            │                        │
  │                                  │ 2. keycloak.init()         │                        │
  │                                  │───────────────────────────▶│                        │
  │                                  │                            │                        │
  │ 3. Redirect to Keycloak login   │                            │                        │
  │◀─────────────────────────────────│                            │                        │
  │                                  │                            │                        │
  │ 4. User enters credentials      │                            │                        │
  │─────────────────────────────────────────────────────────────▶│                        │
  │                                  │                            │                        │
  │ 5. Redirect back with auth code │                            │                        │
  │◀─────────────────────────────────────────────────────────────│                        │
  │                                  │                            │                        │
  │                                  │ 6. Exchange code for tokens │                        │
  │                                  │───────────────────────────▶│                        │
  │                                  │                            │                        │
  │                                  │ 7. JWT access token + refresh token                   │
  │                                  │◀───────────────────────────│                        │
  │                                  │                            │                        │
  │                                  │ 8. Store tokens in IndexedDB + memory                  │
  │                                  │                            │                        │
  │                                  │ 9. Parse token claims → UserProfile                    │
  │                                  │    - Extract roles         │                        │
  │                                  │    - Extract organization   │                        │
  │                                  │    - Extract cooperation    │                        │
  │                                  │    - Determine route        │                        │
  │                                  │                            │                        │
  │ 10. ProtectedRoute grants access │                            │                        │
  │◀─────────────────────────────────│                            │                        │
  │                                  │                            │                        │
  │ 11. API call (e.g., GET /admin/organizations)                 │                        │
  │─────────────────────────────────▶│                            │                        │
  │                                  │ 12. GET /admin/organizations │                        │
  │                                  │    Authorization: Bearer JWT │                        │
  │                                  │────────────────────────────────────────────────────▶ │
  │                                  │                            │                        │
  │                                  │                            │ 13. Auth middleware validates JWT │
  │                                  │                            │    against Keycloak JWKS        │
  │                                  │                            │                        │
  │                                  │                            │ 14. Claims extracted & injected │
  │                                  │                            │                        │
  │                                  │                            │ 15. Handler gets admin token     │
  │                                  │                            │◀────────────────────────────── │
  │                                  │                            │                        │
  │                                  │                            │ 16. Call Keycloak Admin API     │
  │                                  │                            │◀────────────────────────────── │
  │                                  │                            │                        │
  │                                  │                            │ 17. Keycloak returns data   │
  │                                  │                            │──────────────────────────▶│   │
  │                                  │                            │                        │
  │                                  │ 18. JSON response          │                        │
  │◀─────────────────────────────────│◀───────────────────────────────────────────────── │
```

### 13.2 Create Organization Flow

```
dgrv_admin → Frontend → Backend → Keycloak Admin API
                │
                │  POST /admin/organizations
                │  {name, domains, attributes}
                │
                ▼
           Backend handler (no role check)
                │
                │  Get admin token (client credentials)
                │
                │  POST /admin/realms/digital-gap/organizations
                │
                ▼
           Keycloak creates organization
                │
                │  Returns {id, name, domains, ...}
                │
                ▼
           Frontend stores in IndexedDB
```

### 13.3 Invite User to Organization Flow

```
dgrv_admin → Frontend → Backend → Keycloak Admin API
                │
                │  POST /admin/organizations/{org_id}/invitations
                │  {email, first_name, last_name, roles}
                │
                ▼
           Backend handler checks dgrv_admin role ← ONLY handler with role check
                │
                │  1. Get admin token
                │  2. Search user by email
                │  3. If not found: create user with VERIFY_EMAIL action
                │  4. Set invited_organization attribute
                │  5. Assign org_admin realm role
                │  6. Assign realm-management client roles
                │  7. Create organization invitation
                │
                ▼
           Keycloak sends invitation email
           User appears in pending invitations
```

### 13.4 Add Member to Cooperative Flow

```
org_admin/coop_admin → Frontend → Backend → Keycloak Admin API
                │
                │  POST /admin/groups/{group_id}/members
                │  {email, first_name, last_name, roles, dimension_ids}
                │
                ▼
           Backend handler (no role check)
                │
                │  1. Get admin token
                │  2. Search user by email
                │  3. Exclusivity checks (not in other group/org)
                │  4. Create user if not exists OR update attributes
                │  5. Assign realm role (coop_admin or coop_user)
                │  6. Assign client roles based on role
                │  7. Add user to Keycloak group
                │
                ▼
           User created/updated in Keycloak
           User added to cooperative group
```

---

## 14. Keycloak Realm Export Details

**File:** `infrastructure/keycloak/realm-export.json`

### Key Realm Roles

```json
{
  "dgrv_admin": { "id": "dde7f274-...", "name": "dgrv_admin" },
  "application_admin": { "id": "94a86ac8-...", "name": "application_admin" },
  "org_admin": { "id": "88868f18-...", "name": "org_admin" },
  "Org_User": { "id": "78d5635a-...", "name": "Org_User" },
  "coop_admin": { "id": "f7b8ab70-...", "name": "coop_admin" },
  "coop_user": { "id": "bbdd130b-...", "name": "coop_user" }
}
```

### Default Composite Role

The `default-roles-sustainability-realm` role (which is the default role auto-assigned to all users) includes:
- `offline_access`
- `uma_authorization`
- `account` client role: `view-profile`, `manage-account`

---

## 15. Token Claims & Role Extraction

### 15.1 Frontend: Parsing JWT Claims

**File:** `frontend/src/services/shared/authService.ts` → `getUserProfile()`

```typescript
const token = keycloak.tokenParsed as CustomKeycloakTokenParsed;

const realmRoles = token.realm_access?.roles || [];     // e.g., ["org_admin", "offline_access"]
const resourceRoles = token.roles || [];                 // e.g., [] (not heavily used)
const allRoles = [...new Set([...realmRoles, ...resourceRoles])];

// Extract organization info
const orgs = token.organization || token.organizations;
// e.g., { "My Org": { id: "uuid" } }

// Extract cooperation (group) path
const cooperation = token.cooperation;  // e.g., ["/uuid-cooperative-name"]

// Extract assigned dimensions
const assigned_dimensions = token.assigned_dimensions;
// e.g., ["dimension-uuid-1", "dimension-uuid-2"]
```

### 15.2 Backend: JWT Claims Struct

```rust
struct PrivateClaims {
    realm_access: Option<RealmAccess>,
    resource_access: Option<HashMap<String, RealmAccess>>,
    preferred_username: String,
    email: String,
    name: Option<String>,
    organization_id: Option<String>,
}

struct Claims {
    subject: String,                    // "sub" claim = Keycloak user ID
    realm_access: Option<RealmAccess>,  // Realm roles
    resource_access: Option<HashMap<String, RealmAccess>>, // Client roles
    preferred_username: String,
    email: String,
    name: Option<String>,
    organization_id: Option<String>,     // From org_id mapper
}
```

### 15.3 How Organization ID is Extracted from Token

**Frontend (two methods):**

1. **Primary:** From `organization` (singular) claim — the Keycloak 26 Organization scope mapper:
   ```typescript
   const orgs = token.organization || token.organizations;
   const orgId = Object.values(orgs)[0].id;
   ```

2. **Fallback:** From `cooperation` claim, parsing the UUID prefix of the group path:
   ```typescript
   const path = token.cooperation[0];  // e.g., "/uuid-hyphens- coop-name"
   const withoutSlash = path.slice(1); // "uuid-hyphens-coop-name"
   const uuidMatch = withoutSlash.match(/^([0-9a-f]{8}-[0-9a-f]{4}-...)/);
   const orgId = uuidMatch[1];  // "uuid-hyphens"
   ```

**Backend:** From `organization_id` claim set by the `org_id` User Session Note mapper on the `admin-portal` client. Note: this mapper is only configured for `admin-portal`, not `dgat-client`, so the backend's `organization_id` claim may be `None` for regular users.

---

## 16. Offline Support

### 16.1 Token Persistence

The frontend stores tokens in IndexedDB via `idb-keyval`:

```typescript
const tokens = {
    accessToken: keycloak.token,
    refreshToken: keycloak.refreshToken,
    idToken: keycloak.idToken,
    expiresAt: keycloak.tokenParsed?.exp,
};
await set("auth_tokens", tokens);
await set("auth_profile", profile);
```

### 16.2 Offline Behavior

- `getAccessToken()` — If token is near expiry (>30s) and offline, uses cached token instead of refreshing
- `AuthProvider` — Re-hydrates from IndexedDB on page reload, manually restores `keycloak.token` and `keycloak.tokenParsed` when offline
- `organizationRepository` — Falls back to IndexedDB when `navigator.onLine` is false
- `cooperationRepository` — Caches fetched data in IndexedDB; queries local cache on error
- Inactivity timer (10 minutes) — Logs user out on inactivity; only active when authenticated and online

### 16.3 Sync Queue Pattern

Most repositories follow a pattern:
1. If online: call backend API, store response in IndexedDB
2. If offline: store locally with `syncStatus: "new"` or `"updated"`, add to sync queue
3. When back online: `syncService` processes queue and syncs changes to backend

---

## 17. Bootstrap / Initial Provisioning

### 17.1 Keycloak Startup

**File:** `docker-compose.yml` + `keycloak-startup.sh` + `scripts/keycloak-provisioning.sh`

1. Keycloak container starts with `--import-realm` flag (imports `realm-export.json`)
2. `keycloak-startup.sh` starts Keycloak, waits for readiness, then runs `keycloak-provisioning.sh`
3. Provisioning script:
   - Logs in as admin on master realm (retries up to 120 times)
   - Creates user `360@dgrv.coop` with first name `fernando`, last name `espinosa`, temporary password
   - Assigns ALL `realm-management` client roles to this user
   - Assigns `realm-admin` role to `dgat-admin-client` service account
   - Assigns `application_admin` and `dgrv_admin` realm roles to the user
   - Configures SMTP email settings
   - Sets realm `frontendUrl`
   - Resets `dgat-admin-client` client secret
   - Adds `organization` and `user_attributes` scopes to `dgat-client` default scopes

### 17.2 First Super-Admin

After provisioning, the first `dgrv_admin` user (`360@dgrv.coop`) can:
1. Log in at the platform
2. Access `/admin/*` routes
3. Create organizations
4. Invite org_admins to organizations
5. Create cooperatives within organizations

---

## 18. Security Considerations & Gaps

### 18.1 Current State

1. **Backend has no route-level authorization.** The auth middleware only validates that the JWT is properly signed and not expired. There is no middleware or guard that checks realm roles before allowing access to specific endpoints.

2. **Only 3 handlers check roles** — all in `invitation.rs`, and they only check for `dgrv_admin`:
   - `delete_organization_invitation`
   - `resend_organization_invitation`
   - `invite_user_to_organization`

3. **No org-level or group-level access control.** No handler verifies that a user belongs to an organization before allowing them to modify that organization's resources.

4. **No role hierarchy enforcement in the backend.** The role hierarchy (`dgrv_admin` > `org_admin` > `coop_admin` > `coop_user`) is only enforced on the frontend via `ProtectedRoute`.

5. **`resource_access` (client roles) is extracted in JWT claims but never checked** by any backend handler.

6. **`organization_id` from JWT claims is available but never used for authorization** in any handler.

7. **`has_realm_role()` method exists but is only called by `is_application_admin()`.** No other role checks exist in handlers.

8. **Destructive cascading deletes** — `delete_organization` deletes all Keycloak users belonging to the org before deleting the org itself, with no role check.

9. **Exclusivity checks** are present in `add_member` and `invite_user_to_organization` (preventing users from being in multiple orgs/groups) but are not enforced at the Keycloak level.

### 18.2 What Is Protected

- **Frontend routes:** All protected routes require authenticated JWT + correct role
- **API endpoints:** All API endpoints require a valid JWT (auth middleware)
- **Invitation endpoints:** Require `dgrv_admin` realm role
- **User self-service** (`GET/PATCH /user/me`, `POST /user/me/password`): Uses `Claims.subject` to identify the acting user

### 18.3 Recommendations

1. **Add backend role-checking middleware** that validates realm roles against required roles for each route group
2. **Add organization membership checks** — verify that the calling user belongs to the organization they're operating on
3. **Add cooperative access checks** — verify user membership before allowing cooperative modifications
4. **Implement resource-level authorization** — use the `organization_id` claim or query Keycloak for membership
5. **Add audit logging** for all administrative operations
6. **Consider using Keycloak Authorization Services** (resource-based permissions) for more granular control

---

## Appendix A: API Routes Summary

### Organization Routes (`/admin/organizations`)

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| POST | `/admin/organizations` | `create_organization` | JWT only |
| GET | `/admin/organizations` | `get_organizations` | JWT only |
| GET | `/admin/organizations/:org_id` | `get_organization` | JWT only |
| PUT | `/admin/organizations/:org_id` | `update_organization` | JWT only |
| DELETE | `/admin/organizations/:org_id` | `delete_organization` | JWT only |
| POST | `/admin/organizations/:org_id/invitations` | `invite_user_to_organization` | **dgrv_admin** |
| GET | `/admin/organizations/:org_id/invitations` | `get_organization_invitations` | JWT only |
| DELETE | `/admin/organizations/:org_id/invitations/:id` | `delete_organization_invitation` | **dgrv_admin** |
| POST | `/admin/organizations/:org_id/invitations/:id/resend` | `resend_organization_invitation` | **dgrv_admin** |
| GET | `/admin/organizations/:org_id/members` | `get_organization_members` | JWT only |
| POST | `/admin/organizations/:org_id/groups` | `create_group` | JWT only |
| GET | `/admin/organizations/:org_id/groups` | `get_groups_by_organization` | JWT only |
| POST | `/admin/organizations/:org_id/dimensions` | `assign_dimension_to_organization` | JWT only |
| GET | `/admin/organizations/:org_id/dimensions` | `get_organization_dimensions` | JWT only |
| PUT | `/admin/organizations/:org_id/dimensions` | `update_organization_dimensions` | JWT only |
| DELETE | `/admin/organizations/:org_id/dimensions/:dimension_id` | `remove_dimension_from_organization` | JWT only |

### Group (Cooperative) Routes (`/admin/groups`)

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| GET | `/admin/groups/path?path=...` | `get_group_by_path` | JWT only |
| GET | `/admin/groups/:group_id` | `get_group` | JWT only |
| PUT | `/admin/groups/:group_id` | `update_group` | JWT only |
| DELETE | `/admin/groups/:group_id` | `delete_group` | JWT only |
| POST | `/admin/groups/:group_id/members` | `add_member` | JWT only |
| GET | `/admin/groups/:group_id/members` | `get_group_members` | JWT only |

### User Routes (`/admin/users`)

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| DELETE | `/admin/users/:user_id` | `delete_user` | JWT only |
| PUT | `/admin/users/:user_id/dimensions` | `update_user_dimensions` | JWT only |

### Self-Service Routes

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| GET | `/user/me` | `get_me` | JWT (uses sub claim) |
| PATCH | `/user/me` | `update_me` | JWT (uses sub claim) |
| POST | `/user/me/password` | `change_password` | JWT (uses sub claim) |

---

## Appendix B: Frontend Route Protection Summary

| Route Pattern | Required Roles | Layout |
|---------------|---------------|--------|
| `/admin/*` | `dgrv_admin` | `AdminLayout` (sidebar with Organizations, Dimensions, Users, Reports) |
| `/second-admin/*` | `org_admin` | `SecondAdminLayout` (sidebar with Cooperations, Users, Assessments, Reports) |
| `/third-admin/*` | `coop_admin` | `ThirdAdminLayout` (sidebar with Users, Assessments, Submissions) |
| `/user/*` | `coop_user`, `coop_admin` | `UserLayout` (sidebar with Assessments, Submissions) |
| `/onboarding` | `dgrv_admin`, `org_admin`, `coop_admin`, `coop_user` | — |