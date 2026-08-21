import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Application, ListQuery, PagedResult, Permission } from '../models';
import { ApplicationsService } from '../services/data-contracts';
import { APPLICATIONS, PERMISSIONS } from './data/seed-catalog';
import { queryCollection, respond } from './mock-utils';

@Injectable({ providedIn: 'root' })
export class MockApplicationsService extends ApplicationsService {
  private readonly applications: Application[] = [...APPLICATIONS];

  list(query?: ListQuery): Observable<PagedResult<Application>> {
    return respond(queryCollection(this.applications, query, ['name', 'key', 'productName', 'type', 'baseUrl']));
  }

  all(): Observable<Application[]> {
    return respond([...this.applications]);
  }

  byId(id: string): Observable<Application | undefined> {
    return respond(this.applications.find((application) => application.id === id || application.key === id));
  }

  byProduct(productKey: string): Observable<Application[]> {
    return respond(this.applications.filter((application) => application.productKey === productKey));
  }

  permissions(): Observable<Permission[]> {
    return respond([...PERMISSIONS]);
  }
}
