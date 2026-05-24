import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import type { Equipment, FuelRecord, FuelType } from '../types';

type FuelTableProps = {
  equipment: Equipment[];
  records: FuelRecord[];
  onExport: () => void;
};

const recordsPerPage = 8;

const formatNumber = (value: number) =>
  new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(value);

export default function FuelTable({ equipment, records, onExport }: FuelTableProps) {
  const [search, setSearch] = React.useState('');
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
  const [fuelType, setFuelType] = React.useState<FuelType | ''>('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const equipmentByCode = React.useMemo(
    () => new Map(equipment.map(item => [item.code, item])),
    [equipment]
  );

  const filteredRecords = records.filter(record => {
    const query = search.toLowerCase();
    const matchesSearch =
      record.machineId.toLowerCase().includes(query) ||
      record.operator.toLowerCase().includes(query) ||
      record.location.toLowerCase().includes(query) ||
      record.notes?.toLowerCase().includes(query) ||
      equipmentByCode.get(record.machineId)?.name.toLowerCase().includes(query);

    const matchesFuelType = !fuelType || record.fuelType === fuelType;

    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    endDate?.setHours(23, 59, 59, 999);

    const matchesDate =
      (!startDate || record.timestamp >= startDate) &&
      (!endDate || record.timestamp <= endDate);

    return matchesSearch && matchesFuelType && matchesDate;
  });

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const hasRecords = filteredRecords.length > 0;
  const firstResult = hasRecords ? (currentPage - 1) * recordsPerPage + 1 : 0;
  const lastResult = hasRecords ? Math.min(currentPage * recordsPerPage, filteredRecords.length) : 0;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, dateRange.start, dateRange.end, fuelType]);

  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Historial operacional</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Registros de abastecimiento</h2>
        </div>
        <button
          type="button"
          onClick={onExport}
          disabled={records.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-5 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar equipo, operador, zona..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          />
        </label>

        <select
          value={fuelType}
          onChange={(event) => setFuelType(event.target.value as FuelType | '')}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="">Todos los combustibles</option>
          <option value="DIESEL">Diesel</option>
          <option value="GAS">Gas</option>
        </select>

        <input
          type="date"
          value={dateRange.start}
          onChange={(event) => setDateRange(prev => ({ ...prev, start: event.target.value }))}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        />

        <input
          type="date"
          value={dateRange.end}
          onChange={(event) => setDateRange(prev => ({ ...prev, end: event.target.value }))}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-white">
            <tr>
              {['Fecha', 'Equipo', 'Tipo', 'Combustible', 'Cantidad', 'Operador', 'Ubicacion', 'Nota'].map(header => (
                <th key={header} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedRecords.length > 0 ? paginatedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {format(record.timestamp, 'yyyy-MM-dd HH:mm')}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950">
                  <span className="block">{record.machineId}</span>
                  <span className="block text-xs font-medium text-slate-500">
                    {equipmentByCode.get(record.machineId)?.name ?? 'No registrado'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {equipmentByCode.get(record.machineId)?.type ?? '-'}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm">
                  <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${
                    record.fuelType === 'DIESEL'
                      ? 'bg-cyan-50 text-cyan-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {record.fuelType}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950">
                  {formatNumber(record.quantity)} {record.unit === 'LITERS' ? 'L' : 'gal'}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {record.operator}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {record.location}
                </td>
                <td className="min-w-48 px-5 py-4 text-sm text-slate-500">
                  {record.notes || 'Sin observaciones'}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                  No hay registros para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Mostrando <span className="font-semibold text-slate-950">{firstResult}</span> -{' '}
          <span className="font-semibold text-slate-950">{lastResult}</span> de{' '}
          <span className="font-semibold text-slate-950">{filteredRecords.length}</span> registros
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || !hasRecords}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Pagina anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || !hasRecords}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Pagina siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
