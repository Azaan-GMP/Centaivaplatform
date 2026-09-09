import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ListQuery, PagedResult, PlatformUser, UserEffectiveAccess, UserStatus } from '../models';
import { UsersService } from './data-contracts';

interface UserListDto {
  id: string;
  userName: string | null;
  email: string | null;
  displayName: string;
  status: number | string;
  emailConfirmed: boolean;
  twoFactorEnabled: boolean;
  mustChangePassword: boolean;
  lastLoginAtUtc: string | null;
  createdAtUtc: string;
  organizationCount: number | string;
  tenantCount: number | string;
}

interface OrganizationMembershipDto {
  membershipId: string;
  organizationId: string;
  organizationKey: string;
  organizationName: string;
  membershipStatus: string;
  joinedAtUtc: string;
}

interface TenantMembershipDto {
  membershipId: string;
  tenantId: string;
  tenantKey: string;
  tenantName: string;
  membershipStatus: string;
  joinedAtUtc: string;
}

interface UserDetailsDto extends UserListDto {
  phoneNumber: string | null;
  preferredLocale: string | null;
  timeZoneId: string | null;
  platformRoles: string[];
  organizations: OrganizationMembershipDto[];
  tenants: TenantMembershipDto[];
}

interface PagedUsersDto {
  items: UserListDto[];
  page: number | string;
  pageSize: number | string;
  totalCount: number | string;
}

interface EffectiveAccessDto extends UserEffectiveAccess {
  entitlements: Array<{ key: string; value: string }>;
}

@Injectable()
export class UsersApiService extends UsersService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/v1/platform/users`;

  list(query: ListQuery = {}): Observable<PagedResult<PlatformUser>> {
    let params = new HttpParams()
      .set('page', query.page ?? 1)
      .set('pageSize', query.pageSize ?? 100)
      .set('includeDeleted', false);
    if (query.search) params = params.set('search', query.search);
    const status = query.filters?.['status'];
    if (status !== undefined && status !== null) params = params.set('status', status);

    return this.http.get<PagedUsersDto>(this.url, { params }).pipe(
      switchMap((response) => {
        if (!response.items.length) return of({ response, items: [] as PlatformUser[] });
        return forkJoin(response.items.map((item) => this.byId(item.id).pipe(map((detail) => detail ?? this.mapList(item))))).pipe(
          map((items) => ({ response, items })),
        );
      }),
      map(({ response, items }) => ({
        items,
        total: Number(response.totalCount),
        page: Number(response.page),
        pageSize: Number(response.pageSize),
      })),
    );
  }

  all(): Observable<PlatformUser[]> {
    return this.list({ page: 1, pageSize: 100 }).pipe(map((result) => result.items));
  }

  byId(id: string): Observable<PlatformUser | undefined> {
    return this.http.get<UserDetailsDto>(`${this.url}/${id}`).pipe(map((dto) => this.mapDetails(dto)));
  }

  create(payload: Partial<PlatformUser>): Observable<PlatformUser> {
    const request = {
      email: payload.email,
      displayName: payload.displayName,
      status: this.toApiStatus(payload.status ?? 'Active'),
      emailConfirmed: false,
      mustChangePassword: true,
      preferredLocale: payload.locale ?? 'en-GB',
      timeZoneId: payload.timeZone ?? 'UTC',
    };

    return this.http.post(this.url, request, { responseType: 'text' }).pipe(
      switchMap(() => this.http.get<UserDetailsDto>(`${this.url}/by-email`, { params: { email: payload.email ?? '' } })),
      map((dto) => this.mapDetails(dto)),
    );
  }

  createTenantUser(
    tenantId: string,
    payload: { email: string; displayName: string; temporaryPassword?: string; applicationKey: string; roleKey: string },
  ): Observable<PlatformUser> {
    const request = {
      email: payload.email,
      displayName: payload.displayName,
      temporaryPassword: payload.temporaryPassword || null,
      applicationKey: payload.applicationKey,
      roleKey: payload.roleKey,
      isBillableSeat: true,
      emailConfirmed: true,
      mustChangePassword: false,
    };

    return this.http
      .post(`${environment.apiBaseUrl}/api/v1/tenants/${tenantId}/users`, request, { responseType: 'text' })
      .pipe(
        switchMap(() => this.http.get<UserDetailsDto>(`${this.url}/by-email`, { params: { email: payload.email } })),
        map((dto) => this.mapDetails(dto)),
      );
  }

  update(id: string, payload: Partial<PlatformUser>): Observable<PlatformUser | undefined> {
    const request = {
      displayName: payload.displayName ?? '',
      phoneNumber: payload.phoneNumber ?? null,
      preferredLocale: payload.locale ?? 'en-GB',
      timeZoneId: payload.timeZone ?? 'UTC',
    };
    return this.http.put(`${this.url}/${id}`, request, { responseType: 'text' }).pipe(switchMap(() => this.byId(id)));
  }

  setStatus(id: string, status: PlatformUser['status']): Observable<PlatformUser | undefined> {
    return this.http
      .put(`${this.url}/${id}/status`, { status: this.toApiStatus(status), reason: 'Changed from Centaiva Platform UI' }, { responseType: 'text' })
      .pipe(switchMap(() => this.byId(id)));
  }

  resetPassword(id: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/reset-password`, { newPassword });
  }

  resetMfa(id: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/reset-mfa`, null);
  }

  effectiveAccess(id: string, applicationKey?: string, tenantId?: string): Observable<UserEffectiveAccess> {
    let params = new HttpParams();
    if (applicationKey) params = params.set('applicationKey', applicationKey);
    if (tenantId) params = params.set('tenantId', tenantId);
    return this.http.get<EffectiveAccessDto>(`${this.url}/${id}/access`, { params });
  }

  private mapList(dto: UserListDto): PlatformUser {
    const names = this.names(dto.displayName);
    return {
      id: dto.id,
      displayName: dto.displayName,
      firstName: names.first,
      lastName: names.last,
      email: dto.email ?? dto.userName ?? '',
      phoneNumber: null,
      jobTitle: '',
      status: this.fromApiStatus(dto.status),
      mfa: dto.twoFactorEnabled ? 'Enabled' : 'Disabled',
      emailVerified: dto.emailConfirmed,
      organizationIds: [],
      tenantIds: [],
      productKeys: [],
      roleIds: [],
      primaryRole: '',
      locale: 'en-GB',
      timeZone: 'UTC',
      createdAt: this.asUtc(dto.createdAtUtc)!,
      lastSignInAt: this.asUtc(dto.lastLoginAtUtc),
      avatarColor: '#1a73e8',
      organizations: [],
      tenants: [],
      sessions: [],
      securityEvents: [],
      defaultEnvironment: 'QA',
    };
  }

  private mapDetails(dto: UserDetailsDto): PlatformUser {
    const user = this.mapList(dto);
    const organizations = dto.organizations ?? [];
    const tenants = dto.tenants ?? [];
    return {
      ...user,
      phoneNumber: dto.phoneNumber,
      status: this.membershipStatus(tenants, organizations, dto.status),
      organizationIds: organizations.map((item) => item.organizationId),
      tenantIds: tenants.map((item) => item.tenantId),
      roleIds: dto.platformRoles ?? [],
      primaryRole: dto.platformRoles?.[0] ?? '',
      locale: dto.preferredLocale ?? 'en-GB',
      timeZone: dto.timeZoneId ?? 'UTC',
      organizations: organizations.map((item) => ({
        id: item.membershipId,
        name: item.organizationName,
        key: item.organizationKey,
        role: item.membershipStatus,
        joinedAt: this.asUtc(item.joinedAtUtc)!,
      })),
      tenants: tenants.map((item) => ({
        id: item.membershipId,
        name: item.tenantName,
        key: item.tenantKey,
        role: item.membershipStatus,
        joinedAt: this.asUtc(item.joinedAtUtc)!,
      })),
    };
  }

  private names(displayName: string): { first: string; last: string } {
    const [first = '', ...rest] = displayName.trim().split(/\s+/);
    return { first, last: rest.join(' ') };
  }

  /** The QA API emits UTC fields without an offset; append Z so browsers do not parse them as local time. */
  private asUtc(value: string | null): string | null {
    if (!value) return null;
    return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`;
  }

  private membershipStatus(
    tenants: TenantMembershipDto[],
    organizations: OrganizationMembershipDto[],
    fallback: number | string,
  ): UserStatus {
    const statuses = [...tenants, ...organizations].map((membership) => membership.membershipStatus.toLowerCase());
    const priority: Array<{ api: string; ui: UserStatus }> = [
      { api: 'active', ui: 'Active' },
      { api: 'invited', ui: 'Invited' },
      { api: 'pending', ui: 'Invited' },
      { api: 'suspended', ui: 'Suspended' },
      { api: 'disabled', ui: 'Disabled' },
      { api: 'inactive', ui: 'Disabled' },
    ];

    return priority.find((candidate) => statuses.includes(candidate.api))?.ui ?? this.fromApiStatus(fallback);
  }

  private fromApiStatus(status: number | string): UserStatus {
    const normalized = Number(status);
    return ({ 0: 'Active', 1: 'Disabled', 2: 'Suspended', 3: 'Invited' } as Record<number, UserStatus>)[normalized] ?? 'Disabled';
  }

  private toApiStatus(status: UserStatus): number {
    return ({ Active: 0, Disabled: 1, Suspended: 2, Invited: 3 } as Record<UserStatus, number>)[status];
  }
}


