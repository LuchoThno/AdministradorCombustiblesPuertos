import mongoose, { Schema } from 'mongoose';

const taskPermissions = [
  'dashboard:view',
  'equipment:view',
  'equipment:manage',
  'fuel:create',
  'history:view',
  'history:export',
  'admin:users',
  'admin:profiles',
  'admin:security',
] as const;

const fuelTypes = ['DIESEL', 'GAS'] as const;
const equipmentTypes = ['RTG', 'REACH_STACKER', 'MOBILE_CRANE', 'TRUCK', 'FORKLIFT', 'GENERATOR', 'OTHER'] as const;
const equipmentStatuses = ['ACTIVE', 'MAINTENANCE', 'INACTIVE'] as const;
const userRoles = ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'VIEWER'] as const;
const userStatuses = ['ACTIVE', 'INVITED', 'SUSPENDED'] as const;

const tenantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

const profileSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    permissions: [{ type: String, enum: taskPermissions, required: true }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: userRoles, required: true },
    profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    status: { type: String, enum: userStatuses, default: 'INVITED' },
    organization: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    mustChangePassword: { type: Boolean, default: true },
    lastAccess: { type: Date },
  },
  { timestamps: true }
);

const equipmentSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: equipmentTypes, required: true },
    status: { type: String, enum: equipmentStatuses, default: 'ACTIVE' },
    area: { type: String, required: true, trim: true },
    fuelType: { type: String, enum: fuelTypes, required: true },
    consumptionTarget: { type: Number, required: true, min: 0 },
    plate: { type: String, trim: true },
    operator: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const fuelRecordSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    timestamp: { type: Date, required: true },
    machineId: { type: String, required: true, trim: true },
    fuelType: { type: String, enum: fuelTypes, required: true },
    quantity: { type: Number, required: true, min: 0 },
    operator: { type: String, required: true, trim: true },
    unit: { type: String, enum: ['LITERS', 'GALLONS'], required: true },
    location: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const auditLogSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

profileSchema.index({ tenantId: 1, name: 1 }, { unique: true });
equipmentSchema.index({ tenantId: 1, code: 1 }, { unique: true });
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const TenantModel = mongoose.model('Tenant', tenantSchema);
export const ProfileModel = mongoose.model('Profile', profileSchema);
export const UserModel = mongoose.model('User', userSchema);
export const EquipmentModel = mongoose.model('Equipment', equipmentSchema);
export const FuelRecordModel = mongoose.model('FuelRecord', fuelRecordSchema);
export const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);
