import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataStore, Deployment, ListQuery, PagedResult } from '../models';
import { DeploymentsService } from '../services/data-contracts';
import { DATA_STORES, DEPLOYMENTS } from './data/seed-operations';
import { queryCollection, respond } from './mock-utils';

@Injectable({ providedIn: 'root' })
export class MockDeploymentsService extends DeploymentsService {
  private readonly deployments: Deployment[] = [...DEPLOYMENTS];
  private readonly stores: DataStore[] = [...DATA_STORES];

  list(query?: ListQuery): Observable<PagedResult<Deployment>> {
    return respond(queryCollection(this.deployments, query, ['name', 'productName', 'region', 'environment', 'baseUrl', 'version']));
  }

  all(): Observable<Deployment[]> {
    return respond([...this.deployments]);
  }

  byId(id: string): Observable<Deployment | undefined> {
    return respond(this.deployments.find((deployment) => deployment.id === id));
  }

  dataStores(query?: ListQuery): Observable<PagedResult<DataStore>> {
    return respond(queryCollection(this.stores, query, ['name', 'provider', 'server', 'database', 'region', 'environment']));
  }

  dataStoreById(id: string): Observable<DataStore | undefined> {
    return respond(this.stores.find((store) => store.id === id));
  }
}
