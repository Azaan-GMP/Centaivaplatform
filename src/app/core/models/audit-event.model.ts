export type AuditOutcome = 'Success' | 'Failure' | 'Denied' | 'Warning';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorType: 'User' | 'Service Account' | 'System';
  eventType: string;
  action: string;
  entityType: string;
  entityName: string;
  entityId: string;
  organizationName: string;
  organizationId: string;
  tenantName: string;
  tenantId: string | null;
  productName: string;
  applicationName: string;
  outcome: AuditOutcome;
  correlationId: string;
  ipAddress: string;
  userAgent: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}
