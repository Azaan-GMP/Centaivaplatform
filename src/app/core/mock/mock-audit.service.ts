import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditEvent, ListQuery, PagedResult } from '../models';
import { AuditService } from '../services/data-contracts';
import { AUDIT_EVENTS } from './data/seed-audit';
import { queryCollection, respond } from './mock-utils';

const SEARCH_FIELDS = [
  'actorName', 'actorEmail', 'action', 'entityName', 'entityType',
  'organizationName', 'tenantName', 'correlationId', 'ipAddress',
];

@Injectable({ providedIn: 'root' })
export class MockAuditService extends AuditService {
  list(query?: ListQuery): Observable<PagedResult<AuditEvent>> {
    return respond(queryCollection(AUDIT_EVENTS, query, SEARCH_FIELDS));
  }

  recent(count: number): Observable<AuditEvent[]> {
    return respond(AUDIT_EVENTS.slice(0, count));
  }

  byId(id: string): Observable<AuditEvent | undefined> {
    return respond(AUDIT_EVENTS.find((event) => event.id === id));
  }
}
