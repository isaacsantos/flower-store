# Plan de Implementación: Firebase Google Auth

## Overview

Migración del sistema de autenticación del panel admin desde usuario/token en `localStorage` a Google OAuth gestionado por Firebase Authentication. Se crea un `AuthContext` como única fuente de verdad, se modifica `AdminAuthGuard`, `AdminLogin`, `AdminSidebar` y `apiClient`, y se elimina completamente el sistema anterior.

## Tasks

- [x] 1. Instalar dependencias de Firebase y actualizar variables de entorno
  - Instalar `firebase` como dependencia de producción: `npm install firebase` desde `flower-store/`
  - Añadir las cuatro variables de Firebase a `.env.example`: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`
  - _Requirements: 1.1, 1.2, 9.1, 9.2_

- [x] 2. Crear módulo de inicialización de Firebase
  - [x] 2.1 Crear `src/firebase/firebaseConfig.js`
    - Validar que las cuatro variables de entorno estén presentes; lanzar `Error` descriptivo con el nombre de cada variable faltante si alguna está ausente o vacía
    - Inicializar la app de Firebase una única vez con `initializeApp`
    - Exportar `auth` (instancia de `getAuth`) y `db` (instancia de `getFirestore`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.3_

  - [x] 2.2 Escribir property test para variables de entorno faltantes
    - **Property 1: Variables de entorno faltantes lanzan error descriptivo**
    - **Validates: Requirements 1.3, 9.3**
    - Usar `fc.subarray(['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID'], { minLength: 1 })` para simular subconjuntos de variables ausentes
    - Verificar que el mensaje de error menciona el nombre de cada variable faltante
    - Archivo: `src/firebase/firebaseConfig.test.js`
    - _Requirements: 1.3, 9.3_

- [x] 3. Crear AuthContext y AuthProvider
  - [x] 3.1 Crear `src/firebase/AuthContext.jsx`
    - Definir el contexto con forma `{ user, loading, isAdmin, signInWithGoogle, logout }`
    - En `AuthProvider`: suscribirse a `onAuthStateChanged` en el montaje y cancelar en el desmontaje
    - Cuando `user` es no-nulo: consultar `getDoc(doc(db, 'admins', user.email))` y actualizar `isAdmin`
    - Cuando `user` es `null`: establecer `isAdmin = false` sin consultar Firestore
    - `loading` es `true` hasta que `onAuthStateChanged` dispara por primera vez
    - Implementar `signInWithGoogle()` usando `signInWithPopup` con `GoogleAuthProvider`
    - Implementar `logout()` llamando a `signOut(auth)`
    - Si la consulta a Firestore falla: `isAdmin = false` + `console.error`
    - Exportar `AuthProvider` y el hook `useAuth()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 3.2 Escribir property test: AuthContext refleja onAuthStateChanged
    - **Property 2: AuthContext refleja cambios de onAuthStateChanged**
    - **Validates: Requirements 2.2**
    - Usar `fc.option(userArbitrary, { nil: null })` como valor emitido por el mock de `onAuthStateChanged`
    - Verificar que `user` y `loading` se actualizan correctamente
    - Archivo: `src/firebase/AuthContext.test.jsx`
    - _Requirements: 2.2_

  - [x] 3.3 Escribir property test: isAdmin refleja Firestore
    - **Property 3: isAdmin refleja el resultado de la consulta a Firestore**
    - **Validates: Requirements 2.3, 2.4, 7.2, 7.3, 7.4**
    - Usar `fc.record({ email: fc.emailAddress() })` como user + mock de Firestore que retorna `exists=true/false`
    - Verificar que `isAdmin` es `true` solo cuando el documento existe; `false` cuando `user=null` sin llamar a Firestore
    - Archivo: `src/firebase/AuthContext.test.jsx`
    - _Requirements: 2.3, 2.4, 7.2, 7.3, 7.4_

  - [x] 3.4 Escribir unit tests para AuthContext
    - `loading` es `true` antes de que `onAuthStateChanged` resuelva (Req 2.5)
    - Error de Firestore → `isAdmin=false` + `console.error` (Req 7.5)
    - Archivo: `src/firebase/AuthContext.test.jsx`
    - _Requirements: 2.5, 7.5_

- [x] 4. Checkpoint — Verificar que los tests del módulo Firebase pasan
  - Asegurarse de que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 5. Añadir claves de traducción para el nuevo flujo de autenticación
  - [x] 5.1 Actualizar `src/i18n/translations.js`
    - Añadir en los cuatro idiomas (`es`, `en`, `fr`, `ko`) las claves: `admin.login.google`, `admin.login.error.unauthorized`, `admin.login.error.network`, `admin.login.loading`
    - Eliminar las claves obsoletas: `admin.login.username`, `admin.login.token`, `admin.login.submit`, `admin.login.error.required`
    - Usar los valores exactos definidos en el diseño técnico
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 5.2 Escribir property test: claves de traducción completas en los cuatro idiomas
    - **Property 11: Claves de traducción nuevas completas en los cuatro idiomas**
    - **Validates: Requirements 10.2, 10.4**
    - Iterar sobre las claves nuevas `admin.login.*` y verificar que los cuatro idiomas tienen cada clave con valor de cadena no vacío
    - Archivo: `src/i18n/adminTranslations.test.js`
    - _Requirements: 10.2, 10.4_

- [x] 6. Modificar AdminLogin para Google OAuth
  - [x] 6.1 Reescribir `src/components/AdminLogin.jsx`
    - Eliminar el formulario de usuario/token y todos sus estados (`username`, `token`)
    - Mostrar un único botón que llama a `signInWithGoogle()` de `useAuth()`
    - Gestionar estados de error: `'unauthorized' | 'popup_closed' | 'network' | null`
    - Si `signInWithPopup` lanza `auth/popup-closed-by-user`: no mostrar error (comportamiento silencioso)
    - Si `signInWithPopup` lanza cualquier otro error: mostrar `t('admin.login.error.network')`
    - Si `isAdmin` es `false` tras el login: mostrar `t('admin.login.error.unauthorized')` y llamar a `logout()`
    - Redirigir reactivamente a `/admin` cuando `isAdmin` es `true` (efecto sobre el contexto)
    - Usar `t()` para todos los textos visibles
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 8.1, 10.1_

  - [x] 6.2 Actualizar `src/components/AdminLogin.css`
    - Eliminar estilos del formulario usuario/token
    - Añadir estilos para el botón Google: altura mínima 44px, uso de variables CSS globales (`--pink`, `--rose`, `--dark`, etc.)
    - Aplicar Playfair Display para el título y Lato para el cuerpo
    - Añadir breakpoints `@media (max-width: 900px)` y `@media (max-width: 640px)`
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 6.3 Escribir property test: Login redirige cuando isAdmin=true
    - **Property 6: Login con isAdmin=true redirige a /admin**
    - **Validates: Requirements 3.4**
    - Usar `userArbitrary` con `isAdmin=true` en el mock de `useAuth`
    - Verificar que se renderiza `<Navigate to="/admin" />`
    - Archivo: `src/components/AdminLogin.test.jsx`
    - _Requirements: 3.4_

  - [x] 6.4 Escribir property test: Login muestra error y cierra sesión cuando isAdmin=false
    - **Property 7: Login con isAdmin=false muestra error y cierra sesión**
    - **Validates: Requirements 3.5**
    - Usar `userArbitrary` con `isAdmin=false` en el mock de `useAuth`
    - Verificar que se muestra el mensaje `admin.login.error.unauthorized` y se llama a `logout()`
    - Archivo: `src/components/AdminLogin.test.jsx`
    - _Requirements: 3.5_

  - [x] 6.5 Escribir property test: errores Firebase muestran mensaje de error
    - **Property 8: Errores de Firebase (excepto popup-closed) muestran mensaje**
    - **Validates: Requirements 3.6, 3.7**
    - Usar `fc.constantFrom('auth/network-request-failed', 'auth/internal-error', 'auth/cancelled-popup-request')` como códigos de error
    - Verificar que errores distintos de `auth/popup-closed-by-user` muestran mensaje visible; `popup-closed` no muestra nada
    - Archivo: `src/components/AdminLogin.test.jsx`
    - _Requirements: 3.6, 3.7_

  - [x] 6.6 Escribir unit tests para AdminLogin
    - Renderiza exactamente un botón de Google, sin campos usuario/token (Req 3.1, 8.1)
    - Clic en botón llama a `signInWithGoogle()` (Req 3.2)
    - Archivo: `src/components/AdminLogin.test.jsx`
    - _Requirements: 3.1, 3.2, 8.1_

- [x] 7. Modificar AdminAuthGuard para usar AuthContext
  - [x] 7.1 Reescribir `src/components/AdminAuthGuard.jsx`
    - Leer `{ user, loading, isAdmin }` desde `useAuth()` — eliminar toda referencia a `localStorage`
    - Si `loading=true`: renderizar un indicador de carga (spinner o texto) sin redirigir
    - Si `!user || !isAdmin`: `<Navigate to="/admin/login" replace />`
    - Si `isAdmin && ruta=/admin/login`: `<Navigate to="/admin" replace />`
    - Si `isAdmin`: `<Outlet />`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.2_

  - [x] 7.2 Escribir property test: Guard redirige cuando usuario no es admin
    - **Property 4: AuthGuard redirige a login cuando el usuario no es admin**
    - **Validates: Requirements 4.1, 4.2**
    - Usar `fc.constantFrom(null, { email: 'x@x.com' })` como user con `isAdmin=false` y `loading=false`
    - Verificar que se renderiza `<Navigate to="/admin/login" />` sin renderizar contenido protegido
    - Archivo: `src/components/AdminAuthGuard.test.jsx`
    - _Requirements: 4.1, 4.2_

  - [x] 7.3 Escribir property test: Guard redirige admin desde /admin/login
    - **Property 5: AuthGuard redirige a /admin cuando el usuario admin visita /admin/login**
    - **Validates: Requirements 4.3**
    - Usar `userArbitrary` con `isAdmin=true` y `loading=false` en la ruta `/admin/login`
    - Verificar que se renderiza `<Navigate to="/admin" />`
    - Archivo: `src/components/AdminAuthGuard.test.jsx`
    - _Requirements: 4.3_

  - [x] 7.4 Escribir unit test: spinner cuando loading=true
    - Verificar que se muestra el indicador de carga y no se redirige cuando `loading=true`
    - Archivo: `src/components/AdminAuthGuard.test.jsx`
    - _Requirements: 4.4_

- [x] 8. Modificar AdminSidebar para añadir cierre de sesión
  - [x] 8.1 Actualizar `src/components/AdminSidebar.jsx`
    - Añadir botón "Cerrar Sesión" que llama a `logout()` de `useAuth()`
    - Mostrar error inline si `logout()` falla, sin redirigir
    - Usar `t('admin.logout.button')` para el texto del botón (clave ya existente)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 8.2 Escribir unit tests para AdminSidebar
    - Contiene botón "Cerrar Sesión" (Req 5.1)
    - Clic en "Cerrar Sesión" llama a `logout()` (Req 5.2)
    - Archivo: `src/components/AdminSidebar.test.jsx`
    - _Requirements: 5.1, 5.2_

- [x] 9. Checkpoint — Verificar que los tests de componentes pasan
  - Asegurarse de que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 10. Modificar apiClient para usar Firebase JWT
  - [x] 10.1 Reescribir `src/utils/apiClient.js`
    - Cambiar la firma a `apiRequest(path, options = {}, user)`
    - Si `user` es `null`: lanzar `Error('No authenticated user')` sin realizar la petición HTTP
    - Llamar a `user.getIdToken()` para obtener el JWT fresco antes de cada petición
    - Incluir el token en `Authorization: Bearer <token>` en todas las peticiones
    - Si la respuesta es 401: llamar a `user.getIdToken(true)` y reintentar la petición una vez
    - Si el reintento también retorna 401: redirigir a `/admin/login`
    - Eliminar toda referencia a `localStorage.getItem('admin_token')`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.3, 8.4_

  - [x] 10.2 Escribir property test: apiClient inyecta JWT en todas las peticiones
    - **Property 9: apiClient inyecta el Firebase JWT en todas las peticiones**
    - **Validates: Requirements 6.1, 6.2**
    - Usar `fc.string({ minLength: 1 })` como token + `fc.constantFrom('GET','POST','PUT','DELETE')` como método
    - Verificar que `user.getIdToken()` es llamado y el token aparece en `Authorization: Bearer <token>`
    - Archivo: `src/utils/apiClient.test.js`
    - _Requirements: 6.1, 6.2_

  - [x] 10.3 Escribir property test: 401 provoca reintento con token renovado
    - **Property 10: 401 provoca reintento con token renovado**
    - **Validates: Requirements 6.5**
    - Mock de `fetch` que retorna 401 en el primer intento
    - Usar `fc.string({ minLength: 1 })` como token renovado
    - Verificar que `user.getIdToken(true)` es llamado y la petición se reintenta exactamente una vez
    - Archivo: `src/utils/apiClient.test.js`
    - _Requirements: 6.5_

- [x] 11. Actualizar componentes que usan apiClient para pasar el user
  - Actualizar `src/components/AdminHome.jsx` (y cualquier otro componente que llame a `apiRequest`) para obtener `user` de `useAuth()` y pasarlo como tercer argumento a `apiRequest`
  - _Requirements: 6.1, 6.4_

- [x] 12. Integrar AuthProvider en App.jsx
  - Importar `AuthProvider` desde `src/firebase/AuthContext.jsx`
  - Envolver `<AppContent />` con `<AuthProvider>` dentro de `<LocaleProvider>` en `App.jsx`
  - _Requirements: 2.6_

- [x] 13. Checkpoint final — Verificar integración completa
  - Asegurarse de que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los property tests usan `fast-check` (ya instalado) con mínimo 100 iteraciones (`{ numRuns: 100 }`)
- Cada property test debe incluir el comentario: `// Feature: firebase-google-auth, Property N: <texto>`
- La clave `admin.logout.button` ya existe en `translations.js` — no es necesario añadirla
- Los componentes que consumen `apiRequest` deben obtener `user` de `useAuth()` y pasarlo explícitamente
