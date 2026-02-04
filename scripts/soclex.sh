#!/bin/bash

#===============================================================================
#
#          FILE:  soclex.sh
#
#         USAGE:  ./soclex --install | --uninstall | --status | --restart
#
#   DESCRIPTION:  SOCLEX Security Operations Center - Main Control Script
#
#       OPTIONS:  --install     Install SOCLEX with all dependencies
#                 --uninstall   Remove SOCLEX completely
#                 --status      Check SOCLEX service status
#                 --restart     Restart SOCLEX services
#                 --update      Update SOCLEX to latest version
#                 --docker      Install using Docker
#                 --help        Show this help message
#
#  REQUIREMENTS:  Ubuntu 20.04+ / Debian 11+ / CentOS 8+
#                 Root or sudo access
#
#       VERSION:  1.0.0
#
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SOCLEX_VERSION="1.0.0"
SOCLEX_DIR="/opt/soclex"
SOCLEX_USER="soclex"
SOCLEX_LOG="/var/log/soclex"
SOCLEX_PORT="7129"
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

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root or with sudo"
        exit 1
    fi
}

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        log_error "Cannot detect OS"
        exit 1
    fi
    log_info "Detected OS: $OS $VERSION"
}

# Docker Installation
install_docker() {
    log_info "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        log_warning "Docker already installed"
        return
    fi
    
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    
    log_success "Docker installed"
}

# Docker deployment
deploy_docker() {
    print_banner
    check_root
    
    log_info "Deploying SOCLEX with Docker..."
    
    install_docker
    
    # Clone or update repository
    if [ -d "$SOCLEX_DIR" ]; then
        cd $SOCLEX_DIR
        git pull origin main 2>/dev/null || true
    else
        git clone https://github.com/soclex/soclex.git $SOCLEX_DIR 2>/dev/null || {
            log_error "Failed to clone repository"
            exit 1
        }
    fi
    
    cd $SOCLEX_DIR
    
    # Build and start
    docker compose up -d --build
    
    # Wait for container
    sleep 5
    
    if docker compose ps | grep -q "Up"; then
        print_summary_docker
    else
        log_error "Docker deployment failed"
        docker compose logs
        exit 1
    fi
}

# Manual installation
install_manual() {
    print_banner
    check_root
    detect_os
    
    log_info "Starting SOCLEX installation..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    case $OS in
        ubuntu|debian)
            apt-get update -qq
            apt-get install -y -qq curl wget git nginx ufw fail2ban
            ;;
        centos|rhel|rocky|almalinux)
            dnf update -y -q
            dnf install -y -q curl wget git nginx firewalld fail2ban
            ;;
        *)
            log_error "Unsupported OS: $OS"
            exit 1
            ;;
    esac
    
    # Install Node.js
    if ! command -v node &> /dev/null; then
        log_info "Installing Node.js 20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y -qq nodejs
    fi
    
    # Create directories
    log_info "Creating directories..."
    mkdir -p $SOCLEX_DIR
    mkdir -p $SOCLEX_LOG
    
    # Clone repository
    if [ -d "$SOCLEX_DIR/.git" ]; then
        cd $SOCLEX_DIR
        git pull origin main 2>/dev/null || true
    else
        git clone https://github.com/soclex/soclex.git $SOCLEX_DIR 2>/dev/null || {
            log_warning "Git clone failed, manual setup required"
        }
    fi
    
    cd $SOCLEX_DIR
    
    # Install and build
    log_info "Installing npm packages..."
    npm install --production --silent 2>/dev/null || npm install
    
    log_info "Building application..."
    npm run build
    
    # Configure Nginx
    configure_nginx_manual
    
    # Configure firewall
    configure_firewall
    
    # Start services
    systemctl enable nginx
    systemctl restart nginx
    
    print_summary_manual
}

configure_nginx_manual() {
    log_info "Configuring Nginx..."
    
    cat > /etc/nginx/sites-available/soclex << EOF
server {
    listen ${SOCLEX_PORT};
    server_name _;

    root ${SOCLEX_DIR}/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    ln -sf /etc/nginx/sites-available/soclex /etc/nginx/sites-enabled/
    nginx -t
}

configure_firewall() {
    log_info "Configuring firewall..."
    
    case $OS in
        ubuntu|debian)
            ufw --force enable 2>/dev/null || true
            ufw allow ssh
            ufw allow ${SOCLEX_PORT}/tcp
            ufw allow ${AGENT_PORT}/tcp
            ;;
        centos|rhel|rocky|almalinux)
            systemctl enable firewalld 2>/dev/null || true
            systemctl start firewalld 2>/dev/null || true
            firewall-cmd --permanent --add-service=ssh 2>/dev/null || true
            firewall-cmd --permanent --add-port=${SOCLEX_PORT}/tcp 2>/dev/null || true
            firewall-cmd --permanent --add-port=${AGENT_PORT}/tcp 2>/dev/null || true
            firewall-cmd --reload 2>/dev/null || true
            ;;
    esac
}

uninstall() {
    print_banner
    check_root
    
    log_warning "This will remove SOCLEX completely!"
    read -p "Are you sure? (y/N): " confirm
    
    if [[ $confirm != [yY] ]]; then
        log_info "Uninstall cancelled"
        exit 0
    fi
    
    log_info "Stopping services..."
    docker compose -f $SOCLEX_DIR/docker-compose.yml down 2>/dev/null || true
    systemctl stop nginx 2>/dev/null || true
    
    log_info "Removing files..."
    rm -f /etc/nginx/sites-enabled/soclex
    rm -f /etc/nginx/sites-available/soclex
    rm -rf $SOCLEX_DIR
    rm -rf $SOCLEX_LOG
    
    systemctl restart nginx 2>/dev/null || true
    
    log_success "SOCLEX has been removed"
}

status() {
    print_banner
    
    echo -e "${CYAN}Service Status:${NC}"
    echo ""
    
    # Docker
    if docker compose -f $SOCLEX_DIR/docker-compose.yml ps 2>/dev/null | grep -q "Up"; then
        echo -e "  SOCLEX (Docker): ${GREEN}● Running${NC}"
    elif systemctl is-active --quiet nginx; then
        echo -e "  SOCLEX (Nginx):  ${GREEN}● Running${NC}"
    else
        echo -e "  SOCLEX:          ${RED}○ Stopped${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}Ports:${NC}"
    echo -e "  Web UI:  ${SOCLEX_PORT}"
    echo -e "  Agent:   ${AGENT_PORT}"
    echo ""
    
    # Get IP
    IP=$(hostname -I | awk '{print $1}')
    echo -e "${CYAN}Access:${NC}"
    echo -e "  http://${IP}:${SOCLEX_PORT}"
}

restart_services() {
    print_banner
    check_root
    
    log_info "Restarting SOCLEX..."
    
    if [ -f "$SOCLEX_DIR/docker-compose.yml" ]; then
        docker compose -f $SOCLEX_DIR/docker-compose.yml restart
    else
        systemctl restart nginx
    fi
    
    log_success "SOCLEX restarted"
}

update() {
    print_banner
    check_root
    
    log_info "Updating SOCLEX..."
    
    cd $SOCLEX_DIR
    git pull origin main 2>/dev/null || {
        log_error "Failed to pull updates"
        exit 1
    }
    
    if [ -f "docker-compose.yml" ]; then
        docker compose build --no-cache
        docker compose up -d
    else
        npm install
        npm run build
        systemctl restart nginx
    fi
    
    log_success "SOCLEX updated to latest version"
}

print_summary_docker() {
    IP=$(hostname -I | awk '{print $1}')
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  SOCLEX Docker Deployment Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Web Interface:${NC}  http://${IP}:${SOCLEX_PORT}"
    echo -e "  ${CYAN}Agent Port:${NC}     ${AGENT_PORT}"
    echo ""
    echo -e "  ${YELLOW}Default Credentials:${NC}"
    echo -e "  Username: ${GREEN}adminlex${NC}"
    echo -e "  Password: ${GREEN}ahsYte\$@612#231Hyad${NC}"
    echo ""
    echo -e "  ${RED}⚠️  Change the default password immediately!${NC}"
    echo ""
    echo -e "  ${CYAN}Commands:${NC}"
    echo -e "  Status:   ${GREEN}docker compose -f ${SOCLEX_DIR}/docker-compose.yml ps${NC}"
    echo -e "  Logs:     ${GREEN}docker compose -f ${SOCLEX_DIR}/docker-compose.yml logs -f${NC}"
    echo -e "  Restart:  ${GREEN}docker compose -f ${SOCLEX_DIR}/docker-compose.yml restart${NC}"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
}

print_summary_manual() {
    IP=$(hostname -I | awk '{print $1}')
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  SOCLEX Installation Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Web Interface:${NC}  http://${IP}:${SOCLEX_PORT}"
    echo -e "  ${CYAN}Agent Port:${NC}     ${AGENT_PORT}"
    echo ""
    echo -e "  ${YELLOW}Default Credentials:${NC}"
    echo -e "  Username: ${GREEN}adminlex${NC}"
    echo -e "  Password: ${GREEN}ahsYte\$@612#231Hyad${NC}"
    echo ""
    echo -e "  ${RED}⚠️  Change the default password immediately!${NC}"
    echo ""
    echo -e "  ${CYAN}Commands:${NC}"
    echo -e "  Status:   ${GREEN}./soclex --status${NC}"
    echo -e "  Restart:  ${GREEN}./soclex --restart${NC}"
    echo -e "  Logs:     ${GREEN}tail -f /var/log/nginx/access.log${NC}"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
}

show_help() {
    print_banner
    echo "Usage: ./soclex [OPTION]"
    echo ""
    echo "Options:"
    echo "  --install     Install SOCLEX manually (Nginx)"
    echo "  --docker      Install SOCLEX with Docker (recommended)"
    echo "  --uninstall   Remove SOCLEX completely"
    echo "  --status      Check SOCLEX status"
    echo "  --restart     Restart SOCLEX services"
    echo "  --update      Update to latest version"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  sudo ./soclex --docker    # Docker installation"
    echo "  sudo ./soclex --install   # Manual installation"
    echo "  ./soclex --status         # Check status"
}

# Main
case "$1" in
    --install)
        install_manual
        ;;
    --docker)
        deploy_docker
        ;;
    --uninstall)
        uninstall
        ;;
    --status)
        status
        ;;
    --restart)
        restart_services
        ;;
    --update)
        update
        ;;
    --help|*)
        show_help
        ;;
esac
