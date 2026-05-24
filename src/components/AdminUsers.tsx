import React from 'react';
import { useForm } from 'react-hook-form';
import { BadgeCheck, Building2, Mail, Search, Shield, UserPlus, Users } from 'lucide-react';
import type { User, UserRole, UserStatus } from '../types';

type AdminUsersProps = {
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'lastAccess'>) => void;
};

type UserFormValues = Omit<User, 'id' | 'lastAccess'>;

const inputClass =
  'mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100';

const roleLabel: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  OPERATOR: 'Operador',
  VIEWER: 'Lectura',
};

const statusLabel: Record<UserStatus, string> = {
  ACTIVE: 'Activo',
  INVITED: 'Invitado',
  SUSPENDED: 'Suspendido',
};

const statusClass: Record<UserStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  INVITED: 'bg-cyan-50 text-cyan-700',
  SUSPENDED: 'bg-rose-50 text-rose-700',
};

const permissions: Record<UserRole, string[]> = {
  ADMIN: ['Usuarios', 'Equipos', 'Combustible', 'Reportes'],
  SUPERVISOR: ['Equipos', 'Combustible', 'Reportes'],
  OPERATOR: ['Combustible', 'Historial'],
  VIEWER: ['Dashboard', 'Reportes'],
};

export default function AdminUsers({ users, onAddUser }: AdminUsersProps) {
  const [query, setQuery] = React.useState('');
  const [role, setRole] = React.useState<UserRole | ''>('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    defaultValues: {
      role: 'OPERATOR',
      status: 'INVITED',
      organization: 'Terminal Puerto Norte',
      area: 'Operaciones',
    },
  });

  const filteredUsers = users.filter(user => {
    const normalizedQuery = query.toLowerCase();
    const matchesQuery =
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery) ||
      user.area.toLowerCase().includes(normalizedQuery) ||
      user.organization.toLowerCase().includes(normalizedQuery);
    const matchesRole = !role || user.role === role;

    return matchesQuery && matchesRole;
  });

  const handleFormSubmit = (data: UserFormValues) => {
    onAddUser({
      ...data,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      organization: data.organization.trim(),
      area: data.area.trim(),
    });
    reset({
      role: 'OPERATOR',
      status: 'INVITED',
      organization: 'Terminal Puerto Norte',
      area: 'Operaciones',
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-950">Crear usuario</h2>
            <p className="text-sm text-slate-500">Administracion SaaS por rol, estado y organizacion.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Nombre</span>
            <input {...register('name', { required: true })} placeholder="Nombre completo" className={inputClass} />
            {errors.name && <span className="mt-1 block text-xs font-medium text-red-600">Campo requerido</span>}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              {...register('email', { required: true })}
              placeholder="usuario@empresa.cl"
              className={inputClass}
            />
            {errors.email && <span className="mt-1 block text-xs font-medium text-red-600">Email requerido</span>}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Rol</span>
            <select {...register('role', { required: true })} className={inputClass}>
              {Object.entries(roleLabel).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Estado</span>
            <select {...register('status', { required: true })} className={inputClass}>
              {Object.entries(statusLabel).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Organizacion</span>
            <input {...register('organization', { required: true })} className={inputClass} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Area</span>
            <input {...register('area', { required: true })} placeholder="Operaciones" className={inputClass} />
          </label>
        </div>

        <button
          type="submit"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
        >
          <UserPlus className="h-4 w-4" />
          Crear usuario
        </button>
      </form>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">Usuarios</p>
              <Users className="h-5 w-5 text-cyan-700" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-950">{users.length}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">Activos</p>
              <BadgeCheck className="h-5 w-5 text-emerald-700" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {users.filter(user => user.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">Organizaciones</p>
              <Building2 className="h-5 w-5 text-slate-700" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {new Set(users.map(user => user.organization)).size}
            </p>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Administracion SaaS</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Usuarios y accesos</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Buscar usuario..."
                />
              </label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole | '')}
                className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Todos los roles</option>
                {Object.entries(roleLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  {['Usuario', 'Rol', 'Estado', 'Organizacion', 'Permisos', 'Ultimo acceso'].map(header => (
                    <th key={header} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-950">{user.name}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                        <Shield className="h-3 w-3" />
                        {roleLabel[user.role]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${statusClass[user.status]}`}>
                        {statusLabel[user.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      <span className="block font-semibold text-slate-950">{user.organization}</span>
                      <span className="text-xs text-slate-500">{user.area}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex max-w-sm flex-wrap gap-1">
                        {permissions[user.role].map(permission => (
                          <span key={permission} className="rounded bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {user.lastAccess ? user.lastAccess.toLocaleDateString('es-CL') : 'Pendiente'}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                      No hay usuarios para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
