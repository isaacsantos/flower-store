# Documento de Requisitos — Firebase Google Auth

## Introducción

Este documento describe los requisitos para migrar el sistema de autenticación del panel de administración de Petal & Bloom desde el esquema actual (usuario + JWT manual en `localStorage`) a Google OAuth gestionado por Firebase Authentication.

El panel admin es una SPA en React 19 + Vite sin backend propio. La fuente de verdad para el control de acceso es Firestore: una colección de emails autorizados determina qué cuentas de Google tienen rol de administrador. El JWT de Firebase reemplaza al token manual actual y se inyecta automáticamente en las llamadas al Admin API externo.

El módulo de administración existente (rutas, CRUD de productos, sidebar, i18n) no cambia funcionalmente; solo se reemplaza la capa de autenticación.

---

## Glosario

- **Firebase_Auth**: Servicio de Firebase Authentication que gestiona el flujo OAuth con Google y emite JWTs firmados.
- **Google_OAuth**: Protocolo de autorización que permite al usuario autenticarse con su cuenta de Google mediante un popup o redirección.
- **Firebase_JWT**: Token de identidad (ID token) emitido por Firebase Authentication tras una autenticación exitosa. Tiene expiración y puede renovarse automáticamente.
- **Firestore**: Base de datos NoSQL de Firebase usada como fuente de verdad para la lista de emails autorizados como administradores.
- **Authorized_Admins_Collection**: Colección en Firestore (p. ej. `admins`) donde cada documento representa un email autorizado para acceder al panel.
- **Auth_Context**: Contexto de React que expone el estado de autenticación (`user`, `loading`, `isAdmin`) a todos los componentes del árbol.
- **Auth_Guard**: Componente que protege las rutas `/admin/*` verificando el estado del Auth_Context.
- **Login_Page**: Página de inicio de sesión del panel admin, accesible en `/admin/login`, que muestra el botón "Iniciar sesión con Google".
- **Admin_Module**: El conjunto de páginas y componentes accesibles bajo la ruta `/admin`.
- **apiClient**: Módulo utilitario (`src/utils/apiClient.js`) que inyecta el Firebase_JWT en las peticiones al Admin API externo.
- **Admin_API**: Endpoints del backend externo bajo `/admin/api/products` que requieren JWT en el header de autorización.

---

## Requisitos

### Requisito 1: Configuración e inicialización de Firebase

**User Story:** Como desarrollador, quiero inicializar Firebase en la aplicación, para que los servicios de Authentication y Firestore estén disponibles en toda la SPA.

#### Criterios de Aceptación

1. THE Firebase_Auth SHALL inicializarse una única vez al arrancar la aplicación, usando las variables de entorno con prefijo `VITE_FIREBASE_`.
2. THE Firebase_Auth SHALL leer la configuración desde las variables de entorno: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
3. IF alguna variable de entorno de Firebase está ausente o vacía al inicializar, THEN THE Firebase_Auth SHALL lanzar un error descriptivo que indique qué variable falta.
4. THE Firestore SHALL inicializarse en el mismo módulo que Firebase_Auth, reutilizando la misma instancia de la app de Firebase.

---

### Requisito 2: Proveedor de estado de autenticación (Auth Context)

**User Story:** Como desarrollador, quiero un contexto de React que exponga el estado de autenticación, para que cualquier componente pueda saber si el usuario está autenticado y si es administrador sin acceder directamente a Firebase.

#### Criterios de Aceptación

1. THE Auth_Context SHALL exponer las propiedades: `user` (objeto de usuario de Firebase o `null`), `loading` (booleano), e `isAdmin` (booleano).
2. WHEN Firebase_Auth emite un cambio de estado de autenticación, THE Auth_Context SHALL actualizar `user` y `loading` de forma reactiva mediante `onAuthStateChanged`.
3. WHEN `user` es no nulo, THE Auth_Context SHALL consultar la Authorized_Admins_Collection en Firestore para verificar si el email del usuario está autorizado, y actualizar `isAdmin` con el resultado.
4. WHEN `user` es nulo, THE Auth_Context SHALL establecer `isAdmin` en `false` sin realizar consultas a Firestore.
5. WHILE `loading` es `true`, THE Auth_Context SHALL indicar que la verificación de autenticación está en curso.
6. THE Auth_Context SHALL envolver la aplicación en `App.jsx` de forma que todos los componentes tengan acceso al contexto.

---

### Requisito 3: Inicio de sesión con Google OAuth

**User Story:** Como administrador, quiero iniciar sesión con mi cuenta de Google mediante un popup, para que no tenga que gestionar credenciales manuales.

#### Criterios de Aceptación

1. THE Login_Page SHALL mostrar un único botón "Iniciar sesión con Google" en lugar del formulario de usuario/token actual.
2. WHEN el usuario hace clic en "Iniciar sesión con Google", THE Login_Page SHALL invocar el flujo de Google_OAuth mediante un popup de Firebase Authentication (`signInWithPopup`).
3. WHEN el popup de Google_OAuth se completa con éxito, THE Firebase_Auth SHALL emitir un evento de cambio de estado que actualice el Auth_Context.
4. WHEN el Auth_Context detecta que `isAdmin` es `true` tras el inicio de sesión, THE Login_Page SHALL redirigir al usuario a `/admin`.
5. WHEN el Auth_Context detecta que `isAdmin` es `false` tras el inicio de sesión, THE Login_Page SHALL mostrar un mensaje de error indicando que el email no tiene permisos de administrador, y THE Firebase_Auth SHALL cerrar la sesión del usuario inmediatamente.
6. IF el popup de Google_OAuth es cancelado por el usuario, THEN THE Login_Page SHALL permanecer en la página de login sin mostrar error.
7. IF el popup de Google_OAuth falla por un error de red u otro error de Firebase, THEN THE Login_Page SHALL mostrar un mensaje de error descriptivo.
8. THE Login_Page SHALL usar `t()` para todos los textos visibles, con claves bajo el prefijo `admin.login`.

---

### Requisito 4: Protección de rutas de administración

**User Story:** Como administrador, quiero que las rutas `/admin` estén protegidas, para que solo usuarios autenticados y autorizados puedan acceder al panel.

#### Criterios de Aceptación

1. WHEN un usuario no autenticado navega a cualquier ruta bajo `/admin` (excepto `/admin/login`), THE Auth_Guard SHALL redirigir al usuario a `/admin/login`.
2. WHEN un usuario autenticado con `isAdmin` igual a `false` navega a cualquier ruta bajo `/admin`, THE Auth_Guard SHALL redirigir al usuario a `/admin/login`.
3. WHEN un usuario autenticado con `isAdmin` igual a `true` navega a `/admin/login`, THE Auth_Guard SHALL redirigir al usuario a `/admin`.
4. WHILE `loading` es `true` en el Auth_Context, THE Auth_Guard SHALL mostrar un indicador de carga y no redirigir al usuario.
5. THE Auth_Guard SHALL leer el estado de autenticación exclusivamente desde el Auth_Context, sin acceder directamente a `localStorage` ni a Firebase.

---

### Requisito 5: Cierre de sesión

**User Story:** Como administrador, quiero poder cerrar sesión, para que mi sesión quede protegida al terminar de usar el panel.

#### Criterios de Aceptación

1. THE Admin_Module SHALL mostrar un botón "Cerrar Sesión" accesible desde la interfaz del panel (p. ej. en el sidebar o en la cabecera).
2. WHEN el usuario hace clic en "Cerrar Sesión", THE Firebase_Auth SHALL invocar `signOut()` para cerrar la sesión en Firebase.
3. WHEN `signOut()` se completa, THE Auth_Context SHALL actualizar `user` a `null` e `isAdmin` a `false` de forma reactiva.
4. WHEN el Auth_Context actualiza `user` a `null`, THE Auth_Guard SHALL redirigir al usuario a `/admin/login` automáticamente.
5. IF `signOut()` falla, THEN THE Admin_Module SHALL mostrar un mensaje de error sin redirigir al usuario.

---

### Requisito 6: Inyección del Firebase JWT en el API client

**User Story:** Como administrador, quiero que todas las llamadas al Admin API incluyan el Firebase JWT actualizado automáticamente, para que las operaciones estén siempre autorizadas sin intervención manual.

#### Criterios de Aceptación

1. WHEN `apiClient` realiza cualquier petición al Admin_API, THE apiClient SHALL obtener el Firebase_JWT llamando a `user.getIdToken()` en lugar de leer `admin_token` de `localStorage`.
2. THE apiClient SHALL incluir el Firebase_JWT en el header `Authorization: Bearer <token>` en todas las peticiones GET, POST, PUT y DELETE al Admin_API.
3. WHEN el Firebase_JWT está próximo a expirar, THE apiClient SHALL obtener un token renovado llamando a `user.getIdToken(true)` antes de enviar la petición.
4. IF `user` es `null` al momento de realizar una petición, THEN THE apiClient SHALL lanzar un error de autenticación sin realizar la petición HTTP.
5. IF una petición al Admin_API retorna un código HTTP 401, THEN THE apiClient SHALL intentar renovar el Firebase_JWT con `user.getIdToken(true)` y reintentar la petición una vez antes de redirigir a `/admin/login`.

---

### Requisito 7: Verificación de autorización en Firestore

**User Story:** Como administrador del sistema, quiero controlar qué cuentas de Google tienen acceso al panel mediante Firestore, para que pueda gestionar permisos sin modificar el código.

#### Criterios de Aceptación

1. THE Authorized_Admins_Collection SHALL almacenar documentos donde el ID de cada documento es el email del administrador autorizado.
2. WHEN el Auth_Context verifica si un usuario es administrador, THE Auth_Context SHALL consultar Firestore buscando un documento cuyo ID sea el email del usuario autenticado en la Authorized_Admins_Collection.
3. IF el documento con el email del usuario existe en la Authorized_Admins_Collection, THEN THE Auth_Context SHALL establecer `isAdmin` en `true`.
4. IF el documento con el email del usuario no existe en la Authorized_Admins_Collection, THEN THE Auth_Context SHALL establecer `isAdmin` en `false`.
5. IF la consulta a Firestore falla por un error de red u otro error, THEN THE Auth_Context SHALL establecer `isAdmin` en `false` y registrar el error en la consola.

---

### Requisito 8: Eliminación del sistema de autenticación anterior

**User Story:** Como desarrollador, quiero eliminar el sistema de login con usuario/token manual, para que no existan dos mecanismos de autenticación en paralelo que generen confusión o vulnerabilidades.

#### Criterios de Aceptación

1. THE Admin_Module SHALL eliminar el formulario de usuario/token de la Login_Page y reemplazarlo por el botón de Google OAuth.
2. THE Auth_Guard SHALL dejar de leer `admin_token` de `localStorage` como mecanismo de autenticación.
3. THE apiClient SHALL dejar de leer `admin_token` de `localStorage` para inyectar el token en las peticiones.
4. WHEN la migración esté completa, THE Admin_Module SHALL no contener referencias a `localStorage.getItem('admin_token')` ni `localStorage.setItem('admin_token')` en el código de producción.

---

### Requisito 9: Variables de entorno y configuración

**User Story:** Como desarrollador, quiero que las credenciales de Firebase estén en variables de entorno, para que no se expongan en el repositorio de código.

#### Criterios de Aceptación

1. THE Admin_Module SHALL leer la configuración de Firebase exclusivamente desde variables de entorno con prefijo `VITE_FIREBASE_`.
2. THE Admin_Module SHALL documentar todas las variables de entorno requeridas en el archivo `.env.example` del proyecto.
3. IF el archivo `.env` no contiene las variables de Firebase requeridas, THEN THE Firebase_Auth SHALL mostrar un error claro en la consola de desarrollo indicando qué variables faltan.

---

### Requisito 10: Internacionalización de los nuevos textos

**User Story:** Como administrador, quiero que los nuevos textos del flujo de autenticación estén disponibles en los cuatro idiomas soportados, para que la experiencia sea consistente con el resto de la tienda.

#### Criterios de Aceptación

1. THE Admin_Module SHALL usar `t()` de `useLocale()` para todos los textos visibles del nuevo flujo de autenticación.
2. THE Admin_Module SHALL agregar las nuevas claves de traducción bajo el prefijo `admin.login` en los cuatro idiomas soportados: `es`, `en`, `fr` y `ko` en `src/i18n/translations.js`.
3. WHEN el usuario cambia el idioma desde el selector de idioma, THE Admin_Module SHALL actualizar todos los textos del flujo de autenticación al idioma seleccionado sin recargar la página.
4. THE Admin_Module SHALL incluir al menos las siguientes claves nuevas: `admin.login.google`, `admin.login.error.unauthorized`, `admin.login.error.popup_closed`, `admin.login.error.network`.

---

### Requisito 11: Consistencia visual y responsividad

**User Story:** Como administrador, quiero que la nueva página de login sea visualmente coherente con el diseño existente y funcione en todos los dispositivos, para que la experiencia sea unificada.

#### Criterios de Aceptación

1. THE Login_Page SHALL usar las variables CSS globales definidas en `index.css` (`--pink`, `--rose`, `--green`, `--dark`, `--cream`, `--gold`) para sus estilos.
2. THE Login_Page SHALL aplicar estilos base para escritorio (>900px), con overrides en `@media (max-width: 900px)` para tablet y `@media (max-width: 640px)` para móvil.
3. THE Login_Page SHALL garantizar que el botón "Iniciar sesión con Google" tenga una altura mínima de 44px en todos los viewports.
4. THE Login_Page SHALL usar Playfair Display para el título y Lato para el texto de cuerpo, consistente con el resto de la aplicación.
