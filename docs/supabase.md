# SOCLEX - Setup Supabase (Step-by-Step Guide)

<div align="center">

```
███████╗ ██████╗  ██████╗██╗     ███████╗██╗  ██╗
██╔════╝██╔═══██╗██╔════╝██║     ██╔════╝╚██╗██╔╝
███████╗██║   ██║██║     ██║     █████╗   ╚███╔╝ 
╚════██║██║   ██║██║     ██║     ██╔══╝   ██╔██╗ 
███████║╚██████╔╝╚██████╗███████╗███████╗██╔╝ ██╗
╚══════╝ ╚═════╝  ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝
```

**Panduan Setup Supabase untuk SOCLEX**

[![GitHub](https://img.shields.io/badge/GitHub-LutfyAlfean-blue)](https://github.com/LutfyAlfean/soclex)

</div>

---

## 📋 Overview

Panduan ini menjelaskan cara setup SOCLEX dengan Supabase sebagai backend database.

> ⚠️ **PENTING**: Setiap instalasi SOCLEX membutuhkan database Supabase **SENDIRI**!
> 
> File `.env` **TIDAK** disertakan di repository untuk keamanan.
> Anda HARUS membuat project Supabase dan mengkonfigurasi `.env` sendiri.

---

## 🔧 Setup Supabase (WAJIB)

### Step 1: Buat Akun Supabase

1. Buka [supabase.com](https://supabase.com)
2. Klik **Start your project**
3. Login dengan GitHub atau Email
4. Verifikasi email jika diperlukan

### Step 2: Buat Project Baru

1. Klik **New Project**
2. Pilih Organization (atau buat baru)
3. Isi form:
   - **Project name**: `soclex`
   - **Database Password**: Buat password yang kuat (simpan!)
   - **Region**: Pilih yang terdekat (contoh: Singapore)
4. Klik **Create new project**
5. Tunggu 2-3 menit sampai project siap

### Step 3: Ambil API Keys

1. Setelah project siap, klik **Project Settings** (icon gear ⚙️)
2. Pilih **API** di sidebar
3. Catat informasi berikut:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Key untuk akses publik
   - **service_role key**: Key untuk akses admin (JANGAN share!)

### Step 4: Buat Tabel Database

1. Klik **SQL Editor** di sidebar
2. Klik **New Query**
3. Copy-paste SQL berikut:

```sql
-- ============================================
-- SOCLEX Database Schema
-- ============================================

-- Create custom types
CREATE TYPE server_status AS ENUM ('online', 'warning', 'critical', 'offline');
CREATE TYPE server_type AS ENUM ('proxmox', 'vm', 'container', 'physical');
CREATE TYPE agent_status AS ENUM ('connected', 'disconnected', 'pending');
CREATE TYPE threat_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');

-- ============================================
-- Table: servers
-- ============================================
CREATE TABLE servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  server_type server_type DEFAULT 'vm',
  status server_status DEFAULT 'online',
  cpu_usage NUMERIC DEFAULT 0,
  memory_usage NUMERIC DEFAULT 0,
  disk_usage NUMERIC DEFAULT 0,
  os TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: agents
-- ============================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostname TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  os TEXT,
  version TEXT,
  status agent_status DEFAULT 'pending',
  last_heartbeat TIMESTAMPTZ,
  server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: threats
-- ============================================
CREATE TABLE threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  threat_type TEXT NOT NULL,
  severity threat_severity DEFAULT 'medium',
  country TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: server_logs
-- ============================================
CREATE TABLE server_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity threat_severity DEFAULT 'info',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: server_metrics
-- ============================================
CREATE TABLE server_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  cpu_usage NUMERIC NOT NULL,
  memory_usage NUMERIC NOT NULL,
  disk_usage NUMERIC NOT NULL,
  network_in BIGINT DEFAULT 0,
  network_out BIGINT DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: alerts
-- ============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity threat_severity DEFAULT 'info',
  source TEXT,
  is_read BOOLEAN DEFAULT false,
  server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
  threat_id UUID REFERENCES threats(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: tickets
-- ============================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to TEXT,
  created_by TEXT DEFAULT 'admin',
  threat_id UUID REFERENCES threats(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: notification_settings
-- ============================================
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  telegram_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT false,
  email_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Functions
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers
-- ============================================
CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON servers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threats_updated_at
  BEFORE UPDATE ON threats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();
```

4. Klik **Run** untuk menjalankan query

### Step 5: Setup Row Level Security (RLS)

1. Di **SQL Editor**, jalankan query berikut:

```sql
-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (Public Access for SOC Dashboard)
-- ============================================

-- Servers
CREATE POLICY "Allow public read servers" ON servers FOR SELECT USING (true);
CREATE POLICY "Allow public insert servers" ON servers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update servers" ON servers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete servers" ON servers FOR DELETE USING (true);

-- Agents
CREATE POLICY "Allow public read agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Allow public insert agents" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update agents" ON agents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete agents" ON agents FOR DELETE USING (true);

-- Threats
CREATE POLICY "Allow public read threats" ON threats FOR SELECT USING (true);
CREATE POLICY "Allow public insert threats" ON threats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update threats" ON threats FOR UPDATE USING (true);

-- Server Logs
CREATE POLICY "Allow public read server_logs" ON server_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert server_logs" ON server_logs FOR INSERT WITH CHECK (true);

-- Server Metrics
CREATE POLICY "Allow public read server_metrics" ON server_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert server_metrics" ON server_metrics FOR INSERT WITH CHECK (true);

-- Alerts
CREATE POLICY "Allow public read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert alerts" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update alerts" ON alerts FOR UPDATE USING (true);

-- Tickets
CREATE POLICY "Allow public read tickets" ON tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert tickets" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tickets" ON tickets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tickets" ON tickets FOR DELETE USING (true);

-- Notification Settings
CREATE POLICY "Allow public read notification_settings" ON notification_settings FOR SELECT USING (true);
CREATE POLICY "Allow public write notification_settings" ON notification_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update notification_settings" ON notification_settings FOR UPDATE USING (true);
```

2. Klik **Run**

### Step 6: Enable Realtime (Opsional)

Untuk fitur real-time updates:

```sql
-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE threats;
ALTER PUBLICATION supabase_realtime ADD TABLE servers;
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
```

### Step 7: Insert Sample Data (Opsional)

```sql
-- Sample servers
INSERT INTO servers (name, ip_address, server_type, status, cpu_usage, memory_usage, disk_usage, os) VALUES
('proxmox-main', '192.168.1.10', 'proxmox', 'online', 45, 62, 38, 'Proxmox VE 8.0'),
('web-server-01', '192.168.1.20', 'vm', 'online', 23, 45, 55, 'Ubuntu 22.04'),
('db-server-01', '192.168.1.21', 'vm', 'warning', 78, 85, 72, 'Debian 12');

-- Sample notification settings
INSERT INTO notification_settings (telegram_enabled) VALUES (false);
```

### Step 8: Konfigurasi Environment

1. Buat file `.env` di root project (JANGAN commit ke GitHub!):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
```

2. Buat file `.env.example` untuk referensi:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

---

## 🔐 Keamanan

### Jangan Commit .env ke GitHub!

Pastikan `.env` ada di `.gitignore`:

```gitignore
# Environment files
.env
.env.local
.env.*.local
*.local
```

### Hanya Share .env.example

File `.env.example` berisi template tanpa nilai sensitif, aman untuk di-commit.

---

## 📊 Struktur Database

### Tabel `servers`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Nama server |
| ip_address | TEXT | Alamat IP |
| server_type | ENUM | proxmox, vm, container, physical |
| status | ENUM | online, warning, critical, offline |
| cpu_usage | DECIMAL | Penggunaan CPU (%) |
| memory_usage | DECIMAL | Penggunaan Memory (%) |
| disk_usage | DECIMAL | Penggunaan Disk (%) |

### Tabel `agents`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| hostname | TEXT | Nama host |
| ip_address | TEXT | Alamat IP |
| status | ENUM | connected, disconnected, pending |
| last_heartbeat | TIMESTAMP | Heartbeat terakhir |

### Tabel `threats`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ip_address | TEXT | IP penyerang |
| threat_type | TEXT | Jenis ancaman |
| severity | ENUM | critical, high, medium, low, info |
| country | TEXT | Negara asal |

### Tabel `alerts`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Judul alert |
| message | TEXT | Pesan alert |
| severity | ENUM | Tingkat severity |
| is_read | BOOLEAN | Status sudah dibaca |

---

## 💻 Menggunakan Supabase di Code

### Import Client

```typescript
import { supabase } from '@/integrations/supabase/client';
```

### Contoh Query

```typescript
// Get all servers
const { data: servers, error } = await supabase
  .from('servers')
  .select('*')
  .order('name');

// Add new threat
const { error } = await supabase
  .from('threats')
  .insert({
    ip_address: '192.168.1.100',
    threat_type: 'Brute Force',
    severity: 'high',
  });

// Update server status
const { error } = await supabase
  .from('servers')
  .update({ status: 'critical' })
  .eq('id', serverId);
```

### Realtime Subscription

```typescript
const channel = supabase
  .channel('alerts-realtime')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'alerts' },
    (payload) => {
      console.log('New alert:', payload.new);
    }
  )
  .subscribe();
```

---

## 🛠️ Troubleshooting

### Error "relation does not exist"
- Pastikan sudah menjalankan SQL schema di Step 4

### Error "permission denied"
- Pastikan RLS policies sudah dibuat di Step 5

### Realtime tidak bekerja
- Pastikan sudah enable realtime di Step 6

### Data tidak muncul
- Check console browser untuk error
- Pastikan API keys benar di `.env`

---

## 📞 Support

- Repository: [github.com/LutfyAlfean/soclex](https://github.com/LutfyAlfean/soclex)
- Issues: [GitHub Issues](https://github.com/LutfyAlfean/soclex/issues)

---

<div align="center">

**SOCLEX** - Powered by Supabase

[![GitHub](https://img.shields.io/badge/Author-LutfyAlfean-red)](https://github.com/LutfyAlfean)

</div>
