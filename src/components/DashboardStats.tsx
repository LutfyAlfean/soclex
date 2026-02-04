import { Shield, AlertTriangle, Server, Activity, Users, Clock } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

const StatCard = ({ title, value, change, icon, variant = 'default' }: StatCardProps) => {
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
        <span className={`font-display text-4xl font-bold ${getValueColor()}`}>
          {value}
        </span>
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Active Threats"
        value={23}
        change="+5"
        icon={<AlertTriangle className="w-5 h-5 text-primary" />}
        variant="danger"
      />
      <StatCard
        title="Blocked Attacks"
        value="1,247"
        change="+156"
        icon={<Shield className="w-5 h-5 text-cyber-green" />}
        variant="success"
      />
      <StatCard
        title="Monitored Servers"
        value={12}
        icon={<Server className="w-5 h-5 text-cyber-blue" />}
      />
      <StatCard
        title="Active Agents"
        value={18}
        icon={<Activity className="w-5 h-5 text-cyber-purple" />}
      />
      <StatCard
        title="Users Online"
        value={3}
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
