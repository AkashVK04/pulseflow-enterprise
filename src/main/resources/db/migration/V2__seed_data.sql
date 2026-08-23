-- Flyway Migration V2__seed_data.sql
-- Seed Initial Production Data for PulseFlow Enterprise Platform

-- Insert Default Users (Pass: Password123!)
-- BCrypt hash for "Password123!" is $2a$10$7Z8bU77J8.Hw/zVlQvYjze9/Xv.RzGg0P.KkQvQ.QvQ.QvQ.QvQ.Q (or generated BCrypt)
INSERT INTO users (id, name, email, password_hash, avatar, role_id, department, account_non_locked, email_verified) VALUES
('usr_1', 'Sarah Connor', 'sarah.connor@pulseflow.io', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym50CR6251MD.cpt34bAOO', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ROLE_SUPER_ADMIN', 'Executive Leadership', TRUE, TRUE),
('usr_2', 'Alex Rivera', 'alex.rivera@pulseflow.io', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym50CR6251MD.cpt34bAOO', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'ROLE_PM', 'Engineering', TRUE, TRUE),
('usr_3', 'Marcus Vance', 'marcus.vance@pulseflow.io', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym50CR6251MD.cpt34bAOO', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'ROLE_SENIOR_ENG', 'Architecture', TRUE, TRUE),
('usr_4', 'Elena Rostova', 'elena.rostova@pulseflow.io', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym50CR6251MD.cpt34bAOO', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ROLE_STAFF', 'Product Design', TRUE, TRUE);

-- Insert Default Projects
INSERT INTO projects (id, key, name, description, status, category, lead_id, start_date, target_end_date, budget_hours, logged_hours, risk_level) VALUES
('proj_1', 'SEC', 'Cloud Security Architecture', 'Zero-trust network architecture, IAM integration, and audit logging infrastructure.', 'Active', 'Engineering', 'usr_1', '2026-06-01', '2026-11-30', 600.00, 142.50, 'Low'),
('proj_2', 'CLOUD', 'Kubernetes Cluster Migration', 'Migrate legacy monolithic containers to multi-region EKS clusters with Istio mesh.', 'Active', 'Engineering', 'usr_3', '2026-07-15', '2026-12-15', 850.00, 310.00, 'Moderate'),
('proj_3', 'DATA', 'Real-Time Telemetry Pipeline', 'Kafka and Flink pipeline for streaming high-throughput microservice metrics.', 'Active', 'Product', 'usr_2', '2026-08-01', '2026-10-31', 450.00, 88.00, 'Low'),
('proj_4', 'CORE', 'AI Copilot Integration', 'Integrate Gemini 3.6 Flash for automated task decomposition and risk audits.', 'Active', 'Operations', 'usr_1', '2026-05-10', '2026-09-30', 500.00, 240.00, 'High');

-- Insert Default Active Sprints
INSERT INTO sprints (id, project_id, name, goal, status, start_date, end_date, total_points, completed_points) VALUES
('spr_1', 'proj_1', 'Sprint 24 — Zero-Trust IAM Policy', 'Finalize Keycloak OAuth2 mapping and multi-region session sync.', 'Active', '2026-08-01', '2026-08-15', 45, 32),
('spr_2', 'proj_2', 'Sprint 12 — EKS Control Plane', 'Deploy secondary AWS region control plane and automated failover tests.', 'Active', '2026-08-05', '2026-08-19', 38, 18),
('spr_3', 'proj_3', 'Sprint 8 — Pipeline Resiliency', 'Implement dead-letter queues and backpressure rate limiters.', 'Planned', '2026-08-15', '2026-08-29', 30, 0);

-- Insert Default Tasks
INSERT INTO tasks (id, key, title, description, status, priority, project_id, sprint_id, assignee_id, reporter_id, estimated_hours, logged_hours, due_date, tags, subtasks) VALUES
('task_1', 'SEC-101', 'Implement OAuth2 / OIDC Token Verification', 'Configure Spring Security filter chain to extract Bearer JWT and validate HMAC-SHA256 signature.', 'Completed', 'Critical', 'proj_1', 'spr_1', 'usr_3', 'usr_1', 16.00, 16.00, '2026-08-10', '["Security", "JWT", "Backend"]'::jsonb, '[{"id":"sub_1","title":"Setup JwtDecoder bean","completed":true,"estimatedHours":4},{"id":"sub_2","title":"Add custom AccessDeniedHandler","completed":true,"estimatedHours":4}]'::jsonb),
('task_2', 'SEC-102', 'Audit RBAC Endpoint Permissions', 'Ensure `@PreAuthorize` guards all administrative user management and feature flag endpoints.', 'In Progress', 'High', 'proj_1', 'spr_1', 'usr_1', 'usr_1', 12.00, 8.50, '2026-08-14', '["RBAC", "Security"]'::jsonb, '[{"id":"sub_3","title":"Map Role authority strings","completed":true,"estimatedHours":4},{"id":"sub_4","title":"Integration tests for 403 Forbidden","completed":false,"estimatedHours":4}]'::jsonb),
('task_3', 'CLOUD-201', 'Provision Secondary EKS Cluster Infrastructure', 'Use Terraform to spin up VPC peering and EKS control plane in us-west-2.', 'In Progress', 'Critical', 'proj_2', 'spr_2', 'usr_3', 'usr_2', 24.00, 14.00, '2026-08-16', '["DevOps", "AWS", "EKS"]'::jsonb, '[{"id":"sub_5","title":"Apply VPC Peering module","completed":true,"estimatedHours":8},{"id":"sub_6","title":"Deploy Istio Service Mesh","completed":false,"estimatedHours":8}]'::jsonb),
('task_4', 'DATA-301', 'Configure Kafka Topic Partitions & Retention Policy', 'Set retention policy to 7 days and partition count to 16 for metrics topics.', 'To Do', 'Medium', 'proj_3', 'spr_3', 'usr_2', 'usr_2', 8.00, 0.00, '2026-08-20', '["Kafka", "Streaming"]'::jsonb, '[]'::jsonb),
('task_5', 'CORE-401', 'Gemini 3.6 AI Task Auto-Decomposition', 'Call Gemini Flash endpoint to extract actionable subtasks from user story prose.', 'In Review', 'High', 'proj_4', 'spr_1', 'usr_4', 'usr_1', 16.00, 12.00, '2026-08-12', '["AI", "Gemini", "Feature"]'::jsonb, '[{"id":"sub_7","title":"Build Gemini Client HTTP Service","completed":true,"estimatedHours":8},{"id":"sub_8","title":"Parse JSON response into Subtask DTOs","completed":true,"estimatedHours":4}]'::jsonb);

-- Insert Default Task Comments
INSERT INTO task_comments (id, task_id, author_id, content) VALUES
('cm_1', 'task_1', 'usr_1', 'Reviewed token verification PR. HMAC signature verification matches production spec.'),
('cm_2', 'task_2', 'usr_3', 'Added `@PreAuthorize("hasRole(''ROLE_SUPER_ADMIN'')")` on feature flag mutations.');

-- Insert Default Time Entries
INSERT INTO time_entries (id, task_id, user_id, hours, description, work_date) VALUES
('te_1', 'task_1', 'usr_3', 8.00, 'Implemented JwtAuthenticationFilter and security filter chain configuration.', '2026-08-08'),
('te_2', 'task_1', 'usr_3', 8.00, 'Added unit tests for JWT expiration and invalid signature handling.', '2026-08-09'),
('te_3', 'task_2', 'usr_1', 8.50, 'Audited RBAC matrix and mapped endpoints to authority definitions.', '2026-08-12');

-- Insert Default Audit Logs
INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, entity_type, entity_name, details) VALUES
('log_1', 'usr_1', 'Sarah Connor', 'Super Admin', 'User Login Authenticated', 'User', 'Sarah Connor', 'JWT Access Token generated with scope permissions.'),
('log_2', 'usr_1', 'Sarah Connor', 'Super Admin', 'Project Created', 'Project', 'Cloud Security Architecture', 'Created new project [SEC] with budget of 600.00 hours.'),
('log_3', 'usr_3', 'Marcus Vance', 'Senior Engineer', 'Task Updated', 'Task', 'SEC-101: Implement OAuth2 / OIDC Token Verification', 'Status updated to Completed.');
