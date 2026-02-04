import { useNavigate } from 'react-router-dom';
import { Server, Cpu, HardDrive, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useServers } from '@/hooks/useServers';

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
    case 'proxmox': return <Server className="w-4 h-4 text-cyber-blue" />;
    case 'vm': return <Cpu className="w-4 h-4 text-cyber-purple" />;
    case 'container': return <HardDrive className="w-4 h-4 text-cyber-green" />;
    case 'physical': return <Server className="w-4 h-4 text-cyber-orange" />;
    default: return <Server className="w-4 h-4" />;
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
  const navigate = useNavigate();
  const { data: servers, isLoading } = useServers();

  if (isLoading) {
    return (
      <div className="cyber-card p-6">
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const serverList = servers || [];

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg tracking-wider text-foreground">SERVER MONITOR</h3>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-cyber-green">{serverList.filter(s => s.status === 'online').length} Online</span>
          <span className="text-primary">{serverList.filter(s => s.status === 'critical').length} Critical</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {serverList.map((server) => (
          <div
            key={server.id}
            onClick={() => navigate(`/servers/${server.id}`)}
            className={`p-4 rounded-lg border transition-all hover:border-primary/50 cursor-pointer ${
              server.status === 'critical' ? 'cyber-card-danger' : 
              server.status === 'warning' ? 'border-cyber-yellow/30 bg-secondary/30' :
              'bg-secondary/30 border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getTypeIcon(server.server_type)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm tracking-wide">{server.name}</span>
                    <span className={getStatusIndicator(server.status)} />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{server.ip_address}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                    <span className={Number(server.cpu_usage) >= 90 ? 'text-primary' : 'text-foreground'}>{server.cpu_usage}%</span>
                  </div>
                  <UsageBar value={Number(server.cpu_usage)} critical={server.status === 'critical'} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">MEM</span>
                    <span className={Number(server.memory_usage) >= 90 ? 'text-primary' : 'text-foreground'}>{server.memory_usage}%</span>
                  </div>
                  <UsageBar value={Number(server.memory_usage)} critical={server.status === 'critical'} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">DISK</span>
                    <span className={Number(server.disk_usage) >= 90 ? 'text-primary' : 'text-foreground'}>{server.disk_usage}%</span>
                  </div>
                  <UsageBar value={Number(server.disk_usage)} critical={server.status === 'critical'} />
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
