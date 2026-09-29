# FiberMap

FiberMap es un sistema profesional e independiente de gestión, documentación, diseño y visualización de redes de fibra óptica (FTTH/GPON/XGS-PON).

## Requisitos

- Node.js (v20+)
- Docker y Docker Compose
- PostgreSQL 15 + PostGIS (vía Docker)

## Inicio Rápido (Fase 1)

1. Iniciar infraestructura (Base de datos, Redis, MinIO):
   ```bash
   docker compose up -d
   ```

2. Configurar variables de entorno:
   Copiar `.env.example` a `backend/.env` y `frontend/.env`.

3. Instalar dependencias e iniciar el backend:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run start:dev
   ```

4. Instalar dependencias e iniciar el frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Arquitectura Base
- **Backend**: NestJS, Prisma, PostgreSQL + PostGIS.
- **Frontend**: React, Vite, MapLibre GL JS, Zustand.
- **Infraestructura**: Docker (MinIO, Redis).
