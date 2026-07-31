import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Trash2, Upload, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuth = () => ({
  Authorization: `Bearer ${document.cookie.split('; ').find((r) => r.startsWith('session_token='))?.split('=')[1] || ''}`,
});

const empty = { title_en: '', title_zh: '', event_date: '', location: '', event_link: '' };

const AdminPosters = ({ user }) => {
  const [posters, setPosters] = useState([]);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const fetchPosters = async () => {
    try {
      const r = await axios.get(`${API}/posters`);
      setPosters(r.data);
    } catch (e) {
      toast.error('Failed to load posters');
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f && f.type.startsWith('image/')) setFile(f);
    else toast.error('Please drop an image file');
  };

  const handleSave = async () => {
    if (!file) return toast.error('Poster image is required');
    if (!form.event_date) return toast.error('Event date is required');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title_en', form.title_en);
      fd.append('title_zh', form.title_zh);
      fd.append('event_date', form.event_date);
      fd.append('location', form.location);
      fd.append('event_link', form.event_link);
      await axios.post(`${API}/posters`, fd, {
        headers: { ...getAuth(), 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Poster uploaded');
      setForm(empty);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      fetchPosters();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this poster from the homepage?')) return;
    try {
      await axios.delete(`${API}/posters/${id}`, { headers: getAuth() });
      toast.success('Removed');
      fetchPosters();
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-posters-page">
        <h1 className="text-4xl font-heading font-bold text-[#410C09] mb-2">Event Posters</h1>
        <p className="text-gray-600 mb-8">Upload posters for upcoming shows. They appear on the homepage in date order.</p>

        <Card className="mb-8" data-testid="poster-upload-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload size={22} /> Add Poster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title_en">Title (English)</Label>
                <Input id="title_en" value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} placeholder="e.g., Chinese New Year Gala 2026" data-testid="input-poster-title-en" />
              </div>
              <div>
                <Label htmlFor="title_zh">Title (中文)</Label>
                <Input id="title_zh" value={form.title_zh} onChange={(e) => setForm((f) => ({ ...f, title_zh: e.target.value }))} placeholder="例如：2026 新春晚会" data-testid="input-poster-title-zh" />
              </div>
              <div>
                <Label htmlFor="event_date">Event Date *</Label>
                <Input id="event_date" type="date" value={form.event_date} onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))} data-testid="input-poster-date" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g., Dewan UTeM" data-testid="input-poster-location" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="event_link">Event Link (optional)</Label>
                <Input id="event_link" value={form.event_link} onChange={(e) => setForm((f) => ({ ...f, event_link: e.target.value }))} placeholder="https://…" data-testid="input-poster-link" />
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${dragActive ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-300 hover:border-[#410C09] hover:bg-gray-50'}`}
              data-testid="poster-drop-zone"
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} data-testid="input-poster-file" />
              <ImageIcon size={40} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">{file ? file.name : 'Drag & drop poster image or click to select'}</p>
              <p className="text-xs text-gray-500 mt-1">Portrait posters look best (e.g., A3 aspect)</p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="btn-primary" data-testid="save-poster-btn">
              <Upload size={16} className="mr-2" />
              {saving ? 'Uploading…' : 'Upload Poster'}
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="posters-list">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarDays size={22} /> Posters ({posters.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {posters.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No posters yet. Upload one above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {posters.map((p) => {
                  const isUpcoming = (p.event_date || '') >= today;
                  return (
                    <div key={p.id} className="border border-gray-200 rounded-sm overflow-hidden group relative bg-white" data-testid={`poster-item-${p.id}`}>
                      <div className="aspect-[3/4] bg-gray-100">
                        <img src={`${API}/files/${p.storage_path}`} alt={p.title_en} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 text-sm space-y-1">
                        <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold uppercase tracking-wide">
                          <CalendarDays size={12} />
                          {p.event_date || '—'}
                          {isUpcoming && <span className="ml-auto bg-[#410C09] text-white px-2 py-0.5 rounded-full text-[10px]">Upcoming</span>}
                        </div>
                        {p.title_en && <div className="font-semibold text-[#0A0A0A]">{p.title_en}</div>}
                        {p.title_zh && <div className="text-gray-600">{p.title_zh}</div>}
                        {p.location && <div className="text-xs text-gray-500">{p.location}</div>}
                        {p.event_link && (
                          <a href={p.event_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                            <ExternalLink size={12} /> Link
                          </a>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                        className="absolute top-2 right-2 text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`delete-poster-${p.id}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPosters;
