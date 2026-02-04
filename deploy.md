# SOCLEX Deployment Guide

Panduan lengkap untuk deploy SOCLEX dengan database lokal.

---

## 📋 Prasyarat

### System Requirements
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- 4GB RAM minimum
- 50GB storage
- Node.js 18+ atau Bun
- PostgreSQL 14+ (opsional, untuk production)
- Nginx (untuk reverse proxy)

### Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Atau gunakan Bun (lebih cepat)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install PostgreSQL (optional)
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx
```

---

## 🚀 Quick Deploy

### Menggunakan Script Otomatis

```bash
# Download dan jalankan installer
curl -sL https://raw.githubusercontent.com/yourusername/soclex/main/scripts/soclex.sh -o soclex
chmod +x soclex

# Install SOCLEX
sudo ./soclex --install

# Atau untuk uninstall
sudo ./soclex --uninstall
```

---

## 📝 Manual Deployment

### Step 1: Clone Repository

```bash
cd /opt
sudo git clone https://github.com/yourusername/soclex.git
cd soclex
```

### Step 2: Install Dependencies

```bash
# Menggunakan npm
npm install

# Atau menggunakan Bun
bun install
```

### Step 3: Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit konfigurasi
nano .env
```

Contoh `.env`:
```env
# Server Configuration
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=SOCLEX

# Database (jika menggunakan backend)
DATABASE_URL=postgresql://soclex:password@localhost:5432/soclex

# Security
JWT_SECRET=your-super-secret-key-change-this
SESSION_SECRET=another-secret-key

# Agent Configuration
AGENT_PORT=9200
AGENT_SSL=true
```

### Step 4: Setup Database (Optional)

```bash
# Login ke PostgreSQL
sudo -u postgres psql

# Create database dan user
CREATE DATABASE soclex;
CREATE USER soclex WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE soclex TO soclex;
\q
```

### Step 5: Build Application

```bash
# Build untuk production
npm run build

# Atau dengan Bun
bun run build
```

### Step 6: Setup Nginx

```bash
# Buat konfigurasi Nginx
sudo nano /etc/nginx/sites-available/soclex
```

Isi dengan:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /opt/soclex/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy (jika ada backend)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Aktifkan site:
```bash
sudo ln -s /etc/nginx/sites-available/soclex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Setup SSL dengan Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Dapatkan certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal sudah disetup otomatis
```

### Step 8: Setup Systemd Service

```bash
sudo nano /etc/systemd/system/soclex.service
```

Isi dengan:
```ini
[Unit]
Description=SOCLEX Security Operations Center
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/soclex
ExecStart=/usr/bin/node /opt/soclex/server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=soclex
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Aktifkan service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable soclex
sudo systemctl start soclex
sudo systemctl status soclex
```

---

## 🔧 Konfigurasi Database Lokal

### SQLite (Simple Setup)

Untuk deployment sederhana, Anda bisa menggunakan SQLite:

```bash
# Install better-sqlite3
npm install better-sqlite3

# Database akan otomatis dibuat di /opt/soclex/data/soclex.db
```

### PostgreSQL (Production)

Untuk production, gunakan PostgreSQL:

```bash
# Inisialisasi schema
psql -U soclex -d soclex -f /opt/soclex/sql/schema.sql

# Import data awal
psql -U soclex -d soclex -f /opt/soclex/sql/seed.sql
```

---

## 🛡️ Security Hardening

### Firewall Setup

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 9200/tcp  # Agent port
sudo ufw enable
```

### Fail2ban

```bash
sudo apt install -y fail2ban

# Create SOCLEX filter
sudo nano /etc/fail2ban/filter.d/soclex.conf
```

---

## 🔄 Update SOCLEX

```bash
cd /opt/soclex
git pull origin main
npm install
npm run build
sudo systemctl restart soclex
```

---

## 🐛 Troubleshooting

### Check Logs

```bash
# Application logs
sudo journalctl -u soclex -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :80
   sudo kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   sudo chown -R www-data:www-data /opt/soclex
   ```

3. **Database connection failed**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -c "\l"
   ```

---

## 📞 Support

Jika mengalami masalah, silakan:
1. Buka issue di GitHub
2. Join Discord community
3. Email: support@soclex.io

---

<p align="center">
  <strong>SOCLEX</strong> - Deploy with Confidence
</p>
