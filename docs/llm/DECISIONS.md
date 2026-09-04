# CENTAIVA PLATFORM — ARCHITECTURAL DECISIONS

### DATE: 2026-08-28
**Decision**: Adopt `Structure/` directory as the strict Angular 18 project root and preserve all architectural folder patterns.
**Reason**: Follows master GMP template conventions and guarantees consistency with existing shared UI primitives, routes, and services.
**Affected files**: `Structure/*`, `Structure/src/app/*`, `Structure/src/shared/*`
**Do not change unless**: Explicitly instructed by project maintainer.

### DATE: 2026-08-28
**Decision**: Isolate `platformControlToken` (tenantless) from `workwellFinanceToken` (tenant-bound) into distinct token storage keys / services.
**Reason**: Platform Owner control plane operations must remain tenantless; WorkWell Finance requires single-tenant binding. Overwriting or mixing tokens causes authorization breakdown and security boundary leaks.
**Affected files**: `src/services/auth.service.ts`, `src/services/token-storage.service.ts`, HTTP interceptors.
**Do not change unless**: Central API authentication contract changes.

### DATE: 2026-08-28
**Decision**: Derive shell navigation dynamically from `/api/v1/platform/bootstrap`, `/api/v1/platform/me/admin-scope`, and `/api/v1/context/me` rather than hardcoded role assumptions.
**Reason**: Ensures accurate RBAC and dynamic visibility for platform administrators vs product tenant operators.
**Affected files**: `src/app/layout/main-layout/sidebar/*`, `src/services/navigation.service.ts`
**Do not change unless**: Backend navigation contract is replaced.
