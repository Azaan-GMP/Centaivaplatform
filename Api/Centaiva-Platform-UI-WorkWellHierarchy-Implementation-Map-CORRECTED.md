# Centaiva Platform UI Implementation Map

This maps the Platform UI to the current Centaiva API contract.

## 1. Authentication and shell

After Centaiva Platform SSO login, the Platform Owner token is tenantless. Load:

- `GET /api/v1/platform/bootstrap`
- `GET /api/v1/platform/me/admin-scope`
- `GET /api/v1/me/admin-scope`
- `GET /api/v1/context/me`

Do **not** call `GET /api/v1/me/session-policy` with the tenantless Platform Control token.

Load `/api/v1/me/session-policy` only after a product tenant has been selected and a final tenant-bound token has been exchanged.

The shell should derive navigation and administration scope from the API. Do not hardcode Platform Owner visibility.

## 2. Main Platform Owner navigation

Recommended top-level pages:

| UI Page | Primary endpoints |
| --- | --- |
| Overview | `/api/v1/platform/bootstrap`, `/api/v1/platform/me/admin-scope` |
| Organizations | `/api/v1/platform/organizations` |
| Tenants | `/api/v1/platform/tenants`, `/api/v1/platform/tenants/resolve` |
| Users | `/api/v1/platform/users`, `/api/v1/platform/users/by-email` |
| Products | `/api/v1/platform/products` |
| Applications | `/api/v1/platform/applications` |
| Application Modules | `/api/v1/platform/applications/{applicationId}/modules` |
| Application Features | `/api/v1/platform/applications/{applicationId}/features` |
| Roles | `/api/v1/platform/roles` |
| Permissions | `/api/v1/platform/applications/{applicationId}/permissions` |
| Integrations | `/api/v1/platform/integration-providers`, `/api/v1/platform/integrations` |
| Onboarding | `/api/v1/onboarding/readiness`, `/api/v1/onboarding/organizations` |
| WorkWell Onboarding | `/api/v1/workwell/onboarding-readiness`, `/api/v1/workwell/onboard-customer` |
| Feature Flags | `/api/v1/platform/feature-flags` |
| Service Accounts | `/api/v1/platform/service-accounts` |
| Audit | `/api/v1/platform/audit-events` |

## 3. Users UI

List:

`GET /api/v1/platform/users?search=&status=&includeDeleted=false&page=1&pageSize=25`

User detail:

`GET /api/v1/platform/users/{userId}`

Effective access:

`GET /api/v1/platform/users/{userId}/access?applicationKey=...&tenantId=...`

Platform Owner actions:

- `POST /api/v1/platform/users`
- `PUT /api/v1/platform/users/{userId}`
- `PUT /api/v1/platform/users/{userId}/status`
- `POST /api/v1/platform/users/{userId}/reset-password`
- `POST /api/v1/platform/users/{userId}/reset-mfa`

The UI should surface destructive/recovery operations separately from normal profile editing.

## 4. Tenant UI

Tenant directory:

`GET /api/v1/platform/tenants`

Tenant detail:

`GET /api/v1/platform/tenants/{tenantId}`

Tenant members:

`GET /api/v1/platform/tenants/{tenantId}/members`

Tenant invitations:

`GET /api/v1/platform/tenants/{tenantId}/invitations`

Create/invite/member actions use the matching POST endpoints.

Platform Owner should centrally see Eutopia Search, Patrick Morgan and MedPure when those tenant records are active and accessible.

## 5. RBAC UI

Application list:

`GET /api/v1/platform/applications`

Roles:

`GET /api/v1/platform/roles?applicationId=...&tenantId=...`

Permissions:

`GET /api/v1/platform/applications/{applicationId}/permissions`

Assignments:

`GET /api/v1/role-assignments`
`POST /api/v1/role-assignments`
`DELETE /api/v1/role-assignments`

The UI must always show the scope of an assignment: organization, tenant and application.

## 6. Tenant selector

Never switch by changing a local WorkWell `CompId`.

Initial product flow:

```text
Product Login
  -> GET /api/v1/me/tenants?applicationKey=...
  -> POST /api/v1/me/select-tenant
  -> exchange selectionCode at /connect/token
  -> final product token
```

After a final product token exists:

```text
POST /api/v1/me/switch-tenant
  -> exchange new selectionCode
  -> replace old product token
  -> reload product context
```

The compatibility `/select-tenant` behavior can support older deployed frontends, but new UI code should use `/switch-tenant` after initial selection.

## 7. WorkWell Finance

WorkWell must use the `WORKWELL_FINANCE` product context.

Expected users:

- `talha.hassan@centaiva.com`: Platform Owner, can enter authorized WorkWell tenants.
- `yvesb@workwelloutsourcing.com`: Eutopia Search and Patrick Morgan.
- Other WorkWell users remain scoped to their effective access.

After switching, always reload WorkWell:

- `/api/platform-context`
- `/api/companies/me`
- `/api/users`
- `/api/roles`

The final token's Centaiva `tenant_id` is authoritative.

## 8. WorkWell hierarchy and MedPure

MedPure is part of the same `WORKWELL_FINANCE` application.

The Platform hierarchy should be presented as:

```text
WORKWELL_FINANCE
├── WorkWell parent organization
│   ├── Eutopia Search tenant/company
│   └── Patrick Morgan tenant/company
└── MedPure tenant/company
```

`WorkWell` is the grouping/parent organization for Eutopia Search and Patrick Morgan. The children remain separate Central tenants so each final token resolves to exactly one local company.

Use the same WorkWell Finance OIDC values for all three tenant selections:

- client: `workwell-finance-web`
- application key: `WORKWELL_FINANCE`
- scope: `openid profile email roles workwell.finance`

Expected access:

- `talha.hassan@centaiva.com`: Platform Owner, can discover/select Eutopia Search, Patrick Morgan and MedPure when effective access/subscriptions permit.
- `yvesb@workwelloutsourcing.com`: Eutopia Search and Patrick Morgan.
- `yvesb@medpure.com`: MedPure only.

Each final token must still contain exactly one selected Centaiva `tenant_id`. WorkWell resolves that tenant to one local `CompId`.

## 9. Session

There are two contexts:

**Platform Control**

`centaiva-platform-web -> CENTAIVA_CONTROL_WEB`

The Platform Owner control token is tenantless. Do not call the tenant-specific session-policy endpoint with this token.

**Tenant-bound product**

After selecting Eutopia Search, Patrick Morgan or MedPure and exchanging the selection code, call:

`GET /api/v1/me/session-policy`

with the final `WORKWELL_FINANCE` token.

Current target is 10 hours / 600 minutes where the selected tenant policy is configured. Refresh tokens must not bypass the central absolute session policy.

## 10. Onboarding

Generic onboarding:

- readiness: `GET /api/v1/onboarding/readiness`
- create: `POST /api/v1/onboarding/organizations`

WorkWell-specific onboarding:

- readiness: `GET /api/v1/workwell/onboarding-readiness`
- create: `POST /api/v1/workwell/onboard-customer`

The future-company workflow should create central organization/tenant/subscription/access first, then provision the product-specific local mapping. Do not manually make local WorkWell `CompId` the identity authority.

## 11. QA gate before Production

QA must pass:

- Platform Owner tenantless SSO login
- bootstrap/admin scope with no tenant requirement
- tenant-bound session policy after WorkWell Finance tenant selection
- users/tenants/products/applications
- roles/permissions
- Eutopia and Patrick Morgan WorkWell selection
- WorkWell context after each switch
- negative cross-company override
- MedPure as a WORKWELL_FINANCE tenant
- Talha sees all three Finance tenants
- Yves WorkWell sees Eutopia Search + Patrick Morgan
- Yves MedPure sees MedPure only
- onboarding readiness
- audit/feature flags/service accounts reads

Only after QA passes should Production read-only verification run.

## Technical isolation rule for the WorkWell children

Centaiva's current secure WorkWell bridge is one-to-one:

```text
final WORKWELL_FINANCE token
  -> one tenant_id
  -> Companies.CentaivaTenantId
  -> one CompId
```

Therefore Eutopia Search and Patrick Morgan should be grouped beneath the
WorkWell parent **organization** in the Platform UI, but each child should keep
its own Central tenant record. Do not map one Centaiva tenant to two local
WorkWell `CompId` values. That would make the existing tenant-bound token
ambiguous and weaken isolation.


## 12. Frontend token-context rules

Keep Platform and product tokens separate.

```text
platformControlToken
  application = CENTAIVA_CONTROL_WEB
  tenant_id = absent
  use for /api/v1/platform/* and central control

workwellFinanceToken
  application = WORKWELL_FINANCE
  tenant_id = exactly one selected tenant
  use for WorkWell Finance and tenant-specific /api/v1/me/* operations
```

When the Platform Owner clicks a WorkWell Finance tenant:

1. Start/continue `WORKWELL_FINANCE` authorization.
2. Discover eligible tenants.
3. Select the requested tenant.
4. Exchange `selectionCode`.
5. Store/replace the WorkWell Finance token separately from the Platform Control token.
6. Reload WorkWell context.
7. Never overwrite the Platform Control token with a WorkWell token.

Expected access:
- Talha: Eutopia Search + Patrick Morgan + MedPure.
- Yves WorkWell: Eutopia Search + Patrick Morgan only.
- Yves MedPure: MedPure only.
