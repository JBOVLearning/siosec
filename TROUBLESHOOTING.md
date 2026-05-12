# Soluciones a errores comunes

## 1. Build falla con `UNLOADABLE_DEPENDENCY` en archivos Wayfinder

**Síntoma:**
```
[UNLOADABLE_DEPENDENCY] Error: Could not load /resources/js/actions/App/Http/Controllers/Settings/SomeController
```

Además aparece el warning:
```
[plugin builtin:vite-alias] rewrote @/actions/... to /resources/js/actions/... but was not an absolute path
```

**Causa:**  
El import en el archivo TSX apunta a una ruta de Wayfinder que no existe porque el namespace del controlador PHP difiere del path importado. Wayfinder genera los archivos según el namespace real del controlador (por ejemplo `App\Auth\Http\Controllers\...`), pero el import usa una ruta diferente (por ejemplo `App\Http\Controllers\...`).

**Solución:**  
1. Buscar el archivo generado por Wayfinder en `resources/js/actions/` con el nombre del controlador:
   ```powershell
   Get-ChildItem -Recurse resources/js/actions/ -Filter "SomeController.ts"
   ```
2. Copiar la ruta real del archivo encontrado.
3. Corregir el import en el archivo TSX para que coincida con la ruta real:
   ```ts
   // Incorrecto
   import SomeController from '@/actions/App/Http/Controllers/Settings/SomeController';
   // Correcto (según namespace real)
   import SomeController from '@/actions/App/Auth/Http/Controllers/Settings/SomeController';
   ```
4. Repetir para todos los archivos que importen ese controlador (buscar con Grep).
5. Volver a correr `npm run build`.

**Prevención:**  
Cuando Wayfinder regenera los tipos (`php artisan wayfinder:generate` o via `npm run dev`), verificar que los imports en los TSX coincidan con la ruta generada. Si se cambia el namespace de un controlador PHP, actualizar todos los imports correspondientes.

---

## 2. Build falla con `ViteException: Unable to locate file in Vite manifest`

**Síntoma (en Laravel, navegador o tests):**
```
Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest: resources/js/app.tsx
```

**Causa:**  
Los assets del frontend no han sido compilados, o el manifest de Vite está desactualizado.

**Solución:**  
Compilar los assets:
```bash
npm run build
```
O, si está en desarrollo, asegurarse de tener el servidor de Vite corriendo:
```bash
composer run dev
# o
npm run dev
```

---

## 3. `php artisan test` falla por migraciones no aplicadas

**Síntoma:**
```
SQLSTATE[HY000]: General error: 1 no such table: users
```

**Causa:**  
La base de datos de tests no tiene las migraciones aplicadas, o se modificó una migración sin actualizar el esquema.

**Solución:**  
```bash
php artisan migrate:fresh --env=testing
# o simplemente correr los tests (RefreshDatabase lo hace automáticamente)
php artisan test --compact
```

---

## 4. Wayfinder no genera los tipos actualizados

**Síntoma:**  
Se crea un nuevo controlador o ruta pero no aparece en `resources/js/actions/` o `resources/js/routes/`.

**Causa:**  
Wayfinder genera los tipos en tiempo de build (vía Vite) o mediante el comando artisan. Si se crean rutas/controladores nuevos sin reiniciar el servidor de desarrollo, los tipos no se actualizan.

**Solución:**  
```bash
php artisan wayfinder:generate
# o reiniciar el servidor de desarrollo
composer run dev
```

---

## 5. Errores de TypeScript en imports de Wayfinder tras reorganizar controladores

**Síntoma:**
```
Cannot find module '@/actions/App/Http/Controllers/...' or its corresponding type declarations.
```

**Causa:**  
Se movió o renombró un controlador PHP y Wayfinder regeneró los tipos con la nueva ruta, pero los imports TSX siguen apuntando a la ruta antigua.

**Solución:**  
1. Regenerar los tipos: `php artisan wayfinder:generate`
2. Buscar todos los imports desactualizados:
   ```powershell
   Select-String -Path "resources/js/**/*.tsx" -Pattern "NombreControladorAntiguo"
   ```
3. Actualizar cada import con la nueva ruta generada por Wayfinder.

---

## 6. Cambios en el frontend no se reflejan en el navegador

**Síntoma:**  
Se modifica un componente React pero el navegador muestra la versión antigua.

**Causa:**  
El servidor de desarrollo Vite no está corriendo, o se está sirviendo el build de producción desactualizado.

**Solución:**  
- En desarrollo: `composer run dev` (inicia Laravel + Vite + Queue en paralelo)
- En producción: `npm run build` para recompilar los assets

---

## 7. Errores de Pint (formato PHP)

**Síntoma:**
```
FAIL  app/Http/Controllers/SomeController.php
```

**Causa:**  
El código PHP no sigue el estilo del proyecto (PSR-12 con reglas de Laravel Pint).

**Solución:**  
```bash
vendor/bin/pint --dirty --format agent
```
Pint corrige automáticamente todos los archivos modificados. No usar `--test`, ejecutar directamente para aplicar las correcciones.

---

## 8. Error de locale: mensajes de validación en inglés

**Síntoma:**  
Los mensajes de error de validación aparecen en inglés aunque el proyecto es en español.

**Causa:**  
`APP_LOCALE` no está configurado o el fallback en `config/app.php` sigue en `'en'`.

**Solución:**  
1. Verificar `.env`:
   ```
   APP_LOCALE=es
   APP_FALLBACK_LOCALE=es
   ```
2. Verificar `config/app.php` (fallbacks para CI/producción sin `.env`):
   ```php
   'locale' => env('APP_LOCALE', 'es'),
   'fallback_locale' => env('APP_FALLBACK_LOCALE', 'es'),
   ```
3. Limpiar caché de configuración:
   ```bash
   php artisan config:clear
   ```
