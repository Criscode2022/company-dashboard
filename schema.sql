-- Company Dashboard Database Schema
-- Tracks clients, projects, progress, and daily memory

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    industry TEXT, -- restaurant, fitness, etc.
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    budget DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('discovery', 'in_progress', 'beta', 'production', 'maintenance', 'archived')),
    start_date DATE,
    deadline DATE,
    budget DECIMAL(10,2),
    
    -- Links
    repo_url TEXT,
    production_url TEXT,
    staging_url TEXT,
    
    -- Database
    database_connection TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================
-- DAILY PROGRESS UPDATES
-- ============================================
CREATE TABLE IF NOT EXISTS daily_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Metrics
    commits_count INTEGER DEFAULT 0,
    features_completed INTEGER DEFAULT 0,
    bugs_fixed INTEGER DEFAULT 0,
    lines_of_code INTEGER DEFAULT 0,
    
    -- Status update
    status_update TEXT,
    blockers TEXT,
    next_steps TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_progress_project ON daily_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date);

-- ============================================
-- VERSION HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL, -- e.g., "1.0.0", "1.1.0-beta"
    release_date DATE,
    changelog TEXT,
    is_production BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_versions_project ON versions(project_id);

-- ============================================
-- FEATURES
-- ============================================
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'deferred')),
    priority INTEGER DEFAULT 3, -- 1 = highest, 5 = lowest
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_features_project ON features(project_id);
CREATE INDEX IF NOT EXISTS idx_features_status ON features(status);

-- ============================================
-- DAILY MEMORY / COMPANY LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS daily_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL, -- Full markdown content
    summary TEXT, -- Auto-generated or manual summary
    
    -- Metrics for the day
    clients_active INTEGER DEFAULT 0,
    projects_active INTEGER DEFAULT 0,
    commits_total INTEGER DEFAULT 0,
    new_features INTEGER DEFAULT 0,
    bugs_fixed INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_memory_date ON daily_memory(date);

-- ============================================
-- COMPANY STATISTICS (Aggregated daily)
-- ============================================
CREATE TABLE IF NOT EXISTS company_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    
    -- Client metrics
    total_clients INTEGER DEFAULT 0,
    active_clients INTEGER DEFAULT 0,
    new_clients INTEGER DEFAULT 0,
    
    -- Project metrics
    total_projects INTEGER DEFAULT 0,
    active_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    
    -- Development metrics
    total_commits INTEGER DEFAULT 0,
    total_features INTEGER DEFAULT 0,
    total_bugs_fixed INTEGER DEFAULT 0,
    total_lines_of_code INTEGER DEFAULT 0,
    
    -- Financial
    total_revenue DECIMAL(12,2),
    projected_revenue DECIMAL(12,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_stats_date ON company_stats(date);

-- ============================================
-- VIEWS
-- ============================================

-- View: Project summary with client info
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    p.*,
    c.name as client_name,
    c.industry as client_industry,
    c.status as client_status,
    COUNT(f.id) as total_features,
    COUNT(f.id) FILTER (WHERE f.status = 'completed') as completed_features,
    MAX(v.version_number) as latest_version
FROM projects p
JOIN clients c ON p.client_id = c.id
LEFT JOIN features f ON p.id = f.project_id
LEFT JOIN versions v ON p.id = v.project_id
GROUP BY p.id, c.name, c.industry, c.status;

-- View: Weekly progress
CREATE OR REPLACE VIEW weekly_progress AS
SELECT 
    project_id,
    DATE_TRUNC('week', date) as week_start,
    SUM(commits_count) as total_commits,
    SUM(features_completed) as total_features,
    SUM(bugs_fixed) as total_bugs,
    SUM(lines_of_code) as total_loc
FROM daily_progress
GROUP BY project_id, DATE_TRUNC('week', date);

-- View: Recent activity across all projects
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
    dp.*,
    p.name as project_name,
    c.name as client_name
FROM daily_progress dp
JOIN projects p ON dp.project_id = p.id
JOIN clients c ON p.client_id = c.id
ORDER BY dp.date DESC, dp.created_at DESC;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_memory_updated_at ON daily_memory;
CREATE TRIGGER update_daily_memory_updated_at
    BEFORE UPDATE ON daily_memory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert existing clients
INSERT INTO clients (name, contact_name, industry, status, budget) VALUES
('GreenFork Bistro', 'Maya Chen', 'restaurant', 'active', 0),
('FitPulse Studio', 'Marcus Chen', 'fitness', 'active', 15000)
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

SELECT 'Company Dashboard database schema created successfully!' as status;