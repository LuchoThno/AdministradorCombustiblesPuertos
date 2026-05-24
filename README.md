# Control Combustibles Portuarios

Plataforma SaaS para gestionar el consumo de combustibles en equipos y vehiculos portuarios. El sistema centraliza equipos, abastecimientos, historial operativo, dashboard ejecutivo y administracion de usuarios con perfiles y permisos.

## Vista General

Esta aplicacion esta pensada para operaciones portuarias que necesitan controlar el consumo de combustible por equipo, turno, area y tipo de combustible.

Permite registrar abastecimientos, consultar consumos, administrar equipos y gestionar accesos de usuarios desde una interfaz modular por ventanas.

## Caracteristicas

- Login de acceso a la plataforma.
- Dashboard ejecutivo con KPIs operacionales.
- Registro maestro de equipos y vehiculos.
- Registro de abastecimientos enlazado a equipos.
- Historial con busqueda, filtros, paginacion y exportacion CSV.
- Modulo de administracion SaaS.
- CRUD de usuarios.
- CRUD de perfiles de acceso.
- Permisos por tarea.
- Gestor de contrasenas temporales.
- Datos demo precargados para revisar la plataforma sin backend.
- Frontend conectado a la API GraphQL para login, usuarios, perfiles, equipos y registros.

## Modulos

### Dashboard

Visualiza indicadores clave:

- Consumo total.
- Equipos activos.
- Promedio por despacho.
- Participacion por tipo de combustible.
- Ranking de consumo por equipo.
- Distribucion Diesel / Gas.

### Equipos

Registro maestro para equipos y vehiculos portuarios:

- Codigo operacional.
- Nombre del equipo.
- Tipo de equipo.
- Estado.
- Area base.
- Combustible principal.
- Meta de consumo por turno.
- Responsable y observaciones.

### Abastecer

Formulario para registrar cargas de combustible:

- Fecha y hora.
- Equipo registrado.
- Tipo de combustible.
- Cantidad.
- Unidad.
- Operador o turno.
- Ubicacion operacional.
- Observaciones.

### Historial

Consulta operativa de abastecimientos:

- Busqueda por equipo, operador, ubicacion o notas.
- Filtro por combustible.
- Filtro por rango de fechas.
- Paginacion.
- Exportacion CSV.

### Administracion

Modulo SaaS para gestion de usuarios y seguridad:

- Crear, editar y eliminar usuarios.
- Crear, editar y eliminar perfiles.
- Asignar perfiles a usuarios.
- Asignar permisos por tarea.
- Resetear contrasenas.
- Generar contrasenas temporales.
- Control de estados: activo, invitado y suspendido.

## Stack Tecnico

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- React Hook Form
- Lucide React
- pnpm
- Apollo Server
- GraphQL
- MongoDB / Mongoose
- JWT
- bcryptjs

## Requisitos

- Node.js 18 o superior.
- pnpm instalado.

## Instalacion

```bash
pnpm install
```

## Ejecutar en Desarrollo

```bash
pnpm run dev
```

La aplicacion quedara disponible en:

```txt
http://localhost:5173/
```

## Backend GraphQL

El proyecto incluye una primera base backend en `server/` con:

- Apollo Server.
- GraphQL.
- MongoDB con Mongoose.
- Autenticacion JWT.
- Hash de contrasenas con bcrypt.
- Auditoria de acciones administrativas.
- Aislamiento multi-tenant por terminal portuario.
- CRUD de usuarios, perfiles, equipos y abastecimientos.
- Reportes de consumo con filtros.
- Alertas por consumo sobre meta.
- Importacion CSV basica de equipos.

Configura las variables de entorno copiando `.env.example`:

```bash
cp .env.example .env
```

Ejecuta solo la API:

```bash
pnpm run dev:api
```

La API GraphQL queda disponible en:

```txt
http://localhost:4000/
```

El frontend consume la API mediante:

```txt
VITE_GRAPHQL_URL=http://localhost:4000/
```

Ejecuta frontend y API juntos:

```bash
pnpm run dev:full
```

Prueba la conexion a MongoDB:

```bash
pnpm run db:ping
```

Para MongoDB Atlas, configura `MONGODB_URI` en `.env` reemplazando `<db_password>` por la contrasena real del usuario de base de datos. No subas `.env` al repositorio.

## Credenciales Demo

```txt
Email: camila.rojas@puertonorte.cl
Contrasena: Admin123!
```

## Scripts Disponibles

```bash
pnpm run dev
pnpm run dev:api
pnpm run dev:full
pnpm run db:ping
pnpm run build
pnpm run build:api
pnpm run lint
pnpm run preview
```

## Estructura Principal

```txt
src/
  App.tsx
  components/
    AdminUsers.tsx
    Dashboard.tsx
    EquipmentRegistry.tsx
    FuelForm.tsx
    FuelTable.tsx
  types/
    index.ts
server/
  auth.ts
  audit.ts
  config.ts
  db.ts
  index.ts
  models.ts
  resolvers.ts
  schema.ts
  seed.ts
```

## Modelo de Datos

La aplicacion incluye tipos para:

- Equipos.
- Estados de equipos.
- Registros de combustible.
- Usuarios.
- Roles.
- Perfiles administrativos.
- Permisos por tarea.

El frontend consume la API GraphQL y mantiene el estado en memoria solo como cache de UI durante la sesion. La persistencia real queda en MongoDB.

## Seguridad

El backend incorpora JWT y hash de contrasenas. Para un entorno productivo se recomienda reforzar:

- Rotacion de `JWT_SECRET`.
- Refresh tokens o sesiones seguras.
- Rate limiting en login.
- Control de permisos exhaustivo en backend.
- Auditoria ampliada de accesos.
- Recuperacion y rotacion segura de credenciales.

## Validacion

El proyecto fue validado con:

```bash
pnpm run lint
pnpm run build
pnpm run build:api
```

## Roadmap Sugerido

- [x] Persistencia con MongoDB.
- [x] API GraphQL.
- [x] Autenticacion con JWT.
- [x] Hash de contrasenas.
- [x] Auditoria de cambios administrativos.
- [x] Reportes por periodo, equipo y area.
- [x] Alertas por consumo sobre meta.
- [x] Importacion basica de equipos desde CSV.
- [x] Multi-tenant por terminal portuario con aislamiento por tenant en backend.
- [x] Conectar frontend al backend GraphQL.
- [ ] Exportacion avanzada a Excel/PDF.
- [ ] Recuperacion de contrasena por email.
- [ ] Tests automatizados de API y UI.

## Estado del Proyecto

Prototipo funcional frontend con base backend GraphQL/MongoDB para evolucionar a SaaS productivo.
