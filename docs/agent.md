# SOCLEX Agent - Complete Installation Guide

<div align="center">

```
███████╗ ██████╗  ██████╗██╗     ███████╗██╗  ██╗
██╔════╝██╔═══██╗██╔════╝██║     ██╔════╝╚██╗██╔╝
███████╗██║   ██║██║     ██║     █████╗   ╚███╔╝ 
╚════██║██║   ██║██║     ██║     ██╔══╝   ██╔██╗ 
███████║╚██████╔╝╚██████╗███████╗███████╗██╔╝ ██╗
╚══════╝ ╚═════╝  ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝
                    AGENT
```

**Deploy Security Monitoring on Any Server**

</div>

---

## 📋 Overview

SOCLEX Agent is a lightweight security monitoring component that collects metrics, logs, and security events from your servers and sends them to the SOCLEX dashboard.

---

## 🖥️ Supported Platforms

| Platform | Version | Status |
|----------|---------|--------|
| Ubuntu | 18.04+ | ✅ Fully Supported |
| Debian | 10+ | ✅ Fully Supported |
| CentOS | 7+ | ✅ Fully Supported |
| RHEL | 7+ | ✅ Fully Supported |
| Rocky Linux | 8+ | ✅ Fully Supported |
| AlmaLinux | 8+ | ✅ Fully Supported |
| Proxmox VE | 7+ | ✅ Fully Supported |

---

## 🚀 Quick Install (Recommended)

### Step 1: Run Installation Script

The installation script **automatically detects** your server's IP address and configures everything for you.

```bash
curl -sSL https://your-soclex-server.com/install-agent.sh | sudo bash -s -- \
  --server=SOCLEX_SERVER_IP \
  --port=9200 \
  --key=YOUR_API_KEY
```

**Parameters:**
- `--server` - IP address or hostname of your SOCLEX server (required)
- `--port` - Agent communication port (default: 9200)
- `--key` - API key for authentication (required)
- `--name` - Custom agent name (default: hostname)

### Step 2: Verify Installation

```bash
# Check service status
sudo systemctl status soclex-agent

# View logs
sudo journalctl -u soclex-agent -f

# Test connection
sudo /opt/soclex-agent/soclex-agent --test-connection
```

### Step 3: Register in Dashboard

1. Open SOCLEX Dashboard
2. Navigate to **Servers** → **Add Server**
   - Enter server name and IP address
   - Select server type (VM, Container, Physical, Proxmox)
   - Click **Add Server**

3. Navigate to **Agents** → **Add Agent**
   - Enter hostname (must match the server)
   - Enter IP address (auto-detected during install)
   - Set status to **Pending**
   - Click **Save**

4. Wait for heartbeat (30 seconds)
5. Change agent status to **Connected**

---

## ✅ Agent Status Flow

```
┌─────────────┐    Install    ┌─────────────┐    Heartbeat    ┌─────────────┐
│   Pending   │ ────────────► │   Pending   │ ──────────────► │  Connected  │
│  (Initial)  │               │ (Installed) │                 │   (Active)  │
└─────────────┘               └─────────────┘                 └─────────────┘
                                    │                               │
                                    │ Connection Lost               │ Restored
                                    ▼                               ▼
                              ┌─────────────┐                 ┌─────────────┐
                              │Disconnected │ ◄─────────────► │  Connected  │
                              │  (Offline)  │                 │   (Active)  │
                              └─────────────┘                 └─────────────┘
```

**Status Definitions:**
- **Pending** - Agent installed but not yet verified
- **Connected** - Agent actively sending heartbeats and metrics
- **Disconnected** - Agent stopped or network issue

---

## 📝 Manual Installation

### Step 1: Create Directory

```bash
sudo mkdir -p /opt/soclex-agent
cd /opt/soclex-agent
```

### Step 2: Create Agent Script

```bash
sudo nano /opt/soclex-agent/soclex-agent
```

Paste the agent script content (see [scripts/install-agent.sh](../scripts/install-agent.sh)).

```bash
sudo chmod +x /opt/soclex-agent/soclex-agent
```

### Step 3: Create Configuration

```bash
sudo nano /opt/soclex-agent/config.yml
```

```yaml
# SOCLEX Agent Configuration
agent:
  id: "auto"
  name: "your-server-name"

server:
  address: "YOUR_SOCLEX_SERVER_IP"
  port: 9200
  protocol: "https"
  api_key: "YOUR_API_KEY"

modules:
  syslog:
    enabled: true
    paths:
      - /var/log/syslog
      - /var/log/auth.log
      - /var/log/secure

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
```

### Step 4: Create Systemd Service

```bash
sudo nano /etc/systemd/system/soclex-agent.service
```

```ini
[Unit]
Description=SOCLEX Security Agent
After=network.target
Documentation=https://docs.soclex.io/agent

[Service]
Type=simple
User=root
ExecStart=/opt/soclex-agent/soclex-agent -c /opt/soclex-agent/config.yml
Restart=always
RestartSec=10
StandardOutput=append:/var/log/soclex-agent.log
StandardError=append:/var/log/soclex-agent.log

[Install]
WantedBy=multi-user.target
```

### Step 5: Enable and Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable soclex-agent
sudo systemctl start soclex-agent
```

---

## 🔧 Agent Commands

```bash
# Service management
sudo systemctl start soclex-agent
sudo systemctl stop soclex-agent
sudo systemctl restart soclex-agent
sudo systemctl status soclex-agent

# View logs
sudo journalctl -u soclex-agent -f
sudo tail -f /var/log/soclex-agent.log

# Test and diagnostics
sudo /opt/soclex-agent/soclex-agent --test-connection
sudo /opt/soclex-agent/soclex-agent --validate-config
sudo /opt/soclex-agent/soclex-agent --version
sudo /opt/soclex-agent/soclex-agent --register
```

---

## 📊 What Agent Monitors

### System Metrics
- CPU usage (percentage)
- Memory usage (percentage)
- Disk usage (percentage)
- Network I/O (bytes/sec)

### Security Events
- Failed login attempts
- SSH authentication
- Sudo usage
- File integrity changes

### Log Sources
- `/var/log/syslog` - System logs
- `/var/log/auth.log` - Authentication logs
- `/var/log/secure` - Security logs (RHEL/CentOS)
- `/var/log/messages` - General messages

---

## 🛡️ Security Considerations

### Agent Permissions

The agent runs as `root` to access:
- System log files
- Network interfaces
- Process information
- File integrity monitoring

### Communication Security

- All communication is encrypted with TLS 1.3
- API key authentication required
- Certificate validation enabled

### Resource Usage

| Resource | Usage |
|----------|-------|
| Memory | ~50-100 MB |
| CPU | <2% average |
| Disk | ~100 MB |
| Network | ~1-5 Mbps burst |

---

## 🐛 Troubleshooting

### Agent Won't Start

```bash
# Check logs
sudo journalctl -u soclex-agent --no-pager -n 50

# Validate configuration
sudo /opt/soclex-agent/soclex-agent --validate-config

# Check file permissions
ls -la /opt/soclex-agent/
ls -la /var/log/soclex-agent.log
```

### Agent Not Connecting

```bash
# Test network connectivity
ping YOUR_SOCLEX_SERVER_IP
telnet YOUR_SOCLEX_SERVER_IP 9200

# Check firewall
sudo ufw status
sudo iptables -L -n

# Verify API key
cat /opt/soclex-agent/config.yml | grep api_key
```

### High Resource Usage

Edit `/opt/soclex-agent/config.yml`:

```yaml
modules:
  metrics:
    interval: 300  # Increase from 60 to 300 seconds
  
  network:
    enabled: false  # Disable if not needed
```

Restart agent:

```bash
sudo systemctl restart soclex-agent
```

---

## 🗑️ Uninstall Agent

```bash
# Stop and disable service
sudo systemctl stop soclex-agent
sudo systemctl disable soclex-agent

# Remove files
sudo rm -rf /opt/soclex-agent
sudo rm -f /etc/systemd/system/soclex-agent.service
sudo rm -f /var/log/soclex-agent.log

# Reload systemd
sudo systemctl daemon-reload

# Remove from SOCLEX Dashboard
# Go to Agents → Select Agent → Delete
```

---

## 📞 Support

If you encounter issues:

1. Check agent logs: `sudo journalctl -u soclex-agent -f`
2. Verify configuration: `sudo /opt/soclex-agent/soclex-agent --validate-config`
3. Test connection: `sudo /opt/soclex-agent/soclex-agent --test-connection`

---

<div align="center">

**SOCLEX Agent** - Your Eyes Everywhere

</div>
