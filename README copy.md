# MÓDULO 6 — Guía de integración paso a paso

## ARCHIVOS QUE DEBES MODIFICAR/CREAR

### FRONTEND (en tu proyecto encomiendas-frontend/)

| Archivo | Acción |
|---|---|
| `.env` | CREAR en raíz |
| `.env.production` | CREAR en raíz |
| `src/api/axiosConfig.ts` | REEMPLAZAR |
| `src/api/endpoints/pagos.api.ts` | REEMPLAZAR |
| `src/utils/errorHandler.ts` | CREAR NUEVO |
| `src/pages/encomiendas/NuevaEncomiendaWizard.tsx` | REEMPLAZAR |

### BACKEND (en tu proyecto NestJS)

| Archivo | Acción |
|---|---|
| `src/main.ts` | REEMPLAZAR |
| `src/users/users.controller.ts` | CREAR NUEVO |
| `src/users/dto/update-profile.dto.ts` | CREAR NUEVO |
| `src/users/users.service.ts` | AGREGAR métodos (ver users.service.additions.ts) |
| `src/users/users.module.ts` | AGREGAR UsersController a controllers[] |

---

## PASO A PASO

### 1. Variables de entorno (frontend)

Crea `.env` en la raíz de tu frontend:
```
VITE_API_URL=http://localhost:3000
```
Crea `.env.production`:
```
VITE_API_URL=https://tu-dominio.com/api
```
Agrega al `.gitignore`:
```
.env
.env.production
```

---

### 2. Reemplaza axiosConfig.ts

Usa el archivo provisto. Cambia `baseURL` por `import.meta.env.VITE_API_URL`.

---

### 3. Crea src/utils/errorHandler.ts

Usa el archivo provisto. Luego en todos tus catch blocks reemplaza:
```ts
// ANTES
toast.error(error.response?.data?.message || 'Error')

// DESPUÉS
import { extractErrorMessage } from '../../utils/errorHandler'
toast.error(extractErrorMessage(error))
```

---

### 4. Habilita CORS en el backend

Reemplaza `src/main.ts` del backend con el archivo provisto.
Reinicia el servidor NestJS después.

---

### 5. Crea el módulo Users en el backend

#### 5a. Copia los archivos:
- `users.controller.ts` → `src/users/users.controller.ts`
- `update-profile.dto.ts` → `src/users/dto/update-profile.dto.ts`

#### 5b. Agrega estos métodos a tu `users.service.ts` existente:

```typescript
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';

async findAll(): Promise<User[]> {
  return this.userRepo.find({ where: { eliminadoEn: null } });
}

async findOneById(id: number): Promise<User> {
  const user = await this.userRepo.findOne({ where: { id, eliminadoEn: null } });
  if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
  return user;
}

async updateProfile(id: number, dto: UpdateProfileDto): Promise<User> {
  const user = await this.findOneById(id);
  Object.assign(user, dto);
  return this.userRepo.save(user);
}

async softDelete(id: number): Promise<void> {
  const user = await this.findOneById(id);
  user.eliminadoEn = new Date().toISOString();
  await this.userRepo.save(user);
}
```

#### 5c. Actualiza `users.module.ts` para exportar el controller:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';  // ← AGREGAR
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],  // ← AGREGAR
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

### 6. Activa @Auth en los controllers del backend

#### clientes.controller.ts
```typescript
@Controller('clientes')
@Auth(Role.USER)   // ← todos los roles ven clientes
export class ClientesController {
  // ...
  
  @Post()
  @Auth(Role.ADMIN)   // ← solo admin crea
  create() {}

  @Patch(':id')
  @Auth(Role.ADMIN)   // ← solo admin edita
  update() {}

  @Delete(':id')
  @Auth(Role.SUPER_ADMIN)   // ← solo super_admin borra
  remove() {}
}
```

#### sucursales.controller.ts
```typescript
@Controller('sucursales')
export class SucursalesController {
  @Get()
  @Auth(Role.USER)      // todos ven
  findAll() {}

  @Get(':id')
  @Auth(Role.USER)      // todos ven
  findOne() {}

  @Post()
  @Auth(Role.SUPER_ADMIN)   // solo super_admin crea/edita/borra
  create() {}

  @Patch(':id')
  @Auth(Role.SUPER_ADMIN)
  update() {}

  @Delete(':id')
  @Auth(Role.SUPER_ADMIN)
  remove() {}
}
```

#### consignatarios.controller.ts — igual que clientes

---

### 7. Reemplaza pagos.api.ts en el frontend

El endpoint `GET /pagos/metodos-pago` NO existe en el backend.
El archivo provisto usa una constante `METODOS_PAGO` local.
Importa así en el wizard:
```ts
import { createPago, METODOS_PAGO } from '../../api/endpoints/pagos.api'
```

---

### 8. Reemplaza NuevaEncomiendaWizard.tsx

Corrige dos bugs críticos:
- Sucursales se cargan al **montar** (no al hacer clic en el select)
- Métodos de pago usan la constante local (no llamada API)

---

## CHECKLIST DE PRUEBA (en orden)

```
[ ] 1. Backend arranca sin errores en puerto 3000
[ ] 2. Frontend arranca sin errores en puerto 5173
[ ] 3. GET http://localhost:3000/auth/profile con token válido → 200
[ ] 4. GET http://localhost:3000/users/me con token válido → 200
[ ] 5. Login funciona y redirige al dashboard
[ ] 6. Perfil carga datos reales del usuario
[ ] 7. Editar perfil guarda y muestra los cambios
[ ] 8. Módulo clientes: crear, listar, editar
[ ] 9. Módulo consignatarios: crear, listar
[ ] 10. Wizard paso 1: buscar cliente recién creado
[ ] 11. Wizard paso 2: dropdown sucursales cargado al abrir el paso
[ ] 12. Wizard paso 3: agregar ítems y ver total calculado
[ ] 13. Wizard paso 4: pago en origen con método de pago
[ ] 14. Encomienda aparece en la lista con nroGuia
[ ] 15. Detalle de encomienda muestra cliente, consignatario, ítems y pago
[ ] 16. PDF de factura se descarga con datos reales
[ ] 17. Dashboard muestra encomienda en los gráficos
```

---

## RESUMEN DE INCOHERENCIAS CORREGIDAS

| # | Problema | Solución |
|---|---|---|
| 1 | `GET /users/me` no existía en el backend | Creado `UsersController` |
| 2 | `GET /pagos/metodos-pago` no existía | Constante `METODOS_PAGO` en pagos.api.ts |
| 3 | Sucursales no se cargaban en el wizard | `useEffect` al montar el componente |
| 4 | CORS bloqueaba peticiones del frontend | `app.enableCors()` en main.ts |
| 5 | Catch blocks sin manejo de códigos HTTP | `extractErrorMessage()` centralizado |
| 6 | `axiosConfig.ts` hardcodeado a localhost | `import.meta.env.VITE_API_URL` |
