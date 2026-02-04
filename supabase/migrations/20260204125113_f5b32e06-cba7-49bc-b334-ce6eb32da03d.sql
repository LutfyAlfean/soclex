-- Create enum for threat severity
CREATE TYPE public.threat_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');

-- Create enum for server status
CREATE TYPE public.server_status AS ENUM ('online', 'warning', 'critical', 'offline');

-- Create enum for server type
CREATE TYPE public.server_type AS ENUM ('proxmox', 'vm', 'container', 'physical');

-- Create enum for agent status
CREATE TYPE public.agent_status AS ENUM ('connected', 'disconnected', 'pending');

-- Create threats table
CREATE TABLE public.threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  threat_type TEXT NOT NULL,
  severity threat_severity NOT NULL DEFAULT 'medium',
  country TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create servers table
CREATE TABLE public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  server_type server_type NOT NULL DEFAULT 'vm',
  status server_status NOT NULL DEFAULT 'online',
  cpu_usage DECIMAL(5, 2) DEFAULT 0,
  memory_usage DECIMAL(5, 2) DEFAULT 0,
  disk_usage DECIMAL(5, 2) DEFAULT 0,
  os TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostname TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  os TEXT,
  version TEXT,
  status agent_status NOT NULL DEFAULT 'pending',
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  server_id UUID REFERENCES public.servers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create server_logs table for history
CREATE TABLE public.server_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  log_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity threat_severity DEFAULT 'info',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create server_metrics table for charts
CREATE TABLE public.server_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  cpu_usage DECIMAL(5, 2) NOT NULL,
  memory_usage DECIMAL(5, 2) NOT NULL,
  disk_usage DECIMAL(5, 2) NOT NULL,
  network_in BIGINT DEFAULT 0,
  network_out BIGINT DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create alerts table for notifications
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity threat_severity NOT NULL DEFAULT 'info',
  source TEXT,
  is_read BOOLEAN DEFAULT false,
  server_id UUID REFERENCES public.servers(id) ON DELETE SET NULL,
  threat_id UUID REFERENCES public.threats(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notification_settings table
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  telegram_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT false,
  email_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access (SOC dashboard is typically internal)
CREATE POLICY "Allow public read threats" ON public.threats FOR SELECT USING (true);
CREATE POLICY "Allow public insert threats" ON public.threats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update threats" ON public.threats FOR UPDATE USING (true);

CREATE POLICY "Allow public read servers" ON public.servers FOR SELECT USING (true);
CREATE POLICY "Allow public insert servers" ON public.servers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update servers" ON public.servers FOR UPDATE USING (true);

CREATE POLICY "Allow public read agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Allow public insert agents" ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update agents" ON public.agents FOR UPDATE USING (true);

CREATE POLICY "Allow public read server_logs" ON public.server_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert server_logs" ON public.server_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read server_metrics" ON public.server_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert server_metrics" ON public.server_metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update alerts" ON public.alerts FOR UPDATE USING (true);

CREATE POLICY "Allow public read notification_settings" ON public.notification_settings FOR SELECT USING (true);
CREATE POLICY "Allow public write notification_settings" ON public.notification_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update notification_settings" ON public.notification_settings FOR UPDATE USING (true);

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.threats;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_threats_updated_at BEFORE UPDATE ON public.threats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON public.servers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for servers
INSERT INTO public.servers (name, ip_address, server_type, status, cpu_usage, memory_usage, disk_usage, os) VALUES
('proxmox-main', '192.168.1.10', 'proxmox', 'online', 45, 62, 38, 'Proxmox VE 8.0'),
('web-server-01', '192.168.1.20', 'vm', 'online', 23, 45, 55, 'Ubuntu 22.04'),
('db-server-01', '192.168.1.21', 'vm', 'warning', 78, 85, 72, 'Debian 12'),
('mail-server', '192.168.1.22', 'container', 'online', 12, 28, 45, 'Alpine Linux'),
('backup-srv', '192.168.1.30', 'physical', 'critical', 92, 94, 89, 'CentOS 9'),
('monitoring', '192.168.1.40', 'vm', 'offline', 0, 0, 0, 'Ubuntu 20.04');

-- Insert sample threats
INSERT INTO public.threats (ip_address, threat_type, severity, country, city, description) VALUES
('103.45.67.89', 'Brute Force Attack', 'critical', 'China', 'Beijing', 'Multiple failed SSH login attempts detected'),
('45.33.21.98', 'Port Scan', 'high', 'Russia', 'Moscow', 'Systematic port scanning activity'),
('198.51.100.45', 'SQL Injection', 'high', 'Unknown', 'Unknown', 'SQL injection attempt on web application'),
('203.0.113.67', 'DDoS Attack', 'critical', 'Brazil', 'São Paulo', 'Distributed denial of service attack'),
('192.0.2.123', 'Malware C2', 'medium', 'Vietnam', 'Hanoi', 'Command and control communication detected');