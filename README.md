# Control Combustibles Portuarios

Aplicacion SaaS para gestionar consumo de combustibles en equipos y vehiculos portuarios. La plataforma centraliza el registro maestro de equipos, abastecimientos, historial operativo, dashboard ejecutivo y administracion de usuarios/perfiles.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- React Hook Form
- Lucide React
- pnpm

## Modulos Principales

- **Login**: acceso a la plataforma con usuario y contrasena.
- **Dashboard**: KPIs ejecutivos, consumo por equipo y distribucion por combustible.
- **Equipos**: registro maestro de equipos y vehiculos portuarios.
- **Abastecer**: registro de cargas de combustible enlazadas al maestro de equipos.
- **Historial**: busqueda, filtros, paginacion y exportacion CSV.
- **Admin**: CRUD de usuarios, perfiles, permisos por tarea y gestor de contrasenas temporales.

## Credenciales Demo

```txt
Email: camila.rojas@puertonorte.cl
Contrasena: Admin123!
```

## Instalacion

```bash
pnpm install
```

## Desarrollo

```bash
pnpm run dev
```

La app quedara disponible normalmente en:

```txt
http://localhost:5173/
```

## Scripts

```bash
pnpm run dev      # Levanta Vite en modo desarrollo
pnpm run build    # Genera build de produccion
pnpm run lint     # Ejecuta ESLint
pnpm run preview  # Sirve el build generado
```

## Modelo Actual

La aplicacion trabaja con datos en memoria dentro del frontend. Incluye datos iniciales de ejemplo para:

- Equipos y vehiculos portuarios.
- Registros de abastecimiento.
- Usuarios SaaS.
- Perfiles y permisos.
- Contrasenas demo.

## Notas de Seguridad

El gestor de contrasenas actual es solo funcional para prototipo frontend. Para produccion se debe implementar:

- Backend con autenticacion real.
- Hash seguro de contrasenas.
- Tokens de sesion.
- Persistencia en base de datos.
- Auditoria de accesos y cambios administrativos.
- Politicas de recuperacion y rotacion de credenciales.

## Estado

Validado con:

```bash
pnpm run lint
pnpm run build
```
