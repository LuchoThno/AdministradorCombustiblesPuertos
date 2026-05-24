import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Copy,
  Edit,
  Eye,
  EyeOff,
  Key,
  Lock,
  Mail,
  Save,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type { AdminProfile, TaskPermission, User, UserRole, UserStatus } from '../types';

type AdminUsersProps = {
  users: User[];
  profiles: AdminProfile[];
  onCreateUser: (user: Omit<User, 'id' | 'lastAccess'>, password: string) => void;
  onUpdateUser: (id: string, user: Omit<User, 'id' | 'lastAccess'>) => void;
  onDeleteUser: (id: string) => void;
  onResetPassword: (id: string, password: string) => void;
  onCreateProfile: (profile: Omit<AdminProfile, 'id'>) => void;
  onUpdateProfile: (id: string, profile: Omit<AdminProfile, 'id'>) => void;
  onDeleteProfile: (id: string) => void;
};

type UserFormValues = Omit<User, 'id' | 'lastAccess'>;
type ProfileFormValues = Omit<AdminProfile, 'id' | 'permissions'> & {
  permissions: Record<TaskPermission, boolean>;
};

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

const taskGroups: Array<{ label: string; tasks: Array<{ id: TaskPermission; label: string }> }> = [
  {
    label: 'Operación',
    tasks: [
      { id: 'dashboard:view', label: 'Ver dashboard' },
      { id: 'fuel:create', label: 'Registrar combustible' },
      { id: 'history:view', label: 'Ver historial' },
      { id: 'history:export', label: 'Exportar reportes' },
    ],
  },
  {
    label: 'Maestros',
    tasks: [
      { id: 'equipment:view', label: 'Ver equipos' },
      { id: 'equipment:manage', label: 'Gestionar equipos' },
    ],
  },
  {
    label: 'Administración',
    tasks: [
      { id: 'admin:users', label: 'Gestionar usuarios' },
      { id: 'admin:profiles', label: 'Gestionar perfiles' },
      { id: 'admin:security', label: 'Seguridad y contraseñas' },
    ],
  },
];

const allPermissions = taskGroups.flatMap(group => group.tasks.map(task => task.id));

const createPermissionDefaults = (enabled: TaskPermission[] = []) =>
  allPermissions.reduce((acc, permission) => {
    acc[permission] = enabled.includes(permission);
    return acc;
  }, {} as Record<TaskPermission, boolean>);

const createPassword = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#$%&*';
  const chunks = Array.from({ length: 14 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]);
  return chunks.join('');
};

const getPasswordScore = (password: string) => {
  const checks = [
    password.length >= 12,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  return checks.filter(Boolean).length;
};

export default function AdminUsers({
  users,
  profiles,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onResetPassword,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
}: AdminUsersProps) {
  const [tab, setTab] = React.useState<'users' | 'profiles' | 'security'>('users');
  const [query, setQuery] = React.useState('');
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [editingProfileId, setEditingProfileId] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState(createPassword());
  const [showPassword, setShowPassword] = React.useState(false);
  const [notice, setNotice] = React.useState('');

  const userForm = useForm<UserFormValues>({
    defaultValues: {
      role: 'OPERATOR',
      profileId: profiles[0]?.id ?? '',
      status: 'INVITED',
      organization: 'Terminal Puerto Norte',
      area: 'Operaciones',
      mustChangePassword: true,
    },
  });

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      description: '',
      permissions: createPermissionDefaults(['dashboard:view']),
      isSystem: false,
    },
  });

  const profileById = React.useMemo(
    () => new Map(profiles.map(profile => [profile.id, profile])),
    [profiles]
  );

  const filteredUsers = users.filter(user => {
    const normalizedQuery = query.toLowerCase();
    return (
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery) ||
      user.area.toLowerCase().includes(normalizedQuery) ||
      user.organization.toLowerCase().includes(normalizedQuery)
    );
  });

  const passwordScore = getPasswordScore(password);

  const resetUserForm = () => {
    setEditingUserId(null);
    setPassword(createPassword());
    userForm.reset({
      name: '',
      email: '',
      role: 'OPERATOR',
      profileId: profiles[0]?.id ?? '',
      status: 'INVITED',
      organization: 'Terminal Puerto Norte',
      area: 'Operaciones',
      mustChangePassword: true,
    });
  };

  const resetProfileForm = () => {
    setEditingProfileId(null);
    profileForm.reset({
      name: '',
      description: '',
      permissions: createPermissionDefaults(['dashboard:view']),
      isSystem: false,
    });
  };

  const handleUserSubmit = (data: UserFormValues) => {
    const payload = {
      ...data,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      organization: data.organization.trim(),
      area: data.area.trim(),
      mustChangePassword: data.mustChangePassword ?? false,
    };

    if (editingUserId) {
      onUpdateUser(editingUserId, payload);
      setNotice(`Usuario actualizado: ${payload.email}`);
    } else {
      onCreateUser(payload, password);
      setNotice(`Usuario creado. Contraseña temporal: ${password}`);
    }

    resetUserForm();
  };

  const handleProfileSubmit = (data: ProfileFormValues) => {
    const selectedPermissions = allPermissions.filter(permission => data.permissions[permission]);
    const payload = {
      name: data.name.trim(),
      description: data.description.trim(),
      permissions: selectedPermissions,
      isSystem: data.isSystem ?? false,
    };

    if (editingProfileId) {
      onUpdateProfile(editingProfileId, payload);
      setNotice(`Perfil actualizado: ${payload.name}`);
    } else {
      onCreateProfile(payload);
      setNotice(`Perfil creado: ${payload.name}`);
    }

    resetProfileForm();
  };

  const editUser = (user: User) => {
    setEditingUserId(user.id);
    userForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      profileId: user.profileId,
      status: user.status,
      organization: user.organization,
      area: user.area,
      mustChangePassword: user.mustChangePassword ?? false,
    });
    setTab('users');
  };

  const editProfile = (profile: AdminProfile) => {
    setEditingProfileId(profile.id);
    profileForm.reset({
      name: profile.name,
      description: profile.description,
      permissions: createPermissionDefaults(profile.permissions),
      isSystem: profile.isSystem ?? false,
    });
    setTab('profiles');
  };

  const resetPassword = (user: User) => {
    const nextPassword = createPassword();
    onResetPassword(user.id, nextPassword);
    setNotice(`Contraseña temporal para ${user.email}: ${nextPassword}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Usuarios</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{users.length}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Perfiles</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{profiles.length}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Activos</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {users.filter(user => user.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Con cambio clave</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {users.filter(user => user.mustChangePassword).length}
          </p>
        </div>
      </div>

      {notice && (
        <div className="flex items-center justify-between rounded-md border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Cerrar aviso">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Administración SaaS</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Usuarios, perfiles y seguridad</h2>
          </div>
          <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
            {[
              { id: 'users', label: 'Usuarios', icon: Users },
              { id: 'profiles', label: 'Perfiles', icon: Shield },
              { id: 'security', label: 'Seguridad', icon: Key },
            ].map(item => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id as typeof tab)}
                  className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === 'users' && (
          <div className="grid gap-6 p-5 xl:grid-cols-[380px_1fr]">
            <form onSubmit={userForm.handleSubmit(handleUserSubmit)} className="rounded-md border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-950">{editingUserId ? 'Editar usuario' : 'Crear usuario'}</h3>
                {editingUserId && (
                  <button type="button" onClick={resetUserForm} className="text-sm font-semibold text-slate-500">
                    Cancelar
                  </button>
                )}
              </div>

              <div className="grid gap-4">
                <label>
                  <span className="text-sm font-semibold text-slate-700">Nombre</span>
                  <input {...userForm.register('name', { required: true })} className={inputClass} />
                </label>
                <label>
                  <span className="text-sm font-semibold text-slate-700">Email</span>
                  <input type="email" {...userForm.register('email', { required: true })} className={inputClass} />
                </label>
                <label>
                  <span className="text-sm font-semibold text-slate-700">Rol</span>
                  <select {...userForm.register('role', { required: true })} className={inputClass}>
                    {Object.entries(roleLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-semibold text-slate-700">Perfil de acceso</span>
                  <select {...userForm.register('profileId', { required: true })} className={inputClass}>
                    {profiles.map(profile => (
                      <option key={profile.id} value={profile.id}>{profile.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-semibold text-slate-700">Estado</span>
                  <select {...userForm.register('status', { required: true })} className={inputClass}>
                    {Object.entries(statusLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-semibold text-slate-700">Organización</span>
                  <input {...userForm.register('organization', { required: true })} className={inputClass} />
                </label>
                <label>
                  <span className="text-sm font-semibold text-slate-700">Área</span>
                  <input {...userForm.register('area', { required: true })} className={inputClass} />
                </label>

                {!editingUserId && (
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Contraseña temporal</span>
                    <div className="mt-1 flex gap-2">
                      <input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                      />
                      <button type="button" onClick={() => setShowPassword(prev => !prev)} className="h-10 rounded-md border border-slate-300 px-3">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={() => setPassword(createPassword())} className="h-10 rounded-md border border-slate-300 px-3">
                        <Key className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-cyan-600"
                        style={{ width: `${Math.max(20, passwordScore * 20)}%` }}
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" {...userForm.register('mustChangePassword')} />
                  Exigir cambio de contraseña
                </label>
              </div>

              <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
                <Save className="h-4 w-4" />
                {editingUserId ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </form>

            <div>
              <label className="relative mb-4 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar usuario, email, área..."
                  className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
              </label>

              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      {['Usuario', 'Rol/Perfil', 'Estado', 'Organización', 'Acciones'].map(header => (
                        <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-950">{user.name}</div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="block font-semibold text-slate-950">{roleLabel[user.role]}</span>
                          <span className="text-xs text-slate-500">{profileById.get(user.profileId)?.name ?? 'Sin perfil'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${statusClass[user.status]}`}>
                            {statusLabel[user.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          <span className="block font-semibold">{user.organization}</span>
                          <span className="text-xs text-slate-500">{user.area}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => editUser(user)} className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50" aria-label="Editar usuario">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => resetPassword(user)} className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50" aria-label="Resetear contraseña">
                              <Lock className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => onDeleteUser(user.id)} className="rounded-md border border-rose-200 p-2 text-rose-700 hover:bg-rose-50" aria-label="Eliminar usuario">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'profiles' && (
          <div className="grid gap-6 p-5 xl:grid-cols-[380px_1fr]">
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="rounded-md border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-950">{editingProfileId ? 'Editar perfil' : 'Crear perfil'}</h3>
                {editingProfileId && (
                  <button type="button" onClick={resetProfileForm} className="text-sm font-semibold text-slate-500">
                    Cancelar
                  </button>
                )}
              </div>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Nombre del perfil</span>
                <input {...profileForm.register('name', { required: true })} className={inputClass} />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-700">Descripción</span>
                <textarea
                  {...profileForm.register('description', { required: true })}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  rows={3}
                />
              </label>

              <div className="mt-4 space-y-4">
                {taskGroups.map(group => (
                  <fieldset key={group.label} className="rounded-md border border-slate-200 p-3">
                    <legend className="px-1 text-sm font-bold text-slate-700">{group.label}</legend>
                    <div className="mt-2 grid gap-2">
                      {group.tasks.map(task => (
                        <label key={task.id} className="flex items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" {...profileForm.register(`permissions.${task.id}`)} />
                          {task.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>

              <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
                <Shield className="h-4 w-4" />
                {editingProfileId ? 'Guardar perfil' : 'Crear perfil'}
              </button>
            </form>

            <div className="grid gap-4 md:grid-cols-2">
              {profiles.map(profile => (
                <article key={profile.id} className="rounded-md border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-950">{profile.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{profile.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => editProfile(profile)} className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50" aria-label="Editar perfil">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={profile.isSystem}
                        onClick={() => onDeleteProfile(profile.id)}
                        className="rounded-md border border-rose-200 p-2 text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Eliminar perfil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {profile.permissions.map(permission => (
                      <span key={permission} className="rounded bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">
                        {permission}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_340px]">
            <div className="rounded-md border border-slate-200 p-5">
              <h3 className="text-lg font-bold text-slate-950">Gestor de contraseñas</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Genera claves temporales para altas y reseteos. En producción esto debe enviarse por un canal seguro
                y almacenarse en backend con hash, nunca como texto plano.
              </p>
              <div className="mt-5 flex gap-2">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
                <button type="button" onClick={() => setShowPassword(prev => !prev)} className="rounded-md border border-slate-300 px-3">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => setPassword(createPassword())} className="rounded-md border border-slate-300 px-3">
                  <Key className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => navigator.clipboard?.writeText(password)} className="rounded-md border border-slate-300 px-3">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${Math.max(20, passwordScore * 20)}%` }} />
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-950 p-5 text-white">
              <Lock className="h-6 w-6 text-cyan-300" />
              <h3 className="mt-4 text-lg font-bold">Política recomendada</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>12 caracteres mínimos.</li>
                <li>Mayúsculas, minúsculas, números y símbolos.</li>
                <li>Cambio obligatorio en primer acceso.</li>
                <li>Reseteo solo para usuarios autorizados.</li>
                <li>Auditoría de cambios de perfil y accesos.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
