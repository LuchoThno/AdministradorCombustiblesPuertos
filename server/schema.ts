export const typeDefs = `#graphql
  type AuthPayload {
    token: String!
    user: User!
  }

  type Profile {
    id: ID!
    tenantId: ID!
    name: String!
    description: String!
    permissions: [String!]!
    isSystem: Boolean!
  }

  type User {
    id: ID!
    tenantId: ID!
    name: String!
    email: String!
    role: String!
    profileId: ID!
    profile: Profile
    status: String!
    organization: String!
    area: String!
    mustChangePassword: Boolean!
    lastAccess: String
  }

  type Equipment {
    id: ID!
    tenantId: ID!
    code: String!
    name: String!
    type: String!
    status: String!
    area: String!
    fuelType: String!
    consumptionTarget: Float!
    plate: String
    operator: String
    notes: String
  }

  type FuelRecord {
    id: ID!
    tenantId: ID!
    timestamp: String!
    machineId: String!
    equipment: Equipment
    fuelType: String!
    quantity: Float!
    operator: String!
    unit: String!
    location: String!
    notes: String
  }

  type AuditLog {
    id: ID!
    tenantId: ID
    actorId: ID
    action: String!
    entity: String!
    entityId: String
    metadata: String
    createdAt: String!
  }

  type DashboardReport {
    totalConsumption: Float!
    dieselConsumption: Float!
    gasConsumption: Float!
    activeEquipment: Int!
    totalEquipment: Int!
    records: Int!
  }

  type Tenant {
    id: ID!
    name: String!
    slug: String!
    status: String!
  }

  type ConsumptionReportRow {
    equipmentCode: String!
    equipmentName: String
    area: String!
    fuelType: String!
    totalQuantity: Float!
    records: Int!
  }

  type ConsumptionReport {
    rows: [ConsumptionReportRow!]!
    totalQuantity: Float!
    records: Int!
  }

  type ConsumptionAlert {
    equipmentCode: String!
    equipmentName: String
    totalQuantity: Float!
    target: Float!
    variance: Float!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ProfileInput {
    name: String!
    description: String!
    permissions: [String!]!
    isSystem: Boolean
  }

  input UserInput {
    name: String!
    email: String!
    password: String
    role: String!
    profileId: ID!
    status: String!
    organization: String!
    area: String!
    mustChangePassword: Boolean
  }

  input EquipmentInput {
    code: String!
    name: String!
    type: String!
    status: String!
    area: String!
    fuelType: String!
    consumptionTarget: Float!
    plate: String
    operator: String
    notes: String
  }

  input FuelRecordInput {
    timestamp: String!
    machineId: String!
    fuelType: String!
    quantity: Float!
    operator: String!
    unit: String!
    location: String!
    notes: String
  }

  input ReportFilterInput {
    from: String
    to: String
    equipmentCode: String
    area: String
    fuelType: String
  }

  type Query {
    me: User
    myTenant: Tenant
    profiles: [Profile!]!
    users: [User!]!
    equipment: [Equipment!]!
    fuelRecords: [FuelRecord!]!
    auditLogs: [AuditLog!]!
    dashboardReport: DashboardReport!
    consumptionReport(filter: ReportFilterInput): ConsumptionReport!
    consumptionAlerts(filter: ReportFilterInput): [ConsumptionAlert!]!
  }

  type Mutation {
    login(input: LoginInput!): AuthPayload!
    createProfile(input: ProfileInput!): Profile!
    updateProfile(id: ID!, input: ProfileInput!): Profile!
    deleteProfile(id: ID!): Boolean!
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): Boolean!
    resetPassword(id: ID!, password: String!): Boolean!
    createEquipment(input: EquipmentInput!): Equipment!
    updateEquipment(id: ID!, input: EquipmentInput!): Equipment!
    deleteEquipment(id: ID!): Boolean!
    createFuelRecord(input: FuelRecordInput!): FuelRecord!
    deleteFuelRecord(id: ID!): Boolean!
    importEquipmentCsv(csv: String!): Int!
  }
`;
