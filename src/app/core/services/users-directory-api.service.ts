import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DirectoryOptionDto {
  id: string;
  key: string;
  name: string;
  organizationId?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersDirectoryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/platform`;

  organizations(): Observable<DirectoryOptionDto[]> {
    return this.http.get<DirectoryOptionDto[]>(`${this.baseUrl}/organizations`, {
      params: new HttpParams().set('includeInactive', false),
    });
  }

  tenants(organizationId?: string): Observable<DirectoryOptionDto[]> {
    let params = new HttpParams().set('includeInactive', false);
    if (organizationId) params = params.set('organizationId', organizationId);
    return this.http.get<DirectoryOptionDto[]>(`${this.baseUrl}/tenants`, { params });
  }

  products(): Observable<DirectoryOptionDto[]> {
    return this.http.get<DirectoryOptionDto[]>(`${this.baseUrl}/products`, {
      params: new HttpParams().set('includeInactive', false),
    });
  }
}
