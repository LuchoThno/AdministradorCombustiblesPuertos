export type FuelType = 'DIESEL' | 'GAS';

export type FuelRecord = {
  id: string;
  timestamp: Date;
  machineId: string;
  fuelType: FuelType;
  quantity: number;
  operator: string;
  unit: 'LITERS' | 'GALLONS';
  location: string;
  notes?: string;
};

export type User = {
  id: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR';
};