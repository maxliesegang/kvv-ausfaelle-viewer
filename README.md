# KVV Ausfälle Viewer

> Interactive visualization of train cancellations in the Karlsruher Verkehrsverbund (KVV) network

## [🚀 View Live Demo](https://maxliesegang.github.io/kvv-ausfaelle-viewer/)

## Features

- "Toolbar + canvas" layout: a summary strip, interactive charts (daily trend with 7-day mean, by line, cause, departure hour, departure stop, weekday and verification), and a collapsible detail table
- Filtering by text, year, line, date range, time of day, weekday, cause and verification — bulky controls tucked behind toolbar disclosure panels
- Realtime verification: announcements cross-checked against bahn.expert and Transitous when available, shown as bestätigt / fuhr trotz Meldung / kein Befund
- Archived KVV notices readable per row
- CSV export of the currently filtered rows (Excel-friendly, UTF-8 BOM)
- Built with the [KERN UX](https://www.kern-ux.de/) design system; responsive, light/dark theme (auto + manual toggle)
- Fully client-side loading and filtering, with in-browser caching and no backend

## Tech Stack

- React 19 with TypeScript
- Vite
- Recharts
- KERN UX design system (`@kern-ux-annex/kern-react-kit`)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Type-check and build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
npm run deploy   # Manually publish dist/ to GitHub Pages
```

### Configuration

By default the app reads data from the hosted scraper output. Set `VITE_DATA_BASE_URL` to point it at a different source:

```bash
VITE_DATA_BASE_URL=http://localhost:8000 npm run dev
```

## Deployment

Pushes to `main` are automatically built and deployed to GitHub Pages via GitHub Actions. The `npm run deploy` script is available for manual publishing.

## Data Source

Consumes JSON data from [kvv-ausfaelle-scraper](https://maxliesegang.github.io/kvv-ausfaelle-scraper/)

> [!IMPORTANT]
> This is not an official KVV service. The data is collected automatically by scraping public
> information and may be incomplete or contain errors.

## License

MIT
