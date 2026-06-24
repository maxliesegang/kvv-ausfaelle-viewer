# KVV Ausfälle Viewer

> Interactive visualization of train cancellations in the Karlsruher Verkehrsverbund (KVV) network

## [🚀 View Live Demo](https://maxliesegang.github.io/kvv-ausfaelle-viewer/)

## Features

- Focused "toolbar + canvas" layout: a headline summary, interactive charts (daily timeline, by line, by cause, by time-of-day, by day-of-week), and a collapsible detail table
- Advanced filtering (text search, date ranges, time-of-day, day-of-week, and cancellation cause), tucked behind a toolbar toggle
- CSV export of the currently filtered cancellations (Excel-friendly, UTF-8 BOM)
- Built with the [KERN UX](https://www.kern-ux.de/) design system; responsive, with light/dark theme (auto + manual toggle)
- Fast, fully client-side data loading and filtering (in-browser caching, no backend)

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

## License

MIT
