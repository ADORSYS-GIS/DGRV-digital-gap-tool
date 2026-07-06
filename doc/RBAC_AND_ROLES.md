# RBAC & Roles — DGRV Digital Gap Assessment Tool

> This document is the **role reference**: it lists every role, what each role can do,
> and exactly where and how authorization is enforced (and where it is **not**).
> For the deeper Keycloak realm/client/token configuration, see
> `RBAC_AND_AUTH_SYSTEM.md`. This file is kept separate so it can be read quickly
> during handover.

## 1. The Role Model

The system has four business roles plus standard Keycloak realm roles. All business
roles are **Keycloak realm roles** in the `digital-gap` realm.

| Realm role (exact string) | Tier | Who they are | Frontend area |
|---|---|---|---|
| `dgrv_admin` | Platform admin | DGRV staff | `/admin/**` |
| `org_admin` | Organisation admin | Manages one Keycloak *Organisation* | `/second-admin/**` |
| `coop_admin` | Cooperative admin | Manages one cooperative (Keycloak *Group*) | `/third-admin/**` |
| `coop_user` | Cooperative user | End user doing assessments | `/user/**` (also `coop_admin`) |
| `application_admin` | (legacy/companion) | Granted to the bootstrap user alongside `dgrv_admin` | not separately enforced |
| `Org_User` | (legacy, **case-sensitive**) | Older role; not the active `coop_user` | not used by routing |
| `offline_access`, `uma_authorization`, `default-roles-*` | standard Keycloak | infrastructure | n/a |

Roles are issued by Keycloak in the JWT `realm_access.roles` array (and, for resource
roles, `resource_access.<client>.roles`). The frontend combines `token.realm_access.roles`
and `token.roles`, lowercases them, and compares against the allow-list per route.

### Role hierarchy (intended)

```
dgrv_admin  >  org_admin  >  coop_admin  >  coop_user
```

> ⚠️ **This hierarchy is only enforced by the frontend route guard.** The backend does
> *not* enforce hierarchy or membership for most endpoints — see §4.

### Client (realm-management / account) roles granted per role

When the backend creates/invites users it also assigns Keycloak **client roles** so
those users can perform admin actions on their tier:

| On provisioning `org_admin` (invitation) | On adding a `coop_admin` member | On adding a `coop_user` member |
|---|---|---|
| realm-management: `view-users`, `query-users`, `manage-users`, `manage-organizations`, `manage-clients`, `manage-realm` | realm-management: `manage-users`, `view-users`, `query-users`, `query-groups`, `view-realm`, `query-clients`, `view-clients` | realm-management: `query-groups`, `view-users` |
| — | account: `view-groups` | account: `view-groups` |

These assignments live in `src/api/handlers/invitation.rs` and
`src/api/handlers/user.rs::add_member`.

## 2. Where Authorization Is Enforced

### 2.1 Backend

**Authentication (strong, global).**
`src/auth/middleware.rs::auth_middleware` is applied to **all** API routes in
`lib.rs::create_app`. It:
- reads `Authorization: Bearer <token>`,
- validates via `JwtValidator` (biscuit, RS256, JWKS cached, issuer checked against
  `{public_url}/realms/{realm}`),
- injects `Claims` and the raw token into request extensions,
- returns `401` on any failure.

Every business endpoint therefore requires a valid Keycloak JWT.

**Authorization (very limited).**
The only role primitive is `Claims::is_application_admin()` in
`src/auth/claims.rs`, which checks `has_realm_role("dgrv_admin")`. Exhaustive grep
across `src/api/handlers/` shows role checks **only** in 3 invitation handlers:

| Endpoint | Check |
|---|---|
| `POST /admin/organizations/:org_id/invitations` (`invite_user_to_organization`) | `claims.is_application_admin()` → else `BadRequest("Insufficient permissions")` |
| `DELETE /admin/organizations/:org_id/invitations/:invitation_id` (`delete_organization_invitation`) | same |
| `POST /admin/organizations/:org_id/invitations/:invitation_id/resend` (`resend_organization_invitation`) | same |

`GET /admin/organizations/:org_id/invitations` accepts any authenticated token.

**All other ~80 endpoints are "JWT-only"** — any authenticated user can call them,
regardless of role or which org/cooperative the resource belongs to. The `/admin/`
path prefix is a naming convention only; there is **no** route-layer role guard.

> Note: `dimension_scoring.rs` and `minio.rs` are **not** exported from
> `services/mod.rs`, so they are effectively dead code.

### 2.2 Frontend

Authorization is enforced client-side in `frontend/src/router/ProtectedRoute.tsx`:

- Requires `isAuthenticated` (or trusted cached tokens when offline).
- Computes `userRoles = [...user.roles, ...user.realm_access.roles].map(lower)`.
- Redirects `dgrv_admin` requesting `/dashboard` → `/admin/dashboard`.
- For `allowedRoles` set: if the user has none of the allowed roles →
  `<Navigate to="/unauthorized" />`.
- For `org_admin` routes: requires `user.organization` to exist (online); shows
  `NoOrganizationMessage` if missing. Offline users are not blocked.
- Supports `children` or `<Outlet/>` rendering.

Route → allowed roles mapping (from `frontend/src/router/routes.ts`,
role constants in `frontend/src/constants/roles.ts`):

| Route prefix | `allowedRoles` |
|---|---|
| `/admin/**` | `["dgrv_admin"]` |
| `/second-admin/**` | `["org_admin"]` |
| `/third-admin/**` | `["coop_admin"]` |
| `/user/**` | `["coop_user", "coop_admin"]` |
| `/onboarding` | all four |

Post-login redirect by role lives in `frontend/src/pages/HomePage.tsx`.

## 3. Per-Role Capabilities

### `dgrv_admin` (DGRV Super Admin)
- Full platform administration.
- Manage organizations (Keycloak Organizations): create/list/update/delete, invite
  `org_admin` users, resend/delete invitations, list members.
- Manage groups (cooperatives): create under an org, update/delete, add members.
- Manage users: delete users, assign per-user dimensions.
- Manage content: dimensions, current/desired states, gaps, recommendations
  (incl. multilingual + by-key translation editing).
- Full assessment, submission, report, and action-plan access (platform-wide).
- Consolidated report across **all** organizations: `GET /consolidated-reports/dgrv-admin`.

### `org_admin` (Organisation Admin)
- Manages one Keycloak Organization (set via JWT `organization`/`organizations`).
- Manage cooperations (Keycloak Groups) within the org and their users.
- View and scope assessments/submissions/reports for the org.
- Assign/manage cooperative users (`coop_admin`, `coop_user`) within cooperations.
- Org-scoped consolidated report: `GET /consolidated-reports/org-admin/:organization_id`.
- Must have `user.organization` present (frontend blocks otherwise when online).

### `coop_admin` (Cooperative Admin)
- Manages one cooperative (Keycloak Group).
- Can perform everything a `coop_user` does (the `/user/**` area is shared).
- Manage cooperative users within its cooperation.
- View assessments/submissions/reports/action plans for the cooperative.

### `coop_user` (Cooperative User)
- Create and complete assessments for the assigned cooperative.
- Answer dimension assessments (select current state + desired state per dimension).
- Submit assessments (triggers background report generation).
- View/download generated PDF & Word reports.
- Maintain an action plan (add/edit/remove action items; admin recommendations are
  immutable and get cloned on edit).

## 4. Security Gaps (must-read for handover)

These are confirmed by code inspection and are also documented in
`RBAC_AND_AUTH_SYSTEM.md` §18:

1. **No route-level authorization on the backend** beyond the 3 invitation endpoints.
   Any authenticated user can reach any `/admin/*` endpoint. The `/admin/` prefix is
   not protected by a role guard.
2. **No organization/cooperative membership checks in handlers.** A user can pass
   another org's `org_id` / `cooperation_id` and the backend will not verify the
   caller belongs to it.
3. **Client roles are never checked.** `resource_access` (client roles) is parsed but
   no handler inspects it.
4. **`organization_id` claim is unused for authorization** (the `Org_User` legacy role
   and the `organization_id` session-note mapper are present but not enforced).
5. **Role assignment input is not validated.** `add_member` (`user.rs`) takes
   `payload.roles` from the request body and assigns whatever roles are supplied
   (including `coop_admin`/`coop_user`) without verifying the caller may grant them.
6. **JWKS is cached forever** with no TTL/refresh — Keycloak key rotation would not be
   picked up until backend restart.
7. **`reqwest` uses `danger_accept_invalid_certs(true)`** in `KeycloakService` for
   Admin REST calls; acceptable for the internal `http://keycloak:8080` hop but should
   be reviewed if the internal transport is ever TLS.
8. **`verify_user_password` performs a direct-grant `password` flow** (resource-owner
   password credentials) to check credentials — this is a legacy IMF diagnostic and
   should be removed or restricted.

**Mitigations effective today:** The frontend route guard is the primary authorization
control; the backend relies on the frontend to only present authorized actions. Treat
any direct API access (e.g. a user with a token calling APIs directly) as **untrusted**
until the gaps above are remedied.

### Recommended remediation (roadmap)
- Add an axum role-extraction middleware/extractor (`require_roles(&["dgrv_admin"])`)
  and annotate every `/admin/*` router.
- Verify `Claims.subject` membership against the resource's `organization_id`/
  `cooperation_id` before acting (ownership guard).
- Validate `payload.roles` against an allow-list keyed to the caller's own role.
- Add JWKS TTL refresh in `JwtValidator`.
- Drop `danger_accept_invalid_certs` and `verify_user_password` once no longer needed.

## 5. Provisioning Mechanics (reference)

- Realm imported from `infrastructure/keycloak/realm-export.json` on Keycloak boot
  (`--import-realm`).
- `keycloak-startup.sh` starts Keycloak, waits for port 8080, then runs
  `scripts/keycloak-provisioning.sh` which:
  - logs into the master realm as `admin`,
  - creates the bootstrap user `360@dgrv.coop` (run-once via `.user_provisioned`
    marker) with a temp password `dgrv@coop360`,
  - grants it all `realm-management` client roles + the `application_admin` and
    `dgrv_admin` realm roles,
  - grants `realm-admin` to the `dgat-admin-client` service account,
  - configures realm SMTP from `KC_SPI_EMAIL_DEFAULT_*`,
  - sets the realm `frontendUrl` to the public HTTPS URL (so email/action-token links
    use it),
  - resets the `dgat-admin-client` secret (the export masks it with `***`),
  - adds the `organization` and `user_attributes` scopes to `dgat-client`.

See `DEPLOYMENT.md` for the full provisioning-on-a-fresh-server sequence.