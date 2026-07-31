import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, User, MessageSquareQuote } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuth = () => ({
  Authorization: `Bearer ${document.cookie.split('; ').find((r) => r.startsWith('session_token='))?.split('=')[1] || ''}`
});

const empty = { name_en: '', name_zh: '', position_en: '', position_zh: '', session: '', bio_en: '', bio_zh: '', farewell_en: '', farewell_zh: '', order: 0, file: null };

const AdminTeam = ({ user }) => {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [farewellOpen, setFarewellOpen] = useState(false);
  const [farewellMember, setFarewellMember] = useState(null);
  const [farewellForm, setFarewellForm] = useState({ farewell_en: '', farewell_zh: '' });

  const fetchMembers = async () => {
    try {
      const r = await axios.get(`${API}/team`);
      setMembers(r.data);
    } catch (e) { toast.error('Failed to load'); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleSave = async () => {
    if (!form.name_en || !form.name_zh || !form.position_en || !form.position_zh || !form.session) {
      toast.error('Name, position and session are required');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name_en', form.name_en);
      fd.append('name_zh', form.name_zh);
      fd.append('position_en', form.position_en);
      fd.append('position_zh', form.position_zh);
      fd.append('session', form.session);
      fd.append('bio_en', form.bio_en);
      fd.append('bio_zh', form.bio_zh);
      fd.append('farewell_en', form.farewell_en);
      fd.append('farewell_zh', form.farewell_zh);
      fd.append('order', form.order);
      if (form.file) fd.append('file', form.file);
      await axios.post(`${API}/team`, fd, { headers: { ...getAuth(), 'Content-Type': 'multipart/form-data' } });
      toast.success('Council member added');
      setOpen(false);
      setForm(empty);
      fetchMembers();
    } catch (e) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await axios.delete(`${API}/team/${id}`, { headers: getAuth() });
      toast.success('Removed');
      fetchMembers();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const openFarewell = (m) => {
    setFarewellMember(m);
    setFarewellForm({ farewell_en: m.farewell_en || '', farewell_zh: m.farewell_zh || '' });
    setFarewellOpen(true);
  };

  const saveFarewell = async () => {
    if (!farewellMember) return;
    setSaving(true);
    try {
      await axios.patch(`${API}/team/${farewellMember.id}/farewell`, farewellForm, {
        headers: { ...getAuth(), 'Content-Type': 'application/json' },
      });
      toast.success('Farewell note saved');
      setFarewellOpen(false);
      setFarewellMember(null);
      fetchMembers();
    } catch (e) { toast.error('Failed to save farewell'); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-team-page">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-heading font-bold text-[#410C09]">Council Members</h1>
          <Button onClick={() => { setForm(empty); setOpen(true); }} className="btn-primary" data-testid="add-member-btn">
            <Plus size={18} className="mr-2" />
            Add Member
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Council Members ({members.length})</CardTitle></CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No members yet. Add captain, vice captain, secretary, treasurer and committee members.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(m => (
                  <div key={m.id} className="border border-gray-200 rounded-sm overflow-hidden group relative" data-testid={`member-${m.id}`}>
                    <div className="aspect-square bg-[#F5F1E7]">
                      {m.image_path ? (
                        <img src={`${API}/files/${m.image_path}`} alt={m.name_en} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={48} className="text-[#410C09]" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-bold text-[#410C09]">{m.name_en}</div>
                      <div className="text-sm text-gray-600">{m.name_zh}</div>
                      <div className="text-sm text-[#D4AF37] font-semibold mt-1">{m.position_en}</div>
                      <div className="text-xs text-gray-500 mt-1">{m.session}</div>
                      {(m.farewell_en || m.farewell_zh) && (
                        <div className="mt-2 text-xs text-[#410C09] italic line-clamp-2" data-testid={`member-farewell-preview-${m.id}`}>
                          &ldquo;{m.farewell_en || m.farewell_zh}&rdquo;
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openFarewell(m)}
                        className="mt-3 w-full text-[#410C09] hover:bg-[#410C09] hover:text-white"
                        data-testid={`farewell-btn-${m.id}`}
                      >
                        <MessageSquareQuote size={14} className="mr-2" />
                        {m.farewell_en || m.farewell_zh ? 'Edit Farewell' : 'Add Farewell'}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(m.id)}
                      className="absolute top-2 right-2 text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`delete-${m.id}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="member-dialog">
            <DialogHeader><DialogTitle className="text-2xl font-heading text-[#410C09]">Add Council Member</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Name (English) *</Label>
                  <Input id="name_en" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder="e.g., Kon Yi Khai" data-testid="input-name-en" />
                </div>
                <div>
                  <Label htmlFor="name_zh">Name (中文) *</Label>
                  <Input id="name_zh" value={form.name_zh} onChange={(e) => setForm({ ...form, name_zh: e.target.value })} placeholder="例如：官榕凯" data-testid="input-name-zh" />
                </div>
                <div>
                  <Label htmlFor="position_en">Position (English) *</Label>
                  <Input id="position_en" value={form.position_en} onChange={(e) => setForm({ ...form, position_en: e.target.value })} placeholder="e.g., Captain" data-testid="input-position-en" />
                </div>
                <div>
                  <Label htmlFor="position_zh">Position (中文) *</Label>
                  <Input id="position_zh" value={form.position_zh} onChange={(e) => setForm({ ...form, position_zh: e.target.value })} placeholder="例如：队长" data-testid="input-position-zh" />
                </div>
                <div>
                  <Label htmlFor="session">Session *</Label>
                  <Input id="session" value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} placeholder="e.g., 2025/2026" data-testid="input-session" />
                </div>
                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input id="order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} data-testid="input-order" />
                </div>
              </div>
              <div>
                <Label htmlFor="bio_en">Bio (English)</Label>
                <Textarea id="bio_en" value={form.bio_en} onChange={(e) => setForm({ ...form, bio_en: e.target.value })} rows={2} data-testid="input-bio-en" />
              </div>
              <div>
                <Label htmlFor="bio_zh">Bio (中文)</Label>
                <Textarea id="bio_zh" value={form.bio_zh} onChange={(e) => setForm({ ...form, bio_zh: e.target.value })} rows={2} data-testid="input-bio-zh" />
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500 mb-2 italic">Optional — a short farewell note that appears on the Council Yearbook card. Great for graduating members.</p>
                <Label htmlFor="farewell_en">Farewell Note (English)</Label>
                <Textarea id="farewell_en" value={form.farewell_en} onChange={(e) => setForm({ ...form, farewell_en: e.target.value })} rows={2} placeholder="e.g., Every beat we shared is a memory I&apos;ll carry forever." data-testid="input-farewell-en" />
              </div>
              <div>
                <Label htmlFor="farewell_zh">Farewell Note (中文)</Label>
                <Textarea id="farewell_zh" value={form.farewell_zh} onChange={(e) => setForm({ ...form, farewell_zh: e.target.value })} rows={2} placeholder="例如：每一次同鼓共鸣，都会永远藏在心里。" data-testid="input-farewell-zh" />
              </div>
              <div>
                <Label htmlFor="file">Photo (optional)</Label>
                <Input id="file" type="file" accept="image/*" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} data-testid="input-file" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="btn-primary" data-testid="save-btn">
                {saving ? 'Saving...' : 'Save Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={farewellOpen} onOpenChange={setFarewellOpen}>
          <DialogContent className="max-w-xl" data-testid="farewell-dialog">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading text-[#410C09] flex items-center gap-2">
                <MessageSquareQuote size={22} />
                {farewellMember?.name_en}&apos;s Farewell Note
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-500 italic">A short farewell that appears on the Council Yearbook card. Keep it warm and brief.</p>
              <div>
                <Label htmlFor="fw_en">Farewell (English)</Label>
                <Textarea id="fw_en" value={farewellForm.farewell_en} onChange={(e) => setFarewellForm({ ...farewellForm, farewell_en: e.target.value })} rows={3} data-testid="edit-farewell-en" />
              </div>
              <div>
                <Label htmlFor="fw_zh">Farewell (中文)</Label>
                <Textarea id="fw_zh" value={farewellForm.farewell_zh} onChange={(e) => setFarewellForm({ ...farewellForm, farewell_zh: e.target.value })} rows={3} data-testid="edit-farewell-zh" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFarewellOpen(false)}>Cancel</Button>
              <Button onClick={saveFarewell} disabled={saving} className="btn-primary" data-testid="save-farewell-btn">
                {saving ? 'Saving…' : 'Save Farewell'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTeam;
