# SOCLEX - Security Operations Center

<div align="center">

```
███████╗ ██████╗  ██████╗██╗     ███████╗██╗  ██╗
██╔════╝██╔═══██╗██╔════╝██║     ██╔════╝╚██╗██╔╝
███████╗██║   ██║██║     ██║     █████╗   ╚███╔╝ 
╚════██║██║   ██║██║     ██║     ██╔══╝   ██╔██╗ 
███████║╚██████╔╝╚██████╗███████╗███████╗██╔╝ ██╗
╚══════╝ ╚═════╝  ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝
```

**Real-time Security Monitoring Platform**

[![Version](https://img.shields.io/badge/version-1.0.0-red.svg)](https://github.com/soclex/soclex)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](docker-compose.yml)

</div>

---

## 📋 Overview

SOCLEX is a comprehensive Security Operations Center (SOC) platform designed for real-time threat monitoring, incident management, and infrastructure security. Built with modern technologies for enterprise-grade security operations.

### Key Features

- 🛡️ **Threat Detection** - Real-time threat monitoring with severity classification
- 📊 **Server Monitoring** - Track CPU, memory, disk usage with historical metrics
- 🎫 **Ticket System** - Incident management from detection to resolution
- 🤖 **Agent Management** - Deploy and manage security agents across infrastructure
- 📱 **Telegram Alerts** - Instant notifications via Telegram bot
- 📄 **PDF Reports** - Generate comprehensive security reports
- 🔐 **Secure Authentication** - Protected access with session management

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/soclex/soclex.git
cd soclex

# Start with Docker Compose (Port 7129)
docker-compose up -d

# Access: http://localhost:7129
```

### Option 2: Manual Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Option 3: Server Installation

```bash
# Download and run installer
curl -sL https://raw.githubusercontent.com/soclex/soclex/main/scripts/soclex.sh -o soclex
chmod +x soclex
sudo ./soclex --install
```

---

## 🔑 Default Credentials

```
Username: adminlex
Password: AdminLex31Terminat@
```

⚠️ **IMPORTANT:** Change the default password immediately after first login!

---

## 🤖 Agent Installation

### Quick Install

Run this command on any server/VM you want to monitor:

```bash
curl -sSL https://your-soclex-server.com/install-agent.sh | sudo bash -s -- \
  --server=YOUR_SOCLEX_IP \
  --port=9200 \
  --key=YOUR_API_KEY
```

**The script automatically:**
- Detects the server's IP address
- Installs required dependencies
- Configures the agent service
- Registers with SOCLEX server
- Starts monitoring immediately

### Getting Agent to "Connected" Status

1. **Install Agent** on target server using the command above
2. **Add Server** in SOCLEX Dashboard → Servers → Add Server
3. **Add Agent** in SOCLEX Dashboard → Agents → Add Agent
   - Enter the hostname and IP from the target server
   - Set status to "Pending"
4. **Verify Connection** - Agent will automatically send heartbeat
5. **Update Status** - Change agent status to "Connected" once verified

For detailed installation guide, see [docs/agent.md](docs/agent.md)

---

## 📁 Project Structure

```
soclex/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   └── utils/          # Utility functions
├── scripts/
│   ├── soclex.sh       # Server installation script
│   └── install-agent.sh # Agent installation script
├── docker/
│   └── nginx.conf      # Nginx configuration
├── docs/
│   ├── agent.md        # Agent documentation
│   └── supabase.md     # Database documentation
├── Dockerfile          # Docker build configuration
├── docker-compose.yml  # Docker Compose configuration
└── deploy.md           # Deployment guide
```

---

## 🔧 Configuration

### ⚠️ PENTING: Setup Database Sendiri

Setiap instalasi SOCLEX membutuhkan database Supabase sendiri. File `.env` **TIDAK** disertakan di repository untuk keamanan.

### Langkah Setup:

1. **Buat Project Supabase**
   - Daftar di [supabase.com](https://supabase.com)
   - Buat project baru
   - Ikuti panduan lengkap di [docs/supabase.md](docs/supabase.md)

2. **Konfigurasi Environment**
   ```bash
   # Copy template
   cp .env.example .env
   
   # Edit dengan API keys Anda
   nano .env
   ```

3. **Isi dengan nilai Anda:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_SUPABASE_PROJECT_ID=your-project-id
   ```

> ⚠️ **JANGAN** commit file `.env` ke GitHub!

### Docker Configuration

Default port: **7129**

To change port, edit `docker-compose.yml`:

```yaml
ports:
  - "YOUR_PORT:7129"
```

---

## 📊 Dashboard Features

| Feature | Description |
|---------|-------------|
| **Threats** | View and manage detected security threats |
| **Servers** | Monitor server health and metrics |
| **Agents** | Manage deployed security agents |
| **Tickets** | Track incident resolution workflow |
| **Settings** | Configure notifications and preferences |

---

## 🔒 Security Features

- ✅ TLS encryption for all communications
- ✅ Session-based authentication
- ✅ Password complexity requirements
- ✅ Rate limiting on login attempts
- ✅ Fail2ban integration
- ✅ Security headers (CSP, XSS, etc.)
- ✅ Non-root Docker user

---

## 📚 Documentation

- [Deployment Guide](deploy.md)
- [Agent Installation](docs/agent.md)
- [Database Setup](docs/supabase.md)

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI
- **Charts:** Recharts
- **Backend:** Lovable Cloud (Supabase)
- **PDF Generation:** jsPDF
- **Container:** Docker, Nginx

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**SOCLEX** - Secure Your Infrastructure

[Documentation](docs/) • [Report Bug](https://github.com/soclex/soclex/issues) • [Request Feature](https://github.com/soclex/soclex/issues)

</div>
