const { Pool } = require('pg');

// NOTE: Replace with your actual Neon connection string for company-dashboard
const connectionString = process.env.COMPANY_DASHBOARD_DB_URL || 
  'postgresql://[user]:[password]@[host]/company_dashboard?sslmode=require';

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

-- Insert sample data
INSERT INTO clients (name, contact_name, industry, status, budget) VALUES
('GreenFork Bistro', 'Maya Chen', 'restaurant', 'active', 0),
('FitPulse Studio', 'Marcus Chen', 'fitness', 'active', 15000)
ON CONFLICT DO NOTHING;

SELECT 'Company Dashboard tables created!' as status;
`;

async function createTables() {
  const client = await pool.connect();
  try {
    console.log('Creating Company Dashboard database...');
    await client.query(schema);
    console.log('✅ Database tables created successfully!');
    
    // Verify
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables created:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();