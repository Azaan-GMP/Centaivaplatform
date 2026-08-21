import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ActiveSession,
  AuthenticationPolicy,
  FeatureFlag,
  IdentityProvider,
  Invitation,
  ListQuery,
  PagedResult,
  SecurityAlert,
  ServiceAccount,
  VerifiedDomain,
} from '../models';
import { SecurityService } from '../services/data-contracts';
import {
  ACTIVE_SESSIONS,
  AUTHENTICATION_POLICIES,
  FEATURE_FLAGS,
  IDENTITY_PROVIDERS,
  INVITATIONS,
  SECURITY_ALERTS,
  SERVICE_ACCOUNTS,
  VERIFIED_DOMAINS,
} from './data/seed-security';
import { daysAgo, daysAhead, queryCollection, respond } from './mock-utils';

@Injectable({ providedIn: 'root' })
export class MockSecurityService extends SecurityService {
  private readonly invitationRecords: Invitation[] = [...INVITATIONS];

  alerts(): Observable<SecurityAlert[]> {
    return respond([...SECURITY_ALERTS]);
  }

  identityProviders(): Observable<IdentityProvider[]> {
    return respond([...IDENTITY_PROVIDERS]);
  }

  policies(): Observable<AuthenticationPolicy[]> {
    return respond([...AUTHENTICATION_POLICIES]);
  }

  domains(): Observable<VerifiedDomain[]> {
    return respond([...VERIFIED_DOMAINS]);
  }

  sessions(): Observable<ActiveSession[]> {
    return respond([...ACTIVE_SESSIONS]);
  }

  serviceAccounts(query?: ListQuery): Observable<PagedResult<ServiceAccount>> {
    return respond(queryCollection(SERVICE_ACCOUNTS, query, ['name', 'clientId', 'applicationName', 'tenantName']));
  }

  featureFlags(query?: ListQuery): Observable<PagedResult<FeatureFlag>> {
    return respond(queryCollection(FEATURE_FLAGS, query, ['name', 'key', 'applicationName', 'productName', 'description']));
  }

  invitations(query?: ListQuery): Observable<PagedResult<Invitation>> {
    return respond(queryCollection(this.invitationRecords, query, ['email', 'organizationName', 'tenantName', 'role', 'invitedBy']));
  }

  updateInvitation(id: string, status: Invitation['status']): Observable<Invitation | undefined> {
    const invitation = this.invitationRecords.find((candidate) => candidate.id === id);
    if (!invitation) {
      return respond(undefined);
    }
    invitation.status = status;
    if (status === 'Pending') {
      invitation.sentAt = daysAgo(0);
      invitation.expiresAt = daysAhead(14);
    }
    return respond(invitation);
  }

  createInvitation(payload: Partial<Invitation>): Observable<Invitation> {
    const invitation: Invitation = {
      id: `inv-${Date.now().toString(36)}`,
      email: payload.email ?? 'new.user@example.com',
      organizationName: payload.organizationName ?? 'Centaiva',
      organizationId: payload.organizationId ?? 'org-centaiva',
      tenantName: payload.tenantName ?? 'Centaiva Platform Control',
      tenantId: payload.tenantId ?? null,
      role: payload.role ?? 'Read Only',
      status: 'Pending',
      sentAt: daysAgo(0),
      expiresAt: daysAhead(14),
      invitedBy: 'Talha Hassan',
      message: payload.message ?? 'You have been invited to join the Centaiva Platform.',
    };

    this.invitationRecords.unshift(invitation);
    return respond(invitation);
  }
}
