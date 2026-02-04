# SOCLEX Deployment Guide

<div align="center">

```
███████╗ ██████╗  ██████╗██╗     ███████╗██╗  ██╗
██╔════╝██╔═══██╗██╔════╝██║     ██╔════╝╚██╗██╔╝
███████╗██║   ██║██║     ██║     █████╗   ╚███╔╝ 
╚════██║██║   ██║██║     ██║     ██╔══╝   ██╔██╗ 
███████║╚██████╔╝╚██████╗███████╗███████╗██╔╝ ██╗
╚══════╝ ╚═════╝  ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝
```

**Production Deployment Guide**

[![GitHub](https://img.shields.io/badge/GitHub-LutfyAlfean-blue)](https://github.com/LutfyAlfean/soclex)

</div>

---

## 📋 Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| OS | Ubuntu 20.04 LTS | Ubuntu 24.04 LTS |
| RAM | 2 GB | 4 GB |
| CPU | 2 cores | 4 cores |
| Storage | 20 GB | 50 GB |
| Network | 100 Mbps | 1 Gbps |

### Required Ports

| Port | Service | Protocol |
|------|---------|----------|
| 7129 | SOCLEX Web UI | TCP |
| 9200 | Agent Communication | TCP |
| 443 | HTTPS (optional) | TCP |

---

## 🐳 Docker Deployment (Recommended)

### Step 1: Install Docker

**Ubuntu 24.04 LTS:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Step 2: Clone Repository

```bash
cd /opt
sudo git clone https://github.com/LutfyAlfean/soclex.git
cd soclex
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

### Step 4: Start SOCLEX

```bash
# Build and start containers
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 5: Access Dashboard

```
http://YOUR_SERVER_IP:7129

Username: adminlex
Password: AdminLex31Terminat@
```

---

## 🔧 Manual Deployment

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Verify
node --version
npm --version
nginx -v
```

### Step 2: Clone and Build

```bash
# Create directory
sudo mkdir -p /opt/soclex
cd /opt/soclex

# Clone repository
sudo git clone https://github.com/LutfyAlfean/soclex.git .

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 3: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/soclex
```

```nginx
server {
    listen 7129;
    server_name _;

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

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/soclex /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔧 One-Line Installation

### Docker Installation (Recommended)

```bash
curl -sSL https://raw.githubusercontent.com/LutfyAlfean/soclex/main/scripts/soclex.sh -o soclex.sh && chmod +x soclex.sh && sudo ./soclex.sh --docker
```

### Manual Installation

```bash
curl -sSL https://raw.githubusercontent.com/LutfyAlfean/soclex/main/scripts/soclex.sh -o soclex.sh && chmod +x soclex.sh && sudo ./soclex.sh --install
```

---

## 🔒 Security Hardening

### Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow required ports
sudo ufw allow ssh
sudo ufw allow 7129/tcp    # SOCLEX Web
sudo ufw allow 9200/tcp    # Agent communication

# Verify
sudo ufw status
```

### Fail2ban Setup

```bash
# Install
sudo apt install -y fail2ban

# Configure
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[soclex]
enabled = true
port = 7129
filter = soclex
logpath = /var/log/nginx/access.log
maxretry = 10
```

Start Fail2ban:

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🤖 Agent Installation

Install SOCLEX Agent on monitored servers:

```bash
curl -sSL https://raw.githubusercontent.com/LutfyAlfean/soclex/main/scripts/install-agent.sh | sudo bash -s -- \
  --server=YOUR_SOCLEX_SERVER_IP \
  --port=9200 \
  --key=YOUR_API_KEY
```

---

## 🔄 Updates

### Docker Update

```bash
cd /opt/soclex
docker compose down
git pull origin main
docker compose build --no-cache
docker compose up -d
```

### Manual Update

```bash
cd /opt/soclex
git pull origin main
npm install
npm run build
sudo systemctl restart nginx
```

---

## 📊 Monitoring

### Check Service Status

```bash
# Docker
docker compose ps
docker compose logs -f soclex

# Manual
sudo systemctl status nginx
sudo journalctl -u nginx -f
```

### Health Check

```bash
# Check if SOCLEX is responding
curl -s http://localhost:7129/health

# Check port
sudo netstat -tlnp | grep 7129
```

---

## 🗑️ Uninstall

### Docker Uninstall

```bash
cd /opt/soclex
docker compose down -v
sudo rm -rf /opt/soclex
```

### Manual Uninstall

```bash
sudo rm -rf /opt/soclex
sudo rm -f /etc/nginx/sites-enabled/soclex
sudo rm -f /etc/nginx/sites-available/soclex
sudo systemctl restart nginx
```

---

## 📞 Support

- Repository: [github.com/LutfyAlfean/soclex](https://github.com/LutfyAlfean/soclex)
- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/LutfyAlfean/soclex/issues)

---

<div align="center">

**SOCLEX** - Deploy with Confidence

[![GitHub](https://img.shields.io/badge/Author-LutfyAlfean-red)](https://github.com/LutfyAlfean)

</div>
