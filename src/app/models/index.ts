export interface Client {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  industry?: string;
  status: 'active' | 'paused' | 'completed';
  budget?: number;
  created_at: string;
  updated_at: string;
  
  // Aggregated
  projects_count?: number;
  active_projects_count?: number;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  status: 'discovery' | 'in_progress' | 'beta' | 'production' | 'maintenance' | 'archived';
  start_date?: string;
  deadline?: string;
  budget?: number;
  
  // Links
  repo_url?: string;
  production_url?: string;
  staging_url?: string;
  database_connection?: string;
  
  created_at: string;
  updated_at: string;
  
  // Joined fields
  client_name?: string;
  total_features?: number;
  completed_features?: number;
  latest_version?: string;
}

export interface DailyProgress {
  id: string;
  project_id: string;
  date: string;
  commits_count: number;
  features_completed: number;
  bugs_fixed: number;
  lines_of_code: number;
  status_update?: string;
  blockers?: string;
  next_steps?: string;
  created_at: string;
  
  // Joined
  project_name?: string;
  client_name?: string;
}

export interface Version {
  id: string;
  project_id: string;
  version_number: string;
  release_date?: string;
  changelog?: string;
  is_production: boolean;
  created_at: string;
}

export interface Feature {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'deferred';
  priority: number;
  completed_at?: string;
  created_at: string;
}

export interface DailyMemory {
  id: string;
  date: string;
  filename: string;
  title?: string;
  content: string;
  summary?: string;
  
  // Metrics
  clients_active: number;
  projects_active: number;
  commits_total: number;
  new_features: number;
  bugs_fixed: number;
  
  created_at: string;
  updated_at: string;
}

export interface CompanyStats {
  id: string;
  date: string;
  
  // Client metrics
  total_clients: number;
  active_clients: number;
  new_clients: number;
  
  // Project metrics
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  
  // Development metrics
  total_commits: number;
  total_features: number;
  total_bugs_fixed: number;
  total_lines_of_code: number;
  
  // Financial
  total_revenue?: number;
  projected_revenue?: number;
  
  created_at: string;
}