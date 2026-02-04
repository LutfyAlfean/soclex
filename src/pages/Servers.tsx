import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import ServerStatus from '@/components/ServerStatus';

const Servers = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-foreground">
            SERVER MANAGEMENT
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your infrastructure
          </p>
        </div>

        <ServerStatus />
      </div>
    </Sidebar>
  );
};

export default Servers;
