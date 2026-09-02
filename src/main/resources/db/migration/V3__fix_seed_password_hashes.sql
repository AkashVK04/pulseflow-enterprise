-- Flyway Migration V3__fix_seed_password_hashes.sql
-- Update initial seed users' BCrypt password hashes to match "Password123!"

UPDATE users
SET password_hash = '$2a$10$JHcRevs8kY35rO2tF6YCv.w11sjS6BWcY8lMfd5Ngmu0mNe9LtRCu',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN ('usr_1', 'usr_2', 'usr_3', 'usr_4');
