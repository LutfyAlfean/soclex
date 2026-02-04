import { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNotificationSettings, useSaveNotificationSettings } from '@/hooks/useNotificationSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const TelegramSettings = () => {
  const { data: settings, isLoading } = useNotificationSettings();
  const saveSettings = useSaveNotificationSettings();
  
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (settings) {
      setBotToken(settings.telegram_bot_token || '');
      setChatId(settings.telegram_chat_id || '');
      setEnabled(settings.telegram_enabled);
    }
  }, [settings]);

  const handleSave = () => {
    saveSettings.mutate({
      telegram_bot_token: botToken,
      telegram_chat_id: chatId,
      telegram_enabled: enabled,
    });
  };

  const handleTest = async () => {
    if (!botToken || !chatId) {
      toast({
        title: 'Missing Configuration',
        description: 'Please enter Bot Token and Chat ID first.',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-telegram', {
        body: { bot_token: botToken, chat_id: chatId },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Test Successful',
          description: 'Check your Telegram for the test message!',
        });
      } else {
        throw new Error(data.error || 'Failed to send test message');
      }
    } catch (error: unknown) {
      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'Failed to send test message',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground uppercase tracking-wider">
            Bot Token
          </label>
          <input
            type="password"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="Enter your Telegram Bot Token"
            className="w-full mt-1 px-4 py-3 bg-input border border-border rounded-md text-foreground font-mono focus:outline-none focus:border-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Get this from @BotFather on Telegram
          </p>
        </div>
        
        <div>
          <label className="text-sm text-muted-foreground uppercase tracking-wider">
            Chat ID
          </label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Enter your Chat ID or Group ID"
            className="w-full mt-1 px-4 py-3 bg-input border border-border rounded-md text-foreground font-mono focus:outline-none focus:border-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Get this from @userinfobot or @getidsbot on Telegram
          </p>
        </div>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium">Enable Telegram Notifications</div>
            <div className="text-sm text-muted-foreground">
              Receive real-time alerts on Telegram
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              enabled ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleTest}
          disabled={isTesting || !botToken || !chatId}
          className="cyber-btn-secondary flex items-center gap-2"
        >
          {isTesting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Test Connection
        </button>
        
        <button
          onClick={handleSave}
          disabled={saveSettings.isPending}
          className="cyber-btn flex items-center gap-2"
        >
          {saveSettings.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveSettings.isSuccess ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Save Settings
        </button>
      </div>

      {/* Instructions */}
      <div className="cyber-card p-4 bg-secondary/30">
        <h4 className="font-display text-sm tracking-wider mb-2">HOW TO SETUP TELEGRAM BOT</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Open Telegram and search for @BotFather</li>
          <li>Send /newbot and follow the instructions</li>
          <li>Copy the Bot Token and paste it above</li>
          <li>Search for @userinfobot and send any message</li>
          <li>Copy your Chat ID and paste it above</li>
          <li>Click "Test Connection" to verify</li>
        </ol>
      </div>
    </div>
  );
};

export default TelegramSettings;
