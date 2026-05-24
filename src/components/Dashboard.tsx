import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, AlertTriangle, Droplet, Gauge, ShipWheel, Truck } from 'lucide-react';
import type { Equipment, FuelRecord } from '../types';

type DashboardProps = {
  equipment: Equipment[];
  records: FuelRecord[];
};

const COLORS = ['#0891b2', '#16a34a'];

const formatNumber = (value: number) =>
  new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(value);

export default function Dashboard({ equipment, records }: DashboardProps) {
  const equipmentByCode = React.useMemo(
    () => new Map(equipment.map(item => [item.code, item])),
    [equipment]
  );

  const metrics = React.useMemo(() => {
    const total = records.reduce((acc, curr) => acc + curr.quantity, 0);
    const diesel = records
      .filter(record => record.fuelType === 'DIESEL')
      .reduce((acc, curr) => acc + curr.quantity, 0);
    const gas = records
      .filter(record => record.fuelType === 'GAS')
      .reduce((acc, curr) => acc + curr.quantity, 0);
    const activeMachines = new Set(records.map(record => record.machineId)).size;
    const averageDispatch = records.length > 0 ? total / records.length : 0;

    return { total, diesel, gas, activeMachines, averageDispatch };
  }, [records]);

  const consumptionByMachine = React.useMemo(() => {
    const consumption = records.reduce((acc, curr) => {
      if (!acc[curr.machineId]) {
        acc[curr.machineId] = { diesel: 0, gas: 0, total: 0 };
      }

      if (curr.fuelType === 'DIESEL') {
        acc[curr.machineId].diesel += curr.quantity;
      } else {
        acc[curr.machineId].gas += curr.quantity;
      }

      acc[curr.machineId].total += curr.quantity;
      return acc;
    }, {} as Record<string, { diesel: number; gas: number; total: number }>);

    return Object.entries(consumption)
      .map(([machineId, data]) => ({
        machineId,
        label: equipmentByCode.get(machineId)?.code ?? machineId,
        ...data,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [equipmentByCode, records]);

  const distributionData = [
    { name: 'Diesel', value: metrics.diesel },
    { name: 'Gas', value: metrics.gas },
  ].filter(item => item.value > 0);

  const topMachine = consumptionByMachine[0];
  const dieselShare = metrics.total > 0 ? Math.round((metrics.diesel / metrics.total) * 100) : 0;

  const kpis = [
    {
      label: 'Consumo total',
      value: `${formatNumber(metrics.total)} L`,
      detail: `${records.length} abastecimientos registrados`,
      icon: Droplet,
      color: 'bg-cyan-50 text-cyan-700',
    },
    {
      label: 'Equipos activos',
      value: `${metrics.activeMachines}/${equipment.length}`,
      detail: 'Con consumo vs. registrados',
      icon: Truck,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Promedio despacho',
      value: `${formatNumber(metrics.averageDispatch)} L`,
      detail: 'Litros por registro operacional',
      icon: Gauge,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Participacion diesel',
      value: `${dieselShare}%`,
      detail: 'Peso del diesel en el consumo',
      icon: Activity,
      color: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Dashboard ejecutivo</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Consumo y desempeno de equipos</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          {topMachine ? `${topMachine.label} concentra ${formatNumber(topMachine.total)} L` : 'Sin alertas activas'}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{item.value}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-md ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500">{item.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-950">Consumo por equipo</h3>
              <p className="text-sm text-slate-500">Ranking de equipos portuarios por litros despachados.</p>
            </div>
            <ShipWheel className="h-5 w-5 text-cyan-700" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionByMachine} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="diesel" stackId="fuel" fill="#0891b2" name="Diesel" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gas" stackId="fuel" fill="#16a34a" name="Gas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-950">Distribucion por combustible</h3>
          <p className="text-sm text-slate-500">Lectura rapida para planificacion de abastecimiento.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${formatNumber(value)} L`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-cyan-50 p-3">
              <p className="text-xs font-semibold uppercase text-cyan-700">Diesel</p>
              <p className="mt-1 text-xl font-bold text-slate-950">{formatNumber(metrics.diesel)} L</p>
            </div>
            <div className="rounded-md bg-emerald-50 p-3">
              <p className="text-xs font-semibold uppercase text-emerald-700">Gas</p>
              <p className="mt-1 text-xl font-bold text-slate-950">{formatNumber(metrics.gas)} L</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
