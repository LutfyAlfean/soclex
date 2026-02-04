import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import ThreatRadar from '@/components/ThreatRadar';
import ServerStatus from '@/components/ServerStatus';
import AlertTimeline from '@/components/AlertTimeline';
import DashboardStats from '@/components/DashboardStats';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-foreground">
              SECURITY DASHBOARD
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time threat monitoring and infrastructure status
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg">
            <span className="status-online" />
            <span className="text-sm font-mono text-cyber-green">SYSTEM ACTIVE</span>
          </div>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ThreatRadar />
          <ServerStatus />
        </div>

        {/* Alert Timeline */}
        <AlertTimeline />
      </div>
    </Sidebar>
  );
};

export default Dashboard;
