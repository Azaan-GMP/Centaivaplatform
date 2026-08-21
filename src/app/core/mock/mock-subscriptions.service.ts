import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListQuery, PagedResult, Subscription } from '../models';
import { SubscriptionsService } from '../services/data-contracts';
import { SUBSCRIPTIONS } from './data/seed-commercial';
import { daysAgo, daysAhead, queryCollection, respond } from './mock-utils';

@Injectable({ providedIn: 'root' })
export class MockSubscriptionsService extends SubscriptionsService {
  private readonly subscriptions: Subscription[] = [...SUBSCRIPTIONS];

  list(query?: ListQuery): Observable<PagedResult<Subscription>> {
    return respond(
      queryCollection(this.subscriptions, query, ['reference', 'tenantName', 'productName', 'planName', 'organizationName']),
    );
  }

  all(): Observable<Subscription[]> {
    return respond([...this.subscriptions]);
  }

  byId(id: string): Observable<Subscription | undefined> {
    return respond(this.subscriptions.find((subscription) => subscription.id === id));
  }

  create(payload: Partial<Subscription>): Observable<Subscription> {
    const template = this.subscriptions[0]!;
    const subscription: Subscription = {
      ...template,
      id: `sub-${Date.now().toString(36)}`,
      reference: `SUB-${String(2000 + this.subscriptions.length)}`,
      tenantId: payload.tenantId ?? template.tenantId,
      tenantName: payload.tenantName ?? template.tenantName,
      productKey: payload.productKey ?? template.productKey,
      productName: payload.productName ?? template.productName,
      planId: payload.planId ?? template.planId,
      planName: payload.planName ?? template.planName,
      status: payload.status ?? 'Trial',
      seats: payload.seats ?? 10,
      seatsUsed: 0,
      periodStart: daysAgo(0),
      periodEnd: daysAhead(365),
      autoRenew: payload.autoRenew ?? true,
      createdAt: daysAgo(0),
      licenseIds: [],
    };

    this.subscriptions.unshift(subscription);
    return respond(subscription);
  }
}
