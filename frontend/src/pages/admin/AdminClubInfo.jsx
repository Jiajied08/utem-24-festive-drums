import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuth = () => ({
  Authorization: `Bearer ${document.cookie.split('; ').find((r) => r.startsWith('session_token='))?.split('=')[1] || ''}`,
});

const empty = {
  established_year: 2011,
  performances_count: 0,
  members_count: 0,
  about_en: '',
  about_zh: '',
  mission_en: '',
  mission_zh: '',
};

const AdminClubInfo = ({ user }) => {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${API}/club-info`).then((r) => setForm({ ...empty, ...r.data })).catch(() => {});
  }, []);

  const handleChange = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: k.endsWith('_year') || k.endsWith('_count') ? Number(v) || 0 : v }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/club-info`, form, { headers: { ...getAuth(), 'Content-Type': 'application/json' } });
      toast.success('Saved');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-club-info-page" className="max-w-4xl">
        <h1 className="text-4xl font-heading font-bold text-[#410C09] mb-2">Club Info</h1>
        <p className="text-gray-600 mb-8">Edit the intro paragraph shown on the homepage and the club&apos;s core numbers.</p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About the Club (Homepage intro)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="about_en">About (English)</Label>
              <Textarea
                id="about_en"
                value={form.about_en}
                onChange={handleChange('about_en')}
                rows={5}
                data-testid="input-about-en"
                placeholder="Introduce the club in English…"
              />
            </div>
            <div>
              <Label htmlFor="about_zh">About (中文)</Label>
              <Textarea
                id="about_zh"
                value={form.about_zh}
                onChange={handleChange('about_zh')}
                rows={5}
                data-testid="input-about-zh"
                placeholder="用中文介绍俱乐部…"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mission Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mission_en">Mission (English)</Label>
              <Textarea id="mission_en" value={form.mission_en} onChange={handleChange('mission_en')} rows={3} data-testid="input-mission-en" />
            </div>
            <div>
              <Label htmlFor="mission_zh">Mission (中文)</Label>
              <Textarea id="mission_zh" value={form.mission_zh} onChange={handleChange('mission_zh')} rows={3} data-testid="input-mission-zh" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Club Numbers</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="established_year">Established Year</Label>
              <Input id="established_year" type="number" value={form.established_year} onChange={handleChange('established_year')} data-testid="input-year" />
            </div>
            <div>
              <Label htmlFor="performances_count">Performances</Label>
              <Input id="performances_count" type="number" value={form.performances_count} onChange={handleChange('performances_count')} data-testid="input-performances" />
            </div>
            <div>
              <Label htmlFor="members_count">Members</Label>
              <Input id="members_count" type="number" value={form.members_count} onChange={handleChange('members_count')} data-testid="input-members" />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="btn-primary" data-testid="save-club-info-btn">
          <Save size={18} className="mr-2" />
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminClubInfo;
