import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Save, Bell, Shield, Database, Key, Send, Lock } from 'lucide-react';
import TelegramSettings from '@/components/TelegramSettings';
import ChangePassword from '@/components/ChangePassword';

const Settings = () => {
  const { isAuthenticated, user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoBlockThreats: true,
    retentionDays: 30,
    apiEndpoint: 'https://api.soclex.local',
  });

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Sidebar>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-foreground">
            SETTINGS
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your SOCLEX instance
          </p>
        </div>

        {/* Account Settings */}
        <div className="cyber-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg tracking-wider">Account</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full mt-1 px-4 py-3 bg-input border border-border rounded-md text-foreground font-mono opacity-50"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground uppercase tracking-wider">Role</label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="w-full mt-1 px-4 py-3 bg-input border border-border rounded-md text-foreground font-mono opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="cyber-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg tracking-wider">Change Password</h3>
          </div>
          <ChangePassword />
        </div>

        {/* Telegram Settings */}
        <div className="cyber-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Send className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg tracking-wider">Telegram Notifications</h3>
          </div>
          <TelegramSettings />
        </div>

        {/* Notification Settings */}
        <div className="cyber-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg tracking-wider">Email Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Receive alerts via email</div>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, emailNotifications: !s.emailNotifications }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="cyber-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg tracking-wider">Security</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium">Auto-Block Threats</div>
                <div className="text-sm text-muted-foreground">Automatically block detected threats</div>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, autoBlockThreats: !s.autoBlockThreats }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.autoBlockThreats ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  settings.autoBlockThreats ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </label>
          </div>
        </div>

        {/* Data Settings */}
        <div className="cyber-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg tracking-wider">Data Retention</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground uppercase tracking-wider">
                Log Retention (Days)
              </label>
              <input
                type="number"
                value={settings.retentionDays}
                onChange={(e) => setSettings(s => ({ ...s, retentionDays: parseInt(e.target.value) }))}
                className="w-full mt-1 px-4 py-3 bg-input border border-border rounded-md text-foreground font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground uppercase tracking-wider">
                API Endpoint
              </label>
              <input
                type="text"
                value={settings.apiEndpoint}
                onChange={(e) => setSettings(s => ({ ...s, apiEndpoint: e.target.value }))}
                className="w-full mt-1 px-4 py-3 bg-input border border-border rounded-md text-foreground font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <button className="cyber-btn flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </Sidebar>
  );
};

export default Settings;
