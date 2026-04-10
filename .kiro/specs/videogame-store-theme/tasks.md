# Plan de Implementación: Videogame Store Theme

## Visión General

Transformación visual completa del sitio de florería en una tienda de videojuegos. Se sigue el orden del diseño: 1) tema global (CSS vars + fuentes), 2) traducciones i18n, 3) archivos CSS de componentes, 4) archivos JSX de componentes, 5) metadatos del sitio. No se modifica ningún archivo de backend, admin ni lógica de negocio.

## Tareas

- [x] 1. Configurar tema global y tipografía en `src/index.css`
  - [x] 1.1 Actualizar import de Google Fonts: reemplazar `Playfair Display` y `Lato` por `Orbitron` (encabezados) y `Exo 2` (cuerpo)
    - Cambiar la URL de `@import` en la primera línea de `src/index.css`
    - _Requisitos: 2.1, 2.2_
  - [x] 1.2 Actualizar variables CSS `:root` con la paleta gaming
    - `--pink: #a855f7` (púrpura neón), `--rose: #00d4ff` (azul eléctrico), `--green: #39ff14` (verde neón), `--dark: #0a0e1a` (fondo oscuro), `--cream: #0f1328` (fondo secundario), `--gold: #ffd700` (dorado gaming)
    - Mantener los mismos nombres de variables para compatibilidad
    - _Requisitos: 1.1, 1.2_
  - [x] 1.3 Actualizar `font-family` en `body` y regla `h1, h2, h3`
    - `body`: `'Exo 2', sans-serif`
    - `h1, h2, h3`: `'Orbitron', sans-serif`
    - _Requisitos: 2.1, 2.2, 2.3_

- [x] 2. Actualizar traducciones i18n en `src/i18n/translations.js`
  - [x] 2.1 Actualizar textos del banner, carousel, marketplace, footer, product, notfound y contact en locale `es`
    - Reemplazar nombre de marca "El Jardin de Casa Blanca" por "Pixel Realm" en todas las claves donde aparezca
    - Reemplazar textos florales por textos de videojuegos en todas las claves públicas (no `admin.*`)
    - Incluir claves `banner.mothers.*` y `banner.valentines.*` con textos gaming
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 5.3_
  - [x] 2.2 Actualizar textos en locale `en` con los mismos cambios temáticos
    - Mismas claves que 2.1, traducidas al inglés con temática gaming
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 5.3_
  - [x] 2.3 Actualizar textos en locale `fr` con los mismos cambios temáticos
    - Mismas claves que 2.1, traducidas al francés con temática gaming
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 5.3_
  - [x] 2.4 Actualizar textos en locale `ko` con los mismos cambios temáticos
    - Mismas claves que 2.1, traducidas al coreano con temática gaming
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 5.3_
  - [x] 2.5 Verificar que el conjunto de claves sea idéntico en los 4 locales — no agregar ni eliminar claves
    - _Requisito: 3.10_

- [x] 3. Checkpoint — Verificar tema global y traducciones
  - Asegurar que las variables CSS, fuentes y traducciones estén correctas. Preguntar al usuario si hay dudas.

- [x] 4. Actualizar archivos CSS de componentes con paleta gaming
  - [x] 4.1 Actualizar `src/components/Banner.css`
    - Reemplazar gradientes de fondo rosados por tonos oscuros/neón (`#0a0e1a`, `#0f1328`, `#1a1f3a`)
    - Reemplazar colores hardcodeados (`#e11d48` → `#00d4ff`, `#f472b6` → `#a855f7`, `#fff0f6` → `#0f1328`, `#fce7f3` → `#1a1f3a`, `#1a0a0f` → `#0a0e1a`, `#6b3a4a` → `#8b9dc3`)
    - Actualizar SVG wave fill de `#fff7f0` a `#0f1328`
    - Actualizar blob decorativo a tonos neón
    - Actualizar banner Mother's Day y Valentine's Day con colores gaming
    - Preservar estructura responsive (mobile ≤640px, tablet ≤900px, desktop)
    - _Requisitos: 1.3, 1.4, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2_
  - [x] 4.2 Actualizar `src/components/Carousel.css`
    - Fondo sección: `#fff7f0` → tono oscuro
    - Colores de tarjetas, tags, overlays, arrows, dots → paleta gaming
    - Skeletons → tonos oscuros
    - Preservar estructura responsive
    - _Requisitos: 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 4.3 Actualizar `src/components/Navbar.css`
    - Fondo: `rgba(255,247,240,0.92)` → fondo oscuro semi-transparente
    - Colores de enlaces, hover underline, CTA, hamburger → paleta gaming
    - Menú móvil → fondo oscuro
    - Reemplazar `'Playfair Display', serif` por `'Orbitron', sans-serif`
    - Preservar estructura responsive
    - _Requisitos: 1.3, 1.4, 2.3, 7.3, 7.4, 7.5, 7.6_
  - [x] 4.4 Actualizar `src/components/Footer.css`
    - Gradientes de fondo → tonos oscuros gaming
    - Colores de texto, enlaces, headings, newsletter → paleta gaming
    - Reemplazar `'Playfair Display', serif` por `'Orbitron', sans-serif`
    - Preservar estructura responsive
    - _Requisitos: 1.3, 1.4, 2.3, 8.2, 8.3, 8.4_
  - [x] 4.5 Actualizar `src/components/Marketplace.css`
    - Fondo página → oscuro
    - Tarjetas, filtros, paginación, skeletons → paleta gaming
    - Reemplazar colores hardcodeados florales
    - Preservar estructura responsive
    - _Requisitos: 1.3, 1.4, 9.1, 9.3, 9.4, 9.5_
  - [x] 4.6 Actualizar `src/components/ProductDetail.css`
    - Fondo, skeleton, arrows, dots, sombras → paleta gaming
    - Colores de texto (nombre, precio, descripción) → coherentes con tema oscuro
    - Reemplazar colores hardcodeados florales
    - Preservar estructura responsive
    - _Requisitos: 1.3, 1.4, 10.1, 10.2, 10.3, 10.4_
  - [x] 4.7 Actualizar `src/components/NotFound.css`
    - Fondo, colores, CTA → paleta gaming
    - Reemplazar colores hardcodeados florales (`#fff0f6`, `#fce7f3`, `#6b3a4a`, `#e11d48`, `#f472b6`)
    - Preservar estructura responsive
    - _Requisitos: 1.3, 1.4, 11.2, 11.3_
  - [x] 4.8 Actualizar `src/components/Contact.css`
    - Fondo, colores, tarjetas de sucursal, botones → paleta gaming
    - Reemplazar `'Playfair Display', serif` por `'Orbitron', sans-serif`
    - Reemplazar colores hardcodeados florales
    - Preservar estructura responsive
    - _Requisitos: 1.3, 1.4, 2.3, 12.2, 12.3_

- [x] 5. Checkpoint — Verificar CSS de componentes
  - Asegurar que todos los archivos CSS usen la nueva paleta y no contengan colores florales hardcodeados. Preguntar al usuario si hay dudas.

- [x] 6. Actualizar archivos JSX de componentes
  - [x] 6.1 Actualizar `src/components/Banner.jsx`
    - `DefaultBanner`: Emojis `🌸🌺🌼🌷🌹💐` → `🎮🕹️👾🏆⚡🎯`
    - Imagen hero: URL de bouquet → URL de imagen gaming, actualizar atributo `alt`
    - Badges: textos hardcodeados → claves i18n con textos gaming
    - `MothersDayBanner`: Emojis de flores/corazones → emojis gaming, actualizar ribbon
    - `ValentinesBanner`: Emojis románticos → emojis gaming
    - SVG wave fills en los tres banners → color coherente con nueva paleta
    - _Requisitos: 4.1, 4.2, 4.3, 4.6, 5.1, 5.2_
  - [x] 6.2 Actualizar `src/components/Navbar.jsx`
    - Logo texto: "El Jardin de Casa Blanca" → "Pixel Realm"
    - Alt de imagen logo → "Pixel Realm"
    - _Requisitos: 7.1, 7.2_
  - [x] 6.3 Actualizar `src/components/Footer.jsx`
    - Logo: "🌸 El Jardin de Casa Blanca" → "🎮 Pixel Realm"
    - _Requisito: 8.1_
  - [x] 6.4 Actualizar `src/components/Marketplace.jsx`
    - Emojis flotantes: `🌸🌷🌺🍃🌼💐` → `🎮🕹️👾⚡🏆🎯`
    - _Requisito: 9.2_
  - [x] 6.5 Actualizar `src/components/NotFound.jsx`
    - Emojis flotantes: `🌸🌷🌺🍃🌼` → `🎮🕹️👾⚡🏆`
    - _Requisito: 11.1_
  - [x] 6.6 Actualizar `src/components/Contact.jsx`
    - Emojis flotantes: `🌸🌷🌺🍃🌼💐` → `🎮🕹️👾⚡🏆🎯`
    - _Requisito: 12.1_

- [x] 7. Actualizar metadatos del sitio
  - [x] 7.1 Actualizar `<title>` en `index.html` de "El Jardin de Casa Blanca" a "Pixel Realm"
    - _Requisito: 13.1_
  - [x] 7.2 Reemplazar `public/favicon.svg` por un favicon de gamepad/gaming
    - Crear un SVG simple representativo de videojuegos (gamepad)
    - _Requisito: 13.2_

- [x] 8. Checkpoint — Verificar cambios JSX y metadatos
  - Asegurar que todos los emojis, textos de marca y metadatos estén actualizados. Verificar que no queden referencias a la marca floral. Preguntar al usuario si hay dudas.

- [x] 9. Tests de propiedades y unitarios
  - [x] 9.1 Escribir test de propiedad: Ausencia de colores florales en archivos CSS
    - **Propiedad 1: Ausencia de colores florales en archivos CSS**
    - Usar fast-check para seleccionar archivos CSS aleatorios de `src/` (excluyendo Admin) y verificar que no contengan colores hardcodeados florales (`#e11d48`, `#f472b6`, `#fff0f6`, `#fce7f3`, `#1a0a0f`, `#6b3a4a`, `#f9a8d4`, `#f0d6e4`, `#fff7f0`, `#fff0f8`)
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 1.3, 1.4**
  - [x] 9.2 Escribir test de propiedad: Ausencia de fuente floral en archivos CSS
    - **Propiedad 2: Ausencia de fuente floral en archivos CSS**
    - Usar fast-check para seleccionar archivos CSS aleatorios de `src/` y verificar que no contengan "Playfair Display"
    - Mínimo 100 iteraciones
    - **Valida: Requisito 2.3**
  - [x] 9.3 Escribir test de propiedad: Ausencia de texto floral en traducciones públicas
    - **Propiedad 3: Ausencia de texto floral y marca antigua en traducciones públicas**
    - Usar fast-check para seleccionar locale y clave pública aleatorios, verificar que el valor no contenga palabras florales ni "El Jardin de Casa Blanca" / "Petal & Bloom"
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 3.1, 3.2**
  - [x] 9.4 Escribir test de propiedad: Consistencia de claves entre locales
    - **Propiedad 4: Consistencia de claves de traducción entre locales**
    - Usar fast-check para seleccionar pares de locales aleatorios y verificar que sus conjuntos de claves sean idénticos
    - Mínimo 100 iteraciones
    - **Valida: Requisito 3.10**
  - [x] 9.5 Escribir test de propiedad: Preservación de archivos backend y admin
    - **Propiedad 5: Preservación de archivos backend y admin**
    - Usar fast-check para seleccionar archivos backend/admin aleatorios y verificar que su contenido no haya sido modificado
    - Mínimo 100 iteraciones
    - **Valida: Requisitos 14.1, 14.3, 14.4**
  - [x] 9.6 Escribir tests unitarios de verificación puntual
    - Verificar que `index.css` contenga variables `:root` con valores gaming e import de Orbitron/Exo 2
    - Verificar que `index.html` contenga `<title>` con "Pixel Realm"
    - Verificar que `Banner.jsx` contenga emojis gaming y no emojis florales
    - Verificar que `Navbar.jsx` contenga "Pixel Realm" como logo
    - Verificar que `Footer.jsx` contenga "🎮 Pixel Realm"
    - Verificar que `Marketplace.jsx`, `NotFound.jsx`, `Contact.jsx` contengan emojis gaming
    - Verificar que `App.jsx` preserve las rutas existentes (/, /shop, /product/:id, /contact, /admin/*)
    - **Valida: Requisitos 1.1, 2.1, 3.2, 4.1, 7.1, 8.1, 9.2, 11.1, 12.1, 13.1, 14.2**

- [x] 10. Checkpoint final — Asegurar que todos los tests pasen
  - Ejecutar todos los tests. Asegurar que pasen. Preguntar al usuario si hay dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan invariantes universales de correctitud
- Los tests unitarios validan casos específicos puntuales
- No se modifican archivos de backend, admin, firebase ni utilidades (Requisito 14)
