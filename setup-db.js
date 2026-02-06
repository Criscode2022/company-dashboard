const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_oUEF6TC2YAfz@ep-wispy-lake-aii6akyc-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    industry TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    budget DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('discovery', 'in_progress', 'beta', 'production', 'maintenance', 'archived')),
    start_date DATE,
    deadline DATE,
    budget DECIMAL(10,2),
    repo_url TEXT,
    production_url TEXT,
    staging_url TEXT,
    database_connection TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- DAILY PROGRESS
CREATE TABLE IF NOT EXISTS daily_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    commits_count INTEGER DEFAULT 0,
    features_completed INTEGER DEFAULT 0,
    bugs_fixed INTEGER DEFAULT 0,
    lines_of_code INTEGER DEFAULT 0,
    status_update TEXT,
    blockers TEXT,
    next_steps TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_progress_project ON daily_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date);

-- VERSIONS
CREATE TABLE IF NOT EXISTS versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL,
    release_date DATE,
    changelog TEXT,
    is_production BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_versions_project ON versions(project_id);

-- FEATURES
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'deferred')),
    priority INTEGER DEFAULT 3,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_features_project ON features(project_id);
CREATE INDEX IF NOT EXISTS idx_features_status ON features(status);

-- DAILY MEMORY
CREATE TABLE IF NOT EXISTS daily_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    summary TEXT,
    clients_active INTEGER DEFAULT 0,
    projects_active INTEGER DEFAULT 0,
    commits_total INTEGER DEFAULT 0,
    new_features INTEGER DEFAULT 0,
    bugs_fixed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_memory_date ON daily_memory(date);

-- COMPANY STATS
CREATE TABLE IF NOT EXISTS company_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_clients INTEGER DEFAULT 0,
    active_clients INTEGER DEFAULT 0,
    new_clients INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    active_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    total_features INTEGER DEFAULT 0,
    total_bugs_fixed INTEGER DEFAULT 0,
    total_lines_of_code INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2),
    projected_revenue DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_stats_date ON company_stats(date);

SELECT 'Company Dashboard tables created!' as status;
`;

const seedData = `
-- Insert existing clients
INSERT INTO clients (name, contact_name, email, industry, status, budget) VALUES
('GreenFork Bistro', 'Maya Chen', 'maya@greenfork.com', 'restaurant', 'active', 0),
('FitPulse Studio', 'Marcus Chen', 'marcus@fitpulse.com', 'fitness', 'active', 15000)
ON CONFLICT DO NOTHING;

-- Insert existing projects
INSERT INTO projects (client_id, name, description, status, repo_url, production_url, database_connection)
SELECT 
    c.id,
    'GreenFork Scheduler',
    'Staff scheduling and time tracking for restaurants',
    'production',
    'https://github.com/Criscode2022/greenfork-scheduler',
    'https://greenfork-scheduler.netlify.app',
    'postgresql://neondb_owner:npg_CJgz76UYbamS@ep-divine-wildflower-aiuns8nj-pooler.c-4.us-east-1.aws.neon.tech/neondb'
FROM clients c WHERE c.name = 'GreenFork Bistro'
ON CONFLICT DO NOTHING;

INSERT INTO projects (client_id, name, description, status, repo_url, production_url)
SELECT 
    c.id,
    'FitPulse Studio',
    'Class booking and membership management for fitness studios',
    'in_progress',
    'https://github.com/Criscode2022/fitpulse-studio',
    'https://fitpulse-studio.netlify.app'
FROM clients c WHERE c.name = 'FitPulse Studio'
ON CONFLICT DO NOTHING;

-- Insert sample daily memory
INSERT INTO daily_memory (date, filename, title, content, summary, clients_active, projects_active, commits_total, new_features, bugs_fixed)
VALUES 
('2026-02-04', '2026-02-04.md', 'Day 1: GreenFork Launch', '# Company Memory - Day 1...', 'First client GreenFork Bistro. Full MVP built and deployed.', 1, 1, 20, 15, 8)
ON CONFLICT (date) DO NOTHING;

INSERT INTO daily_memory (date, filename, title, content, summary, clients_active, projects_active, commits_total, new_features, bugs_fixed)
VALUES 
('2026-02-05', '2026-02-05.md', 'Day 2: FitPulse Onboarding', '# Company Memory - Day 2...', 'New client FitPulse Studio onboarded. Neon database created.', 2, 2, 6, 3, 0)
ON CONFLICT (date) DO NOTHING;

INSERT INTO daily_memory (date, filename, title, content, summary, clients_active, projects_active, commits_total, new_features, bugs_fixed)
VALUES 
('2026-02-06', '2026-02-06.md', 'Day 3: Company Dashboard', '# Company Memory - Day 3...', 'Built company dashboard for tracking clients, projects, and daily memory.', 2, 3, 2, 1, 0)
ON CONFLICT (date) DO NOTHING;

-- Insert company stats
INSERT INTO company_stats (date, total_clients, active_clients, total_projects, active_projects, total_commits, total_features, total_bugs_fixed)
VALUES ('2026-02-06', 2, 2, 3, 3, 28, 19, 8)
ON CONFLICT (date) DO NOTHING;

SELECT 'Sample data inserted!' as status;
`;

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔧 Setting up Company Dashboard database...\n');
    
    // Create tables
    console.log('Creating tables...');
    await client.query(schema);
    console.log('✅ Tables created!\n');
    
    // Seed data
    console.log('Seeding sample data...');
    await client.query(seedData);
    console.log('✅ Sample data inserted!\n');
    
    // Verify
    console.log('📊 Database Summary:');
    const tables = ['clients', 'projects', 'daily_memory', 'company_stats'];
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`  ${table.padEnd(20)}: ${result.rows[0].count} rows`);
    }
    
    console.log('\n🎉 Database is ready!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();