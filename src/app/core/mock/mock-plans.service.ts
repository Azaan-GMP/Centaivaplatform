import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Entitlement, ListQuery, PagedResult, Plan } from '../models';
import { PlansService } from '../services/data-contracts';
import { ENTITLEMENTS, PLANS } from './data/seed-commercial';
import { queryCollection, respond } from './mock-utils';

@Injectable({ providedIn: 'root' })
export class MockPlansService extends PlansService {
  private readonly plans: Plan[] = [...PLANS];

  list(query?: ListQuery): Observable<PagedResult<Plan>> {
    return respond(queryCollection(this.plans, query, ['name', 'key', 'productName', 'tier', 'description']));
  }

  all(): Observable<Plan[]> {
    return respond([...this.plans]);
  }

  byId(id: string): Observable<Plan | undefined> {
    return respond(this.plans.find((plan) => plan.id === id));
  }

  entitlements(): Observable<Entitlement[]> {
    return respond([...ENTITLEMENTS]);
  }
}
