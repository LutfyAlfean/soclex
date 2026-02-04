import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import {
  LayoutDashboard,
  Radar,
  Server,
  Shield,
  Ticket,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  ChevronDown,
} from 'lucide-react';
import logo from '@/assets/logo_soclex.png';

interface SidebarProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/threats', icon: Radar, label: 'Threat Monitor' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/servers', icon: Server, label: 'Servers' },
  { to: '/agents', icon: Shield, label: 'Agents' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ children }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <img src={logo} alt="SOCLEX" className="w-10 h-10 object-contain" />
            {!collapsed && (
              <span className="font-display text-xl tracking-wider text-sidebar-foreground">
                SOCLEX
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-sidebar-foreground hover:text-primary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium tracking-wide">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user?.username}</div>
                <div className="text-xs text-muted-foreground">{user?.role}</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-4 flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-card/50">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {/* Notifications */}
            <NotificationBell />

            {/* User dropdown */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-sm hidden sm:block">{user?.username}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 cyber-grid">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
