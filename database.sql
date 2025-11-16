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
    user_status ENUM('online', 'idle', 'dnd', 'invisible', 'offline') NOT NULL DEFAULT 'offline' COMMENT 'User presence status: online, idle (away), dnd (do not disturb), invisible, offline',
    INDEX idx_email (email),
    INDEX idx_account_type (account_type),
    INDEX idx_status (status),
    INDEX idx_approved_by (approved_by),
    INDEX idx_suspended_by (suspended_by),
    INDEX idx_smtp_enabled (smtp_enabled),
    INDEX idx_created_at (created_at),
    INDEX idx_last_login (last_login),
    INDEX idx_user_status (user_status),
    FOREIGN KEY (approved_by) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (suspended_by) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'User who will receive this notification',
    type ENUM('info', 'success', 'warning', 'error', 'low_stock', 'new_order', 'return_request', 'purchase_order', 'system', 'chat_message') NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    description TEXT NULL COMMENT 'Additional details about the notification',
    data JSON NULL COMMENT 'Additional structured data (e.g., item_id, order_id, conversation_id, etc.)',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL COMMENT 'Optional expiration time for temporary notifications',
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE
) COMMENT='System notifications for users';

CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('direct', 'group') NOT NULL DEFAULT 'direct',
    name VARCHAR(255) NULL COMMENT 'Group chat name (NULL for direct messages)',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NULL COMMENT 'Timestamp of last message sent',
    last_message_preview TEXT NULL COMMENT 'Preview of last message for list view',
    INDEX idx_type (type),
    INDEX idx_created_by (created_by),
    INDEX idx_last_message_at (last_message_at),
    FOREIGN KEY (created_by) REFERENCES accounts(id) ON DELETE CASCADE
) COMMENT='Chat conversations between users';

CREATE TABLE conversation_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP NULL COMMENT 'Last time user read messages in this conversation',
    is_muted BOOLEAN DEFAULT FALSE COMMENT 'User has muted notifications for this conversation',
    is_archived BOOLEAN DEFAULT FALSE COMMENT 'User has archived this conversation',
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_last_read_at (last_read_at),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (conversation_id, user_id)
) COMMENT='Users participating in conversations';

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    type ENUM('text', 'file', 'image', 'system') DEFAULT 'text',
    file_url VARCHAR(500) NULL COMMENT 'URL/path to uploaded file or image',
    metadata JSON NULL COMMENT 'Additional data: mentions, links, file info, etc.',
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP NULL,
    is_deleted BOOLEAN DEFAULT FALSE COMMENT 'Soft delete for message removal',
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at),
    INDEX idx_conversation_created (conversation_id, created_at),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES accounts(id) ON DELETE CASCADE
) COMMENT='Chat messages';

CREATE TABLE message_read_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_message_id (message_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_receipt (message_id, user_id)
) COMMENT='Track which users have read which messages';

CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50) NOT NULL COMMENT 'general, notifications, security, appearance, system',
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES accounts(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_setting_key (setting_key)
) COMMENT='Store system-wide configuration settings';