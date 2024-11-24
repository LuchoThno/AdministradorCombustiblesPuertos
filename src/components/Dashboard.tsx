import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Droplet, Truck, MapPin } from 'lucide-react';
import type { FuelRecord } from '../types';

type DashboardProps = {
  records: FuelRecord[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard({ records }: DashboardProps) {
  const totalDiesel = records
    .filter(r => r.fuelType === 'DIESEL')
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const totalGas = records
    .filter(r => r.fuelType === 'GAS')
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const consumptionByMachine = React.useMemo(() => {
    const consumption = records.reduce((acc, curr) => {
      if (!acc[curr.machineId]) {
        acc[curr.machineId] = { diesel: 0, gas: 0 };
      }
      if (curr.fuelType === 'DIESEL') {
        acc[curr.machineId].diesel += curr.quantity;
      } else {
        acc[curr.machineId].gas += curr.quantity;
      }
      return acc;
    }, {} as Record<string, { diesel: number; gas: number }>);

    return Object.entries(consumption).map(([machineId, data]) => ({
      machineId,
      ...data,
    }));
  }, [records]);

  const pieData = [
    { name: 'Diesel', value: totalDiesel },
    { name: 'Gas', value: totalGas },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Summary Cards */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <Droplet className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Diesel</p>
            <p className="text-lg font-semibold text-gray-900">{totalDiesel.toFixed(2)} L</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-full">
            <Droplet className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Gas</p>
            <p className="text-lg font-semibold text-gray-900">{totalGas.toFixed(2)} L</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Truck className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Machines</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Set(records.map(r => r.machineId)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumption by Machine</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consumptionByMachine}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="machineId" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="diesel" fill="#0088FE" name="Diesel" />
              <Bar dataKey="gas" fill="#00C49F" name="Gas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}