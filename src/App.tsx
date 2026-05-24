import React from 'react';
import {
  Anchor,
  BarChart3,
  ClipboardList,
  Download,
  Fuel,
  Plus,
  Settings,
  ShipWheel,
  SquareStack,
  Users,
} from 'lucide-react';
import AdminUsers from './components/AdminUsers';
import Dashboard from './components/Dashboard';
import EquipmentRegistry from './components/EquipmentRegistry';
import FuelForm from './components/FuelForm';
import FuelTable from './components/FuelTable';
import type { Equipment, FuelRecord, User } from './types';

type WindowKey = 'dashboard' | 'equipment' | 'registro' | 'historial' | 'admin';

const initialEquipment: Equipment[] = [
  {
    id: 'eq-001',
    code: 'RTG-04',
    name: 'Grua RTG patio norte',
    type: 'RTG',
    status: 'ACTIVE',
    area: 'Patio Contenedores A',
    fuelType: 'DIESEL',
    consumptionTarget: 420,
    operator: 'Turno Norte',
    notes: 'Equipo critico para transferencia a muelle.',
  },
  {
    id: 'eq-002',
    code: 'Reach-12',
    name: 'Reach stacker zona reefer',
    type: 'REACH_STACKER',
    status: 'ACTIVE',
    area: 'Zona Reefer',
    fuelType: 'DIESEL',
    consumptionTarget: 190,
    operator: 'Equipo Patio',
  },
  {
    id: 'eq-003',
    code: 'Grua Movil 02',
    name: 'Grua movil multiproposito',
    type: 'MOBILE_CRANE',
    status: 'MAINTENANCE',
    area: 'Sitio 3',
    fuelType: 'DIESEL',
    consumptionTarget: 340,
    operator: 'Muelle 3',
  },
  {
    id: 'eq-004',
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
  {
    id: 'eq-005',
    code: 'RTG-02',
    name: 'Grua RTG patio sur',
    type: 'RTG',
    status: 'ACTIVE',
    area: 'Patio Contenedores B',
    fuelType: 'DIESEL',
    consumptionTarget: 410,
    operator: 'Turno Sur',
  },
  {
    id: 'eq-006',
    code: 'Montacarga 07',
    name: 'Montacarga deposito fiscal',
    type: 'FORKLIFT',
    status: 'ACTIVE',
    area: 'Deposito Fiscal',
    fuelType: 'GAS',
    consumptionTarget: 80,
    operator: 'Almacen',
  },
];

const initialRecords: FuelRecord[] = [
  {
    id: 'rec-001',
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
    id: 'rec-002',
    timestamp: new Date('2026-05-23T10:40:00'),
    machineId: 'Reach-12',
    fuelType: 'DIESEL',
    quantity: 180,
    unit: 'LITERS',
    operator: 'Equipo Patio',
    location: 'Zona Reefer',
    notes: 'Recarga preventiva',
  },
  {
    id: 'rec-003',
    timestamp: new Date('2026-05-23T12:05:00'),
    machineId: 'Grua Movil 02',
    fuelType: 'DIESEL',
    quantity: 360,
    unit: 'LITERS',
    operator: 'Muelle 3',
    location: 'Sitio 3',
  },
  {
    id: 'rec-004',
    timestamp: new Date('2026-05-22T18:30:00'),
    machineId: 'Camion 18',
    fuelType: 'GAS',
    quantity: 95,
    unit: 'LITERS',
    operator: 'Logistica Interna',
    location: 'Bodega Central',
  },
  {
    id: 'rec-005',
    timestamp: new Date('2026-05-22T21:10:00'),
    machineId: 'RTG-02',
    fuelType: 'DIESEL',
    quantity: 390,
    unit: 'LITERS',
    operator: 'Turno Sur',
    location: 'Patio Contenedores B',
    notes: 'Alto consumo por doble turno',
  },
  {
    id: 'rec-006',
    timestamp: new Date('2026-05-21T09:20:00'),
    machineId: 'Montacarga 07',
    fuelType: 'GAS',
    quantity: 70,
    unit: 'LITERS',
    operator: 'Almacen',
    location: 'Deposito Fiscal',
  },
];

const initialUsers: User[] = [
  {
    id: 'usr-001',
    name: 'Camila Rojas',
    email: 'camila.rojas@puertonorte.cl',
    role: 'ADMIN',
    status: 'ACTIVE',
    organization: 'Terminal Puerto Norte',
    area: 'Gerencia Operaciones',
    lastAccess: new Date('2026-05-23T17:30:00'),
  },
  {
    id: 'usr-002',
    name: 'Diego Morales',
    email: 'diego.morales@puertonorte.cl',
    role: 'SUPERVISOR',
    status: 'ACTIVE',
    organization: 'Terminal Puerto Norte',
    area: 'Patio Contenedores',
    lastAccess: new Date('2026-05-23T15:10:00'),
  },
  {
    id: 'usr-003',
    name: 'Valentina Soto',
    email: 'valentina.soto@operador.cl',
    role: 'OPERATOR',
    status: 'INVITED',
    organization: 'Operador Logistico Sur',
    area: 'Abastecimiento',
  },
  {
    id: 'usr-004',
    name: 'Martin Fuentes',
    email: 'martin.fuentes@puertonorte.cl',
    role: 'VIEWER',
    status: 'ACTIVE',
    organization: 'Terminal Puerto Norte',
    area: 'Finanzas',
    lastAccess: new Date('2026-05-22T11:45:00'),
  },
];

const windows = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'equipment', label: 'Equipos', icon: Settings },
  { key: 'registro', label: 'Abastecer', icon: Plus },
  { key: 'historial', label: 'Historial', icon: ClipboardList },
  { key: 'admin', label: 'Admin', icon: Users },
] satisfies Array<{ key: WindowKey; label: string; icon: React.ComponentType<{ className?: string }> }>;

function App() {
  const [activeWindow, setActiveWindow] = React.useState<WindowKey>('dashboard');
  const [equipment, setEquipment] = React.useState<Equipment[]>(initialEquipment);
  const [records, setRecords] = React.useState<FuelRecord[]>(initialRecords);
  const [users, setUsers] = React.useState<User[]>(initialUsers);

  const equipmentByCode = React.useMemo(
    () => new Map(equipment.map(item => [item.code, item])),
    [equipment]
  );

  const escapeCsvValue = (value: string | number) => {
    const stringValue = String(value);
    return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
  };

  const handleAddEquipment = (data: Omit<Equipment, 'id'>) => {
    const normalizedCode = data.code.trim();
    setEquipment(prev => {
      const exists = prev.some(item => item.code.toLowerCase() === normalizedCode.toLowerCase());

      if (exists) {
        return prev.map(item =>
          item.code.toLowerCase() === normalizedCode.toLowerCase()
            ? { ...item, ...data, code: normalizedCode }
            : item
        );
      }

      return [
        { ...data, id: crypto.randomUUID(), code: normalizedCode },
        ...prev,
      ];
    });
  };

  const handleSubmit = (data: Omit<FuelRecord, 'id'>) => {
    const equipmentMatch = equipmentByCode.get(data.machineId);
    const newRecord: FuelRecord = {
      ...data,
      fuelType: equipmentMatch?.fuelType ?? data.fuelType,
      location: equipmentMatch?.area ?? data.location,
      id: crypto.randomUUID(),
    };
    setRecords(prev => [newRecord, ...prev]);
    setActiveWindow('historial');
  };

  const handleAddUser = (data: Omit<User, 'id' | 'lastAccess'>) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    setUsers(prev => {
      const exists = prev.some(user => user.email.toLowerCase() === normalizedEmail);

      if (exists) {
        return prev.map(user =>
          user.email.toLowerCase() === normalizedEmail
            ? { ...user, ...data, email: normalizedEmail }
            : user
        );
      }

      return [
        { ...data, id: crypto.randomUUID(), email: normalizedEmail },
        ...prev,
      ];
    });
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Equipment Code', 'Equipment Name', 'Equipment Type', 'Fuel Type', 'Quantity', 'Unit', 'Operator', 'Location', 'Notes'],
      ...records.map(r => {
        const machine = equipmentByCode.get(r.machineId);

        return [
          r.timestamp.toISOString(),
          r.machineId,
          machine?.name || '',
          machine?.type || '',
          r.fuelType,
          r.quantity,
          r.unit,
          r.operator,
          r.location,
          r.notes || '',
        ];
      }),
    ]
      .map(row => row.map(escapeCsvValue).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'fuel-records.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const activeWindowLabel = windows.find(item => item.key === activeWindow)?.label ?? 'Ventana';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setActiveWindow('dashboard')} className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-700 text-white">
              <Anchor className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-wide text-slate-500">
                Puerto Operaciones
              </span>
              <span className="block text-lg font-bold leading-5 text-slate-950">
                Control Combustibles
              </span>
            </span>
          </button>

          <div className="hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 md:flex">
            {windows.map(item => {
              const Icon = item.icon;
              const isActive = item.key === activeWindow;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveWindow(item.key)}
                  className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={records.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-5 gap-1 px-4 pb-3 md:hidden">
          {windows.map(item => {
            const Icon = item.icon;
            const isActive = item.key === activeWindow;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveWindow(item.key)}
                className={`flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-semibold ${
                  isActive ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">
              <ShipWheel className="h-4 w-4" />
              Gestion ejecutiva de consumo portuario por ventanas
            </div>
            <h1 className="max-w-4xl text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Equipos, vehiculos y combustible enlazados en una sola plataforma.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              El registro maestro alimenta los abastecimientos, el historial y el dashboard ejecutivo para controlar
              rendimiento, trazabilidad y disponibilidad operacional.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
            <div className="rounded-md bg-white p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Registros</p>
              <p className="mt-2 text-2xl font-bold">{records.length}</p>
            </div>
            <div className="rounded-md bg-white p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Equipos</p>
              <p className="mt-2 text-2xl font-bold">{equipment.length}</p>
            </div>
            <div className="rounded-md bg-white p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Activos</p>
              <p className="mt-2 text-2xl font-bold">{equipment.filter(item => item.status === 'ACTIVE').length}</p>
            </div>
            <div className="rounded-md bg-white p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Usuarios</p>
              <p className="mt-2 text-2xl font-bold">{users.length}</p>
            </div>
            <div className="col-span-2 rounded-md bg-cyan-700 p-4 text-white sm:col-span-4">
              <div className="flex items-center gap-3">
                <Fuel className="h-5 w-5" />
                <p className="text-sm font-medium">Ventana activa: {activeWindowLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-md border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <SquareStack className="h-4 w-4 text-cyan-300" />
              <span className="text-sm font-semibold">Ventana / {activeWindowLabel}</span>
            </div>
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
          </div>

          <div className="bg-slate-50 p-4 sm:p-6">
            {activeWindow === 'dashboard' && <Dashboard equipment={equipment} records={records} />}
            {activeWindow === 'equipment' && (
              <EquipmentRegistry equipment={equipment} onAddEquipment={handleAddEquipment} />
            )}
            {activeWindow === 'registro' && <FuelForm equipment={equipment} onSubmit={handleSubmit} />}
            {activeWindow === 'historial' && (
              <FuelTable equipment={equipment} records={records} onExport={handleExport} />
            )}
            {activeWindow === 'admin' && (
              <AdminUsers users={users} onAddUser={handleAddUser} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
