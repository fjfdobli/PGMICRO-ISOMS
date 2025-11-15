-- PG Micro ISOMS Database Schema
CREATE DATABASE IF NOT EXISTS pgmicro_isoms;
USE pgmicro_isoms;

CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    notes TEXT NULL,
    account_type ENUM('admin', 'employee', 'viewer') NOT NULL DEFAULT 'employee',
    status ENUM('pending', 'active', 'inactive', 'suspended') NOT NULL DEFAULT 'pending',
    allowed_modules JSON NULL COMMENT 'JSON array of allowed modules for this user',
    approved_at TIMESTAMP NULL,
    approved_by INT NULL,
    suspended_at TIMESTAMP NULL,
    suspended_by INT NULL,
    suspension_reason TEXT NULL,
    smtp_host VARCHAR(255) NULL COMMENT 'SMTP server host for this admin (optional)',
    smtp_port INT NULL DEFAULT 587 COMMENT 'SMTP server port for this admin (optional)',
    smtp_password VARCHAR(255) NULL COMMENT 'SMTP password/app password for this admin (encrypted)',
    smtp_enabled BOOLEAN DEFAULT FALSE COMMENT 'Whether this admin has personal SMTP configured',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_account_type (account_type),
    INDEX idx_status (status),
    INDEX idx_approved_by (approved_by),
    INDEX idx_suspended_by (suspended_by),
    INDEX idx_smtp_enabled (smtp_enabled),
    INDEX idx_created_at (created_at),
    INDEX idx_last_login (last_login),
    FOREIGN KEY (approved_by) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (suspended_by) REFERENCES accounts(id) ON DELETE SET NULL
);
