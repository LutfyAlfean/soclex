import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import ThreatRadar from '@/components/ThreatRadar';
import AlertTimeline from '@/components/AlertTimeline';

const Threats = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-foreground">
            THREAT MONITOR
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time threat detection and analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThreatRadar />
          <AlertTimeline />
        </div>
      </div>
    </Sidebar>
  );
};

export default Threats;
