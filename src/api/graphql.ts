import type { AdminProfile, Equipment, FuelRecord, User } from '../types';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/';

type GraphQLError = {
  message: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

async function graphqlRequest<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
  query: string,
  variables?: TVariables,
  token?: string
) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json() as GraphQLResponse<TData>;

  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message ?? 'GraphQL request failed');
  }

  if (!payload.data) {
    throw new Error('GraphQL response did not include data');
  }

  return payload.data;
}

const userFields = `
  id
  tenantId
  name
  email
  role
  profileId
  status
  organization
  area
  mustChangePassword
  lastAccess
`;

const profileFields = `
  id
  tenantId
  name
  description
  permissions
  isSystem
`;

const equipmentFields = `
  id
  tenantId
  code
  name
  type
  status
  area
  fuelType
  consumptionTarget
  plate
  operator
  notes
`;

const fuelRecordFields = `
  id
  tenantId
  timestamp
  machineId
  fuelType
  quantity
  operator
  unit
  location
  notes
`;

type ApiUser = Omit<User, 'lastAccess'> & { lastAccess?: string | null };
type ApiFuelRecord = Omit<FuelRecord, 'timestamp'> & { timestamp: string };

function mapUser(user: ApiUser): User {
  return {
    ...user,
    lastAccess: user.lastAccess ? new Date(user.lastAccess) : undefined,
  };
}

function mapFuelRecord(record: ApiFuelRecord): FuelRecord {
  return {
    ...record,
    timestamp: new Date(record.timestamp),
  };
}

export type AppBootstrap = {
  currentUser: User;
  profiles: AdminProfile[];
  users: User[];
  equipment: Equipment[];
  records: FuelRecord[];
};

export async function login(email: string, password: string) {
  const data = await graphqlRequest<{
    login: {
      token: string;
      user: ApiUser;
    };
  }, { input: { email: string; password: string } }>(
    `mutation Login($input: LoginInput!) {
      login(input: $input) {
        token
        user { ${userFields} }
      }
    }`,
    { input: { email, password } }
  );

  return {
    token: data.login.token,
    user: mapUser(data.login.user),
  };
}

export async function loadAppData(token: string): Promise<AppBootstrap> {
  const data = await graphqlRequest<{
    me: ApiUser;
    profiles: AdminProfile[];
    users: ApiUser[];
    equipment: Equipment[];
    fuelRecords: ApiFuelRecord[];
  }>(
    `query LoadAppData {
      me { ${userFields} }
      profiles { ${profileFields} }
      users { ${userFields} }
      equipment { ${equipmentFields} }
      fuelRecords { ${fuelRecordFields} }
    }`,
    undefined,
    token
  );

  return {
    currentUser: mapUser(data.me),
    profiles: data.profiles,
    users: data.users.map(mapUser),
    equipment: data.equipment,
    records: data.fuelRecords.map(mapFuelRecord),
  };
}

export async function createEquipment(token: string, input: Omit<Equipment, 'id' | 'tenantId'>) {
  await graphqlRequest<{ createEquipment: { id: string } }, { input: Omit<Equipment, 'id' | 'tenantId'> }>(
    `mutation CreateEquipment($input: EquipmentInput!) {
      createEquipment(input: $input) { id }
    }`,
    { input },
    token
  );
}

export async function createFuelRecord(token: string, input: Omit<FuelRecord, 'id' | 'tenantId'>) {
  await graphqlRequest<{ createFuelRecord: { id: string } }, { input: Omit<FuelRecord, 'id' | 'tenantId' | 'timestamp'> & { timestamp: string } }>(
    `mutation CreateFuelRecord($input: FuelRecordInput!) {
      createFuelRecord(input: $input) { id }
    }`,
    { input: { ...input, timestamp: input.timestamp.toISOString() } },
    token
  );
}

export async function createUser(token: string, input: Omit<User, 'id' | 'tenantId' | 'lastAccess'>, password: string) {
  await graphqlRequest<{ createUser: { id: string } }, { input: Omit<User, 'id' | 'tenantId' | 'lastAccess'> & { password: string } }>(
    `mutation CreateUser($input: UserInput!) {
      createUser(input: $input) { id }
    }`,
    { input: { ...input, password } },
    token
  );
}

export async function updateUser(token: string, id: string, input: Omit<User, 'id' | 'tenantId' | 'lastAccess'>) {
  await graphqlRequest<{ updateUser: { id: string } }, { id: string; input: Omit<User, 'id' | 'tenantId' | 'lastAccess'> }>(
    `mutation UpdateUser($id: ID!, $input: UserInput!) {
      updateUser(id: $id, input: $input) { id }
    }`,
    { id, input },
    token
  );
}

export async function deleteUser(token: string, id: string) {
  await graphqlRequest<{ deleteUser: boolean }, { id: string }>(
    `mutation DeleteUser($id: ID!) {
      deleteUser(id: $id)
    }`,
    { id },
    token
  );
}

export async function resetPassword(token: string, id: string, password: string) {
  await graphqlRequest<{ resetPassword: boolean }, { id: string; password: string }>(
    `mutation ResetPassword($id: ID!, $password: String!) {
      resetPassword(id: $id, password: $password)
    }`,
    { id, password },
    token
  );
}

export async function createProfile(token: string, input: Omit<AdminProfile, 'id' | 'tenantId'>) {
  await graphqlRequest<{ createProfile: { id: string } }, { input: Omit<AdminProfile, 'id' | 'tenantId'> }>(
    `mutation CreateProfile($input: ProfileInput!) {
      createProfile(input: $input) { id }
    }`,
    { input },
    token
  );
}

export async function updateProfile(token: string, id: string, input: Omit<AdminProfile, 'id' | 'tenantId'>) {
  await graphqlRequest<{ updateProfile: { id: string } }, { id: string; input: Omit<AdminProfile, 'id' | 'tenantId'> }>(
    `mutation UpdateProfile($id: ID!, $input: ProfileInput!) {
      updateProfile(id: $id, input: $input) { id }
    }`,
    { id, input },
    token
  );
}

export async function deleteProfile(token: string, id: string) {
  await graphqlRequest<{ deleteProfile: boolean }, { id: string }>(
    `mutation DeleteProfile($id: ID!) {
      deleteProfile(id: $id)
    }`,
    { id },
    token
  );
}
