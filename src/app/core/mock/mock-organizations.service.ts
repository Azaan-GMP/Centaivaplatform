import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListQuery, Organization, OrganizationNode, PagedResult } from '../models';
import { OrganizationsService } from '../services/data-contracts';
import { ORGANIZATIONS } from './data/seed-organizations';
import { daysAgo, queryCollection, respond } from './mock-utils';

const SEARCH_FIELDS = ['name', 'key', 'slug', 'type', 'ownerName', 'region'];

@Injectable({ providedIn: 'root' })
export class MockOrganizationsService extends OrganizationsService {
  private readonly organizations: Organization[] = [...ORGANIZATIONS];

  list(query?: ListQuery): Observable<PagedResult<Organization>> {
    return respond(queryCollection(this.organizations, query, SEARCH_FIELDS));
  }

  all(): Observable<Organization[]> {
    return respond([...this.organizations]);
  }

  /** Builds the recursive tree. Depth is derived, never capped. */
  tree(): Observable<OrganizationNode[]> {
    return respond(this.buildTree(null, 0));
  }

  byId(id: string): Observable<Organization | undefined> {
    return respond(this.organizations.find((organization) => organization.id === id));
  }

  childrenOf(id: string): Observable<Organization[]> {
    return respond(this.organizations.filter((organization) => organization.parentId === id));
  }

  create(payload: Partial<Organization>): Observable<Organization> {
    const parent = this.organizations.find((organization) => organization.id === payload.parentId);
    const template = this.organizations[0]!;
    const name = payload.name ?? 'New Organization';

    const organization: Organization = {
      ...template,
      id: `org-${Date.now().toString(36)}`,
      name,
      key: payload.key ?? name.toUpperCase().replace(/[^A-Z0-9]+/g, '-'),
      slug: payload.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: payload.type ?? 'Customer',
      parentId: parent?.id ?? null,
      path: parent ? [...parent.path] : [],
      region: payload.region ?? 'UK South',
      status: 'Active',
      createdAt: daysAgo(0),
      description: payload.description ?? '',
      tenantCount: 0,
      memberCount: 0,
      childCount: 0,
      licenseSeats: payload.licenseSeats ?? 0,
      licenseSeatsUsed: 0,
      ownerName: payload.ownerName ?? 'Unassigned',
      ownerEmail: payload.ownerEmail ?? '',
      members: [],
    };
    organization.path = [...organization.path, organization.id];

    this.organizations.push(organization);
    if (parent) {
      parent.childCount += 1;
    }

    return respond(organization);
  }

  move(id: string, newParentId: string): Observable<Organization | undefined> {
    const organization = this.organizations.find((candidate) => candidate.id === id);
    const newParent = this.organizations.find((candidate) => candidate.id === newParentId);
    if (!organization || !newParent || newParent.path.includes(id)) {
      return respond(undefined);
    }

    const oldParent = this.organizations.find((candidate) => candidate.id === organization.parentId);
    if (oldParent) {
      oldParent.childCount = Math.max(0, oldParent.childCount - 1);
    }

    const previousPath = [...organization.path];
    organization.parentId = newParentId;
    organization.path = [...newParent.path, organization.id];
    newParent.childCount += 1;

    // Re-path the whole sub-tree so deep hierarchies stay consistent.
    for (const descendant of this.organizations) {
      const index = descendant.path.indexOf(id);
      if (index > -1 && descendant.id !== id && descendant.path.length > previousPath.length) {
        descendant.path = [...organization.path, ...descendant.path.slice(index + 1)];
      }
    }

    return respond(organization);
  }

  update(id: string, payload: Partial<Organization>): Observable<Organization | undefined> {
    const index = this.organizations.findIndex((organization) => organization.id === id);
    if (index === -1) {
      return respond(undefined);
    }
    const updated = { ...this.organizations[index]!, ...payload };
    this.organizations[index] = updated;
    return respond(updated);
  }

  private buildTree(parentId: string | null, depth: number): OrganizationNode[] {
    return this.organizations
      .filter((organization) => organization.parentId === parentId)
      .map((organization) => ({
        organization,
        depth,
        children: this.buildTree(organization.id, depth + 1),
      }));
  }
}
