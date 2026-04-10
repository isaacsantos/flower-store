# Documento de Requisitos

## Introducción

Este documento define los requisitos para transformar el sitio web actual de florería "Petal & Bloom" / "El Jardín de Casa Blanca" en una tienda de videojuegos. El cambio es exclusivamente de UI y branding — todos los aspectos visuales (colores, tipografía, iconografía, textos, imágenes, animaciones y emojis decorativos) deben reflejar una temática de videojuegos. La funcionalidad del backend permanece intacta: mismos endpoints, mismas integraciones, misma estructura de datos. La API es configurable y simplemente se apunta a los endpoints correspondientes.

## Glosario

- **Sistema_de_Tema**: Conjunto de variables CSS globales definidas en `index.css` bajo `:root` que controlan la paleta de colores del sitio.
- **Componente_Visual**: Cualquier componente React en `src/components/` que renderiza UI visible al usuario (Banner, Carousel, Navbar, Footer, Marketplace, ProductDetail, Contact, NotFound).
- **Archivo_de_Traducciones**: El archivo `src/i18n/translations.js` que contiene todos los textos visibles al usuario en los 4 locales (es, en, fr, ko).
- **Emojis_Decorativos**: Emojis flotantes usados como elementos de fondo en Banner, Marketplace, Contact y NotFound (actualmente flores: 🌸, 🌷, 🌺, etc.).
- **Banner_Principal**: Sección hero de la página de inicio que muestra el mensaje promocional principal, imagen destacada y CTAs.
- **Carousel_de_Productos**: Sección de la homepage que muestra tarjetas de productos en un carrusel horizontal con navegación.
- **Marketplace**: Página de tienda con grid de productos, filtros por tags y paginación.
- **Breakpoint_Mobile**: Ancho de pantalla ≤ 640px.
- **Breakpoint_Tablet**: Ancho de pantalla ≤ 900px.
- **Breakpoint_Desktop**: Ancho de pantalla > 900px.

## Requisitos

### Requisito 1: Paleta de Colores Global

**Historia de Usuario:** Como visitante del sitio, quiero ver una paleta de colores que evoque el mundo de los videojuegos, para que la experiencia visual sea coherente con una tienda de gaming.

#### Criterios de Aceptación

1. THE Sistema_de_Tema SHALL definir las variables CSS `:root` con una paleta de colores orientada a videojuegos, reemplazando los valores actuales de `--pink`, `--rose`, `--green`, `--dark`, `--cream` y `--gold` por tonos oscuros, neón y tecnológicos (por ejemplo: azul eléctrico, púrpura neón, verde neón, fondo oscuro, gris carbón).
2. THE Sistema_de_Tema SHALL mantener los mismos nombres de variables CSS (`--pink`, `--rose`, `--green`, `--dark`, `--cream`, `--gold`) para preservar la compatibilidad con todos los componentes existentes.
3. WHEN el Sistema_de_Tema aplique la nueva paleta, THE Sistema_de_Tema SHALL asegurar que todos los gradientes CSS en Banner, Carousel, Marketplace, Footer, Navbar y ProductDetail utilicen los nuevos colores de la temática de videojuegos.
4. THE Sistema_de_Tema SHALL reemplazar los colores hardcodeados en los archivos CSS de cada componente (por ejemplo `#e11d48`, `#f472b6`, `#fff0f6`, `#fce7f3`, `#1a0a0f`, `#6b3a4a`) por valores coherentes con la temática de videojuegos.

### Requisito 2: Tipografía

**Historia de Usuario:** Como visitante del sitio, quiero que la tipografía refleje una estética moderna y tecnológica, para que el sitio se sienta como una tienda de videojuegos.

#### Criterios de Aceptación

1. THE Sistema_de_Tema SHALL reemplazar la fuente de encabezados "Playfair Display" por una fuente sans-serif moderna y tecnológica adecuada para una tienda de gaming (por ejemplo: "Orbitron", "Rajdhani" o "Press Start 2P"), importada desde Google Fonts en `index.css`.
2. THE Sistema_de_Tema SHALL mantener una fuente sans-serif legible para el cuerpo de texto (puede conservar "Lato" o reemplazarla por otra como "Inter" o "Exo 2").
3. THE Sistema_de_Tema SHALL actualizar todas las referencias a `'Playfair Display', serif` en los archivos CSS de los componentes para usar la nueva fuente de encabezados.

### Requisito 3: Textos e Internacionalización (i18n)

**Historia de Usuario:** Como visitante del sitio, quiero que todos los textos reflejen la temática de videojuegos en mi idioma, para que la experiencia sea coherente y localizada.

#### Criterios de Aceptación

1. THE Archivo_de_Traducciones SHALL actualizar todas las claves de texto orientadas a flores por textos orientados a videojuegos en los 4 locales (es, en, fr, ko).
2. THE Archivo_de_Traducciones SHALL reemplazar el nombre de marca "El Jardin de Casa Blanca" / "Petal & Bloom" por un nombre de marca orientado a videojuegos en todas las claves donde aparezca.
3. THE Archivo_de_Traducciones SHALL actualizar las claves del banner (`banner.eyebrow`, `banner.title`, `banner.title.accent`, `banner.sub`, `banner.cta.ghost`) con textos temáticos de videojuegos en los 4 locales.
4. THE Archivo_de_Traducciones SHALL actualizar las claves del carousel (`carousel.eyebrow`, `carousel.title`, `carousel.sub`, `carousel.card.desc`, `carousel.card.quickAdd`, `carousel.card.addToCart`, y todas las claves `carousel.tag.*`) con textos temáticos de videojuegos en los 4 locales.
5. THE Archivo_de_Traducciones SHALL actualizar las claves del marketplace (`marketplace.title`, `marketplace.sub`) con textos temáticos de videojuegos en los 4 locales.
6. THE Archivo_de_Traducciones SHALL actualizar las claves del footer (`footer.tagline`, `footer.shop.heading`, `footer.shop.bouquets`, `footer.shop.seasonal`, `footer.shop.gifts`, `footer.shop.subscriptions`, `footer.newsletter.heading`, `footer.newsletter.desc`, `footer.copyright`) con textos temáticos de videojuegos en los 4 locales.
7. THE Archivo_de_Traducciones SHALL actualizar las claves de la página de producto (`product.defaultDesc`, `product.cta`, `product.whatsappMsg`) con textos temáticos de videojuegos en los 4 locales.
8. THE Archivo_de_Traducciones SHALL actualizar las claves de la página NotFound (`notfound.emoji`, `notfound.title`, `notfound.sub`, `notfound.cta`) con textos temáticos de videojuegos en los 4 locales.
9. THE Archivo_de_Traducciones SHALL actualizar las claves de la página de contacto (`contact.eyebrow`, `contact.title`, `contact.sub`) con textos temáticos de videojuegos en los 4 locales.
10. THE Archivo_de_Traducciones SHALL mantener el mismo conjunto de claves en los 4 locales (es, en, fr, ko) sin agregar ni eliminar claves.


### Requisito 4: Banner Principal (Hero)

**Historia de Usuario:** Como visitante del sitio, quiero que el banner principal transmita la emoción de los videojuegos, para sentirme atraído a explorar la tienda.

#### Criterios de Aceptación

1. THE Banner_Principal SHALL reemplazar los Emojis_Decorativos flotantes de flores (🌸, 🌺, 🌼, 🌷, 🌹, 💐) por emojis temáticos de videojuegos (por ejemplo: 🎮, 🕹️, 👾, 🏆, ⚡, 🎯).
2. THE Banner_Principal SHALL reemplazar la imagen hero actual (bouquet de flores) por una imagen representativa de videojuegos, actualizando la URL de la imagen y el atributo `alt`.
3. THE Banner_Principal SHALL actualizar los badges flotantes con textos temáticos de videojuegos (por ejemplo: "🎮 Entrega Digital" y "⚡ Últimos Lanzamientos") usando claves i18n.
4. THE Banner_Principal SHALL actualizar los gradientes de fondo del banner para usar colores oscuros y neón coherentes con la temática de videojuegos.
5. THE Banner_Principal SHALL actualizar el color del blob decorativo detrás de la imagen para usar tonos de la nueva paleta de videojuegos.
6. THE Banner_Principal SHALL actualizar el color de relleno del SVG wave en la parte inferior del banner para que sea coherente con el fondo de la siguiente sección.
7. THE Banner_Principal SHALL mantener la estructura responsive existente para Breakpoint_Mobile, Breakpoint_Tablet y Breakpoint_Desktop.

### Requisito 5: Banners Temáticos (Día de las Madres y San Valentín)

**Historia de Usuario:** Como administrador del sitio, quiero que los banners temáticos estacionales también reflejen la temática de videojuegos, para mantener coherencia visual en todas las variantes del banner.

#### Criterios de Aceptación

1. THE Banner_Principal SHALL actualizar el banner de Día de las Madres (`MothersDayBanner`) reemplazando emojis de flores y corazones por emojis de videojuegos, y actualizando los gradientes y colores a la temática gaming.
2. THE Banner_Principal SHALL actualizar el banner de San Valentín (`ValentinesBanner`) reemplazando emojis románticos por emojis de videojuegos, y actualizando los gradientes, overlays y colores a la temática gaming.
3. THE Archivo_de_Traducciones SHALL actualizar todas las claves `banner.mothers.*` y `banner.valentines.*` con textos temáticos de videojuegos en los 4 locales.

### Requisito 6: Carousel de Productos

**Historia de Usuario:** Como visitante del sitio, quiero que la sección de productos destacados tenga una apariencia de tienda de videojuegos, para que los productos se presenten en un contexto gaming.

#### Criterios de Aceptación

1. THE Carousel_de_Productos SHALL actualizar el fondo de la sección (`carousel-section`) de tonos cálidos/rosados a colores oscuros o neutros coherentes con la temática de videojuegos.
2. THE Carousel_de_Productos SHALL actualizar los colores de las tarjetas de producto (`.product-card`), incluyendo el tag, el overlay, el precio y las sombras, para usar la nueva paleta de videojuegos.
3. THE Carousel_de_Productos SHALL actualizar los colores de los botones de navegación (`.carousel-arrow`) y los dots indicadores para usar la nueva paleta.
4. THE Carousel_de_Productos SHALL actualizar los colores del skeleton de carga para ser coherentes con la nueva paleta.
5. THE Carousel_de_Productos SHALL mantener la estructura responsive existente para Breakpoint_Mobile, Breakpoint_Tablet y Breakpoint_Desktop.

### Requisito 7: Navbar

**Historia de Usuario:** Como visitante del sitio, quiero que la barra de navegación refleje la identidad de una tienda de videojuegos, para que la marca sea reconocible desde el primer momento.

#### Criterios de Aceptación

1. THE Componente_Visual Navbar SHALL actualizar el texto del logo de "El Jardin de Casa Blanca" a un nombre de marca de videojuegos, usando la clave i18n correspondiente o texto directo si es nombre de marca.
2. THE Componente_Visual Navbar SHALL actualizar el emoji del logo (actualmente referencia a flores) por un icono o emoji de videojuegos.
3. THE Componente_Visual Navbar SHALL actualizar el fondo de la barra de navegación (`background`, `backdrop-filter`) para usar colores oscuros coherentes con la temática gaming.
4. THE Componente_Visual Navbar SHALL actualizar los colores de los enlaces, el hover underline y el botón CTA para usar la nueva paleta de videojuegos.
5. THE Componente_Visual Navbar SHALL actualizar el menú móvil (`.nav-menu.open`) para usar el fondo oscuro de la temática gaming.
6. THE Componente_Visual Navbar SHALL mantener la estructura responsive existente para Breakpoint_Mobile, Breakpoint_Tablet y Breakpoint_Desktop.

### Requisito 8: Footer

**Historia de Usuario:** Como visitante del sitio, quiero que el footer refleje la identidad de una tienda de videojuegos, para que la experiencia sea coherente hasta el final de la página.

#### Criterios de Aceptación

1. THE Componente_Visual Footer SHALL actualizar el emoji y texto del logo de "🌸 El Jardin de Casa Blanca" a un nombre e icono de videojuegos.
2. THE Componente_Visual Footer SHALL actualizar los gradientes de fondo del footer para usar colores oscuros coherentes con la temática gaming.
3. THE Componente_Visual Footer SHALL actualizar los colores de texto, enlaces, headings y el formulario de newsletter para usar la nueva paleta de videojuegos.
4. THE Componente_Visual Footer SHALL mantener la estructura responsive existente para Breakpoint_Mobile, Breakpoint_Tablet y Breakpoint_Desktop.

### Requisito 9: Marketplace (Tienda)

**Historia de Usuario:** Como visitante del sitio, quiero que la página de tienda tenga una apariencia de catálogo de videojuegos, para navegar los productos en un contexto gaming.

#### Criterios de Aceptación

1. THE Componente_Visual Marketplace SHALL actualizar el fondo de la página de tonos rosados/cálidos a colores oscuros o neutros coherentes con la temática de videojuegos.
2. THE Componente_Visual Marketplace SHALL reemplazar los Emojis_Decorativos flotantes de flores por emojis de videojuegos.
3. THE Componente_Visual Marketplace SHALL actualizar los colores de las tarjetas de producto (`.mp-card`), overlay, sidebar de filtros, paginación y skeletons para usar la nueva paleta de videojuegos.
4. THE Componente_Visual Marketplace SHALL actualizar los colores de los filtros de tags (`.mp-tag-item`, `.mp-tag-item--active`) para usar la nueva paleta.
5. THE Componente_Visual Marketplace SHALL mantener la estructura responsive existente para Breakpoint_Mobile, Breakpoint_Tablet y Breakpoint_Desktop.

### Requisito 10: Página de Detalle de Producto

**Historia de Usuario:** Como visitante del sitio, quiero que la página de detalle de producto tenga una apariencia coherente con una tienda de videojuegos, para que la experiencia de compra sea inmersiva.

#### Criterios de Aceptación

1. THE Componente_Visual ProductDetail SHALL actualizar el fondo de la página, los colores del skeleton de carga, las flechas de navegación de imágenes y los dots para usar la nueva paleta de videojuegos.
2. THE Componente_Visual ProductDetail SHALL actualizar los colores del nombre del producto, precio, descripción y el botón CTA de WhatsApp para ser coherentes con la temática gaming.
3. THE Componente_Visual ProductDetail SHALL actualizar las sombras de la imagen del producto para usar tonos de la nueva paleta.
4. THE Componente_Visual ProductDetail SHALL mantener la estructura responsive existente para Breakpoint_Mobile, Breakpoint_Tablet y Breakpoint_Desktop.

### Requisito 11: Página NotFound (404)

**Historia de Usuario:** Como visitante del sitio, quiero que la página de error 404 tenga una temática de videojuegos, para que incluso los errores se sientan parte de la experiencia gaming.

#### Criterios de Aceptación

1. THE Componente_Visual NotFound SHALL reemplazar los Emojis_Decorativos flotantes de flores por emojis de videojuegos.
2. THE Componente_Visual NotFound SHALL actualizar el fondo de la página, los colores del título, subtítulo y el botón CTA para usar la nueva paleta de videojuegos.
3. THE Componente_Visual NotFound SHALL mantener la estructura responsive existente para Breakpoint_Mobile y Breakpoint_Desktop.

### Requisito 12: Página de Contacto

**Historia de Usuario:** Como visitante del sitio, quiero que la página de contacto tenga una apariencia coherente con la temática de videojuegos, para que toda la experiencia del sitio sea uniforme.

#### Criterios de Aceptación

1. THE Componente_Visual Contact SHALL reemplazar los Emojis_Decorativos flotantes de flores por emojis de videojuegos.
2. THE Componente_Visual Contact SHALL actualizar el fondo de la página, los colores del eyebrow, título, subtítulo, tarjetas de sucursal y botones de acción para usar la nueva paleta de videojuegos.
3. THE Componente_Visual Contact SHALL mantener la estructura responsive existente para Breakpoint_Mobile, Breakpoint_Tablet y Breakpoint_Desktop.

### Requisito 13: Metadatos del Sitio

**Historia de Usuario:** Como visitante del sitio, quiero que el título de la pestaña del navegador refleje la nueva marca de videojuegos, para identificar correctamente el sitio.

#### Criterios de Aceptación

1. THE Sistema_de_Tema SHALL actualizar el `<title>` en `index.html` de "El Jardin de Casa Blanca" al nuevo nombre de marca de videojuegos.
2. THE Sistema_de_Tema SHALL reemplazar el favicon actual (logo de flores) por un favicon representativo de videojuegos, ya sea un emoji SVG o una imagen nueva en `public/favicon.svg`.

### Requisito 14: Preservación de Funcionalidad Backend

**Historia de Usuario:** Como desarrollador, quiero que todos los endpoints de API, integraciones con Firebase y lógica de negocio permanezcan sin cambios, para que el re-theming sea puramente visual.

#### Criterios de Aceptación

1. WHILE se aplican los cambios de tema, THE Sistema_de_Tema SHALL preservar todas las llamadas a la API de productos (`VITE_PRODUCTS_API_URL`), la integración con Firebase Auth y la lógica de WhatsApp sin modificaciones.
2. WHILE se aplican los cambios de tema, THE Sistema_de_Tema SHALL preservar la estructura de rutas existente en `App.jsx` (/, /shop, /product/:id, /contact, /admin/*) sin modificaciones.
3. WHILE se aplican los cambios de tema, THE Sistema_de_Tema SHALL preservar toda la funcionalidad del panel de administración (AdminLogin, AdminHome, AdminLayout, AdminSidebar, ProductsTable, ProductForm) sin cambios visuales ni funcionales.
4. WHILE se aplican los cambios de tema, THE Sistema_de_Tema SHALL preservar la estructura de componentes existente — no se crean ni eliminan archivos de componentes, solo se modifican los existentes.
