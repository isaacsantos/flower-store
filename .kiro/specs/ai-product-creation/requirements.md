# Documento de Requisitos — Modal de Creación de Productos con IA

## Introducción

Esta funcionalidad agrega un nuevo flujo en la página de administración de productos que permite a los administradores crear productos de forma masiva a partir de imágenes, utilizando inteligencia artificial. El administrador carga archivos de imagen a través de un modal con soporte de drag-and-drop, y el sistema los envía al backend para procesamiento asíncrono.

## Glosario

- **Modal_IA**: Componente de diálogo modal que permite al administrador cargar archivos de imagen para la creación de productos con IA.
- **Zona_De_Carga**: Área interactiva dentro del Modal_IA donde el administrador puede arrastrar y soltar archivos o seleccionarlos desde el sistema de archivos.
- **Administrador**: Usuario autenticado con rol ADMIN en Firebase que tiene acceso al panel de administración.
- **Endpoint_IA**: Ruta del servidor `POST /admin/api/products/ai-create` que recibe imágenes en formato `multipart/form-data` y devuelve HTTP 202 Accepted cuando la solicitud es aceptada.
- **Límite_Máximo_Archivos**: Cantidad máxima de archivos permitidos por carga, configurada mediante la variable de entorno `VITE_AI_MAX_FILES` con valor por defecto de 10.
- **ProductsTable**: Componente existente que muestra la tabla de productos en el panel de administración.
- **apiUpload**: Función existente en `apiClient.js` que maneja solicitudes `multipart/form-data` con inyección automática del token de Firebase y reintento en caso de HTTP 401.

## Requisitos

### Requisito 1: Botón para abrir el Modal de Creación con IA

**Historia de Usuario:** Como Administrador, quiero ver un botón "Crear Productos con IA" en la página de gestión de productos, para poder acceder rápidamente al flujo de creación masiva por imágenes.

#### Criterios de Aceptación

1. THE ProductsTable SHALL mostrar un botón "Crear Productos con IA" en la cabecera de la página, junto al botón existente "Agregar Producto".
2. WHEN el Administrador hace clic en el botón "Crear Productos con IA", THE ProductsTable SHALL abrir el Modal_IA.
3. THE botón "Crear Productos con IA" SHALL utilizar texto internacionalizado mediante la función `t()` con claves idénticas en los 4 locales (es, en, fr, ko).

### Requisito 2: Modal de Carga de Imágenes

**Historia de Usuario:** Como Administrador, quiero un modal con una zona de carga de archivos, para poder seleccionar las imágenes que serán procesadas por la IA.

#### Criterios de Aceptación

1. WHEN el Modal_IA se abre, THE Modal_IA SHALL mostrar un diálogo con `role="dialog"` y `aria-modal="true"` superpuesto sobre la página.
2. THE Modal_IA SHALL incluir un botón de cierre visible que permita al Administrador cerrar el modal sin enviar archivos.
3. THE Zona_De_Carga SHALL aceptar archivos de imagen mediante arrastrar y soltar (drag and drop).
4. THE Zona_De_Carga SHALL aceptar archivos de imagen mediante un selector de archivos del sistema operativo (input file).
5. THE Zona_De_Carga SHALL aceptar únicamente archivos de tipo imagen (`image/*`).
6. WHILE el Administrador arrastra archivos sobre la Zona_De_Carga, THE Zona_De_Carga SHALL mostrar una indicación visual de que está lista para recibir los archivos.
7. THE Modal_IA SHALL mostrar una vista previa (thumbnail) de cada archivo de imagen cargado.
8. THE Modal_IA SHALL permitir al Administrador eliminar archivos individuales de la lista antes de enviarlos.
9. THE Modal_IA SHALL ser responsivo: ocupar el ancho completo en móvil (≤640px), adaptarse en tablet (≤900px) y centrarse con ancho máximo en desktop (>900px).
10. THE Modal_IA SHALL utilizar texto internacionalizado mediante la función `t()` con claves idénticas en los 4 locales (es, en, fr, ko).

### Requisito 3: Validación del Límite de Archivos

**Historia de Usuario:** Como Administrador, quiero que el sistema limite la cantidad de archivos que puedo cargar, para evitar envíos excesivos al servidor.

#### Criterios de Aceptación

1. THE Modal_IA SHALL leer el Límite_Máximo_Archivos desde la variable de entorno `VITE_AI_MAX_FILES`.
2. IF la variable de entorno `VITE_AI_MAX_FILES` no está definida, THEN THE Modal_IA SHALL usar un valor por defecto de 10.
3. IF el Administrador intenta agregar archivos que superen el Límite_Máximo_Archivos, THEN THE Modal_IA SHALL rechazar los archivos excedentes y mostrar un mensaje de error indicando el límite permitido.
4. WHILE la cantidad de archivos cargados sea igual al Límite_Máximo_Archivos, THE Zona_De_Carga SHALL deshabilitar la posibilidad de agregar más archivos.
5. THE Modal_IA SHALL mostrar un contador indicando la cantidad de archivos cargados respecto al Límite_Máximo_Archivos (por ejemplo, "3 / 10").

### Requisito 4: Envío de Archivos al Endpoint de IA

**Historia de Usuario:** Como Administrador, quiero enviar las imágenes cargadas al servidor para que la IA procese y cree los productos automáticamente.

#### Criterios de Aceptación

1. WHEN el Administrador hace clic en el botón de envío, THE Modal_IA SHALL enviar los archivos al Endpoint_IA mediante una solicitud `POST` con `multipart/form-data`, agregando cada archivo como un campo separado con el nombre `files` (es decir, `formData.append('files', file)` por cada archivo), de modo que el backend los reciba como `@RequestParam("files") List<MultipartFile>`.
2. THE Modal_IA SHALL utilizar la función `apiUpload` existente para inyectar el token de autenticación de Firebase y manejar reintentos en caso de HTTP 401.
3. WHILE el envío está en progreso, THE Modal_IA SHALL mostrar un indicador de carga y deshabilitar el botón de envío para evitar envíos duplicados.
4. WHILE el envío está en progreso, THE Modal_IA SHALL deshabilitar el botón de cierre del modal.
5. IF no hay archivos cargados, THEN THE Modal_IA SHALL deshabilitar el botón de envío.

### Requisito 5: Manejo de Respuesta del Servidor

**Historia de Usuario:** Como Administrador, quiero recibir retroalimentación clara sobre el resultado del envío, para saber si mis productos serán procesados o si ocurrió un error.

#### Criterios de Aceptación

1. WHEN el Endpoint_IA responde con HTTP 202 Accepted, THE Modal_IA SHALL mostrar un mensaje de éxito indicando que los productos estarán disponibles pronto para revisión.
2. WHEN el Endpoint_IA responde con cualquier código HTTP diferente de 202, THE Modal_IA SHALL mostrar un mensaje de error indicando que no se pudieron procesar las imágenes.
3. WHEN el envío es exitoso (HTTP 202), THE Modal_IA SHALL permitir al Administrador cerrar el modal mediante un botón de confirmación.
4. WHEN el envío falla, THE Modal_IA SHALL permitir al Administrador reintentar el envío o cerrar el modal.
5. THE mensajes de éxito y error SHALL utilizar texto internacionalizado mediante la función `t()` con claves idénticas en los 4 locales (es, en, fr, ko).
