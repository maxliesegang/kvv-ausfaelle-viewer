# KVV Ausfälle Viewer

> Interactive visualization of train cancellations in the Karlsruher Verkehrsverbund (KVV) network

## [🚀 View Live Demo](https://maxliesegang.github.io/kvv-ausfaelle-viewer/)

## Features

- Interactive charts (daily timeline, by line, by time-of-day)
- Advanced filtering (search, date ranges, time presets)
- Minimal, responsive design with automatic dark mode
- Fast data loading and filtering

## Tech Stack

- React 19 with TypeScript
- Vite
- Recharts
- CSS Variables for theming

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
npm run build    # Build for production
npm run preview  # Preview production build
npm run deploy   # Deploy to GitHub Pages
```

## Data Source

Consumes JSON data from [kvv-ausfaelle-scraper](https://maxliesegang.github.io/kvv-ausfaelle-scraper/)

## License

MIT
