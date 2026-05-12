# Arquitectura — SIOSEC

Sistema de Inteligencia Operativa de Seguridad Ciudadana (MDPP).

## Taxonomía de módulos

Los módulos se clasifican en tres categorías según su relevancia para el negocio:

| Tipo | Descripción | Ejemplos |
|------|-------------|---------|
| **Core** | Capacidades principales del negocio, únicas de SIOSEC | Incidentes, Patrullajes, Inteligencia, Alertas |
| **Supporting** | Soporte al core, pero no diferenciadores | Notificaciones, Reportes, Exportaciones |
| **Generic** | Infraestructura reutilizable en cualquier sistema | Auth, Permisos, Archivos |

## Estructura de la aplicación

```
app/
├── Auth/                        ← [Generic] Autenticación y gestión de usuarios
│   ├── Actions/                 ← Casos de uso (CreateNewUser, ResetUserPassword)
│   ├── Concerns/                ← Traits de validación compartidos
│   ├── Models/                  ← User
│   └── Http/
│       ├── Controllers/
│       │   └── Settings/        ← ProfileController, SecurityController
│       └── Requests/
│           └── Settings/
│
│   [Core y Supporting — pendientes de implementar]
│   ── Incidentes/               ← [Core] gestión de incidentes
│   ── Patrullajes/              ← [Core] control de patrullaje
│   ── Agentes/                  ← [Core] personal de seguridad
│   ── Inteligencia/             ← [Core] análisis y reportes operativos
│   ── Notificaciones/           ← [Supporting]
│
├── Http/
│   ├── Controllers/
│   │   └── Controller.php       ← base controller (compartido)
│   └── Middleware/              ← HandleInertiaRequests, HandleAppearance
└── Providers/                   ← AppServiceProvider, FortifyServiceProvider
```

```
resources/js/
├── features/<modulo>/           ← lógica frontend del módulo
│   ├── components/
│   ├── hooks/
│   └── types/
├── pages/<Modulo>/              ← páginas Inertia (TitleCase)
├── pages/auth/                  ← páginas de auth (starter kit)
├── pages/settings/              ← configuración de usuario
├── components/                  ← componentes UI compartidos (shadcn/ui)
└── layouts/                     ← layouts de la app
```

## Anatomía de un módulo

```
app/NombreModulo/
├── Domain/
│   ├── Enums/          ← estados del dominio
│   ├── Exceptions/     ← errores de negocio
│   └── Services/       ← reglas que no pertenecen al modelo
├── Actions/            ← casos de uso (qué hace el usuario)
├── Events/             ← hechos ya ocurridos
├── Jobs/               ← trabajo asíncrono
├── Models/             ← persistencia Eloquent
├── Policies/           ← autorización
└── Http/
    ├── Controllers/
    ├── Requests/
    └── Resources/
```

## Flujo de una acción

```
Route → Controller → Action → DomainService → Model
                  ↘ Event → Listeners / Jobs
```

## Regla fundamental

**Presentación → Aplicación → Dominio**

El dominio no conoce HTTP, Inertia ni Eloquent. Los controladores no contienen lógica de negocio.

## Añadir un nuevo módulo

1. Crear `app/NombreModulo/` con las capas necesarias
2. Registrar su Policy en `AppServiceProvider` si aplica
3. Crear `routes/nombre-modulo.php` y `require` desde `routes/web.php`
4. Crear páginas en `resources/js/pages/NombreModulo/`
5. Crear tipos en `resources/js/features/nombre-modulo/types/`
