export type FuelType = 'DIESEL' | 'GAS';

export type EquipmentType =
  | 'RTG'
  | 'REACH_STACKER'
  | 'MOBILE_CRANE'
  | 'TRUCK'
  | 'FORKLIFT'
  | 'GENERATOR'
  | 'OTHER';

export type EquipmentStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export type Equipment = {
  id: string;
  code: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  area: string;
  fuelType: FuelType;
  consumptionTarget: number;
  plate?: string;
  operator?: string;
  notes?: string;
};

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

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'OPERATOR' | 'VIEWER';

export type UserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organization: string;
  area: string;
  lastAccess?: Date;
};
