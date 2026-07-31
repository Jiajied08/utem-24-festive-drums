import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, ShieldCheck, Shield } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuth = () => ({
  Authorization: `Bearer ${document.cookie.split('; ').find((r) => r.startsWith('session_token='))?.split('=')[1] || ''}`,
});

const AdminAccount = ({ user }) => {
  const [old_password, setOld] = useState('');
  const [new_password, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new_password.length < 8) return toast.error('New password must be at least 8 characters');
    if (new_password !== confirm) return toast.error('New password and confirmation do not match');
    setSaving(true);
    try {
      await axios.post(
        `${API}/auth/change-password`,
        { old_password, new_password },
        { headers: { ...getAuth(), 'Content-Type': 'application/json' } }
      );
      toast.success('Password updated. All other sessions have been signed out.');
      setOld('');
      setNew('');
      setConfirm('');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const isMaster = user?.role === 'master';

  return (
    <AdminLayout user={user}>
      <div className="max-w-2xl" data-testid="admin-account-page">
        <h1 className="text-4xl font-heading font-bold text-[#410C09] mb-2">My Account</h1>
        <p className="text-gray-600 mb-8">Change your password. Your existing sessions on other devices will be signed out.</p>

        <Card className="mb-6" data-testid="account-summary-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isMaster ? <ShieldCheck size={22} className="text-[#D4AF37]" /> : <Shield size={22} />}
              Signed in as
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-[#410C09]" data-testid="account-name">{user?.name}</p>
            <p className="text-sm text-gray-600" data-testid="account-email">{user?.email}</p>
            <p className="text-xs mt-2 uppercase tracking-widest font-bold text-[#D4AF37]" data-testid="account-role">
              {isMaster ? 'Master Admin' : 'Admin'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="password-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound size={22} /> Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="change-password-form">
              <div>
                <Label htmlFor="old_password">Current Password</Label>
                <Input id="old_password" type="password" value={old_password} onChange={(e) => setOld(e.target.value)} required autoComplete="current-password" data-testid="input-old-password" />
              </div>
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" type="password" value={new_password} onChange={(e) => setNew(e.target.value)} required minLength={8} autoComplete="new-password" data-testid="input-new-password" />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>
              <div>
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" data-testid="input-confirm-password" />
              </div>
              <Button type="submit" disabled={saving} className="btn-primary" data-testid="save-password-btn">
                {saving ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAccount;
