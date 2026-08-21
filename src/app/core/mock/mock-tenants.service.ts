import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListQuery, PagedResult, Tenant } from '../models';
import { TenantsService } from '../services/data-contracts';
import { TENANTS } from './data/seed-tenants';
import { daysAgo, queryCollection, respond } from './mock-utils';

const SEARCH_FIELDS = ['name', 'key', 'organizationName', 'primaryContact', 'region'];

@Injectable({ providedIn: 'root' })
export class MockTenantsService extends TenantsService {
  private readonly tenants: Tenant[] = [...TENANTS];

  list(query?: ListQuery): Observable<PagedResult<Tenant>> {
    return respond(queryCollection(this.tenants, query, SEARCH_FIELDS));
  }

  all(): Observable<Tenant[]> {
    return respond([...this.tenants]);
  }

  byId(id: string): Observable<Tenant | undefined> {
    return respond(this.tenants.find((tenant) => tenant.id === id));
  }

  byOrganization(organizationId: string): Observable<Tenant[]> {
    return respond(this.tenants.filter((tenant) => tenant.organizationId === organizationId));
  }

  create(payload: Partial<Tenant>): Observable<Tenant> {
    const template = this.tenants[0]!;
    const name = payload.name ?? 'New Tenant';

    const tenant: Tenant = {
      ...template,
      id: `tnt-${Date.now().toString(36)}`,
      name,
      key: payload.key ?? name.toUpperCase().replace(/[^A-Z0-9]+/g, '-'),
      slug: payload.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      organizationId: payload.organizationId ?? template.organizationId,
      organizationName: payload.organizationName ?? template.organizationName,
      region: payload.region ?? 'UK South',
      environment: payload.environment ?? 'Production',
      status: 'Provisioning',
      createdAt: daysAgo(0),
      memberCount: 0,
      productKeys: payload.productKeys ?? [],
      licenseSeats: payload.licenseSeats ?? 0,
      licenseSeatsUsed: 0,
      members: [],
      products: [],
      dataRoutes: [],
    };

    this.tenants.unshift(tenant);
    return respond(tenant);
  }

  update(id: string, payload: Partial<Tenant>): Observable<Tenant | undefined> {
    const index = this.tenants.findIndex((tenant) => tenant.id === id);
    if (index === -1) {
      return respond(undefined);
    }
    const updated = { ...this.tenants[index]!, ...payload };
    this.tenants[index] = updated;
    return respond(updated);
  }
}
