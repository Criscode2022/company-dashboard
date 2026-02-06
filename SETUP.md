# Company Dashboard - Setup Guide

## 1. Create Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Create a new project called "company-dashboard"
3. Copy the connection string

## 2. Create Tables

In Neon SQL Editor, run the contents of `schema.sql`

Or use Node.js:
```bash
export COMPANY_DASHBOARD_DB_URL="postgresql://..."
node create-db.js
```

## 3. Deploy to Netlify

### Environment Variables
Add these to Netlify Site Settings:

```
NEON_AUTH_URL=https://[project].neonauth.[region].neon.tech/[db]/auth
DATABASE_URL=https://[project].[region].neon.tech/rest/v1
DATABASE_SCHEMA=public
```

### Build Settings
- Build command: `npm run build`
- Publish directory: `dist/company-dashboard/browser`
- Base directory: `company-dashboard`

## 4. Enable PostgREST

In Neon dashboard:
1. Go to project settings
2. Enable "Neon Data API (PostgREST)"
3. Note the API URL

## 5. Seed Initial Data

Run in Neon SQL Editor:

```sql
-- Insert existing clients
INSERT INTO clients (name, contact_name, industry, status, budget) VALUES
('GreenFork Bistro', 'Maya Chen', 'restaurant', 'active', 0),
('FitPulse Studio', 'Marcus Chen', 'fitness', 'active', 15000);

-- Insert existing projects
INSERT INTO projects (client_id, name, description, status, repo_url, production_url)
SELECT 
    c.id,
    'GreenFork Scheduler',
    'Staff scheduling and time tracking for restaurants',
    'production',
    'https://github.com/Criscode2022/greenfork-scheduler',
    'https://greenfork-scheduler.netlify.app'
FROM clients c WHERE c.name = 'GreenFork Bistro';

INSERT INTO projects (client_id, name, description, status, repo_url, production_url)
SELECT 
    c.id,
    'FitPulse Studio',
    'Class booking and membership management for fitness studios',
    'in_progress',
    'https://github.com/Criscode2022/fitpulse-studio',
    'https://fitpulse-studio.netlify.app'
FROM clients c WHERE c.name = 'FitPulse Studio';
```

## Features

- **Dashboard**: Company overview with stats
- **Clients**: Client directory with projects
- **Memory**: Daily logs with markdown support
- **Statistics**: Development activity tracking

## Repository

https://github.com/Criscode2022/company-dashboard