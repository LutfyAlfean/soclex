import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import logo from '@/assets/logo_soclex.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Access denied.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      {/* Animated scan lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent top-1/3 animate-pulse" />
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent top-2/3 animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src={logo} 
                alt="SOCLEX" 
                className="w-32 h-32 object-contain drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 20px hsla(0, 85%, 50%, 0.5))' }}
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-wider text-foreground text-glow-red">
            SOCLEX
          </h1>
          <p className="text-muted-foreground mt-2 font-medium tracking-wide">
            Security Operations Center
          </p>
        </div>

        {/* Login form */}
        <div className="cyber-card cyber-corner p-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display text-sm tracking-wider text-muted-foreground uppercase">
              Secure Access Portal
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded bg-destructive/10 border border-destructive/30 text-destructive">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-mono">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-md text-foreground font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-md text-foreground font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-12"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="cyber-btn w-full text-primary-foreground font-display tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Initialize Access'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>System Status: <span className="text-cyber-green">ONLINE</span></span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6 font-mono">
          Unauthorized access is prohibited and will be logged
        </p>
      </div>
    </div>
  );
};

export default Login;
