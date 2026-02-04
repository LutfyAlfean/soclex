import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { useThreats, useResolveThread, Threat } from '@/hooks/useThreats';
import { useCreateTicketFromThreat } from '@/hooks/useTickets';
import ThreatRadar from '@/components/ThreatRadar';
import { 
  RefreshCw, 
  Shield, 
  ShieldAlert, 
  Ticket, 
  CheckCircle,
  MapPin,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-primary bg-primary/20';
    case 'high': return 'text-cyber-orange bg-cyber-orange/20';
    case 'medium': return 'text-cyber-yellow bg-cyber-yellow/20';
    case 'low': return 'text-cyber-green bg-cyber-green/20';
    default: return 'text-muted-foreground bg-secondary';
  }
};

const Threats = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: threats, isLoading } = useThreats();
  const resolveThread = useResolveThread();
  const createTicket = useCreateTicketFromThreat();
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const filteredThreats = threats?.filter(threat => {
    if (filter === 'active') return !threat.is_resolved;
    if (filter === 'resolved') return threat.is_resolved;
    return true;
  }) || [];

  const handleCreateTicket = (threat: Threat) => {
    createTicket.mutate({
      id: threat.id,
      ip_address: threat.ip_address,
      threat_type: threat.threat_type,
      severity: threat.severity,
      description: threat.description,
    }, {
      onSuccess: () => {
        navigate('/tickets');
      }
    });
  };

  const handleResolve = (threatId: string) => {
    resolveThread.mutate(threatId);
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-foreground">
              THREAT MONITOR
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time threat detection and ticket management
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'active', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThreatRadar />
          
          {/* Threat List */}
          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg tracking-wider text-foreground">DETECTED THREATS</h3>
              <span className="text-xs font-mono text-muted-foreground">
                {filteredThreats.length} threats
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredThreats.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto text-cyber-green mb-4" />
                <h3 className="text-lg font-display text-cyber-green">All Clear</h3>
                <p className="text-muted-foreground mt-1">No threats detected</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredThreats.map((threat) => (
                  <div
                    key={threat.id}
                    className={`p-4 rounded-lg border transition-all ${
                      threat.is_resolved 
                        ? 'bg-secondary/20 border-border opacity-60' 
                        : threat.severity === 'critical'
                        ? 'cyber-card-danger'
                        : 'bg-secondary/30 border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className={`w-5 h-5 mt-0.5 ${
                          threat.severity === 'critical' ? 'text-primary' :
                          threat.severity === 'high' ? 'text-cyber-orange' :
                          threat.severity === 'medium' ? 'text-cyber-yellow' :
                          'text-cyber-green'
                        }`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono ${getSeverityColor(threat.severity)}`}>
                              {threat.severity.toUpperCase()}
                            </span>
                            {threat.is_resolved && (
                              <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyber-green/20 text-cyber-green">
                                RESOLVED
                              </span>
                            )}
                          </div>
                          <h4 className="font-display text-sm">{threat.threat_type}</h4>
                          <div className="text-xs text-muted-foreground font-mono mt-1">
                            IP: {threat.ip_address}
                          </div>
                          {threat.country && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              {threat.city ? `${threat.city}, ` : ''}{threat.country}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(threat.detected_at), 'MMM d, HH:mm')}
                          </div>
                        </div>
                      </div>
                      
                      {!threat.is_resolved && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleCreateTicket(threat)}
                            disabled={createTicket.isPending}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/30 transition-colors"
                          >
                            <Ticket className="w-3 h-3" />
                            Open Ticket
                          </button>
                          <button
                            onClick={() => handleResolve(threat.id)}
                            disabled={resolveThread.isPending}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-cyber-green/20 text-cyber-green hover:bg-cyber-green/30 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default Threats;
