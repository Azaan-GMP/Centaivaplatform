import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IntegrationProvider, ListQuery, PagedResult, TenantIntegration } from '../models';
import { IntegrationsService } from '../services/data-contracts';
import { INTEGRATION_PROVIDERS, TENANT_INTEGRATIONS } from './data/seed-operations';
import { queryCollection, respond } from './mock-utils';

@Injectable({ providedIn: 'root' })
export class MockIntegrationsService extends IntegrationsService {
  providers(): Observable<IntegrationProvider[]> {
    return respond([...INTEGRATION_PROVIDERS]);
  }

  tenantIntegrations(query?: ListQuery): Observable<PagedResult<TenantIntegration>> {
    return respond(queryCollection(TENANT_INTEGRATIONS, query, ['tenantName', 'providerName', 'productName', 'environment']));
  }
}
