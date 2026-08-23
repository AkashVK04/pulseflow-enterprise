-- Flyway Database Migration Script V1__init.sql
-- PostgreSQL Production Schema for PulseFlow Enterprise Platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles & Permissions
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(50) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id),
    department VARCHAR(100),
    account_non_locked BOOLEAN DEFAULT TRUE,
    failed_login_attempts INT DEFAULT 0,
    email_verified BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- Refresh Tokens for JWT Rotation
CREATE TABLE refresh_tokens (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    key VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    category VARCHAR(50) NOT NULL DEFAULT 'Engineering',
    lead_id VARCHAR(50) REFERENCES users(id),
    start_date DATE NOT NULL,
    target_end_date DATE NOT NULL,
    budget_hours NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    logged_hours NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'Low',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_key ON projects(key);
CREATE INDEX idx_projects_status ON projects(status);

-- Sprints Table
CREATE TABLE sprints (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    project_id VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Planned',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_points INT DEFAULT 0,
    completed_points INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sprints_project ON sprints(project_id);

-- Tasks Table
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    key VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'To Do',
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    project_id VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id VARCHAR(50) REFERENCES sprints(id) ON DELETE SET NULL,
    assignee_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    reporter_id VARCHAR(50) NOT NULL REFERENCES users(id),
    estimated_hours NUMERIC(8, 2) DEFAULT 8.00,
    logged_hours NUMERIC(8, 2) DEFAULT 0.00,
    due_date DATE,
    tags JSONB DEFAULT '[]'::jsonb,
    subtasks JSONB DEFAULT '[]'::jsonb,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Task Comments Table
CREATE TABLE task_comments (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    task_id VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id VARCHAR(50) NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Time Entries Table
CREATE TABLE time_entries (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    task_id VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    hours NUMERIC(6, 2) NOT NULL,
    description TEXT,
    work_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);

-- System Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    actor_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(150) NOT NULL,
    actor_role VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(created_at DESC);

-- AI Execution Audit Logs
CREATE TABLE ai_audit_logs (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(50) REFERENCES users(id),
    model_alias VARCHAR(100) NOT NULL DEFAULT 'gemini-3.6-flash',
    prompt_type VARCHAR(100) NOT NULL,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    execution_time_ms INT DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Feature Flags
CREATE TABLE feature_flags (
    flag_key VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed Data for Roles
INSERT INTO roles (id, name, description) VALUES
('ROLE_SUPER_ADMIN', 'Super Admin', 'Full system control, security policy manager, RBAC control'),
('ROLE_PM', 'Project Manager', 'Sprint planner, resource allocator, project manager'),
('ROLE_SENIOR_ENG', 'Senior Engineer', 'Technical lead, task decomposer, architecture reviewer'),
('ROLE_STAFF', 'Staff Contributor', 'Task executor, time tracker, code contributor'),
('ROLE_GUEST', 'Guest', 'Read-only external stakeholder view');

-- Initial Seed Data for Feature Flags
INSERT INTO feature_flags (flag_key, name, enabled, description) VALUES
('enableGeminiDecompose', 'Gemini AI Task Decomposition', TRUE, 'Allow AI auto-decomposition of backlog items'),
('enableRealtimeSSE', 'Real-time SSE Telemetry', TRUE, 'Stream live notifications and task updates'),
('enableSprintRiskAudit', 'Automated Sprint Risk Scanner', TRUE, 'Background AI risk detection on active sprints'),
('enableAuditPersistence', 'Immutable System Audit Logging', TRUE, 'Persist security events and RBAC mutations');
