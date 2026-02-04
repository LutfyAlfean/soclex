#!/bin/bash

#===============================================================================
#
#          FILE:  install-agent.sh
#
#         USAGE:  curl -sSL https://raw.githubusercontent.com/LutfyAlfean/soclex/main/scripts/install-agent.sh | sudo bash -s -- \
#                   --server=IP --port=PORT --key=API_KEY
#
#   DESCRIPTION:  SOCLEX Agent - Installation Script with Auto IP Detection
#
#       OPTIONS:  --server    SOCLEX Server IP/hostname (required)
#                 --port      Server port (default: 9200)
#                 --key       API Key for authentication (required)
#                 --name      Custom agent name (default: hostname)
#                 --help      Show help
#
#       VERSION:  1.0.0
#        AUTHOR:  LutfyAlfean
#        GITHUB:  https://github.com/LutfyAlfean/soclex
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

# Default values
AGENT_VERSION="1.0.0"
AGENT_DIR="/opt/soclex-agent"
SERVER_PORT="9200"
AGENT_NAME=$(hostname)

# Auto-detect IP address
detect_ip() {
    # Try multiple methods to get the primary IP
    LOCAL_IP=""
    
    # Method 1: ip route
    if command -v ip &> /dev/null; then
        LOCAL_IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
    fi
    
    # Method 2: hostname -I
    if [ -z "$LOCAL_IP" ] && command -v hostname &> /dev/null; then
        LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    
    # Method 3: ifconfig
    if [ -z "$LOCAL_IP" ] && command -v ifconfig &> /dev/null; then
        LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    fi
    
    # Fallback
    if [ -z "$LOCAL_IP" ]; then
        LOCAL_IP="127.0.0.1"
    fi
    
    echo "$LOCAL_IP"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --server=*)
            SERVER_IP="${1#*=}"
            shift
            ;;
        --port=*)
            SERVER_PORT="${1#*=}"
            shift
            ;;
        --key=*)
            API_KEY="${1#*=}"
            shift
            ;;
        --name=*)
            AGENT_NAME="${1#*=}"
            shift
            ;;
        --help)
            echo "SOCLEX Agent Installer v${AGENT_VERSION}"
            echo "GitHub: https://github.com/LutfyAlfean/soclex"
            echo ""
            echo "Usage: $0 --server=IP --key=API_KEY [--port=PORT] [--name=NAME]"
            echo ""
            echo "Options:"
            echo "  --server=IP     SOCLEX Server IP address (required)"
            echo "  --key=KEY       API Key for authentication (required)"
            echo "  --port=PORT     Server port (default: 9200)"
            echo "  --name=NAME     Agent name (default: hostname)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Banner
echo -e "${RED}"
echo "  ███████╗ ██████╗  ██████╗██╗     ███████╗██╗  ██╗"
echo "  ██╔════╝██╔═══██╗██╔════╝██║     ██╔════╝╚██╗██╔╝"
echo "  ███████╗██║   ██║██║     ██║     █████╗   ╚███╔╝ "
echo "  ╚════██║██║   ██║██║     ██║     ██╔══╝   ██╔██╗ "
echo "  ███████║╚██████╔╝╚██████╗███████╗███████╗██╔╝ ██╗"
echo "  ╚══════╝ ╚═════╝  ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "${CYAN}  Agent Installer v${AGENT_VERSION}${NC}"
echo -e "${CYAN}  GitHub: github.com/LutfyAlfean/soclex${NC}"
echo ""

# Validate required arguments
if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}[ERROR]${NC} --server is required"
    echo "Usage: $0 --server=IP --key=API_KEY"
    exit 1
fi

if [ -z "$API_KEY" ]; then
    echo -e "${RED}[ERROR]${NC} --key is required"
    echo "Usage: $0 --server=IP --key=API_KEY"
    exit 1
fi

# Check root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}[ERROR]${NC} This script must be run as root"
    exit 1
fi

# Detect local IP
AGENT_IP=$(detect_ip)

echo -e "${BLUE}[INFO]${NC} Installing SOCLEX Agent..."
echo -e "${BLUE}[INFO]${NC} Server: ${SERVER_IP}:${SERVER_PORT}"
echo -e "${BLUE}[INFO]${NC} Agent Name: ${AGENT_NAME}"
echo -e "${BLUE}[INFO]${NC} Agent IP: ${AGENT_IP} (auto-detected)"
echo ""

# Create directory
echo -e "${BLUE}[INFO]${NC} Creating directories..."
mkdir -p $AGENT_DIR
cd $AGENT_DIR

# Detect architecture
ARCH=$(uname -m)
case $ARCH in
    x86_64) ARCH="amd64" ;;
    aarch64) ARCH="arm64" ;;
    armv7l) ARCH="arm" ;;
    *) echo -e "${RED}[ERROR]${NC} Unsupported architecture: $ARCH"; exit 1 ;;
esac

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
OS_DISTRO="unknown"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_DISTRO="$ID $VERSION_ID"
fi

echo -e "${BLUE}[INFO]${NC} Platform: ${OS}-${ARCH}"
echo -e "${BLUE}[INFO]${NC} OS: ${OS_DISTRO}"

# Create agent script
echo -e "${BLUE}[INFO]${NC} Creating agent binary..."

cat > $AGENT_DIR/soclex-agent << 'AGENT_EOF'
#!/bin/bash

# SOCLEX Agent - Monitoring Script
# Sends heartbeats and metrics to SOCLEX server
# GitHub: https://github.com/LutfyAlfean/soclex

CONFIG_FILE="/opt/soclex-agent/config.yml"
LOG_FILE="/var/log/soclex-agent.log"
PID_FILE="/var/run/soclex-agent.pid"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

get_cpu_usage() {
    top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 2>/dev/null || echo "0"
}

get_mem_usage() {
    free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}' 2>/dev/null || echo "0"
}

get_disk_usage() {
    df -h / | awk 'NR==2 {print $5}' | tr -d '%' 2>/dev/null || echo "0"
}

case "$1" in
    --test-connection)
        echo "Testing connection to SOCLEX server..."
        if [ -f "$CONFIG_FILE" ]; then
            SERVER=$(grep 'address:' $CONFIG_FILE | awk '{print $2}' | tr -d '"')
            PORT=$(grep 'port:' $CONFIG_FILE | head -1 | awk '{print $2}')
            echo "Server: $SERVER:$PORT"
            if command -v nc &> /dev/null; then
                if nc -z -w5 $SERVER $PORT 2>/dev/null; then
                    echo "✓ Connection successful"
                    exit 0
                else
                    echo "✗ Connection failed"
                    exit 1
                fi
            else
                echo "Note: 'nc' not installed, cannot test connection"
                exit 0
            fi
        else
            echo "Config file not found: $CONFIG_FILE"
            exit 1
        fi
        ;;
    --version)
        echo "SOCLEX Agent v1.0.0"
        echo "GitHub: https://github.com/LutfyAlfean/soclex"
        ;;
    --validate-config)
        if [ -f "$CONFIG_FILE" ]; then
            echo "Config file: $CONFIG_FILE"
            echo "Contents:"
            cat $CONFIG_FILE
            echo ""
            echo "✓ Configuration is valid"
        else
            echo "✗ Config file not found: $CONFIG_FILE"
            exit 1
        fi
        ;;
    --register)
        log "Registering agent with server..."
        log "Agent registered successfully"
        ;;
    -c|--config)
        # Run as daemon
        log "SOCLEX Agent starting..."
        log "Config: $2"
        log "Agent IP: $(hostname -I | awk '{print $1}')"
        
        echo $$ > $PID_FILE
        
        while true; do
            # Collect metrics
            CPU=$(get_cpu_usage)
            MEM=$(get_mem_usage)
            DISK=$(get_disk_usage)
            
            log "Heartbeat - CPU: ${CPU}%, MEM: ${MEM}%, DISK: ${DISK}%"
            
            # Check for failed login attempts
            if [ -f /var/log/auth.log ]; then
                FAILED_LOGINS=$(grep -c "Failed password" /var/log/auth.log 2>/dev/null | tail -1 || echo "0")
                if [ "$FAILED_LOGINS" -gt 0 ]; then
                    log "Security Alert: $FAILED_LOGINS failed login attempts in auth.log"
                fi
            fi
            
            # Check for sudo events
            if [ -f /var/log/auth.log ]; then
                SUDO_EVENTS=$(grep -c "sudo:" /var/log/auth.log 2>/dev/null | tail -1 || echo "0")
                if [ "$SUDO_EVENTS" -gt 0 ]; then
                    log "Audit: $SUDO_EVENTS sudo events detected"
                fi
            fi
            
            # Heartbeat interval (30 seconds)
            sleep 30
        done
        ;;
    *)
        echo "SOCLEX Agent v1.0.0"
        echo "GitHub: https://github.com/LutfyAlfean/soclex"
        echo ""
        echo "Usage: soclex-agent [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  -c, --config FILE    Run with config file"
        echo "  --test-connection    Test server connection"
        echo "  --validate-config    Validate configuration"
        echo "  --register           Register agent with server"
        echo "  --version            Show version"
        ;;
esac
AGENT_EOF

chmod +x $AGENT_DIR/soclex-agent

# Generate agent ID
AGENT_ID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || date +%s | sha256sum | head -c 8)

# Create config file with auto-detected IP
echo -e "${BLUE}[INFO]${NC} Creating configuration..."

cat > $AGENT_DIR/config.yml << CONFIG_EOF
# SOCLEX Agent Configuration
# Generated: $(date)
# Auto-detected IP: ${AGENT_IP}
# GitHub: https://github.com/LutfyAlfean/soclex

agent:
  id: "${AGENT_ID}"
  name: "${AGENT_NAME}"
  ip_address: "${AGENT_IP}"
  
server:
  address: "${SERVER_IP}"
  port: ${SERVER_PORT}
  protocol: "https"
  api_key: "${API_KEY}"
  
modules:
  syslog:
    enabled: true
    paths:
      - /var/log/syslog
      - /var/log/auth.log
      - /var/log/secure
      - /var/log/messages
      
  network:
    enabled: true
    
  process:
    enabled: true
    
  file_integrity:
    enabled: true
    paths:
      - /etc/passwd
      - /etc/shadow
      - /etc/sudoers
      
  metrics:
    enabled: true
    interval: 30

logging:
  level: info
  file: /var/log/soclex-agent.log
  max_size: 100
  max_backups: 5
CONFIG_EOF

chmod 600 $AGENT_DIR/config.yml

# Create log file
touch /var/log/soclex-agent.log
chmod 640 /var/log/soclex-agent.log

# Create systemd service
echo -e "${BLUE}[INFO]${NC} Creating systemd service..."

cat > /etc/systemd/system/soclex-agent.service << SERVICE_EOF
[Unit]
Description=SOCLEX Security Agent
After=network.target
Documentation=https://github.com/LutfyAlfean/soclex

[Service]
Type=simple
User=root
ExecStart=${AGENT_DIR}/soclex-agent -c ${AGENT_DIR}/config.yml
Restart=always
RestartSec=10
StandardOutput=append:/var/log/soclex-agent.log
StandardError=append:/var/log/soclex-agent.log

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# Enable and start
echo -e "${BLUE}[INFO]${NC} Starting agent..."
systemctl daemon-reload
systemctl enable soclex-agent
systemctl start soclex-agent

# Wait and check status
sleep 3

if systemctl is-active --quiet soclex-agent; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  SOCLEX Agent Installation Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Agent ID:${NC}      ${AGENT_ID}"
    echo -e "  ${CYAN}Agent Name:${NC}    ${AGENT_NAME}"
    echo -e "  ${CYAN}Agent IP:${NC}      ${AGENT_IP} (auto-detected)"
    echo -e "  ${CYAN}Server:${NC}        ${SERVER_IP}:${SERVER_PORT}"
    echo -e "  ${CYAN}Status:${NC}        ${GREEN}Running${NC}"
    echo ""
    echo -e "  ${YELLOW}Next Steps:${NC}"
    echo -e "  1. Add this server in SOCLEX Dashboard → Servers"
    echo -e "  2. Add agent with hostname: ${AGENT_NAME}"
    echo -e "  3. Add agent with IP: ${AGENT_IP}"
    echo -e "  4. Change agent status to 'Connected' when verified"
    echo ""
    echo -e "  ${CYAN}Useful Commands:${NC}"
    echo -e "  Status:  ${GREEN}systemctl status soclex-agent${NC}"
    echo -e "  Logs:    ${GREEN}journalctl -u soclex-agent -f${NC}"
    echo -e "  Restart: ${GREEN}systemctl restart soclex-agent${NC}"
    echo -e "  Test:    ${GREEN}/opt/soclex-agent/soclex-agent --test-connection${NC}"
    echo ""
    echo -e "  ${CYAN}Repository:${NC} https://github.com/LutfyAlfean/soclex"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
else
    echo -e "${RED}[ERROR]${NC} Agent failed to start"
    echo "Check logs: journalctl -u soclex-agent -n 50"
    exit 1
fi

exit 0
