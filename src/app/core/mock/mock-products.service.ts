import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListQuery, PagedResult, Product } from '../models';
import { ProductsService } from '../services/data-contracts';
import { PRODUCTS } from './data/seed-catalog';
import { queryCollection, respond } from './mock-utils';

@Injectable({ providedIn: 'root' })
export class MockProductsService extends ProductsService {
  private readonly products: Product[] = [...PRODUCTS];

  list(query?: ListQuery): Observable<PagedResult<Product>> {
    return respond(queryCollection(this.products, query, ['name', 'key', 'description', 'owner']));
  }

  all(): Observable<Product[]> {
    return respond([...this.products]);
  }

  byId(id: string): Observable<Product | undefined> {
    return respond(this.products.find((product) => product.id === id || product.key === id));
  }
}
