import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { useServer } from '@/hooks/useServers';
import { useServerMetrics } from '@/hooks/useServerMetrics';
import { useServerLogs } from '@/hooks/useServerLogs';
import { ArrowLeft, Server, Cpu, HardDrive, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'text-cyber-green';
    case 'warning': return 'text-cyber-yellow';
    case 'critical': return 'text-primary';
    case 'offline': return 'text-muted-foreground';
    default: return 'text-muted-foreground';
  }
};

const getStatusIndicator = (status: string) => {
  switch (status) {
    case 'online': return 'status-online';
    case 'warning': return 'status-warning';
    case 'critical': return 'status-danger';
    case 'offline': return 'status-offline';
    default: return 'status-offline';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'proxmox': return <Server className="w-6 h-6 text-cyber-blue" />;
    case 'vm': return <Cpu className="w-6 h-6 text-cyber-purple" />;
    case 'container': return <HardDrive className="w-6 h-6 text-cyber-green" />;
    case 'physical': return <Server className="w-6 h-6 text-cyber-orange" />;
    default: return <Server className="w-6 h-6" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-primary bg-primary/20';
    case 'high': return 'text-cyber-orange bg-cyber-orange/20';
    case 'medium': return 'text-cyber-yellow bg-cyber-yellow/20';
    case 'low': return 'text-cyber-blue bg-cyber-blue/20';
    default: return 'text-muted-foreground bg-secondary';
  }
};

const UsageBar = ({ value, label }: { value: number; label: string }) => {
  const getColor = () => {
    if (value >= 90) return 'bg-red-500';
    if (value >= 75) return 'bg-orange-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={value >= 90 ? 'text-primary' : 'text-foreground'}>{value}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

// Generate mock metrics data for chart
const generateMockMetrics = () => {
  const metrics = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    metrics.push({
      time: format(time, 'HH:mm'),
      cpu: Math.floor(Math.random() * 40) + 30,
      memory: Math.floor(Math.random() * 30) + 50,
      disk: Math.floor(Math.random() * 10) + 40,
    });
  }
  return metrics;
};

// Generate mock logs
const generateMockLogs = () => {
  const logTypes = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
  const severities = ['info', 'medium', 'high', 'low'];
  const messages = [
    'Service started successfully',
    'High memory usage detected',
    'Connection timeout to database',
    'Scheduled backup completed',
    'SSH login attempt from unknown IP',
    'Disk space running low',
    'Security update installed',
    'New user session started',
  ];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `log-${i}`,
    created_at: new Date(Date.now() - i * 300000).toISOString(),
    log_type: logTypes[Math.floor(Math.random() * logTypes.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    severity: severities[Math.floor(Math.random() * severities.length)] as 'critical' | 'high' | 'medium' | 'low' | 'info',
  }));
};

const ServerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { data: server, isLoading: serverLoading } = useServer(id || '');
  const { data: metricsData } = useServerMetrics(id || '');
  const { data: logsData } = useServerLogs(id || '');

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Use mock data if no real data
  const metrics = metricsData?.length ? metricsData.map(m => ({
    time: format(new Date(m.recorded_at), 'HH:mm'),
    cpu: Number(m.cpu_usage),
    memory: Number(m.memory_usage),
    disk: Number(m.disk_usage),
  })) : generateMockMetrics();

  const logs = logsData?.length ? logsData : generateMockLogs();

  if (serverLoading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Sidebar>
    );
  }

  if (!server) {
    return (
      <Sidebar>
        <div className="text-center py-12">
          <h2 className="text-xl font-display">Server not found</h2>
          <Link to="/servers" className="text-primary hover:underline mt-2 inline-block">
            Back to servers
          </Link>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/servers"
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            {getTypeIcon(server.server_type)}
            <div>
              <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-foreground flex items-center gap-3">
                {server.name.toUpperCase()}
                <span className={getStatusIndicator(server.status)} />
              </h1>
              <p className="text-muted-foreground font-mono">{server.ip_address} • {server.os}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {server.status === 'online' ? (
              <Wifi className="w-5 h-5 text-cyber-green" />
            ) : server.status === 'offline' ? (
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            ) : null}
            <span className={`font-display uppercase tracking-wider ${getStatusColor(server.status)}`}>
              {server.status}
            </span>
          </div>
        </div>

        {/* Current Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="cyber-card p-6">
            <UsageBar value={Number(server.cpu_usage)} label="CPU Usage" />
          </div>
          <div className="cyber-card p-6">
            <UsageBar value={Number(server.memory_usage)} label="Memory Usage" />
          </div>
          <div className="cyber-card p-6">
            <UsageBar value={Number(server.disk_usage)} label="Disk Usage" />
          </div>
        </div>

        {/* Metrics Chart */}
        <div className="cyber-card p-6">
          <h3 className="font-display text-lg tracking-wider text-foreground mb-4">
            PERFORMANCE METRICS (24H)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={false}
                  name="CPU %"
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name="Memory %"
                />
                <Line 
                  type="monotone" 
                  dataKey="disk" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                  name="Disk %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Log History */}
        <div className="cyber-card p-6">
          <h3 className="font-display text-lg tracking-wider text-foreground mb-4">
            LOG HISTORY
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-colors"
              >
                <span className={`px-2 py-0.5 rounded text-xs font-mono ${getSeverityColor(log.severity)}`}>
                  {log.log_type}
                </span>
                <span className="flex-1 text-sm">{log.message}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {format(new Date(log.created_at), 'HH:mm:ss')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default ServerDetail;
