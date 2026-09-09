# CENTAIVA PLATFORM — API MEMORY

## Base URLs by Environment
- **QA Centaiva API / OAuth**: `https://api.workwell.centaiva.com`
- **QA WorkWell API**: `http://192.168.88.27:8091`
- **Production Centaiva OAuth / API**: `https://oauth.centaiva.com`
- **Production WorkWell API**: `https://api.workwell.centaiva.com`

## Clients & Scopes
- **Platform Control**:
  - `client_id`: `centaiva-platform-web`
  - `scope`: `openid profile email roles centaiva.platform`
  - `application_key`: `CENTAIVA_CONTROL_WEB`
  - `token_type`: Tenantless for Platform Owner (`talha.hassan@centaiva.com`)
- **WorkWell Finance**:
  - `client_id`: `workwell-finance-web`
  - `scope`: `openid profile email roles workwell.finance`
  - `application_key`: `WORKWELL_FINANCE`
  - `token_type`: Tenant-bound (e.g. Eutopia Search, Patrick Morgan, MedPure)

## Core Platform Endpoints Mapping
- **Authentication**: `POST /connect/token` (`grant_type=password` or `grant_type=selection_code` / `refresh_token`)
- **Bootstrap & Shell Context**:
  - `GET /api/v1/context/me`
  - `GET /api/v1/platform/bootstrap`
  - `GET /api/v1/platform/me/admin-scope`
  - `GET /api/v1/me/admin-scope`
  - `GET /api/v1/me/access-snapshot`
- **Organizations**: `GET/POST /api/v1/platform/organizations`, `GET/PUT /api/v1/platform/organizations/{id}`
- **Tenants**: `GET/POST /api/v1/platform/tenants`, `GET /api/v1/platform/tenants/{id}`, `GET /api/v1/platform/tenants/{id}/members`, `GET /api/v1/platform/tenants/{id}/invitations`
- **Users**: `GET/POST /api/v1/platform/users`, `GET/PUT /api/v1/platform/users/{id}`, `PUT /api/v1/platform/users/{id}/status`, `POST /api/v1/platform/users/{id}/reset-password`, `POST /api/v1/platform/users/{id}/reset-mfa`, `GET /api/v1/platform/users/{id}/access`
- **Products & Apps**: `GET /api/v1/platform/products`, `GET /api/v1/platform/applications`, `/modules`, `/features`, `/permissions`
- **RBAC**: `GET/POST /api/v1/platform/roles`, `GET/POST/DELETE /api/v1/role-assignments`
- **Integrations**: `GET /api/v1/platform/integration-providers`, `GET /api/v1/platform/integrations`
- **Onboarding**: `GET /api/v1/onboarding/readiness`, `POST /api/v1/onboarding/organizations`, `GET /api/v1/workwell/onboarding-readiness`, `POST /api/v1/workwell/onboard-customer`
- **Feature Flags & Service Accounts**: `GET /api/v1/platform/feature-flags`, `GET /api/v1/platform/service-accounts`
- **Audit**: `GET /api/v1/platform/audit-events`
- **WorkWell Tenant Selection / Switch**:
  - `GET /api/v1/me/tenants?applicationKey=WORKWELL_FINANCE`
  - `POST /api/v1/me/select-tenant`
  - `POST /api/v1/me/switch-tenant`
  - `GET /api/v1/me/session-policy` (ONLY with tenant-bound `workwellFinanceToken`)
