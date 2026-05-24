import React from 'react';
import {
  Anchor,
  BarChart3,
  ClipboardList,
  Download,
  Fuel,
  LogIn,
  LogOut,
  Plus,
  Settings,
  ShipWheel,
  SquareStack,
  Users,
} from 'lucide-react';
import * as api from './api/graphql';
import AdminUsers from './components/AdminUsers';
import Dashboard from './components/Dashboard';
import EquipmentRegistry from './components/EquipmentRegistry';
import FuelForm from './components/FuelForm';
import FuelTable from './components/FuelTable';
import type { AdminProfile, Equipment, FuelRecord, TaskPermission, User } from './types';

type WindowKey = 'dashboard' | 'equipment' | 'registro' | 'historial' | 'admin';

const windows = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'equipment', label: 'Equipos', icon: Settings },
  { key: 'registro', label: 'Abastecer', icon: Plus },
  { key: 'historial', label: 'Historial', icon: ClipboardList },
  { key: 'admin', label: 'Admin', icon: Users },
] satisfies Array<{ key: WindowKey; label: string; icon: React.ComponentType<{ className?: string }> }>;

function App() {
  const [activeWindow, setActiveWindow] = React.useState<WindowKey>('dashboard');
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [records, setRecords] = React.useState<FuelRecord[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [profiles, setProfiles] = React.useState<AdminProfile[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState('');
  const [loginEmail, setLoginEmail] = React.useState('camila.rojas@puertonorte.cl');
  const [loginPassword, setLoginPassword] = React.useState('Admin123!');
  const [loginError, setLoginError] = React.useState('');
  const [appError, setAppError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const equipmentByCode = React.useMemo(
    () => new Map(equipment.map(item => [item.code, item])),
    [equipment]
  );

  const profileById = React.useMemo(
    () => new Map(profiles.map(profile => [profile.id, profile])),
    [profiles]
  );

  const currentPermissions = currentUser ? profileById.get(currentUser.profileId)?.permissions ?? [] : [];
  const canAccess = (permission: TaskPermission) => currentPermissions.includes(permission);

  const escapeCsvValue = (value: string | number) => {
    const stringValue = String(value);
    return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
  };

  const applyBootstrap = (data: api.AppBootstrap) => {
    setCurrentUser(data.currentUser);
    setProfiles(data.profiles);
    setUsers(data.users);
    setEquipment(data.equipment);
    setRecords(data.records);
  };

  const refreshData = React.useCallback(async (authToken: string) => {
    const data = await api.loadAppData(authToken);
    applyBootstrap(data);
  }, []);

  const runMutation = async (operation: () => Promise<void>) => {
    if (!token) return;

    setAppError('');
    try {
      await operation();
      await refreshData(token);
    } catch (error) {
      setAppError(error instanceof Error ? error.message : 'No se pudo completar la operacion');
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const session = await api.login(loginEmail, loginPassword);
      setToken(session.token);
      const data = await api.loadAppData(session.token);
      applyBootstrap(data);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'No se pudo iniciar sesion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    setProfiles([]);
    setUsers([]);
    setEquipment([]);
    setRecords([]);
    setActiveWindow('dashboard');
  };

  const handleAddEquipment = (data: Omit<Equipment, 'id'>) => {
    const input = { ...data };
    delete input.tenantId;
    void runMutation(() => api.createEquipment(token, input));
  };

  const handleSubmit = (data: Omit<FuelRecord, 'id'>) => {
    const recordInput = { ...data };
    delete recordInput.tenantId;
    const equipmentMatch = equipmentByCode.get(recordInput.machineId);
    void runMutation(async () => {
      await api.createFuelRecord(token, {
        ...recordInput,
        fuelType: equipmentMatch?.fuelType ?? recordInput.fuelType,
        location: equipmentMatch?.area ?? recordInput.location,
      });
      setActiveWindow('historial');
    });
  };

  const handleCreateUser = (data: Omit<User, 'id' | 'tenantId' | 'lastAccess'>, password: string) => {
    void runMutation(() => api.createUser(token, data, password));
  };

  const handleUpdateUser = (id: string, data: Omit<User, 'id' | 'tenantId' | 'lastAccess'>) => {
    void runMutation(() => api.updateUser(token, id, data));
  };

  const handleDeleteUser = (id: string) => {
    void runMutation(() => api.deleteUser(token, id));
  };

  const handleResetPassword = (id: string, password: string) => {
    void runMutation(() => api.resetPassword(token, id, password));
  };

  const handleCreateProfile = (data: Omit<AdminProfile, 'id' | 'tenantId'>) => {
    void runMutation(() => api.createProfile(token, data));
  };

  const handleUpdateProfile = (id: string, data: Omit<AdminProfile, 'id' | 'tenantId'>) => {
    void runMutation(() => api.updateProfile(token, id, data));
  };

  const handleDeleteProfile = (id: string) => {
    void runMutation(() => api.deleteProfile(token, id));
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

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-950">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_420px]">
          <div className="bg-slate-950 p-8 text-white sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-200">
              <Anchor className="h-6 w-6" />
            </div>
            <h1 className="mt-8 max-w-xl text-3xl font-bold sm:text-4xl">
              SaaS de control de combustible para operacion portuaria.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
              Ingresa para administrar usuarios, perfiles, equipos, abastecimientos e indicadores ejecutivos conectados a MongoDB.
            </p>
            <div className="mt-8 rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Demo admin: <span className="font-semibold text-white">camila.rojas@puertonorte.cl</span>
              <br />
              Contrasena: <span className="font-semibold text-white">Admin123!</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-8 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Acceso seguro</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Iniciar sesion</h2>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700">Contrasena</span>
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            {loginError && (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {loginError}
              </div>
            )}

            <button
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? 'Conectando...' : 'Entrar a la plataforma'}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Salir
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
              Equipos, vehiculos y combustible enlazados a MongoDB.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              El registro maestro alimenta los abastecimientos, el historial y el dashboard ejecutivo con datos reales del tenant activo.
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
                <p className="text-sm font-medium">
                  Ventana activa: {activeWindowLabel} · Sesion: {currentUser.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {appError && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {appError}
          </div>
        )}

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
              canAccess('admin:users') ? (
                <AdminUsers
                  users={users}
                  profiles={profiles}
                  onCreateUser={handleCreateUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onResetPassword={handleResetPassword}
                  onCreateProfile={handleCreateProfile}
                  onUpdateProfile={handleUpdateProfile}
                  onDeleteProfile={handleDeleteProfile}
                />
              ) : (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-800">
                  Tu perfil no tiene permisos para administrar usuarios.
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
