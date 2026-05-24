import { hashPassword } from './auth.js';
import { AuditLogModel, EquipmentModel, FuelRecordModel, ProfileModel, TenantModel, UserModel } from './models.js';

export async function seedDemoData() {
  const tenant = await TenantModel.findOneAndUpdate(
    { slug: 'terminal-puerto-norte' },
    { name: 'Terminal Puerto Norte', slug: 'terminal-puerto-norte', status: 'ACTIVE' },
    { new: true, upsert: true }
  );

  await Promise.all([
    ProfileModel.updateMany({ tenantId: { $exists: false } }, { tenantId: tenant._id }),
    UserModel.updateMany({ tenantId: { $exists: false } }, { tenantId: tenant._id }),
    EquipmentModel.updateMany({ tenantId: { $exists: false } }, { tenantId: tenant._id }),
    FuelRecordModel.updateMany({ tenantId: { $exists: false } }, { tenantId: tenant._id }),
    AuditLogModel.updateMany({ tenantId: { $exists: false } }, { tenantId: tenant._id }),
  ]);

  const existingUsers = await UserModel.countDocuments();

  if (existingUsers > 0) {
    return;
  }

  const adminProfile = await ProfileModel.create({
    tenantId: tenant._id,
    name: 'Administrador SaaS',
    description: 'Acceso completo a operacion, maestros, usuarios, perfiles y seguridad.',
    permissions: [
      'dashboard:view',
      'equipment:view',
      'equipment:manage',
      'fuel:create',
      'history:view',
      'history:export',
      'admin:users',
      'admin:profiles',
      'admin:security',
    ],
    isSystem: true,
  });

  const supervisorProfile = await ProfileModel.create({
    tenantId: tenant._id,
    name: 'Supervisor Operacional',
    description: 'Supervisa consumo, equipos e historial operativo.',
    permissions: ['dashboard:view', 'equipment:view', 'equipment:manage', 'fuel:create', 'history:view', 'history:export'],
    isSystem: true,
  });

  await UserModel.create([
    {
      tenantId: tenant._id,
      name: 'Camila Rojas',
      email: 'camila.rojas@puertonorte.cl',
      passwordHash: await hashPassword('Admin123!'),
      role: 'ADMIN',
      profileId: adminProfile._id,
      status: 'ACTIVE',
      organization: 'Terminal Puerto Norte',
      area: 'Gerencia Operaciones',
      mustChangePassword: false,
      lastAccess: new Date(),
    },
    {
      tenantId: tenant._id,
      name: 'Diego Morales',
      email: 'diego.morales@puertonorte.cl',
      passwordHash: await hashPassword('Supervisor123!'),
      role: 'SUPERVISOR',
      profileId: supervisorProfile._id,
      status: 'ACTIVE',
      organization: 'Terminal Puerto Norte',
      area: 'Patio Contenedores',
      mustChangePassword: false,
    },
  ]);

  await EquipmentModel.create([
    {
      tenantId: tenant._id,
      code: 'RTG-04',
      name: 'Grua RTG patio norte',
      type: 'RTG',
      status: 'ACTIVE',
      area: 'Patio Contenedores A',
      fuelType: 'DIESEL',
      consumptionTarget: 420,
      operator: 'Turno Norte',
    },
    {
      tenantId: tenant._id,
      code: 'Camion 18',
      name: 'Camion abastecimiento interno',
      type: 'TRUCK',
      status: 'ACTIVE',
      area: 'Bodega Central',
      fuelType: 'GAS',
      consumptionTarget: 100,
      plate: 'PT-1818',
      operator: 'Logistica Interna',
    },
  ]);

  await FuelRecordModel.create([
    {
      tenantId: tenant._id,
      timestamp: new Date('2026-05-23T08:15:00'),
      machineId: 'RTG-04',
      fuelType: 'DIESEL',
      quantity: 420,
      unit: 'LITERS',
      operator: 'Turno Norte',
      location: 'Patio Contenedores A',
      notes: 'Operacion de carga buque Andino',
    },
    {
      tenantId: tenant._id,
      timestamp: new Date('2026-05-22T18:30:00'),
      machineId: 'Camion 18',
      fuelType: 'GAS',
      quantity: 95,
      unit: 'LITERS',
      operator: 'Logistica Interna',
      location: 'Bodega Central',
    },
  ]);
}
