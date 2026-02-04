#!/bin/bash

#===============================================================================
#
#          FILE:  install-agent.sh
#
#         USAGE:  curl -sL https://soclex.io/install-agent | sudo bash -s -- \
#                   --server=IP --port=PORT --key=API_KEY
#
#   DESCRIPTION:  SOCLEX Agent - Quick Installation Script
#
#       OPTIONS:  --server    SOCLEX Server IP/hostname (required)
#                 --port      Server port (default: 9200)
#                 --key       API Key for authentication (required)
#                 --name      Custom agent name (default: hostname)
#                 --help      Show help
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
            echo "Usage: $0 --server=IP --key=API_KEY [--port=PORT] [--name=NAME]"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
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

echo -e "${BLUE}[INFO]${NC} Installing SOCLEX Agent..."
echo -e "${BLUE}[INFO]${NC} Server: $SERVER_IP:$SERVER_PORT"
echo -e "${BLUE}[INFO]${NC} Agent Name: $AGENT_NAME"
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

echo -e "${BLUE}[INFO]${NC} Detected: ${OS}-${ARCH}"

# For demo, create a mock agent script
echo -e "${BLUE}[INFO]${NC} Creating agent binary..."

cat > $AGENT_DIR/soclex-agent << 'AGENT_EOF'
#!/bin/bash

# SOCLEX Agent - Mock Implementation
# In production, this would be a compiled binary

CONFIG_FILE="/opt/soclex-agent/config.yml"
LOG_FILE="/var/log/soclex-agent.log"
PID_FILE="/var/run/soclex-agent.pid"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

case "$1" in
    --test-connection)
        echo "Testing connection to SOCLEX server..."
        if [ -f "$CONFIG_FILE" ]; then
            SERVER=$(grep 'address:' $CONFIG_FILE | awk '{print $2}' | tr -d '"')
            PORT=$(grep 'port:' $CONFIG_FILE | head -1 | awk '{print $2}')
            echo "Server: $SERVER:$PORT"
            if nc -z -w5 $SERVER $PORT 2>/dev/null; then
                echo "✓ Connection successful"
                exit 0
            else
                echo "✗ Connection failed"
                exit 1
            fi
        else
            echo "Config file not found"
            exit 1
        fi
        ;;
    --version)
        echo "SOCLEX Agent v1.0.0"
        ;;
    --validate-config)
        if [ -f "$CONFIG_FILE" ]; then
            echo "Config file: $CONFIG_FILE"
            echo "✓ Configuration is valid"
        else
            echo "✗ Config file not found"
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
        
        echo $$ > $PID_FILE
        
        while true; do
            # Collect and send metrics
            CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 2>/dev/null || echo "0")
            MEM=$(free | grep Mem | awk '{print $3/$2 * 100.0}' 2>/dev/null || echo "0")
            
            log "Metrics - CPU: ${CPU}%, MEM: ${MEM}%"
            
            # Check for security events
            if [ -f /var/log/auth.log ]; then
                FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log 2>/dev/null | tail -5 | wc -l)
                if [ "$FAILED_LOGINS" -gt 0 ]; then
                    log "Security: $FAILED_LOGINS failed login attempts detected"
                fi
            fi
            
            sleep 60
        done
        ;;
    *)
        echo "SOCLEX Agent v1.0.0"
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
AGENT_ID=$(cat /proc/sys/kernel/random/uuid | cut -d'-' -f1)

# Create config file
echo -e "${BLUE}[INFO]${NC} Creating configuration..."

cat > $AGENT_DIR/config.yml << CONFIG_EOF
# SOCLEX Agent Configuration
# Generated: $(date)

agent:
  id: "${AGENT_ID}"
  name: "${AGENT_NAME}"
  
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
    interval: 60

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
Documentation=https://docs.soclex.io/agent

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
sleep 2

if systemctl is-active --quiet soclex-agent; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  SOCLEX Agent Installation Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Agent ID:${NC}    ${AGENT_ID}"
    echo -e "  ${CYAN}Agent Name:${NC}  ${AGENT_NAME}"
    echo -e "  ${CYAN}Server:${NC}      ${SERVER_IP}:${SERVER_PORT}"
    echo -e "  ${CYAN}Status:${NC}      ${GREEN}Running${NC}"
    echo ""
    echo -e "  ${CYAN}Useful Commands:${NC}"
    echo -e "  Status:  ${GREEN}systemctl status soclex-agent${NC}"
    echo -e "  Logs:    ${GREEN}journalctl -u soclex-agent -f${NC}"
    echo -e "  Restart: ${GREEN}systemctl restart soclex-agent${NC}"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
else
    echo -e "${RED}[ERROR]${NC} Agent failed to start"
    echo "Check logs: journalctl -u soclex-agent -n 50"
    exit 1
fi

exit 0
