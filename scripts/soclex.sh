#!/bin/bash

#===============================================================================
#
#          FILE:  soclex.sh
#
#         USAGE:  ./soclex --install | --uninstall | --status | --restart
#
#   DESCRIPTION:  SOCLEX Security Operations Center - Installation Script
#
#       OPTIONS:  --install     Install SOCLEX and all dependencies
#                 --uninstall   Remove SOCLEX completely
#                 --status      Check SOCLEX service status
#                 --restart     Restart SOCLEX service
#                 --update      Update SOCLEX to latest version
#                 --help        Show this help message
#
#  REQUIREMENTS:  Ubuntu 20.04+ / Debian 11+ / CentOS 8+
#                 Root or sudo access
#
#         NOTES:  Run as root or with sudo
#
#        AUTHOR:  SOCLEX Team
#       VERSION:  1.0.0
#       CREATED:  2024
#
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SOCLEX_VERSION="1.0.0"
SOCLEX_DIR="/opt/soclex"
SOCLEX_USER="soclex"
SOCLEX_DATA="/var/lib/soclex"
SOCLEX_LOG="/var/log/soclex"
SOCLEX_CONFIG="/etc/soclex"
SOCLEX_PORT="3000"
AGENT_PORT="9200"

# Banner
print_banner() {
    echo -e "${RED}"
    echo "  ███████╗ ██████╗  ██████╗██╗     ███████╗██╗  ██╗"
    echo "  ██╔════╝██╔═══██╗██╔════╝██║     ██╔════╝╚██╗██╔╝"
    echo "  ███████╗██║   ██║██║     ██║     █████╗   ╚███╔╝ "
    echo "  ╚════██║██║   ██║██║     ██║     ██╔══╝   ██╔██╗ "
    echo "  ███████║╚██████╔╝╚██████╗███████╗███████╗██╔╝ ██╗"
    echo "  ╚══════╝ ╚═════╝  ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝"
    echo -e "${NC}"
    echo -e "${CYAN}  Security Operations Center - v${SOCLEX_VERSION}${NC}"
    echo ""
}

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        log_error "Cannot detect OS. /etc/os-release not found."
        exit 1
    fi
    
    log_info "Detected OS: $OS $VERSION"
}

# Install dependencies based on OS
install_dependencies() {
    log_info "Installing dependencies..."
    
    case $OS in
        ubuntu|debian)
            apt-get update -qq
            apt-get install -y -qq curl wget git build-essential \
                nginx postgresql postgresql-contrib \
                ufw fail2ban certbot python3-certbot-nginx
            ;;
        centos|rhel|rocky|almalinux)
            dnf update -y -q
            dnf install -y -q curl wget git gcc make \
                nginx postgresql postgresql-server \
                firewalld fail2ban certbot python3-certbot-nginx
            postgresql-setup --initdb
            systemctl enable postgresql
            systemctl start postgresql
            ;;
        *)
            log_error "Unsupported OS: $OS"
            exit 1
            ;;
    esac
    
    # Install Node.js 20
    if ! command -v node &> /dev/null; then
        log_info "Installing Node.js 20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y -qq nodejs
    fi
    
    log_success "Dependencies installed"
}

# Create SOCLEX user
create_user() {
    log_info "Creating SOCLEX user..."
    
    if id "$SOCLEX_USER" &>/dev/null; then
        log_warning "User $SOCLEX_USER already exists"
    else
        useradd -r -s /bin/false -d $SOCLEX_DIR $SOCLEX_USER
        log_success "User $SOCLEX_USER created"
    fi
}

# Create directories
create_directories() {
    log_info "Creating directories..."
    
    mkdir -p $SOCLEX_DIR
    mkdir -p $SOCLEX_DATA
    mkdir -p $SOCLEX_LOG
    mkdir -p $SOCLEX_CONFIG
    
    chown -R $SOCLEX_USER:$SOCLEX_USER $SOCLEX_DIR
    chown -R $SOCLEX_USER:$SOCLEX_USER $SOCLEX_DATA
    chown -R $SOCLEX_USER:$SOCLEX_USER $SOCLEX_LOG
    
    log_success "Directories created"
}

# Setup database
setup_database() {
    log_info "Setting up PostgreSQL database..."
    
    # Generate random password
    DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)
    
    sudo -u postgres psql -c "CREATE USER soclex WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE soclex OWNER soclex;" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE soclex TO soclex;" 2>/dev/null || true
    
    # Save credentials
    echo "DATABASE_URL=postgresql://soclex:$DB_PASSWORD@localhost:5432/soclex" > $SOCLEX_CONFIG/database.env
    chmod 600 $SOCLEX_CONFIG/database.env
    
    log_success "Database configured"
}

# Download and install SOCLEX
install_soclex() {
    log_info "Downloading SOCLEX..."
    
    # Clone or download SOCLEX
    if [ -d "$SOCLEX_DIR/.git" ]; then
        cd $SOCLEX_DIR
        git pull origin main
    else
        git clone https://github.com/yourusername/soclex.git $SOCLEX_DIR 2>/dev/null || {
            log_warning "Git clone failed, creating from scratch..."
            cd $SOCLEX_DIR
        }
    fi
    
    cd $SOCLEX_DIR
    
    log_info "Installing npm packages..."
    npm install --production --silent
    
    log_info "Building application..."
    npm run build
    
    chown -R $SOCLEX_USER:$SOCLEX_USER $SOCLEX_DIR
    
    log_success "SOCLEX installed"
}

# Configure Nginx
configure_nginx() {
    log_info "Configuring Nginx..."
    
    cat > /etc/nginx/sites-available/soclex << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /opt/soclex/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Agent endpoint
    location /agent {
        proxy_pass http://localhost:9200;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Block sensitive files
    location ~ /\. {
        deny all;
    }
}
EOF
    
    # Enable site
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    ln -sf /etc/nginx/sites-available/soclex /etc/nginx/sites-enabled/soclex
    
    nginx -t
    systemctl enable nginx
    systemctl restart nginx
    
    log_success "Nginx configured"
}

# Create systemd service
create_service() {
    log_info "Creating systemd service..."
    
    cat > /etc/systemd/system/soclex.service << EOF
[Unit]
Description=SOCLEX Security Operations Center
After=network.target postgresql.service

[Service]
Type=simple
User=$SOCLEX_USER
Group=$SOCLEX_USER
WorkingDirectory=$SOCLEX_DIR
EnvironmentFile=-$SOCLEX_CONFIG/database.env
ExecStart=/usr/bin/node $SOCLEX_DIR/server.js
Restart=always
RestartSec=10
StandardOutput=append:$SOCLEX_LOG/soclex.log
StandardError=append:$SOCLEX_LOG/soclex-error.log

# Security
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$SOCLEX_DATA $SOCLEX_LOG

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable soclex
    
    log_success "Systemd service created"
}

# Configure firewall
configure_firewall() {
    log_info "Configuring firewall..."
    
    case $OS in
        ubuntu|debian)
            ufw --force enable
            ufw default deny incoming
            ufw default allow outgoing
            ufw allow ssh
            ufw allow 80/tcp
            ufw allow 443/tcp
            ufw allow $AGENT_PORT/tcp
            ;;
        centos|rhel|rocky|almalinux)
            systemctl enable firewalld
            systemctl start firewalld
            firewall-cmd --permanent --add-service=ssh
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            firewall-cmd --permanent --add-port=$AGENT_PORT/tcp
            firewall-cmd --reload
            ;;
    esac
    
    log_success "Firewall configured"
}

# Configure fail2ban
configure_fail2ban() {
    log_info "Configuring Fail2ban..."
    
    cat > /etc/fail2ban/jail.d/soclex.conf << EOF
[soclex]
enabled = true
port = http,https
filter = soclex
logpath = $SOCLEX_LOG/soclex.log
maxretry = 5
bantime = 3600
findtime = 600

[soclex-agent]
enabled = true
port = $AGENT_PORT
filter = soclex-agent
logpath = $SOCLEX_LOG/agent.log
maxretry = 10
bantime = 1800
EOF
    
    cat > /etc/fail2ban/filter.d/soclex.conf << 'EOF'
[Definition]
failregex = ^.*Failed login attempt from <HOST>.*$
            ^.*Authentication failed for .* from <HOST>.*$
ignoreregex =
EOF
    
    systemctl enable fail2ban
    systemctl restart fail2ban
    
    log_success "Fail2ban configured"
}

# Start services
start_services() {
    log_info "Starting services..."
    
    systemctl start postgresql 2>/dev/null || true
    systemctl start nginx
    systemctl start soclex 2>/dev/null || log_warning "SOCLEX service needs manual configuration"
    
    log_success "Services started"
}

# Print installation summary
print_summary() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  SOCLEX Installation Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Web Interface:${NC}  http://$(hostname -I | awk '{print $1}')"
    echo -e "  ${CYAN}Agent Port:${NC}     $AGENT_PORT"
    echo ""
    echo -e "  ${YELLOW}Default Credentials:${NC}"
    echo -e "  Username: ${PURPLE}adminlex${NC}"
    echo -e "  Password: ${PURPLE}ahsYte\$@612#231Hyad${NC}"
    echo ""
    echo -e "  ${RED}⚠️  IMPORTANT: Change the default password immediately!${NC}"
    echo ""
    echo -e "  ${CYAN}Useful Commands:${NC}"
    echo -e "  Status:   ${GREEN}./soclex --status${NC}"
    echo -e "  Restart:  ${GREEN}./soclex --restart${NC}"
    echo -e "  Logs:     ${GREEN}journalctl -u soclex -f${NC}"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
}

# Installation function
install() {
    print_banner
    log_info "Starting SOCLEX installation..."
    
    check_root
    detect_os
    install_dependencies
    create_user
    create_directories
    setup_database
    install_soclex
    configure_nginx
    create_service
    configure_firewall
    configure_fail2ban
    start_services
    print_summary
}

# Uninstall function
uninstall() {
    print_banner
    check_root
    
    log_warning "This will remove SOCLEX and all its data!"
    read -p "Are you sure? (y/N): " confirm
    
    if [[ $confirm != [yY] ]]; then
        log_info "Uninstall cancelled"
        exit 0
    fi
    
    log_info "Stopping services..."
    systemctl stop soclex 2>/dev/null || true
    systemctl disable soclex 2>/dev/null || true
    
    log_info "Removing files..."
    rm -f /etc/systemd/system/soclex.service
    rm -f /etc/nginx/sites-enabled/soclex
    rm -f /etc/nginx/sites-available/soclex
    rm -f /etc/fail2ban/jail.d/soclex.conf
    rm -f /etc/fail2ban/filter.d/soclex.conf
    rm -rf $SOCLEX_DIR
    rm -rf $SOCLEX_DATA
    rm -rf $SOCLEX_LOG
    rm -rf $SOCLEX_CONFIG
    
    log_info "Removing database..."
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS soclex;" 2>/dev/null || true
    sudo -u postgres psql -c "DROP USER IF EXISTS soclex;" 2>/dev/null || true
    
    log_info "Removing user..."
    userdel $SOCLEX_USER 2>/dev/null || true
    
    systemctl daemon-reload
    systemctl restart nginx
    systemctl restart fail2ban
    
    log_success "SOCLEX has been completely removed"
}

# Status function
status() {
    print_banner
    
    echo -e "${CYAN}Service Status:${NC}"
    echo ""
    
    # SOCLEX service
    if systemctl is-active --quiet soclex; then
        echo -e "  SOCLEX:     ${GREEN}● Running${NC}"
    else
        echo -e "  SOCLEX:     ${RED}○ Stopped${NC}"
    fi
    
    # Nginx
    if systemctl is-active --quiet nginx; then
        echo -e "  Nginx:      ${GREEN}● Running${NC}"
    else
        echo -e "  Nginx:      ${RED}○ Stopped${NC}"
    fi
    
    # PostgreSQL
    if systemctl is-active --quiet postgresql; then
        echo -e "  PostgreSQL: ${GREEN}● Running${NC}"
    else
        echo -e "  PostgreSQL: ${RED}○ Stopped${NC}"
    fi
    
    # Fail2ban
    if systemctl is-active --quiet fail2ban; then
        echo -e "  Fail2ban:   ${GREEN}● Running${NC}"
    else
        echo -e "  Fail2ban:   ${RED}○ Stopped${NC}"
    fi
    
    echo ""
}

# Restart function
restart() {
    print_banner
    check_root
    
    log_info "Restarting SOCLEX services..."
    
    systemctl restart soclex
    systemctl restart nginx
    
    log_success "Services restarted"
}

# Update function
update() {
    print_banner
    check_root
    
    log_info "Updating SOCLEX..."
    
    cd $SOCLEX_DIR
    git pull origin main
    npm install --production --silent
    npm run build
    
    chown -R $SOCLEX_USER:$SOCLEX_USER $SOCLEX_DIR
    
    systemctl restart soclex
    
    log_success "SOCLEX updated to latest version"
}

# Help function
show_help() {
    print_banner
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --install     Install SOCLEX and all dependencies"
    echo "  --uninstall   Remove SOCLEX completely"
    echo "  --status      Check SOCLEX service status"
    echo "  --restart     Restart SOCLEX services"
    echo "  --update      Update SOCLEX to latest version"
    echo "  --help        Show this help message"
    echo ""
}

# Main
case "$1" in
    --install)
        install
        ;;
    --uninstall)
        uninstall
        ;;
    --status)
        status
        ;;
    --restart)
        restart
        ;;
    --update)
        update
        ;;
    --help|*)
        show_help
        ;;
esac

exit 0
