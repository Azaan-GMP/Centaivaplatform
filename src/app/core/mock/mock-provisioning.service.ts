import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListQuery, PagedResult, ProvisioningRun, ProvisioningTemplate } from '../models';
import { ProvisioningService } from '../services/data-contracts';
import { PROVISIONING_RUNS, PROVISIONING_TEMPLATES } from './data/seed-operations';
import { queryCollection, respond } from './mock-utils';

@Injectable({ providedIn: 'root' })
export class MockProvisioningService extends ProvisioningService {
  private readonly provisioningRuns: ProvisioningRun[] = [...PROVISIONING_RUNS];

  runs(query?: ListQuery): Observable<PagedResult<ProvisioningRun>> {
    return respond(queryCollection(this.provisioningRuns, query, ['id', 'tenantName', 'productName', 'templateName', 'triggeredBy']));
  }

  runById(id: string): Observable<ProvisioningRun | undefined> {
    return respond(this.provisioningRuns.find((run) => run.id === id));
  }

  templates(): Observable<ProvisioningTemplate[]> {
    return respond([...PROVISIONING_TEMPLATES]);
  }
}
