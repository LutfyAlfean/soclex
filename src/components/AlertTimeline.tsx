import { useState } from 'react';
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { useAlerts, Alert as AlertType } from '@/hooks/useAlerts';
import { format } from 'date-fns';

type SeverityType = 'critical' | 'high' | 'medium' | 'low' | 'info';

const getSeverityConfig = (severity: SeverityType) => {
  switch (severity) {
    case 'critical':
      return { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'high':
      return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    case 'medium':
      return { icon: Shield, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    case 'low':
      return { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'info':
      return { icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
  }
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// Mock alerts for when database is empty
const mockAlerts: AlertType[] = [
  {
    id: '1',
    title: 'Brute Force Attack Detected',
    message: 'Multiple failed SSH login attempts detected from external IP',
    severity: 'critical',
    source: 'web-server-01',
    is_read: false,
    server_id: null,
    threat_id: null,
    created_at: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: '2',
    title: 'Suspicious Port Scan',
    message: 'Sequential port scanning detected on multiple hosts',
    severity: 'high',
    source: 'firewall',
    is_read: false,
    server_id: null,
    threat_id: null,
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: '3',
    title: 'Unusual Outbound Traffic',
    message: 'Large data transfer to unknown external endpoint',
    severity: 'high',
    source: 'db-server-01',
    is_read: true,
    server_id: null,
    threat_id: null,
    created_at: new Date(Date.now() - 450000).toISOString(),
  },
  {
    id: '4',
    title: 'Failed Authentication',
    message: 'Multiple failed authentication attempts for admin account',
    severity: 'medium',
    source: 'mail-server',
    is_read: true,
    server_id: null,
    threat_id: null,
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: '5',
    title: 'Service Restart',
    message: 'Apache service was restarted automatically',
    severity: 'low',
    source: 'web-server-01',
    is_read: true,
    server_id: null,
    threat_id: null,
    created_at: new Date(Date.now() - 1200000).toISOString(),
  },
];

const AlertTimeline = () => {
  const { data: alertsData, isLoading } = useAlerts();
  const [filter, setFilter] = useState<SeverityType | 'all'>('all');

  const alerts = alertsData?.length ? alertsData : mockAlerts;
  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  if (isLoading) {
    return (
      <div className="cyber-card p-6">
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg tracking-wider text-foreground">ALERT TIMELINE</h3>
        <div className="flex items-center gap-2">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-2 py-1 text-xs font-mono rounded transition-all ${
                filter === sev
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {sev.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts.map((alert) => {
          const config = getSeverityConfig(alert.severity);
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${config.bg} ${config.border} transition-all hover:scale-[1.01] cursor-pointer ${
                alert.severity === 'critical' ? 'animate-pulse' : ''
              }`}
              style={{ animationDuration: '3s' }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-display text-sm tracking-wide ${config.color}`}>
                      {alert.title}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(alert.created_at)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                    <span className="text-muted-foreground">
                      Source: <span className="text-foreground">{alert.source || 'System'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No alerts matching filter</p>
        </div>
      )}
    </div>
  );
};

export default AlertTimeline;
