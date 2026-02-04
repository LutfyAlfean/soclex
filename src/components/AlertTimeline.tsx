import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';

interface Alert {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  source: string;
  ip?: string;
}

const generateAlerts = (): Alert[] => {
  const alerts: Alert[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 120000),
      severity: 'critical',
      title: 'Brute Force Attack Detected',
      description: 'Multiple failed SSH login attempts detected from external IP',
      source: 'web-server-01',
      ip: '45.33.32.156',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000),
      severity: 'high',
      title: 'Suspicious Port Scan',
      description: 'Sequential port scanning detected on multiple hosts',
      source: 'firewall',
      ip: '185.220.101.33',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 450000),
      severity: 'high',
      title: 'Unusual Outbound Traffic',
      description: 'Large data transfer to unknown external endpoint',
      source: 'db-server-01',
      ip: '91.121.87.18',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 600000),
      severity: 'medium',
      title: 'Failed Authentication',
      description: 'Multiple failed authentication attempts for admin account',
      source: 'mail-server',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 900000),
      severity: 'medium',
      title: 'Configuration Change Detected',
      description: 'Firewall rules modified by unknown user',
      source: 'firewall',
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 1200000),
      severity: 'low',
      title: 'Service Restart',
      description: 'Apache service was restarted automatically',
      source: 'web-server-01',
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 1500000),
      severity: 'info',
      title: 'Agent Update Available',
      description: 'New SOCLEX agent version 1.2.3 is available',
      source: 'system',
    },
  ];

  return alerts;
};

const getSeverityConfig = (severity: Alert['severity']) => {
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

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const AlertTimeline = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<Alert['severity'] | 'all'>('all');

  useEffect(() => {
    setAlerts(generateAlerts());
  }, []);

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

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
        {filteredAlerts.map((alert, index) => {
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
                      {formatTimeAgo(alert.timestamp)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                    <span className="text-muted-foreground">
                      Source: <span className="text-foreground">{alert.source}</span>
                    </span>
                    {alert.ip && (
                      <span className="text-muted-foreground">
                        IP: <span className="text-primary">{alert.ip}</span>
                      </span>
                    )}
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
