# CENTAIVA PLATFORM — PROJECT MEMORY

## Project Purpose
Enterprise B2B SaaS Central Control Plane & Identity/Tenant Administration Platform for Centaiva, managing multi-tenant products, organizations, tenants, users, RBAC, integrations, feature flags, audit, and WorkWell Finance tenant discovery/switching.

## Architecture Summary
- **Framework**: Angular 18 (Standalone Components, SSR optional via server.ts).
- **Styling**: TailwindCSS 3.4 + Custom SCSS Design System + FontAwesome 7 + Flowbite.
- **Routing**: Standalone lazy routes with `childRoutes.ts` rendered within `ContentComponent` (Header, Sidebar, Main Workspace).
- **Core Folder Structure**:
  - `src/app/auth/`: Authentication views & logic (Login, MFA, SSO).
  - `src/app/components/`: Feature pages (dashboard, users, tenants, organizations, rbac, products, applications, integrations, onboarding, feature-flags, audit, service-accounts).
  - `src/app/layout/`: Application shell (`main-layout` with `header`, `sidebar`, `footer`).
  - `src/app/routes/`: Child routes definition (`childRoutes.ts`).
  - `src/environments/`: Environment configs (`environment.ts`, `environment.qa.ts`, `environment.prod.ts`).
  - `src/services/`: Core infrastructure services (Toastr, NetworkStatus, Pagination, Platform API services, Auth services).
  - `src/shared/UI/`: Reusable UI primitives (`button`, `dialog`, `error-message`, `file-upload`, `form-field`, `form-input`, `form-label`, `form-select`, `generic-table`, `icon`, `loader`, `page-breadcrumb`, `title`, `action-button`).
  - `src/shared/styles/`: Global SCSS mixins and token definitions.
  - `src/utils/`: Enums, constants, helpers.

## Authentication Architecture
- **Dual Token Context**:
  1. `platformControlToken`: Tenantless token for `CENTAIVA_CONTROL_WEB` (`/api/v1/platform/*`, global admin).
  2. `workwellFinanceToken`: Tenant-bound token for `WORKWELL_FINANCE` (`/api/v1/me/*`, WorkWell Finance tenant data).
- **Critical Security Rules**:
  - `platformControlToken` must never be overwritten with `workwellFinanceToken`.
  - Do NOT call `GET /api/v1/me/session-policy` with tenantless `platformControlToken`.
  - Tenant selection uses `/api/v1/me/select-tenant` or `/api/v1/me/switch-tenant` + code exchange at `/connect/token`. Never manually tamper with `CompId`.
