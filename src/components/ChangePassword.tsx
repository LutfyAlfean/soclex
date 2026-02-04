import { useState } from 'react';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center gap-2 text-xs ${met ? 'text-cyber-green' : 'text-muted-foreground'}`}>
    {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    {text}
  </div>
);

const ChangePassword = () => {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const requirements = {
    length: formData.newPassword.length >= 12,
    uppercase: /[A-Z]/.test(formData.newPassword),
    lowercase: /[a-z]/.test(formData.newPassword),
    number: /[0-9]/.test(formData.newPassword),
    special: /[^A-Za-z0-9]/.test(formData.newPassword),
    match: formData.newPassword === formData.confirmPassword && formData.confirmPassword.length > 0,
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    setErrors({});
    
    try {
      passwordSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            fieldErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);

    try {
      const success = await changePassword(formData.currentPassword, formData.newPassword);
      
      if (!success) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        toast({
          title: 'Error',
          description: 'Current password is incorrect',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password Changed',
          description: 'Your password has been updated successfully. Please use the new password on your next login.',
        });

        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Password */}
      <div>
        <label className="text-sm text-muted-foreground uppercase tracking-wider">
          Current Password *
        </label>
        <div className="relative mt-1">
          <Input
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            className={errors.currentPassword ? 'border-primary' : ''}
            placeholder="Enter your current password"
          />
          <button
            type="button"
            onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-xs text-primary mt-1">{errors.currentPassword}</p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label className="text-sm text-muted-foreground uppercase tracking-wider">
          New Password *
        </label>
        <div className="relative mt-1">
          <Input
            type={showPasswords.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            className={errors.newPassword ? 'border-primary' : ''}
            placeholder="Enter your new password"
          />
          <button
            type="button"
            onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs text-primary mt-1">{errors.newPassword}</p>
        )}
        
        {/* Password Requirements */}
        <div className="mt-3 p-3 bg-secondary/50 rounded-lg space-y-1">
          <div className="text-xs text-muted-foreground mb-2">Password Requirements:</div>
          <PasswordRequirement met={requirements.length} text="At least 12 characters" />
          <PasswordRequirement met={requirements.uppercase} text="One uppercase letter" />
          <PasswordRequirement met={requirements.lowercase} text="One lowercase letter" />
          <PasswordRequirement met={requirements.number} text="One number" />
          <PasswordRequirement met={requirements.special} text="One special character" />
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="text-sm text-muted-foreground uppercase tracking-wider">
          Confirm New Password *
        </label>
        <div className="relative mt-1">
          <Input
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className={errors.confirmPassword ? 'border-primary' : ''}
            placeholder="Confirm your new password"
          />
          <button
            type="button"
            onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-primary mt-1">{errors.confirmPassword}</p>
        )}
        {formData.confirmPassword && (
          <div className="mt-2">
            <PasswordRequirement met={requirements.match} text="Passwords match" />
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !Object.values(requirements).every(Boolean)}
        className="cyber-btn w-full flex items-center justify-center gap-2"
      >
        <Lock className="w-4 h-4" />
        {isLoading ? 'Changing Password...' : 'Change Password'}
      </button>
    </div>
  );
};

export default ChangePassword;
