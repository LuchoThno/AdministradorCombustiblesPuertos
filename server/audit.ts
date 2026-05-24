import { AuditLogModel } from './models.js';

type AuditInput = {
  tenantId?: string;
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: unknown;
};

export async function audit(input: AuditInput) {
  await AuditLogModel.create(input);
}
