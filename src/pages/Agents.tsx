import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import AgentManager from '@/components/AgentManager';

const Agents = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-foreground">
            SOCLEX AGENTS
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and deploy security agents across your infrastructure
          </p>
        </div>

        <AgentManager />
      </div>
    </Sidebar>
  );
};

export default Agents;
