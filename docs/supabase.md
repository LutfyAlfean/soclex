# SOCLEX - Setup dengan Lovable Cloud (Supabase)

[![GitHub](https://img.shields.io/badge/GitHub-LutfyAlfean-blue)](https://github.com/LutfyAlfean/soclex)

Panduan ini menjelaskan cara setup SOCLEX menggunakan Lovable Cloud yang sudah terintegrasi dengan Supabase.

## Langkah-langkah Setup

### 1. Aktifkan Lovable Cloud

Lovable Cloud sudah otomatis aktif pada project ini. Database, authentication, dan storage sudah tersedia tanpa perlu konfigurasi tambahan.

### 2. Struktur Database

Database SOCLEX terdiri dari tabel-tabel berikut:

#### Tabel `servers`
Menyimpan informasi server yang dimonitor.

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
| os | TEXT | Sistem operasi |
| last_seen_at | TIMESTAMP | Terakhir aktif |
| created_at | TIMESTAMP | Dibuat pada |
| updated_at | TIMESTAMP | Diupdate pada |

#### Tabel `threats`
Menyimpan informasi ancaman yang terdeteksi.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ip_address | TEXT | IP penyerang |
| threat_type | TEXT | Jenis ancaman |
| severity | ENUM | critical, high, medium, low, info |
| country | TEXT | Negara asal |
| city | TEXT | Kota asal |
| latitude | DECIMAL | Koordinat lintang |
| longitude | DECIMAL | Koordinat bujur |
| description | TEXT | Deskripsi ancaman |
| is_resolved | BOOLEAN | Status resolved |
| detected_at | TIMESTAMP | Waktu deteksi |
| resolved_at | TIMESTAMP | Waktu resolved |

#### Tabel `agents`
Menyimpan informasi agent yang terpasang.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| hostname | TEXT | Nama host |
| ip_address | TEXT | Alamat IP |
| os | TEXT | Sistem operasi |
| version | TEXT | Versi agent |
| status | ENUM | connected, disconnected, pending |
| last_heartbeat | TIMESTAMP | Heartbeat terakhir |
| server_id | UUID | Referensi ke server |

#### Tabel `server_logs`
Menyimpan log dari setiap server.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| server_id | UUID | Referensi ke server |
| log_type | TEXT | Jenis log |
| message | TEXT | Pesan log |
| severity | ENUM | Tingkat severity |
| metadata | JSONB | Data tambahan |
| created_at | TIMESTAMP | Waktu log |

#### Tabel `server_metrics`
Menyimpan metrik performa server.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| server_id | UUID | Referensi ke server |
| cpu_usage | DECIMAL | Penggunaan CPU |
| memory_usage | DECIMAL | Penggunaan Memory |
| disk_usage | DECIMAL | Penggunaan Disk |
| network_in | BIGINT | Traffic masuk (bytes) |
| network_out | BIGINT | Traffic keluar (bytes) |
| recorded_at | TIMESTAMP | Waktu pencatatan |

#### Tabel `alerts`
Menyimpan notifikasi alert.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Judul alert |
| message | TEXT | Pesan alert |
| severity | ENUM | Tingkat severity |
| source | TEXT | Sumber alert |
| is_read | BOOLEAN | Status sudah dibaca |
| server_id | UUID | Referensi ke server |
| threat_id | UUID | Referensi ke threat |
| created_at | TIMESTAMP | Waktu alert |

#### Tabel `notification_settings`
Menyimpan pengaturan notifikasi.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| telegram_bot_token | TEXT | Token bot Telegram |
| telegram_chat_id | TEXT | Chat ID Telegram |
| telegram_enabled | BOOLEAN | Status Telegram aktif |
| email_enabled | BOOLEAN | Status email aktif |
| email_address | TEXT | Alamat email |

### 3. Mengakses Database

#### Dari Frontend (React)

```typescript
import { supabase } from '@/integrations/supabase/client';

// Mengambil data servers
const { data: servers, error } = await supabase
  .from('servers')
  .select('*')
  .order('name');

// Menambah threat baru
const { error } = await supabase
  .from('threats')
  .insert({
    ip_address: '192.168.1.100',
    threat_type: 'Brute Force',
    severity: 'high',
    description: 'SSH brute force attack detected',
  });

// Update status server
const { error } = await supabase
  .from('servers')
  .update({ status: 'critical', cpu_usage: 95 })
  .eq('id', serverId);
```

#### Dari Agent (cURL)

```bash
# Mengirim heartbeat dari agent
curl -X POST "https://ksttsjpwdpkantgoznkj.supabase.co/rest/v1/agents" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "hostname": "web-server-01",
    "ip_address": "192.168.1.20",
    "os": "Ubuntu 22.04",
    "version": "1.0.0",
    "status": "connected"
  }'

# Mengirim metrik server
curl -X POST "https://ksttsjpwdpkantgoznkj.supabase.co/rest/v1/server_metrics" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "UUID_SERVER",
    "cpu_usage": 45.5,
    "memory_usage": 62.3,
    "disk_usage": 38.0,
    "network_in": 1048576,
    "network_out": 524288
  }'
```

### 4. Realtime Subscriptions

SOCLEX menggunakan Supabase Realtime untuk update real-time:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Subscribe ke alerts baru
const channel = supabase
  .channel('alerts-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'alerts',
    },
    (payload) => {
      console.log('New alert:', payload.new);
      // Handle new alert
    }
  )
  .subscribe();

// Subscribe ke threats baru
const threatChannel = supabase
  .channel('threats-realtime')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'threats',
    },
    (payload) => {
      console.log('Threat change:', payload);
    }
  )
  .subscribe();
```

### 5. Edge Functions

SOCLEX menggunakan Edge Functions untuk:

- **send-telegram**: Mengirim notifikasi ke Telegram
- **test-telegram**: Testing koneksi Telegram

```typescript
// Memanggil edge function dari frontend
const { data, error } = await supabase.functions.invoke('send-telegram', {
  body: {
    title: 'Security Alert',
    message: 'Brute force attack detected from 192.168.1.100',
    severity: 'critical',
  },
});
```

### 6. Environment Variables

Project ini sudah dikonfigurasi dengan environment variables:

- `VITE_SUPABASE_URL` - URL Supabase project
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon key untuk akses publik

### 7. Security (Row Level Security)

Semua tabel sudah dilindungi dengan RLS policies. Untuk production, pastikan untuk:

1. Review dan update RLS policies sesuai kebutuhan
2. Gunakan authentication untuk akses sensitif
3. Jangan expose service role key

## Troubleshooting

### Error "relation does not exist"
Pastikan migration sudah dijalankan. Buka Cloud tab dan jalankan migration.

### Error "permission denied"
Check RLS policies pada tabel yang bersangkutan.

### Realtime tidak bekerja
Pastikan tabel sudah di-enable untuk realtime dengan:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.table_name;
```

## Next Steps

1. Setup Telegram notifications di Settings
2. Deploy SOCLEX agent ke server yang akan dimonitor
3. Configure alert rules sesuai kebutuhan
4. Setup backup database secara berkala
