import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { UserPlus, Trash2, ShieldCheck, Shield, Crown, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuth = () => ({
  Authorization: `Bearer ${document.cookie.split('; ').find((r) => r.startsWith('session_token='))?.split('=')[1] || ''}`,
});

const AdminUsers = ({ user }) => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [saving, setSaving] = useState(false);

  const [transferTarget, setTransferTarget] = useState(null);
  const [transferPassword, setTransferPassword] = useState('');

  useEffect(() => {
    if (user && user.role !== 'master') {
      toast.error('Master role required');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const fetchAdmins = async () => {
    try {
      const r = await axios.get(`${API}/admins`, { headers: getAuth() });
      setAdmins(r.data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'master') fetchAdmins();
  }, [user]);

  const handleAdd = async () => {
    if (!form.email || !form.password) return toast.error('Email and password are required');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      await axios.post(`${API}/admins`, form, { headers: { ...getAuth(), 'Content-Type': 'application/json' } });
      toast.success('Admin created');
      setForm({ email: '', name: '', password: '' });
      setAddOpen(false);
      fetchAdmins();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/admins/${u.user_id}`, { headers: getAuth() });
      toast.success('Admin removed');
      fetchAdmins();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to delete');
    }
  };

  const handleTransfer = async () => {
    if (!transferTarget || !transferPassword) return toast.error('Enter your current password to confirm');
    setSaving(true);
    try {
      await axios.post(
        `${API}/admins/${transferTarget.user_id}/transfer-master`,
        { password: transferPassword },
        { headers: { ...getAuth(), 'Content-Type': 'application/json' } }
      );
      toast.success(`${transferTarget.email} is now the master. You are now an admin.`);
      setTransferTarget(null);
      setTransferPassword('');
      // Force refresh so sidebar re-evaluates role
      window.location.reload();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to transfer master');
    } finally {
      setSaving(false);
    }
  };

  if (user && user.role !== 'master') return null;

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-users-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-[#410C09] mb-1 flex items-center gap-3">
              <Crown className="text-[#D4AF37]" size={32} />
              Admin Users
            </h1>
            <p className="text-gray-600">As master, you can add, remove and hand over admin access.</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="btn-primary" data-testid="add-admin-btn">
            <UserPlus size={18} className="mr-2" />
            Add Admin
          </Button>
        </div>

        <Card data-testid="admins-list">
          <CardHeader>
            <CardTitle>Team ({admins.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-12 text-gray-500">Loading…</p>
            ) : admins.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No admins yet.</p>
            ) : (
              <div className="divide-y divide-gray-200" data-testid="admin-rows">
                {admins.map((u) => {
                  const isMe = u.user_id === user.user_id;
                  const isMaster = u.role === 'master';
                  return (
                    <div key={u.user_id} className="flex items-center justify-between py-4 gap-4" data-testid={`admin-row-${u.user_id}`}>
                      <div className="flex items-center gap-3">
                        {isMaster ? (
                          <ShieldCheck size={26} className="text-[#D4AF37]" />
                        ) : (
                          <Shield size={26} className="text-gray-400" />
                        )}
                        <div>
                          <div className="font-semibold text-[#410C09]">
                            {u.name || u.email}
                            {isMe && <span className="ml-2 text-xs text-gray-500">(you)</span>}
                          </div>
                          <div className="text-sm text-gray-600">{u.email}</div>
                          <div className={`text-xs uppercase tracking-widest font-bold ${isMaster ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
                            {isMaster ? 'Master' : 'Admin'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isMe && !isMaster && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTransferTarget(u)}
                            data-testid={`transfer-btn-${u.user_id}`}
                          >
                            <ArrowRightLeft size={14} className="mr-2" />
                            Transfer Master
                          </Button>
                        )}
                        {!isMe && !isMaster && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(u)}
                            className="text-red-600 hover:bg-red-50"
                            data-testid={`delete-admin-${u.user_id}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent data-testid="add-admin-dialog">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading text-[#410C09]">Add Admin</DialogTitle>
              <DialogDescription>New admins can manage all content, but only the master can add or remove admins.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="input-new-admin-email" />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Display name (optional)" data-testid="input-new-admin-name" />
              </div>
              <div>
                <Label htmlFor="password">Temporary Password *</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} data-testid="input-new-admin-password" />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters. Share it privately — they can change it from their My Account page after logging in.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={saving} className="btn-primary" data-testid="save-new-admin-btn">
                {saving ? 'Creating…' : 'Create Admin'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!transferTarget} onOpenChange={(v) => !v && setTransferTarget(null)}>
          <DialogContent data-testid="transfer-master-dialog">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading text-[#410C09] flex items-center gap-2">
                <Crown className="text-[#D4AF37]" size={22} />
                Transfer Master
              </DialogTitle>
              <DialogDescription>
                Hand over the master role to <span className="font-semibold text-[#410C09]">{transferTarget?.email}</span>. After this, they can add or remove admins, and you become a regular admin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="tp">Confirm your current password</Label>
                <Input id="tp" type="password" value={transferPassword} onChange={(e) => setTransferPassword(e.target.value)} autoComplete="current-password" data-testid="input-transfer-password" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setTransferTarget(null); setTransferPassword(''); }}>Cancel</Button>
              <Button onClick={handleTransfer} disabled={saving} className="btn-primary" data-testid="confirm-transfer-btn">
                {saving ? 'Transferring…' : 'Transfer Master'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
