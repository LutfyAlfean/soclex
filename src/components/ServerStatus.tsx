import { Server, Cpu, HardDrive, Wifi, WifiOff } from 'lucide-react';

interface ServerInfo {
  id: string;
  name: string;
  ip: string;
  type: 'proxmox' | 'vm' | 'container' | 'physical';
  status: 'online' | 'warning' | 'critical' | 'offline';
  cpu: number;
  memory: number;
  disk: number;
  alerts: number;
  os: string;
}

const mockServers: ServerInfo[] = [
  { id: '1', name: 'proxmox-main', ip: '192.168.1.10', type: 'proxmox', status: 'online', cpu: 45, memory: 62, disk: 38, alerts: 0, os: 'Proxmox VE 8.0' },
  { id: '2', name: 'web-server-01', ip: '192.168.1.20', type: 'vm', status: 'online', cpu: 23, memory: 45, disk: 55, alerts: 2, os: 'Ubuntu 22.04' },
  { id: '3', name: 'db-server-01', ip: '192.168.1.21', type: 'vm', status: 'warning', cpu: 78, memory: 85, disk: 72, alerts: 5, os: 'Debian 12' },
  { id: '4', name: 'mail-server', ip: '192.168.1.22', type: 'container', status: 'online', cpu: 12, memory: 28, disk: 45, alerts: 0, os: 'Alpine Linux' },
  { id: '5', name: 'backup-srv', ip: '192.168.1.30', type: 'physical', status: 'critical', cpu: 92, memory: 94, disk: 89, alerts: 12, os: 'CentOS 9' },
  { id: '6', name: 'monitoring', ip: '192.168.1.40', type: 'vm', status: 'offline', cpu: 0, memory: 0, disk: 0, alerts: 0, os: 'Ubuntu 20.04' },
];

const getStatusColor = (status: ServerInfo['status']) => {
  switch (status) {
    case 'online': return 'text-cyber-green';
    case 'warning': return 'text-cyber-yellow';
    case 'critical': return 'text-primary';
    case 'offline': return 'text-muted-foreground';
  }
};

const getStatusIndicator = (status: ServerInfo['status']) => {
  switch (status) {
    case 'online': return 'status-online';
    case 'warning': return 'status-warning';
    case 'critical': return 'status-danger';
    case 'offline': return 'status-offline';
  }
};

const getTypeIcon = (type: ServerInfo['type']) => {
  switch (type) {
    case 'proxmox': return <Server className="w-4 h-4 text-cyber-blue" />;
    case 'vm': return <Cpu className="w-4 h-4 text-cyber-purple" />;
    case 'container': return <HardDrive className="w-4 h-4 text-cyber-green" />;
    case 'physical': return <Server className="w-4 h-4 text-cyber-orange" />;
  }
};

const UsageBar = ({ value, critical = false }: { value: number; critical?: boolean }) => {
  const getColor = () => {
    if (value >= 90) return 'bg-red-500';
    if (value >= 75) return 'bg-orange-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full ${getColor()} transition-all duration-500 ${critical && value >= 90 ? 'animate-pulse' : ''}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const ServerStatus = () => {
  return (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg tracking-wider text-foreground">SERVER MONITOR</h3>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-cyber-green">{mockServers.filter(s => s.status === 'online').length} Online</span>
          <span className="text-primary">{mockServers.filter(s => s.status === 'critical').length} Critical</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {mockServers.map((server) => (
          <div
            key={server.id}
            className={`p-4 rounded-lg border transition-all hover:border-primary/50 cursor-pointer ${
              server.status === 'critical' ? 'cyber-card-danger' : 
              server.status === 'warning' ? 'border-cyber-yellow/30 bg-secondary/30' :
              'bg-secondary/30 border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getTypeIcon(server.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm tracking-wide">{server.name}</span>
                    <span className={getStatusIndicator(server.status)} />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{server.ip}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {server.alerts > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-primary/20 text-primary">
                    {server.alerts} alerts
                  </span>
                )}
                {server.status === 'online' ? (
                  <Wifi className="w-4 h-4 text-cyber-green" />
                ) : server.status === 'offline' ? (
                  <WifiOff className="w-4 h-4 text-muted-foreground" />
                ) : null}
              </div>
            </div>

            {server.status !== 'offline' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">CPU</span>
                    <span className={server.cpu >= 90 ? 'text-primary' : 'text-foreground'}>{server.cpu}%</span>
                  </div>
                  <UsageBar value={server.cpu} critical={server.status === 'critical'} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">MEM</span>
                    <span className={server.memory >= 90 ? 'text-primary' : 'text-foreground'}>{server.memory}%</span>
                  </div>
                  <UsageBar value={server.memory} critical={server.status === 'critical'} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">DISK</span>
                    <span className={server.disk >= 90 ? 'text-primary' : 'text-foreground'}>{server.disk}%</span>
                  </div>
                  <UsageBar value={server.disk} critical={server.status === 'critical'} />
                </div>
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground font-mono">{server.os}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServerStatus;
