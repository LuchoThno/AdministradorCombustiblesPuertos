<div align="center">

# ⛽ Control Combustibles Portuarios (SaaS)

**Plataforma SaaS multi-tenant para gestión de consumo de combustible en equipos y vehículos portuarios**

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-9-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47a248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

## 📌 Descripción

Aplicación completa (frontend + backend) para operar un **SaaS** de control de combustibles:

- **Multi-tenant** por `tenantId` (cada terminal/cliente ve solo sus datos).
- **Autenticación** con **JWT**.
- **Autorización** por **RBAC** basado en *permisos*.
- Persistencia en **MongoDB** (Mongoose).
- API **GraphQL (Apollo Server)**.
- Módulos operacionales:
  - Dashboard ejecutivo (KPIs)
  - Registro maestro de equipos
  - Registro de abastecimientos e historial
  - Reportes de consumo y alertas por meta
  - Administración SaaS (usuarios/perfiles/permisos)
  - Importación masiva de equipos desde CSV
  - Auditoría de acciones administrativas

---

## ✨ Funcionalidades principales

### Dashboard ejecutivo
- KPIs operacionales agregados desde registros de combustible.
- Consumo total, distribución por tipo (Diesel/Gas), equipos activos, promedio por despacho.

### Equipos (maestro)
- CRUD de equipos/vehículos.
- Campos clave: código, tipo, estado, área, combustible principal y meta de consumo.

### Historial de abastecimientos
- Consulta de `FuelRecord` con filtros en reportes (rango de fechas, equipo, área, combustible).

### Reportes
- `consumptionReport(filter)`:
  - Agrega consumo por equipo/área/combustible.
- `consumptionAlerts(filter)`:
  - Calcula varianza vs `consumptionTarget` y devuelve alertas (solo cuando la varianza es positiva).

### Administración SaaS (Security + RBAC)
- Gestión de:
  - Perfiles (`profiles` / `createProfile` / `updateProfile` / `deleteProfile`)
  - Usuarios (`users` / `createUser` / `updateUser` / `deleteUser`)
  - Reset de contraseñas con estados tipo *INVITED*
- RBAC: cada acción protegida requiere un permiso específico (ej. `admin:users`, `equipment:manage`, `history:view`).

### Auditoría
- Se registra en `AuditLog` acciones como LOGIN, CREATE/UPDATE/DELETE e IMPORT_CSV.

### Importación CSV
- `importEquipmentCsv(csv: String!)`:
  - Crea/actualiza equipos por `code`.
  - Campos esperados en CSV (por encabezados): `code,name,type,status,area,fuelType,consumptionTarget,plate,operator,notes`.

---

## 🧱 Arquitectura

- **Frontend**: React + TypeScript + Vite + Tailwind
  - Consume GraphQL con `fetch`.
  - Usa `VITE_GRAPHQL_URL` para definir la URL del endpoint.

- **Backend API**: Node + Apollo Server (GraphQL)
  - Definición de schema en `server/schema.ts`.
  - Implementación en `server/resolvers.ts`.
  - Autenticación/seguridad en `server/auth.ts`.

- **Base de datos**: MongoDB + Mongoose
  - Modelos en `server/models.ts`.

- **Multi-tenant**:
  - Todo query/mutación está filtrado por `tenantId`.
  - El `tenantId` proviene del JWT del usuario autenticado.

---

## 🔐 Autenticación y flujo de sesión

1. Login: se ejecuta el GraphQL mutation `login(input)`.
2. Backend valida credenciales (bcrypt) y firma un **JWT**.
3. El frontend guarda el token.
4. Para cada request GraphQL, se envía:

- Header: `Authorization: Bearer <token>`

El backend inyecta `context.user` y aplica RBAC con `requirePermission()`.

---

## 🧩 Permisos (RBAC)

Permisos actuales (definidos en `server/models.ts`):

- `dashboard:view`
- `equipment:view`
- `equipment:manage`
- `fuel:create`
- `history:view`
- `history:export`
- `admin:users`
- `admin:profiles`
- `admin:security`

---

## 🌐 Endpoints

### GraphQL
- URL por defecto: `http://localhost:4000/`

---

## ⚙️ Variables de entorno

En el backend (`server/config.ts`) se soportan:

- `PORT` (default: `4000`)
- `MONGODB_URI` (default: `mongodb://127.0.0.1:27017/port-fuel-management`)
- `JWT_SECRET` (default: `change-this-secret-in-production`)
- `JWT_EXPIRES_IN` (default: `8h`)
- `SEED_DEMO_DATA` (default: `true`)

En el frontend (`src/api/graphql.ts`) se soporta:

- `VITE_GRAPHQL_URL` (default: `http://localhost:4000/`)

---

## 🚀 Instalación y desarrollo

### 1) Instalar dependencias

```bash
pnpm install
```

### 2) Levantar frontend y API

**Opción recomendada (ambos):**

```bash
pnpm run dev:full
```

- `pnpm run dev:api`: arranca GraphQL + MongoDB seed opcional
- `pnpm run dev`: arranca la UI

### 3) Endpoints disponibles

- UI: `http://localhost:5173/`
- GraphQL: `http://localhost:4000/`

---

## 🧪 Credenciales demo (seed)

Si `SEED_DEMO_DATA=true`, se crearán usuarios de ejemplo.

```txt
Email: camila.rojas@puertonorte.cl
Contraseña: Admin123!
```

```txt
Email: diego.morales@puertonorte.cl
Contraseña: Supervisor123!
```

---

## 🧰 Scripts

```bash
pnpm run dev
pnpm run dev:api
pnpm run dev:full
pnpm run build
pnpm run build:api
pnpm run lint
pnpm run preview
pnpm run db:ping
```

---

## 📁 Estructura principal

```txt
server/
  auth.ts            # JWT + verificación + helpers requireAuth/requirePermission
  config.ts          # env/config del backend
  db.ts              # conexión Mongo
  index.ts           # arranque Apollo Server
  models.ts          # Mongoose models (Tenant/Profile/User/Equipment/FuelRecord/AuditLog)
  resolvers.ts       # lógica GraphQL + multi-tenant + RBAC
  schema.ts          # GraphQL schema/types
  seed.ts            # precarga de datos demo (multi-tenant)

src/
  api/graphql.ts     # cliente GraphQL y queries/mutations
  components/        # UI por módulo (Dashboard/Equipos/Historial/Admin)
  types/             # tipos TS compartidos
  App.tsx
  main.tsx
```

---

## 🗃️ Modelo de datos (resumen)

- **Tenant**: terminal/cliente SaaS.
- **Profile**: perfil administrativo (incluye permisos y flag `isSystem`).
- **User**: usuario, pertenece a un `tenantId` y tiene `profileId`.
- **Equipment**: equipo/vehículo con `consumptionTarget`.
- **FuelRecord**: registro de abastecimiento (timestamp, máquina, combustible, cantidad, etc.).
- **AuditLog**: auditoría de acciones.

---

## ✅ Validación

```bash
pnpm run lint
pnpm run build
pnpm run build:api
```

---

## 🧭 Roadmap sugerido

- Persistencia avanzada y optimización de consultas de reportes (agregaciones Mongo).
- Exportación avanzada a Excel/PDF.
- Alertas programadas (jobs) y notificaciones.
- Importación CSV validada (schema + errores por fila).
- Endurecer seguridad (rotación de JWT/refresh, rate limiting, CORS policies).

