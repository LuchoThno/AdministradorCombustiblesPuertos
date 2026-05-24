<div align="center">

# ⛽ Control Combustibles Portuarios

**Plataforma SaaS para gestión de combustibles en equipos y vehículos portuarios**

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-9-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)

</div>

---

## 📌 Descripción

Sistema pensado para operaciones portuarias que necesitan controlar el consumo de combustible por equipo, turno, área y tipo de combustible. Centraliza equipos, abastecimientos, historial operativo, dashboard ejecutivo y administración de usuarios con perfiles y permisos desde una interfaz modular por ventanas.

> **⚠️ Estado actual:** prototipo funcional con datos en memoria. Sin backend ni persistencia en base de datos.

---

## 🧩 Módulos

| Módulo | Descripción |
|---|---|
| 🔐 **Login** | Acceso a la plataforma con usuario y contraseña |
| 📊 **Dashboard** | KPIs operacionales, ranking de consumo y distribución por tipo de combustible |
| 🚛 **Equipos** | Registro maestro de equipos y vehículos portuarios |
| ⛽ **Abastecer** | Registro de cargas de combustible enlazadas a equipos |
| 📋 **Historial** | Búsqueda, filtros por fecha y combustible, paginación y exportación CSV |
| 🛠️ **Admin** | CRUD de usuarios y perfiles, permisos por tarea y gestor de contraseñas temporales |

---

## 📊 Dashboard — Indicadores

- Consumo total del período
- Equipos activos
- Promedio por despacho
- Participación por tipo de combustible
- Ranking de consumo por equipo
- Distribución Diesel / Gas

---

## 🚛 Ficha de Equipo

Cada equipo registra:

- Código operacional y nombre
- Tipo, estado y área base
- Combustible principal
- Meta de consumo por turno
- Responsable y observaciones

---

## ⛽ Registro de Abastecimiento

Cada carga registra:

- Fecha, hora y ubicación operacional
- Equipo, tipo de combustible y cantidad
- Operador o turno
- Observaciones

---

## 🛠️ Stack

| Categoría | Tecnología |
|---|---|
| Framework UI | React 18 |
| Lenguaje | TypeScript |
| Bundler | Vite |
| Estilos | Tailwind CSS |
| Gráficos | Recharts |
| Formularios | React Hook Form |
| Iconos | Lucide React |
| Gestor de paquetes | pnpm |

---

## 📁 Estructura

```
src/
├── App.tsx
├── components/
│   ├── Dashboard.tsx
│   ├── EquipmentRegistry.tsx
│   ├── FuelForm.tsx
│   ├── FuelTable.tsx
│   └── AdminUsers.tsx
└── types/
    └── index.ts
```

---

## ⚙️ Requisitos

- **Node.js** `>= 18`
- **pnpm** instalado globalmente

---

## 🚀 Instalación y Desarrollo

```bash
# Instalar dependencias
pnpm install

# Modo desarrollo
pnpm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 📜 Scripts

| Comando | Descripción |
|---|---|
| `pnpm run dev` | Levanta Vite en modo desarrollo |
| `pnpm run build` | Genera build de producción |
| `pnpm run preview` | Sirve el build generado localmente |
| `pnpm run lint` | Ejecuta ESLint |

---

## 🔑 Credenciales Demo

```
Email:      camila.rojas@puertonorte.cl
Contraseña: Admin123!
```

> Los datos demo están precargados en memoria para revisar la plataforma sin necesidad de backend.

---

## ⚠️ Seguridad — Pendiente para Producción

El login, usuarios, perfiles y gestor de contraseñas son funcionales solo como prototipo frontend. Antes de producción implementar:

- [ ] Backend con autenticación real
- [ ] Hash seguro de contraseñas (bcrypt / argon2)
- [ ] Tokens de sesión (JWT / cookies `httpOnly`)
- [ ] Control de permisos en backend
- [ ] Persistencia en base de datos
- [ ] Auditoría de accesos y cambios administrativos
- [ ] Políticas de recuperación y rotación de credenciales

---

## 🗺️ Roadmap

- [ ] Persistencia con base de datos
- [ ] API REST o GraphQL
- [ ] Autenticación real con JWT o sesiones seguras
- [ ] Reportes por período, equipo y área
- [ ] Alertas por consumo sobre meta
- [ ] Multi-tenant por terminal portuario
- [ ] Importación masiva de equipos desde CSV
- [ ] Exportación avanzada a Excel / PDF

---

## ✅ Validación

```bash
pnpm run lint && pnpm run build
```

---

<div align="center">

Desarrollado para gestión portuaria de combustibles · Prototipo frontend

</div>
