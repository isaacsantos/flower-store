# Plan de Implementación: Módulo de Administración (admin-module)

## Overview

Implementación incremental del módulo de administración para Petal & Bloom. Se integra en la SPA existente (React + Vite + HashRouter) sin nuevas dependencias de producción. El orden sigue la cadena de dependencias: utilidades → autenticación → layout → CRUD → i18n → estilos responsivos.

## Tasks

- [x] 1. Crear utilidad `apiClient` y claves de traducción base
  - [x] 1.1 Crear `flower-store/src/utils/apiClient.js` con la función `apiRequest(path, options)`
    - Lee `admin_token` de `localStorage`
    - Añade header `Authorization: Bearer <token>` a todas las peticiones
    - Si la respuesta es 401: elimina el token y redirige con `window.location.hash = '/admin/login'`
    - Lanza error para cualquier respuesta no-2xx
    - _Requisitos: 9.1, 9.2, 9.3_
  - [x] 1.2 Escribir property test para `apiClient` — Property 6: inyección de JWT
    - **Property 6: apiClient inyecta el JWT en todas las peticiones**
    - **Validates: Requirements 5.1, 6.4, 7.3, 8.3, 9.1, 9.3**
    - Crear `flower-store/src/utils/apiClient.test.js`
    - Usar `fc.string({ minLength: 1 })` como token + `fc.constantFrom('GET','POST','PUT','DELETE')`
    - Mockear `fetch` global para capturar los headers enviados
    - _Requisitos: 9.1, 9.3_
  - [x] 1.3 Escribir property test para `apiClient` — Property 10: respuesta 401
    - **Property 10: Respuesta 401 limpia el token y redirige**
    - **Validates: Requirements 9.2**
    - En el mismo archivo `apiClient.test.js`
    - Usar `fc.string({ minLength: 1 })` como token + mock fetch que retorna 401
    - Verificar que `localStorage.getItem('admin_token')` sea `null` tras la llamada
    - _Requisitos: 9.2_
  - [x] 1.4 Añadir claves de traducción del módulo admin a `flower-store/src/i18n/translations.js`
    - Agregar en los cuatro idiomas (`es`, `en`, `fr`, `ko`) todas las claves bajo `admin.login`, `admin.sidebar`, `admin.products` y `admin.logout`
    - Claves requeridas según el diseño: `admin.login.title`, `admin.login.username`, `admin.login.token`, `admin.login.submit`, `admin.login.error.required`, `admin.login.error.unauthorized`, `admin.sidebar.products`, `admin.sidebar.collapse`, `admin.sidebar.expand`, `admin.products.title`, `admin.products.add`, `admin.products.edit`, `admin.products.delete`, `admin.products.confirm`, `admin.products.cancel`, `admin.products.save`, `admin.products.loading`, `admin.products.error`, `admin.products.empty`, `admin.products.col.name`, `admin.products.col.price`, `admin.products.col.description`, `admin.products.col.image`, `admin.products.col.actions`, `admin.products.form.title.create`, `admin.products.form.title.edit`, `admin.products.error.save`, `admin.products.error.delete`, `admin.logout.button`
    - _Requisitos: 10.1, 10.2_
  - [x] 1.5 Escribir property test para traducciones — Property 11: claves completas en 4 idiomas
    - **Property 11: Claves de traducción completas en los cuatro idiomas**
    - **Validates: Requirements 10.2**
    - Crear `flower-store/src/i18n/adminTranslations.test.js`
    - Iterar sobre todas las claves `admin.*` del objeto `translations` y verificar que los cuatro idiomas las tengan con valor no vacío
    - _Requisitos: 10.2_

- [x] 2. Implementar `AdminAuthGuard` y `AdminLogin`
  - [x] 2.1 Crear `flower-store/src/components/AdminAuthGuard.jsx`
    - Si `localStorage.getItem('admin_token')` es nulo o vacío → renderizar `<Navigate to="/admin/login" replace />`
    - Si hay token → renderizar `<Outlet />`
    - Si el usuario ya está autenticado y navega a `/admin/login` → redirigir a `/admin`
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 Escribir property test para `AdminAuthGuard` — Property 1: redirige sin token
    - **Property 1: Guard redirige a login cuando no hay token**
    - **Validates: Requirements 1.1, 1.4**
    - Crear `flower-store/src/components/AdminAuthGuard.test.jsx`
    - Usar `fc.option(fc.string(), { nil: null })` para simular ausencia de token
    - Verificar que se renderiza `<Navigate>` hacia `/admin/login`
    - _Requisitos: 1.1, 1.4_
  - [x] 2.3 Escribir property test para `AdminAuthGuard` — Property 2: redirige con token desde login
    - **Property 2: Guard redirige a home cuando hay token**
    - **Validates: Requirements 1.2, 1.3**
    - En el mismo archivo `AdminAuthGuard.test.jsx`
    - Usar `fc.string({ minLength: 1 })` como token
    - Verificar que al renderizar la ruta `/admin/login` se redirige a `/admin`
    - _Requisitos: 1.2, 1.3_
  - [x] 2.4 Crear `flower-store/src/components/AdminLogin.jsx` y `AdminLogin.css`
    - Formulario con campo `username` y campo `token` (tipo text)
    - Botón "Iniciar Sesión" que valida que ambos campos no estén vacíos ni sean solo whitespace
    - Si validación falla: mostrar mensaje de error inline (sin petición al backend)
    - Si validación pasa: guardar token en `localStorage` bajo `admin_token` y redirigir a `/admin`
    - Todos los textos via `t()` con claves `admin.login.*`
    - Estilos con prefijo `admin-login-`, responsivos (base desktop, overrides ≤900px y ≤640px)
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 12.1, 12.2, 12.3, 12.4_
  - [x] 2.5 Escribir property test para `AdminLogin` — Property 3: rechaza campos vacíos/whitespace
    - **Property 3: Login rechaza campos vacíos o solo whitespace**
    - **Validates: Requirements 2.2, 2.3**
    - Crear `flower-store/src/components/AdminLogin.test.jsx`
    - Usar `fc.tuple(fc.string(), fc.string())` filtrando combinaciones donde al menos uno sea vacío o whitespace
    - Verificar que no se almacena nada en `localStorage` y se muestra mensaje de error
    - _Requisitos: 2.2, 2.3_
  - [x] 2.6 Escribir property test para `AdminLogin` — Property 4: persiste token en localStorage
    - **Property 4: Login persiste el token en localStorage**
    - **Validates: Requirements 2.4, 2.5**
    - En el mismo archivo `AdminLogin.test.jsx`
    - Usar `fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }))` como (username, token)
    - Verificar que `localStorage.getItem('admin_token')` sea igual al token introducido
    - _Requisitos: 2.4, 2.5_

- [x] 3. Checkpoint — Verificar autenticación
  - Asegurarse de que todos los tests de `AdminAuthGuard` y `AdminLogin` pasan. Consultar al usuario si hay dudas.

- [x] 4. Implementar `AdminLayout`, `AdminSidebar` y `AdminHome`
  - [x] 4.1 Crear `flower-store/src/components/AdminSidebar.jsx` y `AdminSidebar.css`
    - Estado interno `collapsed` (boolean), inicializado a `true` si `window.innerWidth <= 900`
    - Botón toggle que alterna entre expandido y colapsado
    - Colapsado: muestra solo íconos; expandido: muestra íconos + etiquetas de texto
    - Enlace "Productos" que navega a `/admin` (ruta principal del módulo)
    - Todos los textos via `t()` con claves `admin.sidebar.*`
    - Estilos con prefijo `admin-sidebar-`, responsivos
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 11.2, 12.1, 12.2, 12.3, 12.4_
  - [x] 4.2 Crear `flower-store/src/components/AdminLayout.jsx` y `AdminLayout.css`
    - Compone `<AdminSidebar />` + `<Outlet />` en un layout de dos columnas
    - Estilos con prefijo `admin-layout-`, responsivos
    - _Requisitos: 4.1, 11.1, 12.1, 12.3_
  - [x] 4.3 Crear `flower-store/src/components/AdminHome.jsx` y `AdminHome.css`
    - Monta `<ProductsTable />` (se implementa en tarea 5)
    - Muestra botón "Cerrar Sesión" accesible desde la interfaz
    - Al hacer clic en "Cerrar Sesión": elimina `admin_token` de `localStorage` y redirige a `/admin/login`
    - Todos los textos via `t()` con claves `admin.logout.*`
    - _Requisitos: 3.1, 3.2, 3.3, 12.1, 12.2, 12.3, 12.4_
  - [x] 4.4 Escribir property test para logout — Property 5: limpia token y redirige
    - **Property 5: Logout elimina el token y redirige**
    - **Validates: Requirements 3.2, 3.3**
    - Crear `flower-store/src/components/AdminHome.test.jsx`
    - Usar `fc.string({ minLength: 1 })` como token inicial en `localStorage`
    - Verificar que tras el clic `localStorage.getItem('admin_token')` sea `null`
    - _Requisitos: 3.2, 3.3_

- [x] 5. Implementar `ProductsTable`
  - [x] 5.1 Crear `flower-store/src/components/ProductsTable.jsx` y `ProductsTable.css`
    - Al montar: petición GET a `/admin/api/products` via `apiRequest()` con JWT
    - Estados: `products[]`, `loading`, `error`, `showForm`, `editingProduct`
    - Mientras carga: mostrar indicador de carga (`admin.products.loading`)
    - Si error: mostrar mensaje descriptivo (`admin.products.error`)
    - Si lista vacía: mostrar mensaje (`admin.products.empty`)
    - Tabla con columnas: nombre, precio, descripción, imagen principal, acciones
    - Botón "Agregar Producto" visible en la vista
    - Por cada fila: botón "Editar" y botón "Eliminar"
    - Clic en "Agregar": abre `<ProductForm product={null} />`
    - Clic en "Editar": abre `<ProductForm product={producto} />`
    - Clic en "Eliminar": muestra diálogo de confirmación nativo (`window.confirm`) antes de proceder
    - Si confirma: petición DELETE a `/admin/api/products/{id}` y recarga la lista
    - Si cancela: no realiza ninguna petición
    - Si DELETE falla: mostrar mensaje de error
    - Todos los textos via `t()` con claves `admin.products.*`
    - Estilos con prefijo `admin-products-`, responsivos (scroll horizontal o vista tarjetas en ≤640px, botones ≥44px en móvil)
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 7.1, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4_
  - [x] 5.2 Escribir property test para `ProductsTable` — Property 7: renderiza todos los productos
    - **Property 7: La tabla renderiza todos los productos recibidos**
    - **Validates: Requirements 5.2**
    - Crear `flower-store/src/components/ProductsTable.test.jsx`
    - Usar `fc.array(productArbitrary, { minLength: 0, maxLength: 50 })` donde `productArbitrary` genera objetos con `id`, `name`, `price`, `description`, `images`
    - Mockear `apiRequest` para retornar el array generado
    - Verificar que se renderizan exactamente tantas filas como productos
    - _Requisitos: 5.2_
  - [x] 5.3 Escribir property test para `ProductsTable` — Property 8: N productos → N botones editar + N eliminar
    - **Property 8: Acciones por fila coinciden con el número de productos**
    - **Validates: Requirements 7.1, 8.1**
    - En el mismo archivo `ProductsTable.test.jsx`
    - Usar `fc.array(productArbitrary, { minLength: 1, maxLength: 20 })`
    - Verificar que hay exactamente N botones "Editar" y N botones "Eliminar"
    - _Requisitos: 7.1, 8.1_

- [x] 6. Implementar `ProductForm`
  - [x] 6.1 Crear `flower-store/src/components/ProductForm.jsx` y `ProductForm.css`
    - Props: `product` (null = modo creación, objeto = modo edición), `onClose`, `onSaved`
    - Estado del formulario: `name`, `price` (string), `description`, `error`, `saving`
    - Modo edición: precargar campos con los valores del producto recibido como prop
    - Campos requeridos: nombre, precio, descripción
    - Botón "Guardar":
      - Modo creación: POST a `/admin/api/products` via `apiRequest()`
      - Modo edición: PUT a `/admin/api/products/{id}` via `apiRequest()`
      - Si éxito (2xx): llamar `onSaved()` y `onClose()`
      - Si falla: mostrar error inline sin cerrar el formulario
    - Botón "Cancelar": llamar `onClose()` sin petición
    - Todos los textos via `t()` con claves `admin.products.*`
    - Estilos con prefijo `admin-form-`, presentado como modal, responsivo
    - _Requisitos: 6.3, 6.4, 6.5, 6.6, 6.7, 7.2, 7.3, 7.4, 7.5, 12.1, 12.2, 12.3, 12.4_
  - [x] 6.2 Escribir property test para `ProductForm` — Property 9: precarga datos del producto
    - **Property 9: Formulario de edición precarga los datos del producto**
    - **Validates: Requirements 7.2**
    - Crear `flower-store/src/components/ProductForm.test.jsx`
    - Usar `productArbitrary` con campos `name`, `price`, `description`
    - Verificar que los inputs del formulario contienen exactamente los valores del producto recibido como prop
    - _Requisitos: 7.2_

- [x] 7. Checkpoint — Verificar CRUD completo
  - Asegurarse de que todos los tests de `ProductsTable` y `ProductForm` pasan. Consultar al usuario si hay dudas.

- [x] 8. Integrar rutas en `App.jsx`
  - [x] 8.1 Modificar `flower-store/src/App.jsx` para añadir las rutas del módulo admin
    - Importar `AdminAuthGuard`, `AdminLayout`, `AdminLogin`, `AdminHome`
    - Añadir dentro del `HashRouter` existente:
      ```jsx
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminAuthGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
        </Route>
      </Route>
      ```
    - No modificar las rutas públicas existentes
    - _Requisitos: 1.1, 1.2, 4.1_

- [x] 9. Checkpoint final — Verificar integración completa
  - Asegurarse de que todos los tests del módulo pasan (`vitest --run`). Consultar al usuario si hay dudas.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- Los property tests usan `fast-check` (ya incluido en `devDependencies`) con mínimo 100 iteraciones (`{ numRuns: 100 }`)
- Cada property test debe incluir el comentario: `// Feature: admin-module, Property N: <texto>`
- El `apiClient` centraliza la inyección del JWT y el manejo del 401, evitando duplicación en componentes
- Los estilos siguen la convención BEM-like con prefijo `admin-` para evitar colisiones con estilos existentes
- Todos los componentes usan `t()` de `useLocale()` — nunca texto hardcodeado en JSX
