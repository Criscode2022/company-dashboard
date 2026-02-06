# Company Dashboard

Full-stack dashboard for tracking software company operations:
- Clients and projects
- Daily progress and statistics
- Company memory (daily logs)
- Version history and feature tracking

## Tech Stack

- Angular 19 + Ionic + Tailwind CSS
- Neon PostgreSQL with Data API (PostgREST)
- Chart.js for statistics
- Marked.js for markdown rendering

## Features

### Dashboard Overview
- Company statistics cards
- Recent activity feed
- Active projects list

### Clients & Projects
- Client directory with contact info
- Project tracking with status
- Repository and deployment links
- Feature and version management

### Daily Memory
- Company daily logs (markdown)
- Auto-generated from .md files
- Download functionality
- Formatted display

### Statistics
- 30-day development activity
- Commit and feature tracking
- Project status breakdown

## Database Schema

See `schema.sql` for full PostgreSQL schema including:
- clients
- projects
- daily_progress
- versions
- features
- daily_memory
- company_stats

## Environment Variables

Create `.env` file:
```
NEON_AUTH_URL=https://[project].neonauth.[region].neon.tech/[db]/auth
DATABASE_URL=https://[project].[region].neon.tech/rest/v1
DATABASE_SCHEMA=public
```

## Deployment

### Netlify
1. Connect GitHub repository
2. Add environment variables
3. Build command: `npm run build`
4. Publish directory: `dist/company-dashboard/browser`

## Development

```bash
npm install
npm run start
```

## License

MIT