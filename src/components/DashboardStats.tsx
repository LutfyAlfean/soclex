import { Shield, AlertTriangle, Server, Activity, Users, Clock, RefreshCw } from 'lucide-react';
import { useThreats } from '@/hooks/useThreats';
import { useServers } from '@/hooks/useServers';
import { useAgents } from '@/hooks/useAgents';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  isLoading?: boolean;
}

const StatCard = ({ title, value, change, icon, variant = 'default', isLoading }: StatCardProps) => {
  const getBgClass = () => {
    switch (variant) {
      case 'danger': return 'cyber-card-danger';
      case 'success': return 'cyber-card-safe';
      case 'warning': return 'border-cyber-yellow/30';
      default: return '';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'danger': return 'text-primary text-glow-red';
      case 'success': return 'text-cyber-green text-glow-green';
      case 'warning': return 'text-cyber-yellow';
      default: return 'text-foreground';
    }
  };

  return (
    <div className={`cyber-card p-6 ${getBgClass()}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
          {title}
        </span>
        <div className="p-2 bg-secondary/50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        {isLoading ? (
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        ) : (
          <span className={`font-display text-4xl font-bold ${getValueColor()}`}>
            {value}
          </span>
        )}
        {change && (
          <span className={`text-sm font-mono ${
            change.startsWith('+') ? 'text-primary' : 'text-cyber-green'
          }`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

const DashboardStats = () => {
  const { data: threats, isLoading: threatsLoading } = useThreats();
  const { data: servers, isLoading: serversLoading } = useServers();
  const { data: agents, isLoading: agentsLoading } = useAgents();

  const activeThreats = threats?.filter(t => !t.is_resolved).length || 0;
  const resolvedThreats = threats?.filter(t => t.is_resolved).length || 0;
  const monitoredServers = servers?.length || 0;
  const activeAgents = agents?.filter(a => a.status === 'connected').length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Active Threats"
        value={activeThreats}
        icon={<AlertTriangle className="w-5 h-5 text-primary" />}
        variant="danger"
        isLoading={threatsLoading}
      />
      <StatCard
        title="Resolved"
        value={resolvedThreats}
        icon={<Shield className="w-5 h-5 text-cyber-green" />}
        variant="success"
        isLoading={threatsLoading}
      />
      <StatCard
        title="Servers"
        value={monitoredServers}
        icon={<Server className="w-5 h-5 text-cyber-blue" />}
        isLoading={serversLoading}
      />
      <StatCard
        title="Agents"
        value={activeAgents}
        icon={<Activity className="w-5 h-5 text-cyber-purple" />}
        isLoading={agentsLoading}
      />
      <StatCard
        title="Users"
        value={1}
        icon={<Users className="w-5 h-5 text-cyber-orange" />}
      />
      <StatCard
        title="Uptime"
        value="99.9%"
        icon={<Clock className="w-5 h-5 text-cyber-green" />}
        variant="success"
      />
    </div>
  );
};

export default DashboardStats;
