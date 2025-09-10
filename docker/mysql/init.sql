-- Create databases for webhook example
CREATE DATABASE IF NOT EXISTS crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS pms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create users and grant permissions
CREATE USER IF NOT EXISTS 'crm_user'@'%' IDENTIFIED BY 'crm_password';
CREATE USER IF NOT EXISTS 'pms_user'@'%' IDENTIFIED BY 'pms_password';
CREATE USER IF NOT EXISTS 'webhook_user'@'%' IDENTIFIED BY 'webhook_pass';

-- Grant permissions
GRANT ALL PRIVILEGES ON crm_db.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON pms_db.* TO 'pms_user'@'%';
GRANT ALL PRIVILEGES ON crm_db.* TO 'webhook_user'@'%';
GRANT ALL PRIVILEGES ON pms_db.* TO 'webhook_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;