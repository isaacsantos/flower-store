# Project Structure

```
flower-store/
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Root component, composes all sections
│   ├── index.css             # Global styles, CSS variables, font imports
│   └── components/
│       ├── Navbar.jsx/.css   # Top navigation bar
│       ├── Banner.jsx/.css   # Hero section
│       ├── Carousel.jsx/.css # Product grid with API fetch
│       └── Footer.jsx/.css   # Footer with newsletter
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── index.html
```

## Conventions

- Each component lives in `src/components/` with a co-located CSS file of the same name
- Components are default exports, named after the file (e.g. `export default function Navbar()`)
- CSS uses BEM-like class names scoped to the component (e.g. `.navbar`, `.nav-links`, `.nav-cta`)
- Global CSS variables are defined in `index.css` under `:root` (`--pink`, `--rose`, `--green`, `--dark`, `--cream`, `--gold`)
- `h1`, `h2`, `h3` use Playfair Display; body text uses Lato
- `App.jsx` is the only place components are composed — it imports and renders all sections in order
