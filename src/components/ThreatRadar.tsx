import { useEffect, useState, useMemo } from 'react';

interface ThreatPoint {
  id: string;
  ip: string;
  x: number;
  y: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  country: string;
}

const generateRandomThreats = (): ThreatPoint[] => {
  const threats: ThreatPoint[] = [];
  const types = ['Brute Force', 'Port Scan', 'DDoS', 'Malware', 'SQL Injection', 'XSS Attack', 'Unauthorized Access'];
  const countries = ['CN', 'RU', 'US', 'BR', 'IN', 'KR', 'DE', 'Unknown'];
  const severities: ThreatPoint['severity'][] = ['critical', 'high', 'medium', 'low'];

  const count = Math.floor(Math.random() * 8) + 4;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 0.8 + 0.1;
    threats.push({
      id: `threat-${i}`,
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      x: 50 + Math.cos(angle) * radius * 45,
      y: 50 + Math.sin(angle) * radius * 45,
      severity: severities[Math.floor(Math.random() * severities.length)],
      type: types[Math.floor(Math.random() * types.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
    });
  }

  return threats;
};

const ThreatRadar = () => {
  const [threats, setThreats] = useState<ThreatPoint[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatPoint | null>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setThreats(generateRandomThreats());
    
    // Update threats periodically
    const interval = setInterval(() => {
      setThreats(generateRandomThreats());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(rotationInterval);
  }, []);

  const getSeverityColor = (severity: ThreatPoint['severity']) => {
    switch (severity) {
      case 'critical': return 'rgb(239, 68, 68)';
      case 'high': return 'rgb(249, 115, 22)';
      case 'medium': return 'rgb(234, 179, 8)';
      case 'low': return 'rgb(34, 197, 94)';
    }
  };

  const getSeverityGlow = (severity: ThreatPoint['severity']) => {
    switch (severity) {
      case 'critical': return '0 0 15px rgba(239, 68, 68, 0.8)';
      case 'high': return '0 0 12px rgba(249, 115, 22, 0.7)';
      case 'medium': return '0 0 10px rgba(234, 179, 8, 0.6)';
      case 'low': return '0 0 8px rgba(34, 197, 94, 0.5)';
    }
  };

  const threatStats = useMemo(() => {
    return {
      critical: threats.filter(t => t.severity === 'critical').length,
      high: threats.filter(t => t.severity === 'high').length,
      medium: threats.filter(t => t.severity === 'medium').length,
      low: threats.filter(t => t.severity === 'low').length,
    };
  }, [threats]);

  return (
    <div className="cyber-card p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg tracking-wider text-foreground">THREAT RADAR</h3>
        <div className="flex items-center gap-1">
          <span className="status-online" />
          <span className="text-xs text-cyber-green font-mono">SCANNING</span>
        </div>
      </div>

      {/* Radar container */}
      <div className="relative aspect-square max-w-md mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background circles */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(220 20% 20%)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="hsl(220 20% 18%)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="hsl(220 20% 16%)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="hsl(220 20% 14%)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="5" fill="none" stroke="hsl(220 20% 12%)" strokeWidth="0.5" />

          {/* Cross lines */}
          <line x1="50" y1="5" x2="50" y2="95" stroke="hsl(220 20% 15%)" strokeWidth="0.3" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="hsl(220 20% 15%)" strokeWidth="0.3" />
          <line x1="14.64" y1="14.64" x2="85.36" y2="85.36" stroke="hsl(220 20% 13%)" strokeWidth="0.3" />
          <line x1="85.36" y1="14.64" x2="14.64" y2="85.36" stroke="hsl(220 20% 13%)" strokeWidth="0.3" />

          {/* Radar sweep */}
          <defs>
            <linearGradient id="sweepGradient" gradientUnits="userSpaceOnUse" x1="50" y1="50" x2="50" y2="5">
              <stop offset="0%" stopColor="hsl(0 85% 50%)" stopOpacity="0" />
              <stop offset="100%" stopColor="hsl(0 85% 50%)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50px 50px' }}>
            <path
              d="M 50 50 L 50 5 A 45 45 0 0 1 88.18 30.91 Z"
              fill="url(#sweepGradient)"
            />
            <line x1="50" y1="50" x2="50" y2="5" stroke="hsl(0 85% 50%)" strokeWidth="0.5" opacity="0.8" />
          </g>

          {/* Center point */}
          <circle cx="50" cy="50" r="2" fill="hsl(0 85% 50%)" />
          <circle cx="50" cy="50" r="3" fill="none" stroke="hsl(0 85% 50%)" strokeWidth="0.5" opacity="0.5">
            <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Threat points */}
          {threats.map((threat) => (
            <g key={threat.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedThreat(threat)}>
              <circle
                cx={threat.x}
                cy={threat.y}
                r="2"
                fill={getSeverityColor(threat.severity)}
                style={{ boxShadow: getSeverityGlow(threat.severity) }}
              />
              <circle
                cx={threat.x}
                cy={threat.y}
                r="4"
                fill="none"
                stroke={getSeverityColor(threat.severity)}
                strokeWidth="0.5"
                opacity="0.5"
              >
                {threat.severity === 'critical' && (
                  <>
                    <animate attributeName="r" values="4;8;4" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite" />
                  </>
                )}
              </circle>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)' }} />
            <span className="text-muted-foreground">Critical ({threatStats.critical})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">High ({threatStats.high})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Medium ({threatStats.medium})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Low ({threatStats.low})</span>
          </div>
        </div>
      </div>

      {/* Selected threat info */}
      {selectedThreat && (
        <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-sm tracking-wider" style={{ color: getSeverityColor(selectedThreat.severity) }}>
              {selectedThreat.severity.toUpperCase()} THREAT
            </span>
            <button onClick={() => setSelectedThreat(null)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm font-mono">
            <div><span className="text-muted-foreground">IP:</span> <span className="text-foreground">{selectedThreat.ip}</span></div>
            <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground">{selectedThreat.type}</span></div>
            <div><span className="text-muted-foreground">Origin:</span> <span className="text-foreground">{selectedThreat.country}</span></div>
            <div><span className="text-muted-foreground">Status:</span> <span className="text-primary">ACTIVE</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatRadar;
