import React from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, BadgeCheck, Factory, Plus, Save, Search, Truck } from 'lucide-react';
import type { Equipment, EquipmentStatus, EquipmentType } from '../types';

type EquipmentRegistryProps = {
  equipment: Equipment[];
  onAddEquipment: (equipment: Omit<Equipment, 'id'>) => void;
};

type EquipmentFormValues = Omit<Equipment, 'id' | 'consumptionTarget'> & {
  consumptionTarget: string;
};

const inputClass =
  'mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100';

const equipmentTypeLabel: Record<EquipmentType, string> = {
  RTG: 'Grua RTG',
  REACH_STACKER: 'Reach stacker',
  MOBILE_CRANE: 'Grua movil',
  TRUCK: 'Camion',
  FORKLIFT: 'Montacarga',
  GENERATOR: 'Generador',
  OTHER: 'Otro',
};

const statusLabel: Record<EquipmentStatus, string> = {
  ACTIVE: 'Activo',
  MAINTENANCE: 'Mantencion',
  INACTIVE: 'Inactivo',
};

const statusClass: Record<EquipmentStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  MAINTENANCE: 'bg-amber-50 text-amber-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
};

export default function EquipmentRegistry({ equipment, onAddEquipment }: EquipmentRegistryProps) {
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<EquipmentStatus | ''>('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EquipmentFormValues>({
    defaultValues: {
      type: 'RTG',
      status: 'ACTIVE',
      fuelType: 'DIESEL',
      consumptionTarget: '300',
    },
  });

  const filteredEquipment = equipment.filter(item => {
    const normalizedQuery = query.toLowerCase();
    const matchesQuery =
      item.code.toLowerCase().includes(normalizedQuery) ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.area.toLowerCase().includes(normalizedQuery) ||
      item.plate?.toLowerCase().includes(normalizedQuery);
    const matchesStatus = !status || item.status === status;

    return matchesQuery && matchesStatus;
  });

  const handleFormSubmit = (data: EquipmentFormValues) => {
    onAddEquipment({
      ...data,
      code: data.code.trim(),
      name: data.name.trim(),
      area: data.area.trim(),
      plate: data.plate?.trim() || undefined,
      operator: data.operator?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      consumptionTarget: parseFloat(data.consumptionTarget),
    });
    reset({
      type: 'RTG',
      status: 'ACTIVE',
      fuelType: 'DIESEL',
      consumptionTarget: '300',
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
            <Plus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-950">Alta de equipo o vehiculo</h2>
            <p className="text-sm text-slate-500">Maestro usado por consumo, historial y dashboard.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Codigo operacional</span>
            <input {...register('code', { required: true })} placeholder="Ej: RTG-06" className={inputClass} />
            {errors.code && <span className="mt-1 block text-xs font-medium text-red-600">Campo requerido</span>}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Nombre descriptivo</span>
            <input {...register('name', { required: true })} placeholder="Grua patio norte" className={inputClass} />
            {errors.name && <span className="mt-1 block text-xs font-medium text-red-600">Campo requerido</span>}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Tipo</span>
            <select {...register('type', { required: true })} className={inputClass}>
              {Object.entries(equipmentTypeLabel).map(([value, label]) => (
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
            <span className="text-sm font-semibold text-slate-700">Combustible principal</span>
            <select {...register('fuelType', { required: true })} className={inputClass}>
              <option value="DIESEL">Diesel</option>
              <option value="GAS">Gas</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Meta consumo por turno</span>
            <input
              type="number"
              min="0"
              step="0.01"
              {...register('consumptionTarget', { required: true, min: 0 })}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Area base</span>
            <input {...register('area', { required: true })} placeholder="Patio Contenedores A" className={inputClass} />
            {errors.area && <span className="mt-1 block text-xs font-medium text-red-600">Campo requerido</span>}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Patente / identificador</span>
            <input {...register('plate')} placeholder="Opcional" className={inputClass} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Responsable</span>
            <input {...register('operator')} placeholder="Turno o supervisor" className={inputClass} />
          </label>

          <label className="block sm:col-span-2 xl:col-span-1">
            <span className="text-sm font-semibold text-slate-700">Notas</span>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              placeholder="Condicion, restricciones o comentarios"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
        >
          <Save className="h-4 w-4" />
          Guardar equipo
        </button>
      </form>

      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Registro maestro</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Equipos y vehiculos portuarios</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                placeholder="Buscar equipo..."
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as EquipmentStatus | '')}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="MAINTENANCE">Mantencion</option>
              <option value="INACTIVE">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          {filteredEquipment.map(item => (
            <article key={item.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    {item.type === 'TRUCK' ? <Truck className="h-5 w-5" /> : <Factory className="h-5 w-5" />}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-950">{item.code}</h3>
                    <p className="text-sm text-slate-500">{item.name}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${statusClass[item.status]}`}>
                  {item.status === 'ACTIVE' ? <BadgeCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {statusLabel[item.status]}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">Tipo</dt>
                  <dd className="text-slate-950">{equipmentTypeLabel[item.type]}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Combustible</dt>
                  <dd className="text-slate-950">{item.fuelType}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Area</dt>
                  <dd className="text-slate-950">{item.area}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Meta turno</dt>
                  <dd className="text-slate-950">{item.consumptionTarget} L</dd>
                </div>
              </dl>
            </article>
          ))}

          {filteredEquipment.length === 0 && (
            <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 md:col-span-2">
              No hay equipos para los filtros seleccionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
