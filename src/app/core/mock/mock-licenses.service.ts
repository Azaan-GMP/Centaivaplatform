import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { License, LicensePool, ListQuery, PagedResult } from '../models';
import { LicensesService } from '../services/data-contracts';
import { LICENSE_POOLS, LICENSES } from './data/seed-commercial';
import { daysAgo, daysAhead, queryCollection, respond } from './mock-utils';

const SEARCH_FIELDS = ['reference', 'tenantName', 'productName', 'organizationName', 'maskedKey', 'type'];

@Injectable({ providedIn: 'root' })
export class MockLicensesService extends LicensesService {
  private readonly licenses: License[] = [...LICENSES];
  private readonly licensePools: LicensePool[] = [...LICENSE_POOLS];

  list(query?: ListQuery): Observable<PagedResult<License>> {
    return respond(queryCollection(this.licenses, query, SEARCH_FIELDS));
  }

  all(): Observable<License[]> {
    return respond([...this.licenses]);
  }

  byId(id: string): Observable<License | undefined> {
    return respond(this.licenses.find((license) => license.id === id));
  }

  pools(): Observable<LicensePool[]> {
    return respond([...this.licensePools]);
  }

  issue(payload: Partial<License>): Observable<License> {
    const template = this.licenses[0]!;
    const license: License = {
      ...template,
      id: `lic-${Date.now().toString(36)}`,
      reference: `LIC-${String(9000 + this.licenses.length)}`,
      maskedKey: this.newMaskedKey(),
      tenantId: payload.tenantId ?? template.tenantId,
      tenantName: payload.tenantName ?? template.tenantName,
      productKey: payload.productKey ?? template.productKey,
      productName: payload.productName ?? template.productName,
      type: payload.type ?? 'Named User',
      status: 'Active',
      seatLimit: payload.seatLimit ?? 10,
      seatsUsed: 0,
      activationCount: 0,
      concurrentActive: 0,
      issuedAt: daysAgo(0),
      expiresAt: daysAhead(365),
      seats: [],
      activations: [],
      leases: [],
      history: [
        { id: `h-${Date.now()}`, action: 'Licence issued', actor: 'Talha Hassan', timestamp: daysAgo(0), detail: 'Issued from the licensing console.' },
      ],
    };

    this.licenses.unshift(license);
    return respond(license);
  }

  setStatus(id: string, status: License['status']): Observable<License | undefined> {
    const license = this.licenses.find((candidate) => candidate.id === id);
    if (!license) {
      return respond(undefined);
    }
    license.status = status;
    license.history = [
      { id: `h-${Date.now()}`, action: `Status changed to ${status}`, actor: 'Talha Hassan', timestamp: daysAgo(0), detail: 'Changed from the licensing console.' },
      ...license.history,
    ];
    return respond(license);
  }

  rotateKey(id: string): Observable<License | undefined> {
    const license = this.licenses.find((candidate) => candidate.id === id);
    if (!license) {
      return respond(undefined);
    }
    const previous = license.maskedKey;
    license.maskedKey = this.newMaskedKey();
    license.history = [
      { id: `h-${Date.now()}`, action: 'Key rotated', actor: 'Talha Hassan', timestamp: daysAgo(0), detail: `Replaced ${previous}. The full key is only ever shown once at issue time.` },
      ...license.history,
    ];
    return respond(license);
  }

  createPool(payload: Partial<LicensePool>): Observable<LicensePool> {
    const parent = this.licensePools.find((pool) => pool.id === payload.parentPoolId);
    const total = payload.totalSeats ?? 0;

    const pool: LicensePool = {
      id: `pool-${Date.now().toString(36)}`,
      name: payload.name ?? 'New Pool',
      ownerOrganizationId: payload.ownerOrganizationId ?? '',
      ownerName: payload.ownerName ?? 'Unassigned',
      parentPoolId: parent?.id ?? null,
      productKey: payload.productKey ?? 'WORKWELL_TIMESHEETS',
      productName: payload.productName ?? 'WorkWell Timesheets',
      totalSeats: total,
      allocatedSeats: 0,
      availableSeats: total,
      childPoolCount: 0,
      status: 'Active',
      createdAt: daysAgo(0),
      depth: parent ? parent.depth + 1 : 0,
    };

    if (parent) {
      parent.childPoolCount += 1;
      parent.allocatedSeats = Math.min(parent.totalSeats, parent.allocatedSeats + total);
      parent.availableSeats = parent.totalSeats - parent.allocatedSeats;
    }

    this.licensePools.push(pool);
    return respond(pool);
  }

  allocateSeats(poolId: string, seats: number): Observable<LicensePool | undefined> {
    const pool = this.licensePools.find((candidate) => candidate.id === poolId);
    if (!pool) {
      return respond(undefined);
    }
    pool.allocatedSeats = Math.max(0, Math.min(pool.totalSeats, pool.allocatedSeats + seats));
    pool.availableSeats = pool.totalSeats - pool.allocatedSeats;
    pool.status = pool.availableSeats === 0 ? 'Exhausted' : 'Active';
    return respond(pool);
  }

  /** Only ever produces a masked placeholder — no real key material exists in the UI. */
  private newMaskedKey(): string {
    const alphabet = '0123456789ABCDEF';
    const tail = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    return `CNTA-****-****-${tail}`;
  }
}
