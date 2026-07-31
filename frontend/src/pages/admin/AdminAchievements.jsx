import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuth = () => ({
  Authorization: `Bearer ${document.cookie.split('; ').find((r) => r.startsWith('session_token='))?.split('=')[1] || ''}`
});

const empty = { title_en: '', title_zh: '', year: new Date().getFullYear(), location: '', description_en: '', description_zh: '', file: null };

const AdminAchievements = ({ user }) => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      const r = await axios.get(`${API}/achievements`);
      setItems(r.data);
    } catch (e) { toast.error('Failed to load'); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!form.title_en || !form.title_zh || !form.year) {
      toast.error('Title (EN + 中文) and year are required');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title_en', form.title_en);
      fd.append('title_zh', form.title_zh);
      fd.append('year', form.year);
      fd.append('location', form.location);
      fd.append('description_en', form.description_en);
      fd.append('description_zh', form.description_zh);
      if (form.file) fd.append('file', form.file);
      await axios.post(`${API}/achievements`, fd, { headers: { ...getAuth(), 'Content-Type': 'multipart/form-data' } });
      toast.success('Achievement added');
      setOpen(false);
      setForm(empty);
      fetchItems();
    } catch (e) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await axios.delete(`${API}/achievements/${id}`, { headers: getAuth() });
      toast.success('Deleted');
      fetchItems();
    } catch (e) { toast.error('Failed to delete'); }
  };

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-achievements-page">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-heading font-bold text-[#410C09]">Achievements</h1>
          <Button onClick={() => { setForm(empty); setOpen(true); }} className="btn-primary" data-testid="add-achievement-btn">
            <Plus size={18} className="mr-2" />
            Add Achievement
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Achievements ({items.length})</CardTitle></CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No achievements yet. Add one to showcase competition results and milestones.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-sm" data-testid={`achievement-${item.id}`}>
                    {item.image_path ? (
                      <img src={`${API}/files/${item.image_path}`} alt="" className="w-24 h-24 object-cover rounded-sm flex-shrink-0" />
                    ) : (
                      <div className="w-24 h-24 bg-[#F5F1E7] rounded-sm flex-shrink-0 flex items-center justify-center">
                        <Trophy size={32} className="text-[#D4AF37]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-heading text-2xl font-bold text-[#410C09]">{item.year}</div>
                      <div className="font-semibold">{item.title_en}</div>
                      <div className="text-sm text-gray-600">{item.title_zh}</div>
                      {item.location && <div className="text-xs text-gray-500 mt-1">📍 {item.location}</div>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50" data-testid={`delete-${item.id}`}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="achievement-dialog">
            <DialogHeader><DialogTitle className="text-2xl font-heading text-[#410C09]">Add Achievement</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input id="year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 0 })} data-testid="input-year" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g., Kuala Lumpur" data-testid="input-location" />
                </div>
              </div>
              <div>
                <Label htmlFor="title_en">Title (English) *</Label>
                <Input id="title_en" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} placeholder="e.g., 1st Place - National Competition" data-testid="input-title-en" />
              </div>
              <div>
                <Label htmlFor="title_zh">Title (中文) *</Label>
                <Input id="title_zh" value={form.title_zh} onChange={(e) => setForm({ ...form, title_zh: e.target.value })} placeholder="例如：全国比赛冠军" data-testid="input-title-zh" />
              </div>
              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea id="description_en" value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={2} data-testid="input-description-en" />
              </div>
              <div>
                <Label htmlFor="description_zh">Description (中文)</Label>
                <Textarea id="description_zh" value={form.description_zh} onChange={(e) => setForm({ ...form, description_zh: e.target.value })} rows={2} data-testid="input-description-zh" />
              </div>
              <div>
                <Label htmlFor="file">Photo (optional)</Label>
                <Input id="file" type="file" accept="image/*" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} data-testid="input-file" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="btn-primary" data-testid="save-btn">
                {saving ? 'Saving...' : 'Save Achievement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAchievements;
