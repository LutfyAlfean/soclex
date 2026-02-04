# SOCLEX - Setup dengan MySQL (Local Database)

Panduan ini menjelaskan cara setup SOCLEX menggunakan database MySQL lokal sebagai alternatif dari Lovable Cloud.

## Prerequisites

- MySQL Server 8.0+
- Node.js 18+
- npm atau bun

## 1. Instalasi MySQL

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### CentOS/RHEL
```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

### macOS (Homebrew)
```bash
brew install mysql
brew services start mysql
```

## 2. Setup Database

### Login ke MySQL
```bash
sudo mysql -u root -p
```

### Buat Database dan User
```sql
-- Buat database
CREATE DATABASE soclex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user
CREATE USER 'soclex'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON soclex.* TO 'soclex'@'localhost';
FLUSH PRIVILEGES;

-- Gunakan database
USE soclex;
```

## 3. Schema Database

### Buat Tabel Servers
```sql
CREATE TABLE servers (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  server_type ENUM('proxmox', 'vm', 'container', 'physical') DEFAULT 'vm',
  status ENUM('online', 'warning', 'critical', 'offline') DEFAULT 'online',
  cpu_usage DECIMAL(5,2) DEFAULT 0,
  memory_usage DECIMAL(5,2) DEFAULT 0,
  disk_usage DECIMAL(5,2) DEFAULT 0,
  os VARCHAR(255),
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_server_type (server_type)
);
```

### Buat Tabel Threats
```sql
CREATE TABLE threats (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  ip_address VARCHAR(45) NOT NULL,
  threat_type VARCHAR(255) NOT NULL,
  severity ENUM('critical', 'high', 'medium', 'low', 'info') DEFAULT 'medium',
  country VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  description TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_severity (severity),
  INDEX idx_is_resolved (is_resolved),
  INDEX idx_detected_at (detected_at)
);
```

### Buat Tabel Agents
```sql
CREATE TABLE agents (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  hostname VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  os VARCHAR(255),
  version VARCHAR(50),
  status ENUM('connected', 'disconnected', 'pending') DEFAULT 'pending',
  last_heartbeat TIMESTAMP NULL,
  server_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_hostname (hostname)
);
```

### Buat Tabel Server Logs
```sql
CREATE TABLE server_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  server_id CHAR(36) NOT NULL,
  log_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  severity ENUM('critical', 'high', 'medium', 'low', 'info') DEFAULT 'info',
  metadata JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
  INDEX idx_server_id (server_id),
  INDEX idx_created_at (created_at),
  INDEX idx_severity (severity)
);
```

### Buat Tabel Server Metrics
```sql
CREATE TABLE server_metrics (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  server_id CHAR(36) NOT NULL,
  cpu_usage DECIMAL(5,2) NOT NULL,
  memory_usage DECIMAL(5,2) NOT NULL,
  disk_usage DECIMAL(5,2) NOT NULL,
  network_in BIGINT DEFAULT 0,
  network_out BIGINT DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
  INDEX idx_server_id (server_id),
  INDEX idx_recorded_at (recorded_at)
);
```

### Buat Tabel Alerts
```sql
CREATE TABLE alerts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity ENUM('critical', 'high', 'medium', 'low', 'info') DEFAULT 'info',
  source VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  server_id CHAR(36),
  threat_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE SET NULL,
  FOREIGN KEY (threat_id) REFERENCES threats(id) ON DELETE SET NULL,
  INDEX idx_is_read (is_read),
  INDEX idx_severity (severity),
  INDEX idx_created_at (created_at)
);
```

### Buat Tabel Notification Settings
```sql
CREATE TABLE notification_settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  telegram_bot_token VARCHAR(255),
  telegram_chat_id VARCHAR(100),
  telegram_enabled BOOLEAN DEFAULT FALSE,
  email_enabled BOOLEAN DEFAULT FALSE,
  email_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 4. Insert Sample Data

```sql
-- Insert sample servers
INSERT INTO servers (name, ip_address, server_type, status, cpu_usage, memory_usage, disk_usage, os) VALUES
('proxmox-main', '192.168.1.10', 'proxmox', 'online', 45, 62, 38, 'Proxmox VE 8.0'),
('web-server-01', '192.168.1.20', 'vm', 'online', 23, 45, 55, 'Ubuntu 22.04'),
('db-server-01', '192.168.1.21', 'vm', 'warning', 78, 85, 72, 'Debian 12'),
('mail-server', '192.168.1.22', 'container', 'online', 12, 28, 45, 'Alpine Linux'),
('backup-srv', '192.168.1.30', 'physical', 'critical', 92, 94, 89, 'CentOS 9'),
('monitoring', '192.168.1.40', 'vm', 'offline', 0, 0, 0, 'Ubuntu 20.04');

-- Insert sample threats
INSERT INTO threats (ip_address, threat_type, severity, country, city, description) VALUES
('103.45.67.89', 'Brute Force Attack', 'critical', 'China', 'Beijing', 'Multiple failed SSH login attempts detected'),
('45.33.21.98', 'Port Scan', 'high', 'Russia', 'Moscow', 'Systematic port scanning activity'),
('198.51.100.45', 'SQL Injection', 'high', 'Unknown', 'Unknown', 'SQL injection attempt on web application'),
('203.0.113.67', 'DDoS Attack', 'critical', 'Brazil', 'São Paulo', 'Distributed denial of service attack'),
('192.0.2.123', 'Malware C2', 'medium', 'Vietnam', 'Hanoi', 'Command and control communication detected');
```

## 5. Backend API Setup

### Install Dependencies
```bash
npm install express mysql2 cors dotenv
```

### Environment Variables (.env)
```env
DB_HOST=localhost
DB_USER=soclex
DB_PASSWORD=your_secure_password
DB_NAME=soclex
DB_PORT=3306
API_PORT=3001
```

### Express Server (server.js)
```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// API Routes

// Get all servers
app.get('/api/servers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM servers ORDER BY name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get server by ID
app.get('/api/servers/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM servers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Server not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get server metrics
app.get('/api/servers/:id/metrics', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM server_metrics WHERE server_id = ? ORDER BY recorded_at DESC LIMIT 24',
      [req.params.id]
    );
    res.json(rows.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get server logs
app.get('/api/servers/:id/logs', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM server_logs WHERE server_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all threats
app.get('/api/threats', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM threats ORDER BY detected_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create threat
app.post('/api/threats', async (req, res) => {
  try {
    const { ip_address, threat_type, severity, country, city, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO threats (ip_address, threat_type, severity, country, city, description) VALUES (?, ?, ?, ?, ?, ?)',
      [ip_address, threat_type, severity, country, city, description]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all agents
app.get('/api/agents', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agents ORDER BY hostname');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent heartbeat
app.post('/api/agents/heartbeat', async (req, res) => {
  try {
    const { hostname, ip_address, os, version } = req.body;
    
    // Check if agent exists
    const [existing] = await pool.query(
      'SELECT id FROM agents WHERE hostname = ? AND ip_address = ?',
      [hostname, ip_address]
    );
    
    if (existing.length > 0) {
      // Update existing agent
      await pool.query(
        'UPDATE agents SET status = ?, last_heartbeat = NOW(), os = ?, version = ? WHERE id = ?',
        ['connected', os, version, existing[0].id]
      );
      res.json({ id: existing[0].id, status: 'updated' });
    } else {
      // Create new agent
      const [result] = await pool.query(
        'INSERT INTO agents (hostname, ip_address, os, version, status, last_heartbeat) VALUES (?, ?, ?, ?, ?, NOW())',
        [hostname, ip_address, os, version, 'connected']
      );
      res.json({ id: result.insertId, status: 'created' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit server metrics
app.post('/api/metrics', async (req, res) => {
  try {
    const { server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out } = req.body;
    
    await pool.query(
      'INSERT INTO server_metrics (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out) VALUES (?, ?, ?, ?, ?, ?)',
      [server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out]
    );
    
    // Update server status
    await pool.query(
      'UPDATE servers SET cpu_usage = ?, memory_usage = ?, disk_usage = ?, last_seen_at = NOW() WHERE id = ?',
      [cpu_usage, memory_usage, disk_usage, server_id]
    );
    
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 100');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark alert as read
app.patch('/api/alerts/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE alerts SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`SOCLEX API running on port ${PORT}`);
});
```

## 6. Systemd Service

```ini
# /etc/systemd/system/soclex-api.service
[Unit]
Description=SOCLEX API Server
After=network.target mysql.service

[Service]
Type=simple
User=soclex
WorkingDirectory=/opt/soclex
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=soclex-api
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable soclex-api
sudo systemctl start soclex-api
```

## 7. Frontend Configuration

Update environment variables untuk menggunakan MySQL backend:

```env
VITE_API_URL=http://localhost:3001
```

Update hooks untuk menggunakan REST API:

```typescript
// src/hooks/useServers.ts
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

export const useServers = () => {
  return useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/servers`);
      if (!res.ok) throw new Error('Failed to fetch servers');
      return res.json();
    },
  });
};
```

## 8. Maintenance

### Backup Database
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u soclex -p soclex > /backup/soclex_$DATE.sql
```

### Cleanup Old Metrics (Cron Job)
```sql
-- Delete metrics older than 30 days
DELETE FROM server_metrics WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Delete logs older than 90 days
DELETE FROM server_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### Monitor Database Size
```sql
SELECT 
  table_name AS 'Table',
  ROUND(data_length / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'soclex'
ORDER BY data_length DESC;
```

## Troubleshooting

### Connection Refused
- Check MySQL service: `sudo systemctl status mysql`
- Verify credentials in .env file
- Check firewall: `sudo ufw status`

### Performance Issues
- Add indexes on frequently queried columns
- Configure MySQL buffer pool size
- Enable slow query log for optimization

### Data Integrity
- Use transactions for related operations
- Implement foreign key constraints
- Regular backup schedule

## Migration from Lovable Cloud

Jika ingin migrasi dari Lovable Cloud ke MySQL lokal:

1. Export data dari Cloud menggunakan SQL editor
2. Transform UUID format jika diperlukan
3. Import ke MySQL lokal
4. Update frontend configuration
