# SOCLEX Agent - Installation Guide

Panduan lengkap untuk menginstall dan mengkonfigurasi SOCLEX Agent di server/VM Anda.

---

## 📋 Tentang SOCLEX Agent

SOCLEX Agent adalah komponen lightweight yang di-deploy di setiap server atau VM yang ingin dipantau. Agent ini bertugas untuk:

- Mengumpulkan log sistem dan aplikasi
- Memantau aktivitas jaringan
- Mendeteksi intrusi dan anomali
- Melaporkan metrics sistem (CPU, Memory, Disk)
- Mengirim alert ke SOCLEX Server

---

## 🖥️ Supported Platforms

| Platform | Version | Status |
|----------|---------|--------|
| Ubuntu | 18.04+ | ✅ Supported |
| Debian | 10+ | ✅ Supported |
| CentOS | 7+ | ✅ Supported |
| RHEL | 7+ | ✅ Supported |
| Rocky Linux | 8+ | ✅ Supported |
| AlmaLinux | 8+ | ✅ Supported |
| Proxmox VE | 7+ | ✅ Supported |
| Windows Server | 2016+ | ⚠️ Beta |
| Windows | 10/11 | ⚠️ Beta |
| macOS | 10.15+ | ⚠️ Beta |

---

## 🚀 Quick Install

### One-liner Installation

```bash
curl -sL https://soclex.io/install-agent | sudo bash -s -- \
  --server=YOUR_SOCLEX_SERVER_IP \
  --port=9200 \
  --key=YOUR_API_KEY
```

### Atau dengan wget

```bash
wget -qO- https://soclex.io/install-agent | sudo bash -s -- \
  --server=192.168.1.100 \
  --port=9200 \
  --key=abc123xyz
```

---

## 📝 Manual Installation

### Step 1: Download Agent

```bash
# Buat direktori
sudo mkdir -p /opt/soclex-agent
cd /opt/soclex-agent

# Download agent binary
sudo curl -LO https://github.com/yourusername/soclex-agent/releases/latest/download/soclex-agent-linux-amd64.tar.gz

# Extract
sudo tar -xzf soclex-agent-linux-amd64.tar.gz
sudo rm soclex-agent-linux-amd64.tar.gz
```

### Step 2: Konfigurasi Agent

```bash
# Buat file konfigurasi
sudo nano /opt/soclex-agent/config.yml
```

Isi dengan:

```yaml
# SOCLEX Agent Configuration
agent:
  id: auto  # akan di-generate otomatis
  name: "${HOSTNAME}"
  
server:
  address: "YOUR_SOCLEX_SERVER_IP"
  port: 9200
  protocol: "https"
  api_key: "YOUR_API_KEY"
  
# Modules to enable
modules:
  syslog:
    enabled: true
    paths:
      - /var/log/syslog
      - /var/log/auth.log
      - /var/log/secure
      
  auditd:
    enabled: true
    
  network:
    enabled: true
    interfaces:
      - eth0
      - ens33
      
  process:
    enabled: true
    monitor_commands: true
    
  file_integrity:
    enabled: true
    paths:
      - /etc/passwd
      - /etc/shadow
      - /etc/sudoers
      - /etc/ssh/sshd_config
      
  metrics:
    enabled: true
    interval: 60  # seconds
    
# Log settings
logging:
  level: info
  file: /var/log/soclex-agent.log
  max_size: 100  # MB
  max_backups: 5
```

### Step 3: Install sebagai Service

```bash
# Buat systemd service
sudo tee /etc/systemd/system/soclex-agent.service << EOF
[Unit]
Description=SOCLEX Security Agent
After=network.target

[Service]
Type=simple
User=root
ExecStart=/opt/soclex-agent/soclex-agent -c /opt/soclex-agent/config.yml
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable dan start
sudo systemctl daemon-reload
sudo systemctl enable soclex-agent
sudo systemctl start soclex-agent
```

### Step 4: Verifikasi

```bash
# Cek status
sudo systemctl status soclex-agent

# Lihat logs
sudo journalctl -u soclex-agent -f

# Test koneksi ke server
sudo /opt/soclex-agent/soclex-agent --test-connection
```

---

## 🔧 Agent Commands

```bash
# Start agent
sudo systemctl start soclex-agent

# Stop agent
sudo systemctl stop soclex-agent

# Restart agent
sudo systemctl restart soclex-agent

# Check status
sudo systemctl status soclex-agent

# View logs
sudo journalctl -u soclex-agent -f

# Test connection
sudo /opt/soclex-agent/soclex-agent --test-connection

# Show version
/opt/soclex-agent/soclex-agent --version

# Validate config
sudo /opt/soclex-agent/soclex-agent --validate-config

# Force registration
sudo /opt/soclex-agent/soclex-agent --register
```

---

## 📊 Monitored Data

### System Logs
- `/var/log/syslog` - System messages
- `/var/log/auth.log` - Authentication logs
- `/var/log/secure` - Security logs (RHEL/CentOS)
- `/var/log/messages` - General messages

### Application Logs
- Apache/Nginx access & error logs
- MySQL/PostgreSQL logs
- Docker container logs
- Custom application logs

### Network Activity
- Connection tracking
- Port scanning detection
- Unusual traffic patterns
- DNS queries

### File Integrity
- Critical system files
- Configuration files
- SSH keys and certificates
- Custom monitored paths

### System Metrics
- CPU usage
- Memory usage
- Disk usage
- Network I/O
- Process list

---

## 🛡️ Security Considerations

### Agent Permissions

Agent berjalan sebagai root untuk dapat:
- Membaca semua log files
- Monitor network interfaces
- Access audit logs
- File integrity monitoring

### Secure Communication

- Semua komunikasi dienkripsi dengan TLS 1.3
- API key authentication
- Certificate pinning (optional)

### Minimal Footprint

- Memory: ~50-100MB
- CPU: <2% average
- Disk: ~100MB installed
- Network: ~1-5 Mbps burst

---

## 🔄 Auto-Update

Agent mendukung auto-update:

```yaml
# Di config.yml
auto_update:
  enabled: true
  check_interval: 24h  # check setiap 24 jam
  auto_restart: true
```

Atau manual update:

```bash
# Download versi terbaru
curl -LO https://github.com/yourusername/soclex-agent/releases/latest/download/soclex-agent-linux-amd64.tar.gz

# Extract dan replace
sudo systemctl stop soclex-agent
sudo tar -xzf soclex-agent-linux-amd64.tar.gz -C /opt/soclex-agent/
sudo systemctl start soclex-agent
```

---

## 🐛 Troubleshooting

### Agent tidak connect ke server

```bash
# Test konektivitas
ping YOUR_SOCLEX_SERVER_IP
telnet YOUR_SOCLEX_SERVER_IP 9200

# Cek firewall
sudo ufw status
sudo iptables -L -n

# Cek API key
cat /opt/soclex-agent/config.yml | grep api_key
```

### Agent tidak start

```bash
# Cek logs
sudo journalctl -u soclex-agent --no-pager -n 50

# Validate config
sudo /opt/soclex-agent/soclex-agent --validate-config

# Cek permissions
ls -la /opt/soclex-agent/
ls -la /var/log/soclex-agent.log
```

### High CPU/Memory usage

```bash
# Disable modules yang tidak diperlukan
# Edit config.yml dan set enabled: false

# Increase metric interval
# metrics.interval: 300  # 5 minutes instead of 1
```

---

## 🗑️ Uninstall Agent

```bash
# Stop service
sudo systemctl stop soclex-agent
sudo systemctl disable soclex-agent

# Remove files
sudo rm -rf /opt/soclex-agent
sudo rm -f /etc/systemd/system/soclex-agent.service
sudo rm -f /var/log/soclex-agent.log

# Reload systemd
sudo systemctl daemon-reload

# Remove dari SOCLEX server
# Buka dashboard > Agents > Pilih agent > Delete
```

---

## 📞 Support

Jika mengalami masalah dengan SOCLEX Agent:

1. Cek [FAQ](https://docs.soclex.io/agent/faq)
2. Buka issue di [GitHub](https://github.com/yourusername/soclex-agent/issues)
3. Join [Discord](https://discord.gg/soclex)
4. Email: agent-support@soclex.io

---

<p align="center">
  <strong>SOCLEX Agent</strong> - Your Eyes Everywhere
</p>
