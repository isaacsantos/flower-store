# Documento de Requisitos — Módulo de Administración

## Introducción

Este documento describe los requisitos para el módulo de administración de la tienda de flores "Petal & Bloom". El módulo es accesible en la ruta `/admin` y permite a los administradores autenticados gestionar el catálogo de productos: visualizar, crear, editar y eliminar productos. La autenticación se basa en JWT almacenado en `localStorage`. El diseño es consistente con el resto de la aplicación (mismas variables CSS, tipografía y breakpoints).

---

## Glosario

- **Admin_Module**: El conjunto de páginas y componentes accesibles bajo la ruta `/admin`.
- **Auth_Guard**: Componente que protege las rutas de administración verificando la presencia de un JWT válido.
- **Login_Page**: Página de inicio de sesión del módulo de administración, accesible en `/admin/login`.
- **Admin_Home**: Página principal del módulo de administración, accesible en `/admin` una vez autenticado.
- **Admin_Sidebar**: Barra de navegación lateral contraíble del módulo de administración.
- **Products_Table**: Tabla que lista todos los productos con sus campos y acciones de edición/eliminación.
- **Product_Form**: Formulario modal o inline para crear o editar un producto.
- **JWT**: JSON Web Token usado para autenticar las llamadas al backend.
- **Admin_API**: Endpoints del backend bajo `/admin/api/products` que requieren JWT en el header de autorización.
- **LocalStorage**: Almacenamiento del navegador donde se persiste el JWT entre sesiones.

---

## Requisitos

### Requisito 1: Protección de rutas de administración

**User Story:** Como administrador, quiero que las rutas `/admin` estén protegidas, para que solo usuarios autenticados puedan acceder al panel.

#### Criterios de Aceptación

1. WHEN un usuario no autenticado navega a `/admin`, THE Auth_Guard SHALL redirigir al usuario a `/admin/login`.
2. WHEN un usuario autenticado navega a `/admin/login`, THE Auth_Guard SHALL redirigir al usuario a `/admin`.
3. THE Auth_Guard SHALL verificar la autenticación leyendo el JWT almacenado en `localStorage` bajo la clave `admin_token`.
4. IF el JWT no existe en `localStorage`, THEN THE Auth_Guard SHALL tratar al usuario como no autenticado.

---

### Requisito 2: Inicio de sesión

**User Story:** Como administrador, quiero iniciar sesión con usuario y JWT token, para que pueda acceder al panel de administración de forma segura.

#### Criterios de Aceptación

1. THE Login_Page SHALL mostrar un formulario con un campo de texto para el nombre de usuario y un campo de texto para el JWT token.
2. WHEN el usuario hace clic en el botón "Iniciar Sesión", THE Login_Page SHALL validar que ambos campos no estén vacíos.
3. IF algún campo está vacío al hacer clic en "Iniciar Sesión", THEN THE Login_Page SHALL mostrar un mensaje de error indicando que todos los campos son obligatorios.
4. WHEN el usuario hace clic en "Iniciar Sesión" con ambos campos completos, THE Login_Page SHALL almacenar el JWT en `localStorage` bajo la clave `admin_token`.
5. WHEN el JWT es almacenado exitosamente, THE Login_Page SHALL redirigir al usuario a `/admin`.
6. THE Login_Page SHALL usar `t()` para todos los textos visibles, con claves bajo el prefijo `admin.login`.

---

### Requisito 3: Cierre de sesión

**User Story:** Como administrador, quiero poder cerrar sesión, para que mi sesión quede protegida al terminar de usar el panel.

#### Criterios de Aceptación

1. THE Admin_Home SHALL mostrar un botón o acción de "Cerrar Sesión" accesible desde la interfaz.
2. WHEN el usuario hace clic en "Cerrar Sesión", THE Admin_Module SHALL eliminar el JWT de `localStorage`.
3. WHEN el JWT es eliminado, THE Admin_Module SHALL redirigir al usuario a `/admin/login`.

---

### Requisito 4: Barra de navegación lateral (Sidebar)

**User Story:** Como administrador, quiero una barra de navegación lateral contraíble, para que pueda navegar entre secciones del panel y maximizar el espacio de trabajo.

#### Criterios de Aceptación

1. THE Admin_Sidebar SHALL mostrarse en el lado izquierdo de la pantalla en todas las páginas del Admin_Module (excepto Login_Page).
2. THE Admin_Sidebar SHALL contener al menos la opción de navegación "Productos".
3. WHEN el usuario hace clic en el botón de colapsar/expandir, THE Admin_Sidebar SHALL alternar entre estado expandido y colapsado.
4. WHILE el Admin_Sidebar está colapsado, THE Admin_Sidebar SHALL mostrar únicamente los íconos de cada opción de navegación, sin texto.
5. WHILE el Admin_Sidebar está expandido, THE Admin_Sidebar SHALL mostrar íconos y etiquetas de texto para cada opción.
6. WHEN el usuario hace clic en "Productos" en el Admin_Sidebar, THE Admin_Module SHALL navegar a la vista de gestión de productos.
7. THE Admin_Sidebar SHALL usar `t()` para todos los textos visibles, con claves bajo el prefijo `admin.sidebar`.

---

### Requisito 5: Listado de productos

**User Story:** Como administrador, quiero ver todos los productos en una tabla, para que pueda revisar su información de forma clara y ordenada.

#### Criterios de Aceptación

1. WHEN el Admin_Home carga, THE Products_Table SHALL realizar una petición GET a `/admin/api/products` con el JWT en el header `Authorization: Bearer <token>`.
2. THE Products_Table SHALL mostrar los productos en filas con columnas para: nombre, precio, descripción e imágenes (al menos la imagen principal).
3. WHILE los productos se están cargando, THE Products_Table SHALL mostrar un indicador de carga.
4. IF la petición GET falla o retorna un error HTTP, THEN THE Products_Table SHALL mostrar un mensaje de error descriptivo.
5. IF la lista de productos está vacía, THEN THE Products_Table SHALL mostrar un mensaje indicando que no hay productos disponibles.
6. THE Products_Table SHALL usar `t()` para todos los textos visibles, con claves bajo el prefijo `admin.products`.

---

### Requisito 6: Creación de productos

**User Story:** Como administrador, quiero agregar nuevos productos, para que pueda ampliar el catálogo de la tienda.

#### Criterios de Aceptación

1. THE Products_Table SHALL mostrar un botón "Agregar Producto" visible en la vista de gestión de productos.
2. WHEN el usuario hace clic en "Agregar Producto", THE Admin_Module SHALL mostrar el Product_Form en modo creación.
3. THE Product_Form SHALL incluir campos para: nombre, precio y descripción como mínimo.
4. WHEN el usuario hace clic en "Guardar" dentro del Product_Form en modo creación, THE Product_Form SHALL realizar una petición POST a `/admin/api/products` con el JWT en el header `Authorization: Bearer <token>` y los datos del producto en el cuerpo de la petición.
5. WHEN la petición POST retorna un código de éxito (2xx), THE Admin_Module SHALL cerrar el Product_Form y recargar la lista de productos.
6. IF la petición POST falla, THEN THE Product_Form SHALL mostrar un mensaje de error sin cerrar el formulario.
7. WHEN el usuario hace clic en "Cancelar" dentro del Product_Form, THE Admin_Module SHALL cerrar el formulario sin realizar ninguna petición.

---

### Requisito 7: Edición de productos

**User Story:** Como administrador, quiero editar los datos de un producto existente, para que pueda mantener el catálogo actualizado.

#### Criterios de Aceptación

1. THE Products_Table SHALL mostrar un botón o acción de "Editar" por cada fila de producto.
2. WHEN el usuario hace clic en "Editar" de un producto, THE Admin_Module SHALL mostrar el Product_Form en modo edición con los datos actuales del producto precargados.
3. WHEN el usuario hace clic en "Guardar" dentro del Product_Form en modo edición, THE Product_Form SHALL realizar una petición PUT a `/admin/api/products/{id}` con el JWT en el header `Authorization: Bearer <token>` y los datos actualizados en el cuerpo de la petición.
4. WHEN la petición PUT retorna un código de éxito (2xx), THE Admin_Module SHALL cerrar el Product_Form y recargar la lista de productos.
5. IF la petición PUT falla, THEN THE Product_Form SHALL mostrar un mensaje de error sin cerrar el formulario.

---

### Requisito 8: Eliminación de productos

**User Story:** Como administrador, quiero eliminar productos del catálogo, para que pueda retirar artículos que ya no están disponibles.

#### Criterios de Aceptación

1. THE Products_Table SHALL mostrar un botón o acción de "Eliminar" por cada fila de producto.
2. WHEN el usuario hace clic en "Eliminar" de un producto, THE Admin_Module SHALL mostrar un diálogo de confirmación antes de proceder.
3. WHEN el usuario confirma la eliminación, THE Admin_Module SHALL realizar una petición DELETE a `/admin/api/products/{id}` con el JWT en el header `Authorization: Bearer <token>`.
4. WHEN la petición DELETE retorna un código de éxito (2xx), THE Admin_Module SHALL recargar la lista de productos.
5. IF la petición DELETE falla, THEN THE Admin_Module SHALL mostrar un mensaje de error.
6. WHEN el usuario cancela el diálogo de confirmación, THE Admin_Module SHALL no realizar ninguna petición.

---

### Requisito 9: Autenticación en llamadas al backend

**User Story:** Como administrador, quiero que todas las llamadas al backend incluyan el JWT automáticamente, para que las operaciones estén siempre autorizadas.

#### Criterios de Aceptación

1. THE Admin_API SHALL requerir el JWT en el header `Authorization` con el formato `Bearer <token>` en todas las peticiones GET, POST, PUT y DELETE.
2. IF una petición al Admin_API retorna un código HTTP 401, THEN THE Admin_Module SHALL eliminar el JWT de `localStorage` y redirigir al usuario a `/admin/login`.
3. THE Admin_Module SHALL leer el JWT desde `localStorage` bajo la clave `admin_token` antes de cada petición al Admin_API.

---

### Requisito 10: Internacionalización del módulo de administración

**User Story:** Como administrador, quiero que el panel esté disponible en los idiomas soportados por la aplicación, para que sea consistente con el resto de la tienda.

#### Criterios de Aceptación

1. THE Admin_Module SHALL usar `t()` de `useLocale()` para todos los textos visibles en la interfaz.
2. THE Admin_Module SHALL agregar claves de traducción bajo los prefijos `admin.login`, `admin.sidebar` y `admin.products` en los cuatro idiomas soportados: `es`, `en`, `fr` y `ko` en `src/i18n/translations.js`.
3. WHEN el usuario cambia el idioma desde el selector de idioma, THE Admin_Module SHALL actualizar todos los textos visibles al idioma seleccionado sin recargar la página.

---

### Requisito 11: Diseño responsivo del módulo de administración

**User Story:** Como administrador, quiero que el panel sea usable en dispositivos móviles y tablets, para que pueda gestionar productos desde cualquier dispositivo.

#### Criterios de Aceptación

1. THE Admin_Module SHALL aplicar estilos base para escritorio (>900px), con overrides en `@media (max-width: 900px)` para tablet y `@media (max-width: 640px)` para móvil.
2. WHILE el viewport es menor o igual a 900px, THE Admin_Sidebar SHALL estar colapsado por defecto.
3. WHILE el viewport es menor o igual a 640px, THE Products_Table SHALL adaptar su presentación para ser legible en pantallas pequeñas (por ejemplo, scroll horizontal o vista de tarjetas).
4. THE Admin_Module SHALL garantizar que todos los botones y controles táctiles tengan una altura mínima de 44px en móvil.

---

### Requisito 12: Consistencia visual con la aplicación existente

**User Story:** Como administrador, quiero que el panel de administración tenga un diseño coherente con la tienda, para que la experiencia sea unificada.

#### Criterios de Aceptación

1. THE Admin_Module SHALL usar las variables CSS globales definidas en `index.css` (`--pink`, `--rose`, `--green`, `--dark`, `--cream`, `--gold`).
2. THE Admin_Module SHALL usar Playfair Display para encabezados (`h1`, `h2`, `h3`) y Lato para texto de cuerpo, consistente con el resto de la aplicación.
3. THE Admin_Module SHALL seguir la convención de CSS co-located: cada componente del módulo tendrá su propio archivo `.css` en `src/components/`.
4. THE Admin_Module SHALL seguir la convención de nombres de clase BEM-like, con prefijo `admin-` para evitar colisiones con estilos existentes.
