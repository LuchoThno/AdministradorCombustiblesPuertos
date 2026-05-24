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

## Credenciales Demo

```txt
Email: camila.rojas@puertonorte.cl
Contrasena: Admin123!
```

## Scripts Disponibles

```bash
pnpm run dev
pnpm run build
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

Actualmente los datos se mantienen en memoria dentro del frontend.

## Seguridad

El login, usuarios, perfiles y gestor de contrasenas funcionan como prototipo frontend. Para un entorno productivo se recomienda implementar:

- Backend de autenticacion.
- Hash seguro de contrasenas.
- Tokens de sesion.
- Persistencia en base de datos.
- Control de permisos en backend.
- Auditoria de accesos.
- Recuperacion y rotacion segura de credenciales.

## Validacion

El proyecto fue validado con:

```bash
pnpm run lint
pnpm run build
```

## Roadmap Sugerido

- Persistencia con base de datos.
- API REST o GraphQL.
- Autenticacion real con JWT o sesiones seguras.
- Auditoria de cambios administrativos.
- Reportes por periodo, equipo y area.
- Alertas por consumo sobre meta.
- Multi-tenant por terminal portuario.
- Importacion masiva de equipos desde CSV.
- Exportacion avanzada a Excel/PDF.

## Estado del Proyecto

Prototipo funcional frontend para una plataforma SaaS de control de combustibles portuarios.
