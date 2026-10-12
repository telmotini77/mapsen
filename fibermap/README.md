# FiberMap

Sistema de gestión, diseño y visualización de redes de fibra óptica.

## Ejecutar con Docker

Desde esta carpeta, con Docker Desktop iniciado:

```bash
docker compose up -d --build
docker compose exec backend npx prisma db push --skip-generate
docker compose exec backend npm run seed
```

Aplicación: http://localhost:5173
API: http://localhost:3000
Usuario inicial: `admin@fibermap.local`, contraseña: `Admin123!`.
El seed conserva los usuarios existentes. Cambia la contraseña después del primer acceso.

El backend se compila en la imagen. Los comandos de inicialización del esquema y seed son solo para una base nueva; omítelos si restauraste un respaldo. El arranque no modifica el esquema de la base restaurada. PostgreSQL/PostGIS y Redis conservan sus datos en volúmenes Docker.

```bash
docker compose logs -f backend
docker compose stop
docker compose up -d
```

Después de cambiar código, ejecuta `docker compose up -d --build`.

MinIO es opcional y la aplicación actual no lo utiliza. Está bajo el perfil `storage`: `docker compose --profile storage up -d`. Su registro actualmente rechaza la descarga con HTTP 401; no es necesario para iniciar la aplicación.

## Arquitectura

- Backend: NestJS, Prisma, PostgreSQL y PostGIS.
- Frontend: React, Vite y MapLibre GL JS.
- Infraestructura: Docker Compose y Redis.

