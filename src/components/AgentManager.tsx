import { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle, XCircle, Clock, Server } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  os: string;
  version: string;
  status: 'active' | 'disconnected' | 'pending' | 'outdated';
  lastSeen: Date;
  eventsToday: number;
  cpuUsage: number;
  memoryUsage: number;
}

const mockAgents: Agent[] = [
  { id: '001', name: 'agent-proxmox-main', hostname: 'proxmox-main', ip: '192.168.1.10', os: 'Proxmox VE 8.0', version: '1.2.0', status: 'active', lastSeen: new Date(), eventsToday: 234, cpuUsage: 2.3, memoryUsage: 45 },
  { id: '002', name: 'agent-web-01', hostname: 'web-server-01', ip: '192.168.1.20', os: 'Ubuntu 22.04', version: '1.2.0', status: 'active', lastSeen: new Date(), eventsToday: 567, cpuUsage: 1.8, memoryUsage: 38 },
  { id: '003', name: 'agent-db-01', hostname: 'db-server-01', ip: '192.168.1.21', os: 'Debian 12', version: '1.1.5', status: 'outdated', lastSeen: new Date(Date.now() - 300000), eventsToday: 890, cpuUsage: 3.2, memoryUsage: 52 },
  { id: '004', name: 'agent-mail', hostname: 'mail-server', ip: '192.168.1.22', os: 'Alpine Linux', version: '1.2.0', status: 'active', lastSeen: new Date(), eventsToday: 123, cpuUsage: 0.8, memoryUsage: 25 },
  { id: '005', name: 'agent-backup', hostname: 'backup-srv', ip: '192.168.1.30', os: 'CentOS 9', version: '1.2.0', status: 'disconnected', lastSeen: new Date(Date.now() - 3600000), eventsToday: 0, cpuUsage: 0, memoryUsage: 0 },
  { id: '006', name: 'agent-monitoring', hostname: 'monitoring', ip: '192.168.1.40', os: 'Ubuntu 20.04', version: '1.2.0', status: 'pending', lastSeen: new Date(), eventsToday: 0, cpuUsage: 0, memoryUsage: 0 },
];

const getStatusConfig = (status: Agent['status']) => {
  switch (status) {
    case 'active':
      return { icon: CheckCircle, color: 'text-cyber-green', bg: 'bg-green-500/10', label: 'Active' };
    case 'disconnected':
      return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Disconnected' };
    case 'pending':
      return { icon: Clock, color: 'text-cyber-yellow', bg: 'bg-yellow-500/10', label: 'Pending' };
    case 'outdated':
      return { icon: RefreshCw, color: 'text-cyber-orange', bg: 'bg-orange-500/10', label: 'Update Available' };
  }
};

const formatLastSeen = (date: Date) => {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

const AgentManager = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const activeCount = agents.filter(a => a.status === 'active').length;
  const totalEvents = agents.reduce((sum, a) => sum + a.eventsToday, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card p-4">
          <div className="text-muted-foreground text-sm uppercase tracking-wider">Total Agents</div>
          <div className="font-display text-3xl mt-1">{agents.length}</div>
        </div>
        <div className="cyber-card-safe p-4">
          <div className="text-muted-foreground text-sm uppercase tracking-wider">Active</div>
          <div className="font-display text-3xl mt-1 text-cyber-green">{activeCount}</div>
        </div>
        <div className="cyber-card-danger p-4">
          <div className="text-muted-foreground text-sm uppercase tracking-wider">Disconnected</div>
          <div className="font-display text-3xl mt-1 text-primary">{agents.filter(a => a.status === 'disconnected').length}</div>
        </div>
        <div className="cyber-card p-4">
          <div className="text-muted-foreground text-sm uppercase tracking-wider">Events Today</div>
          <div className="font-display text-3xl mt-1">{totalEvents.toLocaleString()}</div>
        </div>
      </div>

      {/* Agent List */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg tracking-wider">SOCLEX AGENTS</h3>
          <div className="flex items-center gap-2">
            <button className="cyber-btn text-sm py-2 px-4">
              <Download className="w-4 h-4 inline-block mr-2" />
              Download Agent
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-muted-foreground font-medium text-sm uppercase tracking-wider">Agent ID</th>
                <th className="pb-3 text-muted-foreground font-medium text-sm uppercase tracking-wider">Hostname</th>
                <th className="pb-3 text-muted-foreground font-medium text-sm uppercase tracking-wider">IP Address</th>
                <th className="pb-3 text-muted-foreground font-medium text-sm uppercase tracking-wider">OS</th>
                <th className="pb-3 text-muted-foreground font-medium text-sm uppercase tracking-wider">Status</th>
                <th className="pb-3 text-muted-foreground font-medium text-sm uppercase tracking-wider">Version</th>
                <th className="pb-3 text-muted-foreground font-medium text-sm uppercase tracking-wider">Last Seen</th>
                <th className="pb-3 text-muted-foreground font-medium text-sm uppercase tracking-wider">Events</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => {
                const statusConfig = getStatusConfig(agent.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <tr
                    key={agent.id}
                    className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <td className="py-4 font-mono text-sm text-primary">{agent.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{agent.hostname}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-sm">{agent.ip}</td>
                    <td className="py-4 text-sm text-muted-foreground">{agent.os}</td>
                    <td className="py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${statusConfig.bg}`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.color}`} />
                        <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`font-mono text-sm ${agent.status === 'outdated' ? 'text-cyber-orange' : ''}`}>
                        v{agent.version}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">{formatLastSeen(agent.lastSeen)}</td>
                    <td className="py-4 font-mono text-sm">{agent.eventsToday.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <div className="cyber-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg tracking-wider">AGENT DETAILS</h3>
            <button onClick={() => setSelectedAgent(null)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Agent Name</div>
              <div className="font-mono">{selectedAgent.name}</div>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">CPU Usage</div>
              <div className="font-display text-2xl">{selectedAgent.cpuUsage}%</div>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Memory Usage</div>
              <div className="font-display text-2xl">{selectedAgent.memoryUsage}%</div>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Events Today</div>
              <div className="font-display text-2xl">{selectedAgent.eventsToday}</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-secondary/20 rounded-lg font-mono text-sm">
            <div className="text-muted-foreground mb-2"># Installation command:</div>
            <code className="text-cyber-green">
              curl -sL https://soclex.io/install | sudo bash -s -- --server=YOUR_SERVER_IP --key=YOUR_API_KEY
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManager;
