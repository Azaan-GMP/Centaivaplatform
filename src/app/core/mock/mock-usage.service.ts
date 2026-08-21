import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListQuery, PagedResult, QuotaRecord, UsageSummary } from '../models';
import { UsageService } from '../services/data-contracts';
import { QUOTAS, usageSummaryFor } from './data/seed-usage';
import { queryCollection, respond } from './mock-utils';

@Injectable({ providedIn: 'root' })
export class MockUsageService extends UsageService {
  summary(tenantId?: string, productKey?: string): Observable<UsageSummary> {
    return respond(usageSummaryFor(tenantId, productKey));
  }

  quotas(query?: ListQuery): Observable<PagedResult<QuotaRecord>> {
    return respond(queryCollection(QUOTAS, query, ['meterName', 'tenantName', 'productName', 'meterKey']));
  }
}
