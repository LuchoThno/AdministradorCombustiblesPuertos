import React from 'react';
import { useForm } from 'react-hook-form';
import { Fuel, Droplet, User, MapPin, FileText } from 'lucide-react';
import type { FuelRecord } from '../types';

type FuelFormProps = {
  onSubmit: (data: Omit<FuelRecord, 'id'>) => void;
};

export default function FuelForm({ onSubmit }: FuelFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      timestamp: new Date(data.timestamp),
      quantity: parseFloat(data.quantity)
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Fuel className="mr-2" /> New Fuel Record
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date and Time
          </label>
          <input
            type="datetime-local"
            {...register('timestamp', { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.timestamp && <span className="text-red-500 text-sm">Required field</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Droplet className="inline-block w-4 h-4 mr-1" /> Fuel Type
          </label>
          <select
            {...register('fuelType', { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select fuel type</option>
            <option value="DIESEL">Diesel</option>
            <option value="GAS">Gas</option>
          </select>
          {errors.fuelType && <span className="text-red-500 text-sm">Required field</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Machine ID
          </label>
          <input
            type="text"
            {...register('machineId', { required: true })}
            placeholder="Enter machine ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.machineId && <span className="text-red-500 text-sm">Required field</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <div className="flex">
            <input
              type="number"
              step="0.01"
              {...register('quantity', { required: true, min: 0 })}
              placeholder="Enter quantity"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              {...register('unit', { required: true })}
              className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            >
              <option value="LITERS">Liters</option>
              <option value="GALLONS">Gallons</option>
            </select>
          </div>
          {errors.quantity && <span className="text-red-500 text-sm">Required field</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="inline-block w-4 h-4 mr-1" /> Operator
          </label>
          <input
            type="text"
            {...register('operator', { required: true })}
            placeholder="Enter operator name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.operator && <span className="text-red-500 text-sm">Required field</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline-block w-4 h-4 mr-1" /> Location
          </label>
          <input
            type="text"
            {...register('location', { required: true })}
            placeholder="Enter location"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.location && <span className="text-red-500 text-sm">Required field</span>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="inline-block w-4 h-4 mr-1" /> Notes
          </label>
          <textarea
            {...register('notes')}
            placeholder="Additional notes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => reset()}
          className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
}