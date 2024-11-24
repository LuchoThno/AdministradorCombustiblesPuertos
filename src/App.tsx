import React from 'react';
import { Fuel } from 'lucide-react';
import FuelForm from './components/FuelForm';
import FuelTable from './components/FuelTable';
import Dashboard from './components/Dashboard';
import type { FuelRecord } from './types';

function App() {
  const [records, setRecords] = React.useState<FuelRecord[]>([]);

  const handleSubmit = (data: Omit<FuelRecord, 'id'>) => {
    const newRecord: FuelRecord = {
      ...data,
      id: crypto.randomUUID(),
    };
    setRecords(prev => [newRecord, ...prev]);
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Machine ID', 'Fuel Type', 'Quantity', 'Unit', 'Operator', 'Location', 'Notes'],
      ...records.map(r => [
        r.timestamp.toISOString(),
        r.machineId,
        r.fuelType,
        r.quantity,
        r.unit,
        r.operator,
        r.location,
        r.notes || '',
      ]),
    ]
      .map(row => row.join(','))
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
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Fuel className="mr-2" /> Administración Abastecimiento de Combustible
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Dashboard records={records} />
          <div className="mb-8">
            <FuelForm onSubmit={handleSubmit} />
          </div>
          <FuelTable records={records} onExport={handleExport} />
        </div>
      </main>
    </div>
  );
}

export default App;