# Plan de Implementación: Modal de Creación de Productos con IA

## Resumen

Implementar un modal que permita a los administradores cargar imágenes para creación masiva de productos vía IA. Se agrega `apiUploadRaw` en el cliente API, un nuevo componente `AiProductModal` con drag-and-drop y validación de límite, 16 claves i18n en 4 locales, y la integración en `ProductsTable`. Tests con fast-check para las 8 propiedades de correctitud.

## Tareas

- [x] 1. Agregar `apiUploadRaw` en `apiClient.js` y variable de entorno
  - [x] 1.1 Crear la función `apiUploadRaw` en `src/utils/apiClient.js`
    - Misma lógica de inyección de token y reintento 401 que `apiUpload`
    - Retorna el objeto `Response` nativo en lugar de llamar `res.json()`
    - Exportar la función junto a las existentes
    - _Requisitos: 4.1, 4.2_

  - [x] 1.2 Agregar `VITE_AI_MAX_FILES` en `.env.example`
    - Agregar la línea `VITE_AI_MAX_FILES=10` con comentario descriptivo
    - _Requisitos: 3.1, 3.2_

- [x] 2. Agregar las 16 claves i18n con prefijo `admin.ai.*` en `translations.js`
  - Agregar las claves `admin.ai.button`, `admin.ai.title`, `admin.ai.dropzone`, `admin.ai.dropzone.active`, `admin.ai.browse`, `admin.ai.counter`, `admin.ai.error.limit`, `admin.ai.error.send`, `admin.ai.error.type`, `admin.ai.send`, `admin.ai.sending`, `admin.ai.success`, `admin.ai.accept`, `admin.ai.retry`, `admin.ai.close`, `admin.ai.remove` en los 4 locales (es, en, fr, ko)
  - Cada clave debe tener un valor string no vacío en cada locale
  - _Requisitos: 1.3, 2.10, 3.3, 3.5, 5.5_

  - [x] 2.1 Escribir test de propiedad para completitud de claves i18n
    - **Propiedad 1: Completitud de claves i18n**
    - **Valida: Requisitos 1.3, 2.10, 5.5**

- [x] 3. Crear el componente `AiProductModal`
  - [x] 3.1 Crear `src/components/AiProductModal.css`
    - Seguir el patrón de estilos de `ProductForm.css` (overlay, card, acciones)
    - Estilos para zona de drag-and-drop con estado activo
    - Estilos para thumbnails de preview con botón de eliminar
    - Estilos para contador de archivos, indicador de carga, mensajes de éxito/error
    - Responsive: mobile (≤640px), tablet (≤900px), desktop (>900px)
    - _Requisitos: 2.1, 2.6, 2.7, 2.9_

  - [x] 3.2 Crear `src/components/AiProductModal.jsx`
    - Props: `onClose` (callback para cerrar el modal)
    - Estado interno: `files`, `previews`, `dragOver`, `sending`, `result`, `error`
    - Leer `MAX_FILES` de `import.meta.env.VITE_AI_MAX_FILES` con default 10
    - Calcular `AI_ENDPOINT` como `ADMIN_API_URL.replace(/\/products$/, '/products/ai-create')`
    - Zona de carga con `onDrop`, `onDragOver`, `onDragLeave` y `<input type="file" accept="image/*" multiple>`
    - Filtrar archivos no-imagen (solo `type.startsWith('image/')`)
    - Validar límite MAX_FILES al agregar archivos; rechazar excedentes con error i18n
    - Deshabilitar zona de carga cuando `files.length === MAX_FILES`
    - Generar previews con `URL.createObjectURL`, revocar en cleanup con `useEffect`
    - Mostrar thumbnails con botón de eliminar individual
    - Mostrar contador `"{count} / {max}"`
    - Al enviar: construir `FormData` con `formData.append('files', file)` por cada archivo
    - Llamar `apiUploadRaw(AI_ENDPOINT, formData, user)`
    - Si `response.status === 202` → estado éxito con botón "Aceptar"
    - Si otro status → estado error con botones "Reintentar" y "Cerrar"
    - Durante envío: indicador de carga, deshabilitar botón envío y cierre
    - Botón envío deshabilitado si no hay archivos
    - Atributos `role="dialog"` y `aria-modal="true"` en el overlay
    - Todos los textos vía `t()` con claves `admin.ai.*`
    - _Requisitos: 2.1–2.10, 3.1–3.5, 4.1–4.5, 5.1–5.5_

  - [x] 3.3 Escribir test de propiedad para filtro exclusivo de imágenes
    - **Propiedad 2: Filtro exclusivo de imágenes**
    - **Valida: Requisito 2.5**

  - [x] 3.4 Escribir test de propiedad para invariante de archivos y previews
    - **Propiedad 3: Invariante de lista de archivos y previews**
    - **Valida: Requisitos 2.7, 2.8**

  - [x] 3.5 Escribir test de propiedad para cumplimiento del límite de archivos
    - **Propiedad 4: Cumplimiento del límite de archivos**
    - **Valida: Requisitos 3.3, 3.4**

  - [x] 3.6 Escribir test de propiedad para precisión del contador
    - **Propiedad 5: Precisión del contador de archivos**
    - **Valida: Requisito 3.5**

  - [x] 3.7 Escribir test de propiedad para construcción correcta de FormData
    - **Propiedad 6: Construcción correcta de FormData**
    - **Valida: Requisito 4.1**

  - [x] 3.8 Escribir test de propiedad para botón de envío deshabilitado sin archivos
    - **Propiedad 7: Botón de envío deshabilitado sin archivos**
    - **Valida: Requisito 4.5**

  - [x] 3.9 Escribir test de propiedad para respuesta no-202 muestra error
    - **Propiedad 8: Respuesta no-202 muestra error**
    - **Valida: Requisito 5.2**

  - [x] 3.10 Escribir tests unitarios para AiProductModal
    - Renderizado con atributos ARIA `role="dialog"` y `aria-modal="true"` (Req 2.1)
    - Botón de cierre visible y funcional (Req 2.2)
    - Drag-and-drop agrega archivos de imagen (Req 2.3)
    - Selector de archivos agrega archivos (Req 2.4)
    - Indicación visual durante drag-over (Req 2.6)
    - Lectura de VITE_AI_MAX_FILES y default 10 (Req 3.1, 3.2)
    - Indicador de carga y botones deshabilitados durante envío (Req 4.3, 4.4)
    - Mensaje de éxito con botón "Aceptar" en HTTP 202 (Req 5.1, 5.3)
    - Botones "Reintentar" y "Cerrar" en error (Req 5.4)
    - _Requisitos: 2.1–2.6, 3.1, 3.2, 4.3, 4.4, 5.1, 5.3, 5.4_

- [x] 4. Checkpoint — Verificar componente AiProductModal
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 5. Integrar AiProductModal en ProductsTable
  - [x] 5.1 Modificar `src/components/ProductsTable.jsx`
    - Importar `AiProductModal`
    - Agregar estado `showAiModal` (boolean, default false)
    - Agregar botón "Crear Productos con IA" junto al botón "Agregar Producto" en la cabecera
    - Texto del botón vía `t('admin.ai.button')`
    - Renderizar `<AiProductModal onClose={() => setShowAiModal(false)} />` condicionalmente
    - _Requisitos: 1.1, 1.2, 1.3_

  - [x] 5.2 Escribir tests unitarios para la integración en ProductsTable
    - Renderizado del botón "Crear Productos con IA" (Req 1.1)
    - Apertura del modal al hacer clic en el botón (Req 1.2)
    - _Requisitos: 1.1, 1.2_

- [x] 6. Checkpoint final — Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan invariantes universales de correctitud con fast-check
- Los tests unitarios validan ejemplos específicos y casos borde
