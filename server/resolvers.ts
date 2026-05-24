import { audit } from './audit.js';
import { hashPassword, requireAuth, requirePermission, signToken, verifyPassword } from './auth.js';
import type { GraphQLContext } from './auth.js';
import { AuditLogModel, EquipmentModel, FuelRecordModel, ProfileModel, TenantModel, UserModel } from './models.js';

type DbDoc = {
  _id: unknown;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
};

type ProfileInput = {
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
};

type UserInput = {
  name: string;
  email: string;
  password?: string;
  role: string;
  profileId: string;
  status: string;
  organization: string;
  area: string;
  mustChangePassword?: boolean;
};

type EquipmentInput = {
  code: string;
  name: string;
  type: string;
  status: string;
  area: string;
  fuelType: string;
  consumptionTarget: number;
  plate?: string;
  operator?: string;
  notes?: string;
};

type FuelRecordInput = {
  timestamp: string;
  machineId: string;
  fuelType: string;
  quantity: number;
  operator: string;
  unit: string;
  location: string;
  notes?: string;
};

type ReportFilterInput = {
  from?: string;
  to?: string;
  equipmentCode?: string;
  area?: string;
  fuelType?: string;
};

const mapDoc = <T extends DbDoc>(doc: T) => ({
  ...doc,
  id: String(doc._id),
  _id: undefined,
});

const mapUser = (doc: DbDoc) => {
  const user = mapDoc(doc);
  return {
    ...user,
    tenantId: String(doc.tenantId),
    passwordHash: undefined,
    profileId: String(doc.profileId),
    lastAccess: doc.lastAccess instanceof Date ? doc.lastAccess.toISOString() : doc.lastAccess,
  };
};

const mapFuelRecord = (doc: DbDoc) => ({
  ...mapDoc(doc),
  timestamp: doc.timestamp instanceof Date ? doc.timestamp.toISOString() : doc.timestamp,
});

const createRecordFilter = (filter?: ReportFilterInput) => {
  const query: Record<string, unknown> = {};

  if (filter?.equipmentCode) query.machineId = filter.equipmentCode;
  if (filter?.fuelType) query.fuelType = filter.fuelType;
  if (filter?.from || filter?.to) {
    query.timestamp = {
      ...(filter.from ? { $gte: new Date(filter.from) } : {}),
      ...(filter.to ? { $lte: new Date(filter.to) } : {}),
    };
  }

  return query;
};

const withTenant = (tenantId: string, filter: Record<string, unknown> = {}) => ({
  ...filter,
  tenantId,
});

const parseEquipmentCsv = (csv: string) => {
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map(header => header.trim());

  return rows
    .filter(Boolean)
    .map(row => {
      const values = row.split(',').map(value => value.trim());
      return headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = values[index] ?? '';
        return acc;
      }, {});
    });
};

export const resolvers = {
  User: {
    profile: async (user: { profileId: string }) => {
      const profile = await ProfileModel.findById(user.profileId).lean<DbDoc>();
      return profile ? mapDoc(profile) : null;
    },
  },
  FuelRecord: {
    equipment: async (record: { machineId: string; tenantId: string }) => {
      const equipment = await EquipmentModel.findOne({ tenantId: record.tenantId, code: record.machineId }).lean<DbDoc>();
      return equipment ? mapDoc(equipment) : null;
    },
  },
  Query: {
    me: async (_root: unknown, _args: unknown, context: GraphQLContext) => {
      const authUser = requireAuth(context);
      const user = await UserModel.findById(authUser.id).lean<DbDoc>();
      return user ? mapUser(user) : null;
    },
    myTenant: async (_root: unknown, _args: unknown, context: GraphQLContext) => {
      const authUser = requireAuth(context);
      const tenant = await TenantModel.findById(authUser.tenantId).lean<DbDoc>();
      return tenant ? mapDoc(tenant) : null;
    },
    profiles: async (_root: unknown, _args: unknown, context: GraphQLContext) => {
      const actor = requirePermission(context, 'admin:profiles');
      const profiles = await ProfileModel.find(withTenant(actor.tenantId)).sort({ name: 1 }).lean<DbDoc[]>();
      return profiles.map(mapDoc);
    },
    users: async (_root: unknown, _args: unknown, context: GraphQLContext) => {
      const actor = requirePermission(context, 'admin:users');
      const users = await UserModel.find(withTenant(actor.tenantId)).sort({ name: 1 }).lean<DbDoc[]>();
      return users.map(mapUser);
    },
    equipment: async (_root: unknown, _args: unknown, context: GraphQLContext) => {
      const actor = requirePermission(context, 'equipment:view');
      const equipment = await EquipmentModel.find(withTenant(actor.tenantId)).sort({ code: 1 }).lean<DbDoc[]>();
      return equipment.map(mapDoc);
    },
    fuelRecords: async (_root: unknown, _args: unknown, context: GraphQLContext) => {
      const actor = requirePermission(context, 'history:view');
      const records = await FuelRecordModel.find(withTenant(actor.tenantId)).sort({ timestamp: -1 }).lean<DbDoc[]>();
      return records.map(mapFuelRecord);
    },
    auditLogs: async (_root: unknown, _args: unknown, context: GraphQLContext) => {
      const actor = requirePermission(context, 'admin:security');
      const logs = await AuditLogModel.find(withTenant(actor.tenantId)).sort({ createdAt: -1 }).limit(200).lean<DbDoc[]>();
      return logs.map(log => ({
        ...mapDoc(log),
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
        createdAt: log.createdAt?.toISOString(),
      }));
    },
    dashboardReport: async (_root: unknown, _args: unknown, context: GraphQLContext) => {
      const actor = requirePermission(context, 'dashboard:view');
      const records = await FuelRecordModel.find(withTenant(actor.tenantId)).lean<Array<DbDoc & { quantity: number; fuelType: string }>>();
      const totalEquipment = await EquipmentModel.countDocuments(withTenant(actor.tenantId));
      const activeEquipment = await EquipmentModel.countDocuments(withTenant(actor.tenantId, { status: 'ACTIVE' }));

      return records.reduce(
        (acc, record) => ({
          ...acc,
          totalConsumption: acc.totalConsumption + record.quantity,
          dieselConsumption: acc.dieselConsumption + (record.fuelType === 'DIESEL' ? record.quantity : 0),
          gasConsumption: acc.gasConsumption + (record.fuelType === 'GAS' ? record.quantity : 0),
        }),
        {
          totalConsumption: 0,
          dieselConsumption: 0,
          gasConsumption: 0,
          activeEquipment,
          totalEquipment,
          records: records.length,
        }
      );
    },
    consumptionReport: async (_root: unknown, args: { filter?: ReportFilterInput }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'history:view');
      const recordFilter = withTenant(actor.tenantId, createRecordFilter(args.filter));
      const records = await FuelRecordModel.find(recordFilter).lean<Array<DbDoc & {
        machineId: string;
        fuelType: string;
        quantity: number;
      }>>();
      const equipment = await EquipmentModel.find(withTenant(actor.tenantId)).lean<Array<DbDoc & { code: string; name: string; area: string }>>();
      const equipmentByCode = new Map(equipment.map(item => [item.code, item]));
      const rows = new Map<string, {
        equipmentCode: string;
        equipmentName?: string;
        area: string;
        fuelType: string;
        totalQuantity: number;
        records: number;
      }>();

      for (const record of records) {
        const machine = equipmentByCode.get(record.machineId);
        const area = machine?.area ?? 'Sin area';
        if (args.filter?.area && area !== args.filter.area) continue;

        const key = `${record.machineId}-${record.fuelType}-${area}`;
        const existing = rows.get(key);

        if (existing) {
          existing.totalQuantity += record.quantity;
          existing.records += 1;
        } else {
          rows.set(key, {
            equipmentCode: record.machineId,
            equipmentName: machine?.name,
            area,
            fuelType: record.fuelType,
            totalQuantity: record.quantity,
            records: 1,
          });
        }
      }

      const reportRows = [...rows.values()].sort((a, b) => b.totalQuantity - a.totalQuantity);

      return {
        rows: reportRows,
        totalQuantity: reportRows.reduce((acc, row) => acc + row.totalQuantity, 0),
        records: reportRows.reduce((acc, row) => acc + row.records, 0),
      };
    },
    consumptionAlerts: async (_root: unknown, args: { filter?: ReportFilterInput }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'dashboard:view');
      const recordFilter = withTenant(actor.tenantId, createRecordFilter(args.filter));
      const records = await FuelRecordModel.find(recordFilter).lean<Array<DbDoc & { machineId: string; quantity: number }>>();
      const equipment = await EquipmentModel.find(withTenant(actor.tenantId)).lean<Array<DbDoc & {
        code: string;
        name: string;
        consumptionTarget: number;
      }>>();
      const consumption = records.reduce<Record<string, number>>((acc, record) => {
        acc[record.machineId] = (acc[record.machineId] ?? 0) + record.quantity;
        return acc;
      }, {});

      return equipment
        .map(machine => {
          const totalQuantity = consumption[machine.code] ?? 0;
          return {
            equipmentCode: machine.code,
            equipmentName: machine.name,
            totalQuantity,
            target: machine.consumptionTarget,
            variance: totalQuantity - machine.consumptionTarget,
          };
        })
        .filter(alert => alert.variance > 0)
        .sort((a, b) => b.variance - a.variance);
    },
  },
  Mutation: {
    login: async (_root: unknown, args: { input: { email: string; password: string } }) => {
      const email = args.input.email.trim().toLowerCase();
      const user = await UserModel.findOne({ email }).lean<DbDoc & { passwordHash: string; status: string }>();

      if (!user || user.status === 'SUSPENDED') {
        throw new Error('Invalid credentials');
      }

      const isValid = await verifyPassword(args.input.password, user.passwordHash);

      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      await UserModel.findByIdAndUpdate(user._id, { status: 'ACTIVE', lastAccess: new Date() });
      await audit({ tenantId: String(user.tenantId), actorId: String(user._id), action: 'LOGIN', entity: 'User', entityId: String(user._id) });

      return {
        token: signToken(String(user._id)),
        user: mapUser({ ...user, lastAccess: new Date() }),
      };
    },
    createProfile: async (_root: unknown, args: { input: ProfileInput }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'admin:profiles');
      const profile = await ProfileModel.create({ ...args.input, tenantId: actor.tenantId });
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'CREATE', entity: 'Profile', entityId: String(profile._id), metadata: args.input });
      return mapDoc(profile.toObject() as DbDoc);
    },
    updateProfile: async (_root: unknown, args: { id: string; input: ProfileInput }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'admin:profiles');
      const profile = await ProfileModel.findOneAndUpdate(withTenant(actor.tenantId, { _id: args.id }), args.input, { new: true }).lean<DbDoc>();
      if (!profile) throw new Error('Profile not found');
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'UPDATE', entity: 'Profile', entityId: args.id, metadata: args.input });
      return mapDoc(profile);
    },
    deleteProfile: async (_root: unknown, args: { id: string }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'admin:profiles');
      const profile = await ProfileModel.findOne(withTenant(actor.tenantId, { _id: args.id })).lean<DbDoc & { isSystem?: boolean }>();
      if (profile?.isSystem) throw new Error('System profiles cannot be deleted');
      await ProfileModel.findOneAndDelete(withTenant(actor.tenantId, { _id: args.id }));
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'DELETE', entity: 'Profile', entityId: args.id });
      return true;
    },
    createUser: async (_root: unknown, args: { input: UserInput }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'admin:users');
      const passwordHash = await hashPassword(args.input.password ?? 'ChangeMe123!');
      const user = await UserModel.create({ ...args.input, tenantId: actor.tenantId, email: args.input.email.toLowerCase(), passwordHash });
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'CREATE', entity: 'User', entityId: String(user._id), metadata: { email: args.input.email } });
      return mapUser(user.toObject() as DbDoc);
    },
    updateUser: async (_root: unknown, args: { id: string; input: UserInput }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'admin:users');
      const update = { ...args.input, email: args.input.email.toLowerCase() };
      const user = await UserModel.findOneAndUpdate(withTenant(actor.tenantId, { _id: args.id }), update, { new: true }).lean<DbDoc>();
      if (!user) throw new Error('User not found');
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'UPDATE', entity: 'User', entityId: args.id, metadata: { email: args.input.email } });
      return mapUser(user);
    },
    deleteUser: async (_root: unknown, args: { id: string }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'admin:users');
      await UserModel.findOneAndDelete(withTenant(actor.tenantId, { _id: args.id }));
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'DELETE', entity: 'User', entityId: args.id });
      return true;
    },
    resetPassword: async (_root: unknown, args: { id: string; password: string }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'admin:security');
      await UserModel.findOneAndUpdate(withTenant(actor.tenantId, { _id: args.id }), {
        passwordHash: await hashPassword(args.password),
        mustChangePassword: true,
        status: 'INVITED',
      });
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'RESET_PASSWORD', entity: 'User', entityId: args.id });
      return true;
    },
    createEquipment: async (_root: unknown, args: { input: EquipmentInput }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'equipment:manage');
      const equipment = await EquipmentModel.create({ ...args.input, tenantId: actor.tenantId });
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'CREATE', entity: 'Equipment', entityId: String(equipment._id), metadata: args.input });
      return mapDoc(equipment.toObject() as DbDoc);
    },
    updateEquipment: async (_root: unknown, args: { id: string; input: EquipmentInput }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'equipment:manage');
      const equipment = await EquipmentModel.findOneAndUpdate(withTenant(actor.tenantId, { _id: args.id }), args.input, { new: true }).lean<DbDoc>();
      if (!equipment) throw new Error('Equipment not found');
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'UPDATE', entity: 'Equipment', entityId: args.id, metadata: args.input });
      return mapDoc(equipment);
    },
    deleteEquipment: async (_root: unknown, args: { id: string }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'equipment:manage');
      await EquipmentModel.findOneAndDelete(withTenant(actor.tenantId, { _id: args.id }));
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'DELETE', entity: 'Equipment', entityId: args.id });
      return true;
    },
    createFuelRecord: async (_root: unknown, args: { input: FuelRecordInput }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'fuel:create');
      const record = await FuelRecordModel.create({ ...args.input, tenantId: actor.tenantId, timestamp: new Date(args.input.timestamp) });
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'CREATE', entity: 'FuelRecord', entityId: String(record._id), metadata: args.input });
      return mapFuelRecord(record.toObject() as DbDoc);
    },
    deleteFuelRecord: async (_root: unknown, args: { id: string }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'history:export');
      await FuelRecordModel.findOneAndDelete(withTenant(actor.tenantId, { _id: args.id }));
      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'DELETE', entity: 'FuelRecord', entityId: args.id });
      return true;
    },
    importEquipmentCsv: async (_root: unknown, args: { csv: string }, context: GraphQLContext) => {
      const actor = requirePermission(context, 'equipment:manage');
      const rows = parseEquipmentCsv(args.csv);
      let imported = 0;

      for (const row of rows) {
        if (!row.code || !row.name) continue;

        await EquipmentModel.findOneAndUpdate(
          { tenantId: actor.tenantId, code: row.code },
          {
            tenantId: actor.tenantId,
            code: row.code,
            name: row.name,
            type: row.type || 'OTHER',
            status: row.status || 'ACTIVE',
            area: row.area || 'Sin area',
            fuelType: row.fuelType || 'DIESEL',
            consumptionTarget: Number(row.consumptionTarget || 0),
            plate: row.plate || undefined,
            operator: row.operator || undefined,
            notes: row.notes || undefined,
          },
          { upsert: true, new: true }
        );
        imported += 1;
      }

      await audit({ tenantId: actor.tenantId, actorId: actor.id, action: 'IMPORT_CSV', entity: 'Equipment', metadata: { imported } });
      return imported;
    },
  },
};
