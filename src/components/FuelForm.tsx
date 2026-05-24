import { useForm } from 'react-hook-form';
import { ClipboardPlus, Droplet, FileText, MapPin, RotateCcw, Save, Truck, User } from 'lucide-react';
import type { Equipment, FuelRecord } from '../types';

type FuelFormProps = {
  equipment: Equipment[];
  onSubmit: (data: Omit<FuelRecord, 'id'>) => void;
};

type FuelFormValues = Omit<FuelRecord, 'id' | 'timestamp' | 'quantity'> & {
  timestamp: string;
  quantity: string;
};

const inputClass =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100';

export default function FuelForm({ equipment, onSubmit }: FuelFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FuelFormValues>({
    defaultValues: {
      fuelType: 'DIESEL',
      unit: 'LITERS',
    },
  });

  const handleFormSubmit = (data: FuelFormValues) => {
    onSubmit({
      ...data,
      timestamp: new Date(data.timestamp),
      quantity: parseFloat(data.quantity),
      notes: data.notes?.trim() || undefined,
    });
    reset({ fuelType: 'DIESEL', unit: 'LITERS' });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="rounded-md border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-200">
          <ClipboardPlus className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">Nuevo abastecimiento</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Registra carga de combustible por equipo, turno y ubicacion. Estos datos alimentan el dashboard ejecutivo
          y el historial de consumo operacional.
        </p>
        <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-slate-300">
          <div className="flex items-center gap-3">
            <Truck className="h-4 w-4 text-cyan-300" />
            Equipos de patio, muelle y apoyo logistico
          </div>
          <div className="flex items-center gap-3">
            <Droplet className="h-4 w-4 text-cyan-300" />
            Diesel y gas con unidad controlada
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-cyan-300" />
            Trazabilidad por zona portuaria
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Fecha y hora</span>
            <input
              type="datetime-local"
              {...register('timestamp', { required: true })}
              className={inputClass}
            />
            {errors.timestamp && <span className="mt-1 block text-xs font-medium text-red-600">Campo requerido</span>}
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Droplet className="h-4 w-4 text-cyan-700" />
              Combustible
            </span>
            <select {...register('fuelType', { required: true })} className={inputClass}>
              <option value="DIESEL">Diesel</option>
              <option value="GAS">Gas</option>
            </select>
            {errors.fuelType && <span className="mt-1 block text-xs font-medium text-red-600">Campo requerido</span>}
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Truck className="h-4 w-4 text-cyan-700" />
              Equipo
            </span>
            <select {...register('machineId', { required: true })} className={inputClass}>
              <option value="">Seleccionar equipo</option>
              {equipment.map(item => (
                <option key={item.id} value={item.code}>
                  {item.code} - {item.name}
                </option>
              ))}
            </select>
            {errors.machineId && <span className="mt-1 block text-xs font-medium text-red-600">Campo requerido</span>}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Cantidad</span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('quantity', { required: true, min: 0 })}
              placeholder="0"
              className={inputClass}
            />
            {errors.quantity && <span className="mt-1 block text-xs font-medium text-red-600">Ingrese un valor valido</span>}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Unidad</span>
            <select {...register('unit', { required: true })} className={inputClass}>
              <option value="LITERS">Litros</option>
              <option value="GALLONS">Galones</option>
            </select>
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="h-4 w-4 text-cyan-700" />
              Operador / turno
            </span>
            <input
              type="text"
              {...register('operator', { required: true })}
              placeholder="Ej: Turno Norte"
              className={inputClass}
            />
            {errors.operator && <span className="mt-1 block text-xs font-medium text-red-600">Campo requerido</span>}
          </label>

          <label className="block md:col-span-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin className="h-4 w-4 text-cyan-700" />
              Ubicacion operacional
            </span>
            <input
              type="text"
              {...register('location', { required: true })}
              placeholder="Ej: Patio Contenedores A"
              className={inputClass}
            />
            {errors.location && <span className="mt-1 block text-xs font-medium text-red-600">Campo requerido</span>}
          </label>

          <label className="block md:col-span-2 xl:col-span-1">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="h-4 w-4 text-cyan-700" />
              Observaciones
            </span>
            <textarea
              {...register('notes')}
              placeholder="Novedades del abastecimiento"
              className={`${inputClass} min-h-10 resize-y`}
              rows={1}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => reset({ fuelType: 'DIESEL', unit: 'LITERS' })}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
          >
            <Save className="h-4 w-4" />
            Guardar registro
          </button>
        </div>
      </form>
    </div>
  );
}
