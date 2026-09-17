import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiUser, FiLock, FiMoon, FiSun } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';

import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

/* ------------------- Profile form ------------------- */
const profileSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^[0-9]{10}$/).optional().or(z.literal('')),
  currency: z.string().min(1).max(10),
});

/* ------------------- Password form ------------------- */
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Needs uppercase')
    .regex(/[a-z]/, 'Needs lowercase')
    .regex(/[0-9]/, 'Needs a number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      currency: user?.currency || 'INR',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onProfileSubmit = async (data) => {
    setSavingProfile(true);
    try {
      const res = await axiosClient.put('/users/me', data);
      setUser(res.data.data);
      toast.success('Profile updated');
    } catch {
      /* toast handled by interceptor */
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setSavingPassword(true);
    try {
      await axiosClient.post('/users/me/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
      toast.success('Password changed');
    } catch {
      /* toast handled by interceptor */
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-gray-400 mb-6">
        Manage your account and preferences
      </p>

      {/* Profile */}
      <GlassCard className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <FiUser className="text-primary-400" size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Profile</h2>
            <p className="text-xs text-gray-500">
              Update your personal information
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5 p-3 rounded-xl bg-white/5">
          <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-bold text-white">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium">{user?.fullName}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
            {user?.isEmailVerified ? (
              <Badge variant="green" className="mt-1">✓ Verified</Badge>
            ) : (
              <Badge variant="amber" className="mt-1">Unverified</Badge>
            )}
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            error={profileForm.formState.errors.fullName?.message}
            {...profileForm.register('fullName')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              placeholder="9876543210"
              error={profileForm.formState.errors.phone?.message}
              {...profileForm.register('phone')}
            />
            <Input
              label="Currency"
              placeholder="INR"
              error={profileForm.formState.errors.currency?.message}
              {...profileForm.register('currency')}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile}>
              Save Changes
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Password */}
      <GlassCard className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
            <FiLock className="text-accent-cyan" size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Security</h2>
            <p className="text-xs text-gray-500">Change your password</p>
          </div>
        </div>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <Input
              label="Confirm Password"
              type="password"
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={savingPassword}>
              Change Password
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Appearance */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-accent-amber/10 flex items-center justify-center">
            {theme === 'dark' ? (
              <FiMoon className="text-accent-amber" size={18} />
            ) : (
              <FiSun className="text-accent-amber" size={18} />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">Appearance</h2>
            <p className="text-xs text-gray-500">Customize your experience</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-gray-400">
              Currently using <span className="text-white capitalize">{theme}</span> mode
            </p>
          </div>
          <Button variant="outline" onClick={toggle}>
            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
            Toggle
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}